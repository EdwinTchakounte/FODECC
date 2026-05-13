/** Concatène des classes en ignorant les valeurs falsy (mini-clsx, sans dépendance). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
