import {
  formatFiles,
  joinPathFragments,
  ProjectConfiguration,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CopyProjectGeneratorSchema } from './schema';
import applicationGenerator from '../application/generator';
import libraryGenerator from '../library/generator';

export async function copyProjectGenerator(
  tree: Tree,
  options: CopyProjectGeneratorSchema
) {
  const projectToBeCopied: ProjectConfiguration = readProjectConfiguration(
    tree,
    options.project
  );

  const newProjectRoot = options.directory ?? options.name;
  const newProjectType = projectToBeCopied.projectType;
  const buildGradle = tree.read(
    joinPathFragments(projectToBeCopied.root, 'build.gradle.kts').toString()
  );
  const sourcePackage = buildGradle?.toString().match(/group = "(.*)"/)?.[1];
  const sourcePackagePath = sourcePackage?.replace(new RegExp('\\.', 'g'), '/');

  if (newProjectType === 'application') {
    await applicationGenerator(tree, {
      name: options.name,
      directory: options.directory,
      sourcePackage: sourcePackage,
      rootProjectName: '',
    });
  } else {
    await libraryGenerator(tree, {
      name: options.name,
      directory: options.directory,
      sourcePackage: sourcePackage,
      rootProjectName: '',
    });
  }
  tree.delete(
    joinPathFragments(newProjectRoot, 'src/main/kotlin', sourcePackagePath)
  );
  tree.delete(
    joinPathFragments(newProjectRoot, 'src/test/kotlin', sourcePackagePath)
  );
  tree.write(
    joinPathFragments(
      newProjectRoot,
      'src/main/kotlin',
      sourcePackagePath,
      '.gitkeep'
    ),
    ''
  );
  tree.write(
    joinPathFragments(
      newProjectRoot,
      'src/test/kotlin',
      sourcePackagePath,
      '.gitkeep'
    ),
    ''
  );
  tree.write(
    joinPathFragments(newProjectRoot, 'build.gradle.kts'),
    buildGradle
  );
  await formatFiles(tree);
}

export default copyProjectGenerator;
