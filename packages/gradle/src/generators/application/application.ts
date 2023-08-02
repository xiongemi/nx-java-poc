import { Tree } from '@nx/devkit';
import { ApplicationGeneratorSchema } from './schema';
import gradleProjectGenerator from '../gradle-project/generator';

export async function applicationGenerator(
  tree: Tree,
  options: ApplicationGeneratorSchema
) {
  const task = gradleProjectGenerator(tree, options);
  return task;
}

export default applicationGenerator;
