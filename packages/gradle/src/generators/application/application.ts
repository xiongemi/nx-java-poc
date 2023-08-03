import { Tree, generateFiles } from '@nx/devkit';
import { ApplicationGeneratorSchema } from './schema';
import gradleProjectGenerator from '../gradle-project/generator';
import { join } from 'path';
import { normalizeOptions } from '../gradle-project/normalize-schema';

export async function applicationGenerator(
  tree: Tree,
  options: ApplicationGeneratorSchema
) {
  const task = gradleProjectGenerator(tree, {
    ...options,
    projectType: 'application',
  });

  const normalizedOptions = normalizeOptions(tree, {
    ...options,
    projectType: 'application',
  });
  // add src directory
  generateFiles(
    tree,
    join(__dirname, 'files', normalizedOptions.language,),
    join(normalizedOptions.projectRoot),
    normalizedOptions
  );
  return task;
}

export default applicationGenerator;
