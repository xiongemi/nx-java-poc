export interface KtorApplicationGeneratorSchema {
  name: string;
  directory?: string;
  sourcePackage: string;
  javaVersion: string | number;
  rootProjectName: string;
}
