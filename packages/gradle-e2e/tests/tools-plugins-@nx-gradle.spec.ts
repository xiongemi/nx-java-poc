import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { mkdirSync, rmSync } from 'fs';

describe('tools-plugins-@nx-gradle', () => {
  let projectDirectory: string;

  function execInTestProject(command: string) {
    return execSync(command, {
      cwd: projectDirectory,
      stdio: 'inherit',
    });
  }

  beforeAll(() => {
    const projectName = 'test-project';
    projectDirectory = join(process.cwd(), 'tmp', projectName);

    // Cleanup the test project
    rmSync(projectDirectory, {
      recursive: true,
      force: true,
    });

    projectDirectory = createTestProject(projectName, projectDirectory);

    // The plugin has been built and published to a local registry in the jest globalSetup
    // Install the plugin built with the latest source code into the test repo
    execSync(`npm install @nx/gradle@e2e`, {
      cwd: projectDirectory,
      stdio: 'inherit',
      env: process.env,
    });
  });

  afterAll(() => {
    execInTestProject('code .');
  });

  it('should setup a gradle project', () => {
    ['java', 'groovy', 'kotlin'].forEach((language, index) => {
      execInTestProject(
        `nx g @nx/gradle:application app-${language} --language=${language} --dsl=groovy --sourcePackage=com.app${index} --rootProjectName=test`
      );
      execInTestProject(
        `nx g @nx/gradle:library lib-${language} --language=${language} --dsl=groovy --sourcePackage=com.app${index} --rootProjectName=test`
      );

      execInTestProject(`nx build app-${language}`);
      execInTestProject(`nx build lib-${language}`);
      execInTestProject(`nx test app-${language}`);
      execInTestProject(`nx test lib-${language}`);
    });
  });
});

/**
 * Creates a test project with create-nx-workspace and installs the plugin
 * @returns The directory where the test project was created
 */
function createTestProject(projectName: string, projectDirectory: string) {
  // Ensure projectDirectory is empty
  rmSync(projectDirectory, {
    recursive: true,
    force: true,
  });
  mkdirSync(dirname(projectDirectory), {
    recursive: true,
  });

  execSync(
    `npx --yes create-nx-workspace@latest ${projectName} --preset empty --no-nxCloud --no-interactive`,
    {
      cwd: dirname(projectDirectory),
      stdio: 'inherit',
      env: process.env,
    }
  );
  console.log(`Created test project in "${projectDirectory}"`);

  return projectDirectory;
}
