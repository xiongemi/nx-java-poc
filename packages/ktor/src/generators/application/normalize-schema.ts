import { joinPathFragments, names } from '@nx/devkit';
import { KtorApplicationGeneratorSchema } from './schema';

export interface NormalizedSchema extends KtorApplicationGeneratorSchema {
  appClassName: string;
  appSettingName: string; // to used in settings.gradle
  projectName: string;
  appProjectRoot: string;
  sourcePackagePath: string;
}

export function normalizeOptions(
  options: KtorApplicationGeneratorSchema
): NormalizedSchema {
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
