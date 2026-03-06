export enum CefrLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export const CEFR_LEVEL_ORDER: Record<CefrLevel, number> = {
  [CefrLevel.A1]: 1,
  [CefrLevel.A2]: 2,
  [CefrLevel.B1]: 3,
  [CefrLevel.B2]: 4,
  [CefrLevel.C1]: 5,
  [CefrLevel.C2]: 6,
};
