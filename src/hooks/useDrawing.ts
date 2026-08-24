import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { isDemoMode } from '../lib/demoMode';
import { localStore } from '../lib/localStore';
import type { DrawingStroke } from '../types';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useDrawing(userId: string | undefined, pageKey: string) {
  const queryClient = useQueryClient();
  const [localStrokes, setLocalStrokes] = useState<DrawingStroke[]>([]);
  const [drawMode, setDrawMode] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);

  const query = useQuery({
    queryKey: ['page_drawings', userId, pageKey],
    enabled: !!userId && !!pageKey,
    queryFn: async () => {
      if (isDemoMode) {
        return localStore.getDrawing(pageKey);
      }

      const { data, error } = await supabase
        .from('page_drawings')
        .select('*')
        .eq('user_id', userId!)
        .eq('page_key', pageKey)
        .maybeSingle();

      if (error) throw error;
      return (data?.strokes as DrawingStroke[]) ?? [];
    },
  });

  useEffect(() => {
    if (query.data && !hydrated.current) {
      setLocalStrokes(query.data);
      hydrated.current = true;
    }
  }, [query.data]);

  useEffect(() => {
    hydrated.current = false;
  }, [pageKey, userId]);

  const persist = useMutation({
    mutationFn: async (strokes: DrawingStroke[]) => {
      if (isDemoMode) {
        await localStore.saveDrawing(pageKey, strokes);
        return;
      }

      const { error } = await supabase.from('page_drawings').upsert(
        {
          user_id: userId!,
          page_key: pageKey,
          strokes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,page_key' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page_drawings', userId, pageKey] });
    },
  });

  const persistRef = useRef(persist);
  persistRef.current = persist;
  const userIdRef = useRef(userId);
  userIdRef.current = userId;
  const pendingStrokes = useRef<DrawingStroke[] | null>(null);

  const scheduleSave = useCallback((strokes: DrawingStroke[]) => {
    pendingStrokes.current = strokes;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      const next = pendingStrokes.current;
      pendingStrokes.current = null;
      if (userIdRef.current && next) persistRef.current.mutate(next);
    }, 600);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      const next = pendingStrokes.current;
      pendingStrokes.current = null;
      if (userIdRef.current && next) persistRef.current.mutate(next);
    };
  }, []);

  const addStroke = useCallback(
    (stroke: Omit<DrawingStroke, 'id'>) => {
      setLocalStrokes((prev) => {
        const next = [...prev, { ...stroke, id: makeId() }];
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const undo = useCallback(() => {
    setLocalStrokes((prev) => {
      const next = prev.slice(0, -1);
      scheduleSave(next);
      return next;
    });
  }, [scheduleSave]);

  const clear = useCallback(() => {
    setLocalStrokes([]);
    scheduleSave([]);
  }, [scheduleSave]);

  return {
    strokes: localStrokes,
    drawMode,
    setDrawMode,
    addStroke,
    undo,
    clear,
    isLoading: query.isLoading,
  };
}
