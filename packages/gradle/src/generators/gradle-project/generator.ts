import { addProjectConfiguration, generateFiles, Tree } from '@nx/devkit';
import { join } from 'path';
import { ProjectGeneratorSchema } from './schema';
import { NormalizedSchema, normalizeOptions } from './normalize-schema';
import { initGenerator } from '../init/init';

export async function gradleProjectGenerator(
  tree: Tree,
  options: ProjectGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);
  await initGenerator(tree, {
    name: normalizedOptions.rootProjectName,
    dsl: normalizedOptions.dsl,
  });
  addProjectConfiguration(tree, normalizedOptions.name, {
    root: normalizedOptions.projectRoot,
    projectType: options.projectType,
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      ...(options.projectType === 'application'
        ? {
            run: {
              dependsOn: ['build'],
              executor: '@nx/gradle:run',
              options: {},
            },
          }
        : {}),
      build: {
        executor: '@nx/gradle:build',
        options: {},
      },
      test: {
        executor: '@nx/gradle:test',
        options: {},
      },
    },
  });

  // add app's build.gradle or build.gradle.kts file
  generateFiles(
    tree,
    join(
      __dirname,
      'files',
      normalizedOptions.language,
      'build',
      normalizedOptions.dsl
    ),
    normalizedOptions.projectRoot,
    normalizedOptions
  );

  addToSettings(tree, normalizedOptions);
}

function addToSettings(tree: Tree, options: NormalizedSchema) {
  const settingsPath =
    options.dsl === 'groovy' ? 'settings.gradle' : 'settings.gradle.kts';
  let settings = tree.read(settingsPath, 'utf-8');
  if (!settings) {
    throw new Error(`Could not find ${settingsPath}`);
  }
  if (!settings.includes(options.projectSettingName)) {
    settings += `\ninclude("${options.projectSettingName}")`;
    tree.write(settingsPath, settings);
  }
}

export default gradleProjectGenerator;
