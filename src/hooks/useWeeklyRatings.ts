import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { WeeklyRating } from '../types';
import { getWeekStart, clampScore } from '../utils/week';
import { SCORE_MAX, SCORE_MIN } from '../utils/constants';

export function useWeeklyRatings(userId: string | undefined, attributeIds: string[]) {
  const queryClient = useQueryClient();
  const weekStart = getWeekStart();
  const idsKey = attributeIds.slice().sort().join(',');

  const query = useQuery({
    queryKey: ['weekly_ratings', userId, weekStart, idsKey],
    enabled: !!userId && attributeIds.length > 0,
    queryFn: async (): Promise<WeeklyRating[]> => {
      const { data, error } = await supabase
        .from('weekly_ratings')
        .select('*')
        .eq('user_id', userId!)
        .in('attribute_id', attributeIds)
        .order('week_start', { ascending: false });

      if (error) throw error;
      return ((data ?? []) as WeeklyRating[]).map((r) => ({
        ...r,
        score: Number(r.score),
        delta: Number(r.delta),
      }));
    },
  });

  const saveRating = useMutation({
    mutationFn: async (input: {
      attribute_id: string;
      score: number;
      previous_score: number;
      note?: string;
      week_start?: string;
    }) => {
      const ws = input.week_start ?? weekStart;
      const score = clampScore(input.score, SCORE_MIN, SCORE_MAX);
      const delta = clampScore(score - input.previous_score, -SCORE_MAX, SCORE_MAX);

      const { data, error } = await supabase
        .from('weekly_ratings')
        .upsert(
          {
            user_id: userId!,
            attribute_id: input.attribute_id,
            week_start: ws,
            score,
            delta,
            note: input.note?.trim() ?? '',
          },
          { onConflict: 'attribute_id,week_start' }
        )
        .select()
        .single();

      if (error) throw error;

      const { error: attrError } = await supabase
        .from('attributes')
        .update({ current_score: score })
        .eq('id', input.attribute_id);

      if (attrError) throw attrError;

      return data as WeeklyRating;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly_ratings', userId] });
      queryClient.invalidateQueries({ queryKey: ['focuses', userId] });
    },
  });

  const ratingsThisWeek = (query.data ?? []).filter((r) => r.week_start === weekStart);
  const ratedAttributeIds = new Set(ratingsThisWeek.map((r) => r.attribute_id));

  return {
    ratings: query.data ?? [],
    ratingsThisWeek,
    ratedAttributeIds,
    weekStart,
    isLoading: query.isLoading,
    saveRating,
  };
}
