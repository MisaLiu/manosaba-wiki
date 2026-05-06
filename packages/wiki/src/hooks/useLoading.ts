import { useEffect } from 'preact/hooks';
import { useItemStore } from '../store/item';
import { useRecipeStore } from '../store/recipe';

export const useLoading = () => {
  const item = useItemStore();
  const recipe = useRecipeStore();

  const loading = (item.loading || recipe.loading) ?? false;
  const error = (item.error || recipe.error) ?? null;

  useEffect(() => {
    Promise.all([
      item.fetchItems(),
      recipe.fetchRecipes(),
    ]);
  }, []);

  return {
    loading,
    error,
  };
};
