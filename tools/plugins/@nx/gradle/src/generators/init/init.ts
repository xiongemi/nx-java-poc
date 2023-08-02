import { convertNxGenerator, generateFiles, Tree } from '@nx/devkit';
import { join } from 'path';
import { InitGeneratorSchema } from './schema';
import { addGitAttributesEntry, addGitIgnoreEntry } from './add-git-entry';

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  if (!tree.exists('settings.gradle') && !tree.exists('settings.gradle.kts')) {
    // add settings.gradle at workspace root
    generateFiles(
      tree,
      join(__dirname, 'files/settings', options.dsl),
      '.',
      options
    );
  }

  // check java version
  if (tree.exists('.java-version')) {
    const javaVersion = tree.read('.java-version')?.toString().trim();
    if (!javaVersion) {
      tree.write('.java-version', options.javaVersion.toString());
    } else if (
      parseInt(javaVersion) !== parseInt(options.javaVersion.toString())
    ) {
      throw new Error(
        `Java version mismatch. Workspace java version is ${javaVersion}.`
      );
    }
  } else if (parseInt(options.javaVersion.toString()) < 7) {
    throw new Error(`Java version ${options.javaVersion} is not supported.`);
  } else {
    tree.write('.java-version', options.javaVersion.toString());
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
}

export default initGenerator;
export const initSchematic = convertNxGenerator(initGenerator);
