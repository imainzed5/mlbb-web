export const primaryNavItems = [
  { href: "/", label: "Home" },
  { href: "/heroes", label: "Heroes" },
  { href: "/heroes/rank", label: "Rank" },
  { href: "/meta", label: "Meta" },
  { href: "/player", label: "Account" },
] as const;

export const exploreNavItems = [
  { href: "/heroes/rank", label: "Rank board" },
  { href: "/academy", label: "Academy" },
  { href: "/esports", label: "Esports" },
  { href: "/tools", label: "Tools" },
  { href: "/wallpapers", label: "Wallpapers" },
] as const;

export function isExplorePath(pathname: string) {
  return exploreNavItems.some(item => isActivePath(pathname, item.href));
}

export function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/heroes") {
    return pathname === "/heroes" || (pathname.startsWith("/heroes/") && !pathname.startsWith("/heroes/rank"));
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
