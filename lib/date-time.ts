const publicTimestampFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

// Server and browser defaults can differ. Keep hydration text and the label stable.
export function formatPublicTimestamp(value: string) {
  return `${publicTimestampFormatter.format(new Date(value))} (UTC+8)`;
}
