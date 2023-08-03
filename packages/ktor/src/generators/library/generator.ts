import {
  Tree, generateFiles,
} from '@nx/devkit';
import { join } from 'path';
import { KtorLibraryGeneratorSchema } from './schema';
import { libraryGenerator as gradleLibraryGenerator } from '@nx/gradle/generators';
import { normalizeOptions } from './normalize-schema';

export async function libraryGenerator(
  tree: Tree,
  options: KtorLibraryGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(options);
  const task = await gradleLibraryGenerator(tree, {
    ...normalizedOptions,
    language: 'kotlin',
    dsl: 'kotlin',
  });

  generateFiles(
    tree,
    join(__dirname, 'files'),
    options.directory ?? options.name,
    normalizedOptions
  );
  return task;
}

export default libraryGenerator;
