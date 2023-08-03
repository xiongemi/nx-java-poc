import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';

describe('tools-plugins-@nx-gradle', () => {
  let projectDirectory: string;

  function execInTestProject(command: string) {
    return execSync(command, {
      cwd: projectDirectory,
      stdio: 'inherit',
      env: process.env,
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
    execInTestProject(`git init`);

    const nxJson = JSON.parse(
      readFileSync(join(projectDirectory, 'nx.json')).toString()
    );
    nxJson.installation.plugins = {
      '@nx/ktor': 'e2e',
    };
    writeFileSync(
      join(projectDirectory, 'nx.json'),
      JSON.stringify(nxJson, null, 2)
    );
  });

  afterAll(() => {
    execInTestProject('code .');
  });

  it('should setup a ktor project', () => {
    execInTestProject(
      `./nx g @nx/ktor:application api --javaVersion=18 --sourcePackage=com.example.api --rootProjectName=test`
    );

    execInTestProject(`./nx build api`);
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
  mkdirSync(projectDirectory, {
    recursive: true,
  });

  execSync(`npx --yes nx@latest init --useDotNxInstallation --no-interactive`, {
    cwd: projectDirectory,
    stdio: 'inherit',
    env: process.env,
  });
  console.log(`Created test project in "${projectDirectory}"`);

  return projectDirectory;
}
