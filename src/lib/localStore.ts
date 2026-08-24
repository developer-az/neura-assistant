import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Focus,
  Attribute,
  WeeklyRating,
  DrawingStroke,
  FocusWithAttributes,
} from '../types';
import { DEMO_USER_ID } from './demoMode';
import { clampScore, getWeekStart } from '../utils/week';
import { SCORE_MAX, SCORE_MIN } from '../utils/constants';

const STORAGE_KEY = '@baseline/demo';

interface DemoStore {
  focuses: Focus[];
  attributes: Attribute[];
  weeklyRatings: WeeklyRating[];
  drawings: Record<string, DrawingStroke[]>;
}

const emptyStore = (): DemoStore => ({
  focuses: [],
  attributes: [],
  weeklyRatings: [],
  drawings: {},
});

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now() {
  return new Date().toISOString();
}

async function readStore(): Promise<DemoStore> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as DemoStore;
    return {
      focuses: parsed.focuses ?? [],
      attributes: parsed.attributes ?? [],
      weeklyRatings: parsed.weeklyRatings ?? [],
      drawings: parsed.drawings ?? {},
    };
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: DemoStore) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function composeFocuses(store: DemoStore): FocusWithAttributes[] {
  const byFocus = new Map<string, Attribute[]>();
  for (const attr of store.attributes.filter((a) => !a.archived)) {
    const list = byFocus.get(attr.focus_id) ?? [];
    list.push({ ...attr, current_score: Number(attr.current_score) });
    byFocus.set(attr.focus_id, list);
  }

  return store.focuses
    .filter((f) => !f.archived)
    .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
    .map((f) => ({
      ...f,
      attributes: (byFocus.get(f.id) ?? []).sort(
        (a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at)
      ),
    }));
}

export const localStore = {
  async getFocusesWithAttributes(): Promise<FocusWithAttributes[]> {
    const store = await readStore();
    return composeFocuses(store);
  },

  async createFocus(input: { title: string; notes?: string }): Promise<Focus> {
    const store = await readStore();
    const focus: Focus = {
      id: makeId('focus'),
      user_id: DEMO_USER_ID,
      title: input.title.trim(),
      notes: input.notes?.trim() ?? '',
      sort_order: store.focuses.filter((f) => !f.archived).length,
      archived: false,
      created_at: now(),
      updated_at: now(),
    };
    store.focuses.push(focus);
    await writeStore(store);
    return focus;
  },

  async updateFocus(input: {
    id: string;
    title?: string;
    notes?: string;
    archived?: boolean;
  }): Promise<Focus> {
    const store = await readStore();
    const idx = store.focuses.findIndex((f) => f.id === input.id);
    if (idx === -1) throw new Error('Focus not found');
    store.focuses[idx] = {
      ...store.focuses[idx],
      ...input,
      updated_at: now(),
    };
    await writeStore(store);
    return store.focuses[idx];
  },

  async createAttribute(input: {
    focus_id: string;
    name: string;
    current_score?: number;
  }): Promise<Attribute> {
    const store = await readStore();
    const sort_order = store.attributes.filter(
      (a) => a.focus_id === input.focus_id && !a.archived
    ).length;
    const attribute: Attribute = {
      id: makeId('attr'),
      user_id: DEMO_USER_ID,
      focus_id: input.focus_id,
      name: input.name.trim(),
      current_score: input.current_score ?? 5,
      sort_order,
      archived: false,
      created_at: now(),
      updated_at: now(),
    };
    store.attributes.push(attribute);
    await writeStore(store);
    return attribute;
  },

  async updateAttribute(input: {
    id: string;
    name?: string;
    current_score?: number;
    archived?: boolean;
  }): Promise<Attribute> {
    const store = await readStore();
    const idx = store.attributes.findIndex((a) => a.id === input.id);
    if (idx === -1) throw new Error('Attribute not found');
    store.attributes[idx] = {
      ...store.attributes[idx],
      ...input,
      updated_at: now(),
    };
    await writeStore(store);
    return store.attributes[idx];
  },

  async getWeeklyRatings(attributeIds: string[]): Promise<WeeklyRating[]> {
    const store = await readStore();
    const ids = new Set(attributeIds);
    return store.weeklyRatings
      .filter((r) => ids.has(r.attribute_id))
      .map((r) => ({ ...r, score: Number(r.score), delta: Number(r.delta) }))
      .sort((a, b) => b.week_start.localeCompare(a.week_start));
  },

  async saveWeeklyRating(input: {
    attribute_id: string;
    score: number;
    previous_score: number;
    note?: string;
    week_start?: string;
  }): Promise<WeeklyRating> {
    const store = await readStore();
    const week_start = input.week_start ?? getWeekStart();
    const score = clampScore(input.score, SCORE_MIN, SCORE_MAX);
    const delta = clampScore(score - input.previous_score, -SCORE_MAX, SCORE_MAX);

    const existingIdx = store.weeklyRatings.findIndex(
      (r) => r.attribute_id === input.attribute_id && r.week_start === week_start
    );

    const rating: WeeklyRating = {
      id: existingIdx >= 0 ? store.weeklyRatings[existingIdx].id : makeId('rating'),
      user_id: DEMO_USER_ID,
      attribute_id: input.attribute_id,
      week_start,
      score,
      delta,
      note: input.note?.trim() ?? '',
      created_at: existingIdx >= 0 ? store.weeklyRatings[existingIdx].created_at : now(),
    };

    if (existingIdx >= 0) {
      store.weeklyRatings[existingIdx] = rating;
    } else {
      store.weeklyRatings.push(rating);
    }

    const attrIdx = store.attributes.findIndex((a) => a.id === input.attribute_id);
    if (attrIdx >= 0) {
      store.attributes[attrIdx] = {
        ...store.attributes[attrIdx],
        current_score: score,
        updated_at: now(),
      };
    }

    await writeStore(store);
    return rating;
  },

  async getDrawing(pageKey: string): Promise<DrawingStroke[]> {
    const store = await readStore();
    return store.drawings[pageKey] ?? [];
  },

  async saveDrawing(pageKey: string, strokes: DrawingStroke[]) {
    const store = await readStore();
    store.drawings[pageKey] = strokes;
    await writeStore(store);
  },

  async reset() {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
