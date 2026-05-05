import type { Recipe } from '@manosaba/types';
import { RecipeCrafting } from './RecipeCrafting';

type RecipeCardProps = {
  recipe: Recipe,
}

export const RecipeCard = ({
  recipe
}: RecipeCardProps) => {
  return (
    <div>
      <h2
        class={[
          'text-xl',
          'font-semibold'
        ].join(' ')}
        id={recipe.id}
      >
        {recipe.result.name}
      </h2>
      <RecipeCrafting recipe={recipe} />
    </div>
  )
};
