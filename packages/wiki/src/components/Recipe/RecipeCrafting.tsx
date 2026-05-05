import { MCUICraftingTable } from '../MCUI/MDUICraftingTable';
import { MCUICampfire } from '../MCUI/MDUICampfire';
import { MCUIItem } from '../MCUI/MCUIItem';
import type { Recipe, RecipeIngredient } from '@manosaba/types';

type RecipeCraftingProps = {
  recipe: Recipe,
};

const renderIngredient = (ingredient: RecipeIngredient) => (
  <MCUIItem
    name={ingredient.name ?? '未知'}
    textureKey={ingredient.textureKey ?? 'minecraft:unknown'}
    descriptionRich={ingredient.descriptionRich}
  />
);

const renderResult = (recipe: Recipe) => (
  <MCUIItem
    name={recipe.result.name ?? '未知'}
    textureKey={recipe.result.textureKey ?? 'minecraft:unknown'}
    descriptionRich={recipe.result.descriptionRich}
  />
);

export const RecipeCrafting = ({
  recipe
}: RecipeCraftingProps) => {
  if (recipe.kind === 'crafting_shaped' && recipe.pattern && recipe.key) {
    const inputs = recipe.pattern.flatMap(row =>
      [ ...row ].map((char) => {
        const ingredient = recipe.key![char]
        return ingredient ? renderIngredient(ingredient) : undefined
      })
    );

    return (
      <MCUICraftingTable
        inputs={inputs}
        output={renderResult(recipe)}
      />
    )
  }

  if (recipe.kind === 'crafting_shapeless' && recipe.ingredients) {
    return (
      <MCUICraftingTable
        inputs={recipe.ingredients.map(renderIngredient)}
        output={renderResult(recipe)}
        shapeless
      />
    )
  }

  if (recipe.kind === 'campfire_cooking' && recipe.ingredient) {
    return (
      <MCUICampfire
        input={renderIngredient(recipe.ingredient)}
        output={renderResult(recipe)}
      />
    );
  }

  return null;
};
