export const primaryNavItems = [
  { href: "/heroes", label: "Tier List" },
  { href: "/meta", label: "Meta" },
  { href: "/esports", label: "Esports" },
  { href: "/academy", label: "Academy" },
  { href: "/tools", label: "Tools" },
  { href: "/wallpapers", label: "Wallpapers" },
] as const;

export const accountNavItem = { href: "/player", label: "Account" } as const;

export function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/heroes") {
    return pathname === "/heroes" || (pathname.startsWith("/heroes/") && !pathname.endsWith("/wallpapers"));
  }

  if (href === "/wallpapers") {
    return pathname === "/wallpapers" || (pathname.startsWith("/heroes/") && pathname.endsWith("/wallpapers"));
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
