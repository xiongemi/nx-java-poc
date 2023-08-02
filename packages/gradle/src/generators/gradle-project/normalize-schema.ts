import { Tree, joinPathFragments, names } from '@nx/devkit';
import { ProjectGeneratorSchema } from './schema';

export interface NormalizedSchema extends ProjectGeneratorSchema {
  appClassName: string;
  appSettingName: string; // to used in settings.gradle
  projectName: string;
  appProjectRoot: string;
  sourcePackagePath: string;
}

export function normalizeOptions(
  host: Tree,
  options: ProjectGeneratorSchema
): NormalizedSchema {
  if (host.exists('settings.gradle')) {
    // dsl could only to be groovy
    if (options.dsl !== 'groovy') {
      throw new Error(
        `Cannot generate a ${options.language} application with a groovy settings.gradle file.`
      );
    }
  }
  if (host.exists('settings.gradle.kts')) {
    // dsl could only to be kotlin
    if (options.dsl !== 'kotlin') {
      throw new Error(
        `Cannot generate a ${options.language} application with a kotlin settings.gradle.kts file.`
      );
    }
  }

  const { fileName: appFileName, className: appClassName } = names(
    options.name
  );
  const projectName = options.name.replace(new RegExp('/', 'g'), '-');
  const appProjectRoot = options.directory ?? options.name;
  const appSettingName = appProjectRoot.replace(new RegExp('/', 'g'), ':');
  const sourcePackagePath = joinPathFragments(
    ...options.sourcePackage.split('.')
  );

  return {
    ...options,
    name: appFileName,
    appClassName,
    appSettingName,
    projectName,
    appProjectRoot,
    sourcePackagePath,
  };
}
