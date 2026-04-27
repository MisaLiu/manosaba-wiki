import { glob } from 'tinyglobby';

export const scanSupplyTypeFiles = async () => {
  return glob([
    'data/supplies/function/type/*/random.mcfunction',
  ], {
    cwd: DATAPACK_ROOT,
    absolute: true,
  });
};
