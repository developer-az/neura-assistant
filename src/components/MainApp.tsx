import React, { useMemo, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useFocuses } from '../hooks/useFocuses';
import { useWeeklyRatings } from '../hooks/useWeeklyRatings';
import { ClaimNotebook } from './auth/ClaimNotebook';
import { HomeScreen } from './notebook/HomeScreen';
import { FocusScreen } from './notebook/FocusScreen';
import { WeeklyCheckIn } from './notebook/WeeklyCheckIn';
import { Colors } from '../utils/constants';

export default function MainApp() {
  const auth = useAuth();
  const userId = auth.user?.id;
  const { focuses, isLoading, createFocus, createAttribute, updateFocus } = useFocuses(userId);

  const allAttributeIds = useMemo(
    () => focuses.flatMap((f) => f.attributes.map((a) => a.id)),
    [focuses]
  );

  const { ratings, ratedAttributeIds, weekStart, saveRating } = useWeeklyRatings(
    userId,
    allAttributeIds
  );

  const [activeFocusId, setActiveFocusId] = useState<string | null>(null);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInFocusId, setCheckInFocusId] = useState<string | null>(null);

  const activeFocus = focuses.find((f) => f.id === activeFocusId) ?? null;

  const checkInAttributes = useMemo(() => {
    if (checkInFocusId) {
      return focuses.find((f) => f.id === checkInFocusId)?.attributes ?? [];
    }
    return focuses.flatMap((f) => f.attributes);
  }, [checkInFocusId, focuses]);

  const needsCheckIn = useMemo(() => {
    if (allAttributeIds.length === 0) return false;
    return allAttributeIds.some((id) => !ratedAttributeIds.has(id));
  }, [allAttributeIds, ratedAttributeIds]);

  if (auth.loading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <ClaimNotebook
        configured={auth.isConfigured}
        onSignIn={auth.signInWithEmail}
        onSignUp={auth.signUpWithEmail}
      />
    );
  }

  const openCheckIn = (focusId?: string) => {
    setCheckInFocusId(focusId ?? null);
    setCheckInOpen(true);
  };

  return (
    <View style={styles.root}>
      {activeFocus ? (
        <FocusScreen
          userId={userId!}
          focus={activeFocus}
          ratings={ratings.filter((r) =>
            activeFocus.attributes.some((a) => a.id === r.attribute_id)
          )}
          onBack={() => setActiveFocusId(null)}
          onAddAttribute={async (name, score) => {
            await createAttribute.mutateAsync({
              focus_id: activeFocus.id,
              name,
              current_score: score,
            });
          }}
          onStartCheckIn={() => openCheckIn(activeFocus.id)}
          onArchiveFocus={async () => {
            await updateFocus.mutateAsync({ id: activeFocus.id, archived: true });
            setActiveFocusId(null);
          }}
        />
      ) : (
        <HomeScreen
          userId={userId!}
          focuses={focuses}
          loading={isLoading}
          needsCheckIn={needsCheckIn}
          onOpenFocus={setActiveFocusId}
          onCreateFocus={async (title) => {
            await createFocus.mutateAsync({ title });
          }}
          onStartCheckIn={() => openCheckIn()}
          onSignOut={() => auth.signOut()}
        />
      )}

      <WeeklyCheckIn
        visible={checkInOpen}
        attributes={checkInAttributes}
        weekStart={weekStart}
        alreadyRatedIds={ratedAttributeIds}
        onClose={() => setCheckInOpen(false)}
        onSave={async (entries) => {
          for (const entry of entries) {
            await saveRating.mutateAsync(entry);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.paper,
  },
});
