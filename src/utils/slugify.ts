// utils/slugify.ts
export const createSlug = (name: string, category: string) => {
  return `${name.toLowerCase().replace(/\s+/g, '-')}-${category.toLowerCase().replace(/\s+/g, '-')}`;
};