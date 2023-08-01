export interface ApplicationGeneratorSchema {
  name: string;
  directory?: string;
  language: 'java' | 'kotlin' | 'groovy';
  sourcePackage: string;
  dsl: 'groovy' | 'kotlin';
  javaVersion: string | number;
  rootProjectName: string;
}
