import { useState, useMemo } from 'preact/hooks';
import { useRecipeStore } from '../../store/recipe';
import { SearchBar } from '../SearchBar/SearchBar';
import { RecipeCard } from './RecipeCard';
import type { SearchIndex } from '../SearchBar/SearchBar';
import './style.css';

export const RecipeList = () => {
  const [ searchResult, setSearchResult ] = useState<SearchIndex[] | null>(null);

  const recipesOrig = useRecipeStore(e => e.recipes);
  const recipeSearchIndex = useMemo(() => (
    recipesOrig.map(e => ({ id: e.id, name: e.result.name ?? e.linkedItemId ?? e.id }))
  ), [ recipesOrig ]);

  const updateSearchResult = (results: SearchIndex[] | null) => {
    setSearchResult(results);
  };

  const recipes = (
    recipesOrig
      .filter((item) => {
        if (!searchResult) return true;

        return (
          searchResult.findIndex(e => e.id === item.id) !== -1
        );
      })
  );

  return (
    <div>
      <SearchBar
        data={recipeSearchIndex}
        config={{
          keys: [ 'name' ],
          threshold: 0.3,
        }}
        onSearch={updateSearchResult}
      />
      <div class="recipe-list mt-2">
        {recipes.map((recipe) => (
          <RecipeCard recipe={recipe} />
        ))}
      </div>
    </div>
  );
};
