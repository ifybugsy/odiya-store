// Utility function to get user initials from first and last name
export function getUserInitials(firstName?: string, lastName?: string): string {
  if (!firstName) return "?"
  const first = firstName[0]?.toUpperCase() || ""
  const last = lastName?.[0]?.toUpperCase() || ""
  return `${first}${last}`.trim() || "?"
}
