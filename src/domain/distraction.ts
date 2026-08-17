export type Distraction = {
  id: string;
  sessionId: string;
  text: string;
  createdAt: number;
};

export function normalizeDistractionText(value: string): string {
  return value.trim();
}

export function validateDistractionText(value: string): string | null {
  return normalizeDistractionText(value).length > 0 ? null : '请先写下一句话。';
}
