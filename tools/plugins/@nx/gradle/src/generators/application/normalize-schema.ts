import {
  Tree,
  extractLayoutDirectory,
  getWorkspaceLayout,
  joinPathFragments,
  names,
} from '@nx/devkit';
import { ApplicationGeneratorSchema } from './schema';

export interface NormalizedSchema extends ApplicationGeneratorSchema {
  appClassName: string;
  appSettingName: string; // to used in settings.gradle
  projectName: string;
  appProjectRoot: string;
  sourcePackagePath: string;
}

export function normalizeOptions(
  host: Tree,
  options: ApplicationGeneratorSchema
): NormalizedSchema {
  if (host.exists('settings.gradle')) {// dsl could only to be groovy
    if (options.dsl !== 'groovy') {
      throw new Error(
        `Cannot generate a ${options.language} application with a groovy settings.gradle file.`
      );
    }
  }
  if (host.exists('settings.gradle.kts')) {// dsl could only to be kotlin
    if (options.dsl !== 'kotlin') {
      throw new Error(
        `Cannot generate a ${options.language} application with a kotlin settings.gradle.kts file.`
      );
    }
  }

  const { layoutDirectory, projectDirectory } = extractLayoutDirectory(
    options.directory
  );

  const appsDir = layoutDirectory ?? getWorkspaceLayout(host).appsDir;

  const { fileName: appFileName, className: appClassName } = names(options.name);
  const appDirectory = projectDirectory
    ? `${names(projectDirectory).fileName}/${names(options.name).fileName}`
    : names(options.name).fileName;
  const projectName = appDirectory.replace(new RegExp('/', 'g'), '-');
  const appProjectRoot = joinPathFragments(appsDir, appDirectory);
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
