import {
  formatFiles,
  generateFiles,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { KtorApplicationGeneratorSchema } from './schema';
import { gradleProjectGenerator } from '@nx/gradle';
import { join } from 'node:path';
import { normalizeOptions } from './normalize-schema';
import initGenerator from '../init/generator';

export async function applicationGenerator(
  tree: Tree,
  options: KtorApplicationGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);
  const task = await gradleProjectGenerator(tree, {
    ...normalizedOptions,
    language: 'kotlin',
    dsl: 'kotlin',
  });

  const projectConfiguration = readProjectConfiguration(
    tree,
    normalizedOptions.name
  );

  projectConfiguration.targets.serve = {
    dependsOn: ['build'],
    executor: '@nx/gradle:run',
    options: {},
  };

  updateProjectConfiguration(
    tree,
    normalizedOptions.name,
    projectConfiguration
  );

  await initGenerator(tree, { skipFormat: true });

  generateFiles(
    tree,
    join(__dirname, 'files'),
    options.directory ?? options.name,
    normalizedOptions
  );
  await formatFiles(tree);

  return task;
}

export default applicationGenerator;
