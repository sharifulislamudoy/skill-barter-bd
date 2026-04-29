// types/hero.ts
export interface SkillCard {
  id: number;
  name: string;
  icon: string; // lucide icon name, we'll map it inside the component
  color: string; // tailwind bg class
}