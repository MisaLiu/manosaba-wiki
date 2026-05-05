import 'preact/compat';
import { create } from 'zustand';
import type { Recipe } from '@manosaba/types';

interface RecipeStore {
  recipes: Recipe[],
  loading: boolean,
  error: string | null,
  fetchRecipes: () => Promise<void>,
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  loading: false,
  error: null,
  fetchRecipes: async () => {
    if (get().loading) return;
    if (get().error) return;
    if (get().recipes.length > 0) return;

    set({ loading: true, error: null });

    try {
      const response = await fetch('recipes.json');
      const recipes = await response.json();
      set({ recipes, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message ?? JSON.stringify(error) });
      console.error(error);
    }
  }
}));
