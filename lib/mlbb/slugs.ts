function stripDiacritics(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

export function createHeroSlug(name: string) {
  return stripDiacritics(name)
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function heroSlugMatches(name: string, slug: string) {
  return createHeroSlug(name) === slug;
}