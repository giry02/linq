export type EquipmentType = "엔진" | "납축" | "리튬";

export type FleetSite = {
  name: string;
  equipment: Record<EquipmentType, number>;
  revenue: string;
  distance: string;
  runtime: string;
  chargeCount: number;
  maintenance: number;
  errors: number;
  replaceNeeded: number;
  replaceDue: number;
};

export const equipmentSummary = [
  { type: "엔진" as const, active: 741, idle: 240, color: "var(--brand)" },
  { type: "납축" as const, active: 414, idle: 100, color: "var(--orange)" },
  { type: "리튬" as const, active: 540, idle: 100, color: "var(--teal)" },
];

export const profitRanking = [
  "(주)업체A",
  "(주)신성델타테크",
  "(주)두산",
  "(주)신원",
  "(주)하나",
];

export const fleetSites: FleetSite[] = [
  {
    name: "성일하이텍",
    equipment: { 엔진: 5, 납축: 2, 리튬: 8 },
    revenue: "3,707,000원",
    distance: "10km",
    runtime: "25H",
    chargeCount: 501,
    maintenance: 1,
    errors: 3,
    replaceNeeded: 2,
    replaceDue: 3,
  },
  {
    name: "일신",
    equipment: { 엔진: 5, 납축: 2, 리튬: 8 },
    revenue: "3,707,000원",
    distance: "10km",
    runtime: "25H",
    chargeCount: 501,
    maintenance: 1,
    errors: 3,
    replaceNeeded: 2,
    replaceDue: 3,
  },
  {
    name: "강남트럭",
    equipment: { 엔진: 5, 납축: 2, 리튬: 8 },
    revenue: "3,707,000원",
    distance: "10km",
    runtime: "25H",
    chargeCount: 501,
    maintenance: 1,
    errors: 3,
    replaceNeeded: 2,
    replaceDue: 3,
  },
  {
    name: "CH",
    equipment: { 엔진: 5, 납축: 2, 리튬: 8 },
    revenue: "3,707,000원",
    distance: "10km",
    runtime: "25H",
    chargeCount: 501,
    maintenance: 1,
    errors: 3,
    replaceNeeded: 2,
    replaceDue: 3,
  },
  {
    name: "럭키",
    equipment: { 엔진: 5, 납축: 2, 리튬: 8 },
    revenue: "3,707,000원",
    distance: "10km",
    runtime: "25H",
    chargeCount: 501,
    maintenance: 1,
    errors: 3,
    replaceNeeded: 2,
    replaceDue: 3,
  },
  {
    name: "하나",
    equipment: { 엔진: 5, 납축: 2, 리튬: 8 },
    revenue: "3,707,000원",
    distance: "10km",
    runtime: "25H",
    chargeCount: 501,
    maintenance: 1,
    errors: 3,
    replaceNeeded: 2,
    replaceDue: 3,
  },
];
