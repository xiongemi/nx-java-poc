import { joinPathFragments, names } from '@nx/devkit';
import { KtorLibraryGeneratorSchema } from './schema';

export interface NormalizedSchema extends KtorLibraryGeneratorSchema {
  libClassName: string;
  libSettingName: string; // to used in settings.gradle
  projectName: string;
  libProjectRoot: string;
  sourcePackagePath: string;
}

export function normalizeOptions(
  options: KtorLibraryGeneratorSchema
): NormalizedSchema {
  const { fileName: libFileName, className: libClassName } = names(
    options.name
  );
  const projectName = options.name.replace(new RegExp('/', 'g'), '-');
  const libProjectRoot = options.directory ?? options.name;
  const libSettingName = libProjectRoot.replace(new RegExp('/', 'g'), ':');
  const sourcePackagePath = joinPathFragments(
    ...options.sourcePackage.split('.')
  );

  return {
    ...options,
    name: libFileName,
    libClassName,
    libSettingName,
    projectName,
    libProjectRoot,
    sourcePackagePath,
  };
}
