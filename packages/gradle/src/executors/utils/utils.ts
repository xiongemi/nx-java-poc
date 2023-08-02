import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { ExecutorContext } from '@nx/devkit';

export function getProjectRoot(context: ExecutorContext) {
  return context.projectsConfigurations.projects[context.projectName].root;
}

export function execGradle(
  args: string[],
  projectRoot: string,
  context: ExecutorContext
) {
  const gradleBinaryPath = join(context.root, './gradlew');
  if (!existsSync(gradleBinaryPath)) {
    throw new Error('Gradle is not setup. Run "nx g @nx/gradle:init"');
  }

  execFileSync(gradleBinaryPath, args, {
    cwd: projectRoot,
    stdio: 'inherit',
  });
}
