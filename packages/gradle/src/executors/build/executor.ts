import { ExecutorContext } from '@nx/devkit';
import { BuildExecutorSchema } from './schema';
import { getProjectRoot } from '../utils/utils';
import { execGradle } from '../../utils/exec-gradle';

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
) {
  const projectRoot = getProjectRoot(context);
  execGradle(['build'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  return {
    success: true,
  };
}
