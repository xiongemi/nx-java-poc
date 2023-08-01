import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { applicationGenerator } from './application';
import { ApplicationGeneratorSchema } from './schema';

describe('application generator', () => {
  let tree: Tree;
  const options: ApplicationGeneratorSchema = { rootProject: false, rootProjectName: 'root', private name() {
    
  }name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await applicationGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
