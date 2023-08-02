import { ExecutorContext } from '@nx/devkit';
import { BuildExecutorSchema } from './schema';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
) {
  const projectRoot =
    context.projectsConfigurations.projects[context.projectName].root;

  const gradleBinaryPath = join(context.root, './gradlew');
  if (!existsSync(gradleBinaryPath)) {
    throw new Error('Gradle is not setup. Run "nx g @nx/gradle:init"');
  }

  execFileSync(gradleBinaryPath, ['build'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  return {
    success: true,
  };
}
