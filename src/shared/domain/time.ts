export type ISODate = string;
export type ISODateTime = string;

export interface Clock {
  now(): number;
  todayISO(): ISODate;
}

export const SystemClock: Clock = {
  now: () => Date.now(),
  todayISO: () => new Date().toISOString().split("T")[0] as ISODate,
};
