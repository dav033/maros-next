import { addDays, format } from "date-fns";

export function parseTaskQuickAdd(input: string, today = new Date()) {
  const tokens = input.trim().split(/\s+/);
  let priority: "low" | "normal" | "high" | "urgent" = "normal";
  let dueDate: string | undefined;
  let assigneeToken: string | undefined;
  let labelTokens: string[] = [];
  const titleTokens: string[] = [];

  for (const token of tokens) {
    const normalized = token.toLowerCase();
    if (normalized === "!alta" || normalized === "!urgent") priority = "urgent";
    else if (normalized === "!high") priority = "high";
    else if (normalized === "!low") priority = "low";
    else if (normalized === "hoy" || normalized === "today") dueDate = format(today, "yyyy-MM-dd");
    else if (normalized === "mañana" || normalized === "manana" || normalized === "tomorrow") {
      dueDate = format(addDays(today, 1), "yyyy-MM-dd");
    } else if (token.startsWith("@") && token.length > 1) assigneeToken = token.slice(1);
    else if (token.startsWith("#") && token.length > 1) labelTokens.push(token.slice(1));
    else titleTokens.push(token);
  }

  return { title: titleTokens.join(" ").trim() || "Untitled task", priority, dueDate, assigneeToken, labelTokens };
}
