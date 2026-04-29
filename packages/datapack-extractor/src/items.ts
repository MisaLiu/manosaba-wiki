import { writeArtifacts } from './index';

writeArtifacts().then((result) => {
  console.log('Wrote items.json');
  console.log('Wrote recipes.json');
  console.log({
    definitionCount: result.definitions.length,
    triggerCount: result.triggers.length,
    recipeCount: result.recipes.length,
    supplyTemplateCount: result.supplyDefinitions.template.length,
    supplyReplacementCount: result.supplyDefinitions.replacement.length,
    linkedItemCount: result.linkResult.linkedItems.length,
    variantAnalysisCount: result.variantResult.analyses.length,
    itemCount: result.items.items.length,
  });
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
