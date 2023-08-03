import {
  addDependenciesToPackageJson,
  convertNxGenerator,
  formatFiles,
  generateFiles,
  readNxJson,
  removeDependenciesFromPackageJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import { join } from 'path';
import { InitGeneratorSchema } from './schema';
import { addGitAttributesEntry, addGitIgnoreEntry } from './add-git-entry';
import { detectJavaVersion } from '../utils/java-version';
import { nxVersion } from '../utils/versions';

function addPackages(tree: Tree) {
  removeDependenciesFromPackageJson(tree, ['@nx/gradle'], []);
  return addDependenciesToPackageJson(
    tree,
    {},
    {
      '@nx/gradle': nxVersion,
    }
  );
}

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  if (!tree.exists('settings.gradle') && !tree.exists('settings.gradle.kts')) {
    // add settings.gradle at workspace root
    generateFiles(tree, join(__dirname, 'files/settings', options.dsl), '.', {
      ...options,
      javaVersion: detectJavaVersion(),
    });
  }

  if (!tree.exists('gradle')) {
    // add gradle files at workspace root
    generateFiles(tree, join(__dirname, 'files/root'), '.', options);

    for (const gradleExecutable of ['gradlew', 'gradlew.bat']) {
      // Read and Execute, not alter
      tree.changePermissions(gradleExecutable, '755');
    }
  }
  addGitIgnoreEntry(tree);
  addGitAttributesEntry(tree);

  const nxJson = readNxJson(tree);
  const installTask = addPackages(tree);

  updateNxJson(tree, {
    ...nxJson,
    plugins: Array.from(new Set([...(nxJson.plugins ?? []), '@nx/gradle'])),
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return installTask;
}

export default initGenerator;
export const initSchematic = convertNxGenerator(initGenerator);
