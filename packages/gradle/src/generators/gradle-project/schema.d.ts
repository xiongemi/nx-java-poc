import { ProjectType } from '@nx/devkit';

export interface ProjectGeneratorSchema {
  projectType: ProjectType;
  name: string;
  directory?: string;
  language: 'java' | 'kotlin' | 'groovy';
  sourcePackage: string;
  dsl: 'groovy' | 'kotlin';
  rootProjectName: string;
}
