export interface InitGeneratorSchema {
  name: string;
  dsl: 'groovy' | 'kotlin';
  skipFormat?: boolean;
}
