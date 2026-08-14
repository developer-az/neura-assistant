export interface Focus {
  id: string;
  user_id: string;
  title: string;
  notes: string;
  sort_order: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attribute {
  id: string;
  user_id: string;
  focus_id: string;
  name: string;
  current_score: number;
  sort_order: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeeklyRating {
  id: string;
  user_id: string;
  attribute_id: string;
  week_start: string;
  score: number;
  delta: number;
  note: string;
  created_at: string;
}

export interface StrokePoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  points: StrokePoint[];
  color: string;
  width: number;
}

export interface PageDrawing {
  id: string;
  user_id: string;
  page_key: string;
  strokes: DrawingStroke[];
  updated_at: string;
}

export type FocusWithAttributes = Focus & {
  attributes: Attribute[];
};
