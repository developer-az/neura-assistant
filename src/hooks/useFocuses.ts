import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Focus, Attribute, FocusWithAttributes } from '../types';

export function useFocuses(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['focuses', userId],
    enabled: !!userId,
    queryFn: async (): Promise<FocusWithAttributes[]> => {
      const { data: focuses, error } = await supabase
        .from('focuses')
        .select('*')
        .eq('user_id', userId!)
        .eq('archived', false)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      const { data: attributes, error: attrError } = await supabase
        .from('attributes')
        .select('*')
        .eq('user_id', userId!)
        .eq('archived', false)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (attrError) throw attrError;

      const byFocus = new Map<string, Attribute[]>();
      for (const attr of (attributes ?? []) as Attribute[]) {
        const list = byFocus.get(attr.focus_id) ?? [];
        list.push({
          ...attr,
          current_score: Number(attr.current_score),
        });
        byFocus.set(attr.focus_id, list);
      }

      return ((focuses ?? []) as Focus[]).map((f) => ({
        ...f,
        attributes: byFocus.get(f.id) ?? [],
      }));
    },
  });

  const createFocus = useMutation({
    mutationFn: async (input: { title: string; notes?: string }) => {
      const count = query.data?.length ?? 0;
      const { data, error } = await supabase
        .from('focuses')
        .insert({
          user_id: userId!,
          title: input.title.trim(),
          notes: input.notes?.trim() ?? '',
          sort_order: count,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Focus;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['focuses', userId] }),
  });

  const updateFocus = useMutation({
    mutationFn: async (input: { id: string; title?: string; notes?: string; archived?: boolean }) => {
      const { id, ...rest } = input;
      const { data, error } = await supabase.from('focuses').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return data as Focus;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['focuses', userId] }),
  });

  const createAttribute = useMutation({
    mutationFn: async (input: { focus_id: string; name: string; current_score?: number }) => {
      const focus = query.data?.find((f) => f.id === input.focus_id);
      const sort_order = focus?.attributes.length ?? 0;
      const { data, error } = await supabase
        .from('attributes')
        .insert({
          user_id: userId!,
          focus_id: input.focus_id,
          name: input.name.trim(),
          current_score: input.current_score ?? 5,
          sort_order,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Attribute;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['focuses', userId] }),
  });

  const updateAttribute = useMutation({
    mutationFn: async (input: {
      id: string;
      name?: string;
      current_score?: number;
      archived?: boolean;
    }) => {
      const { id, ...rest } = input;
      const { data, error } = await supabase.from('attributes').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return data as Attribute;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['focuses', userId] }),
  });

  return {
    focuses: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createFocus,
    updateFocus,
    createAttribute,
    updateAttribute,
  };
}
