export const BUSINESS_TIMEZONE = "America/New_York";

/**
 * "Today" as a `YYYY-MM-DD` string in the business's timezone — the same definition
 * the backend uses for due-date bucketing (TaskMapper.todayInBusinessTimezone) and the
 * daily digest cron. Comparing against this string, not against a local `Date`, keeps
 * "overdue" / "due today" identical everywhere in the app regardless of the viewer's
 * own timezone or the hours around midnight.
 *
 * `en-CA` happens to format as `YYYY-MM-DD`, matching the `DATE`-typed fields (also
 * `YYYY-MM-DD` strings) it gets compared against — no Date object round-trip.
 */
export function todayInBusinessTimezone(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TIMEZONE }).format(new Date());
}
