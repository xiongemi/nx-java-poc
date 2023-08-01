export interface InitGeneratorSchema {
  name: string;
  dsl: 'groovy' | 'kotlin';
  javaVersion: string | number;
}
