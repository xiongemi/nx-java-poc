import { generateFiles, Tree } from '@nx/devkit';
import * as path from 'path';
import { LibraryGeneratorSchema } from './schema';
import { normalizeOptions } from '../gradle-project/normalize-schema';
import gradleProjectGenerator from '../gradle-project/generator';

export async function libraryGenerator(
  tree: Tree,
  options: LibraryGeneratorSchema
) {
  const task = gradleProjectGenerator(tree, {
    ...options,
    projectType: 'library',
  });
  const normalizedOptions = normalizeOptions(tree, {
    ...options,
    projectType: 'library',
  });
  generateFiles(
    tree,
    path.join(__dirname, 'files', normalizedOptions.language),
    normalizedOptions.projectRoot,
    normalizedOptions
  );
  return task;
}

export default libraryGenerator;
