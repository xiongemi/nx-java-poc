import { addProjectConfiguration, generateFiles, Tree } from '@nx/devkit';
import { join } from 'path';
import { ApplicationGeneratorSchema } from './schema';
import { NormalizedSchema, normalizeOptions } from './normalize-schema';
import { initGenerator } from '../init/init';

export async function applicationGenerator(
  tree: Tree,
  options: ApplicationGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);
  await initGenerator(tree, {
    name: normalizedOptions.rootProjectName,
    dsl: normalizedOptions.dsl,
    javaVersion: normalizedOptions.javaVersion,
  });
  addProjectConfiguration(tree, normalizedOptions.name, {
    root: normalizedOptions.appProjectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.appProjectRoot}/src`,
    targets: {},
  });
  // add src directory
  generateFiles(
    tree,
    join(__dirname, 'files', normalizedOptions.language, 'src'),
    join(normalizedOptions.appProjectRoot, 'src'),
    normalizedOptions
  );
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
    normalizedOptions.appProjectRoot,
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
  if (!settings.includes(options.appSettingName)) {
    settings += `\ninclude("${options.appSettingName}")`;
    tree.write(settingsPath, settings);
  }
}

export default applicationGenerator;
