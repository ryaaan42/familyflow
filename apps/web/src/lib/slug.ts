export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function buildBirthListSlug(householdName: string, fallbackSeed?: string): string {
  const base = slugify(householdName) || "famille";
  const suffix = (fallbackSeed ?? Math.random().toString(36).slice(2, 7)).toLowerCase();
  return `${base}-naissance-${suffix}`;
}
