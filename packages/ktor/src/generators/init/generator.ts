import { formatFiles, Tree } from '@nx/devkit';
import { InitGeneratorSchema } from './schema';

const ktorVersion = '2.3.3';
const kotlinVersion = '1.9.0';
const logbackVersion = '1.2.11';

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  createGradleProperties(tree);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}
function createGradleProperties(tree: Tree) {
  const contents = `ktor_version=${ktorVersion}
  kotlin_version=${kotlinVersion}
  logback_version=${logbackVersion}
  kotlin.code.style=official`;

  tree.write('gradle.properties', contents);
}

export default initGenerator;
