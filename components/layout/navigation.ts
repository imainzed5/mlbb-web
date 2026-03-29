export const primaryNavItems = [
  { href: "/", label: "Home" },
  { href: "/heroes", label: "Heroes" },
  { href: "/heroes/rank", label: "Rank" },
  { href: "/meta", label: "Meta" },
  { href: "/player", label: "Account" },
] as const;

export function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/heroes") {
    return pathname === "/heroes" || (pathname.startsWith("/heroes/") && !pathname.startsWith("/heroes/rank"));
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
