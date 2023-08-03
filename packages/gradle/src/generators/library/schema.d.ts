export interface LibraryGeneratorSchema {
  name: string;
  directory?: string;
  language: 'java' | 'kotlin' | 'groovy';
  sourcePackage: string;
  dsl: 'groovy' | 'kotlin';
  rootProjectName: string;
}
