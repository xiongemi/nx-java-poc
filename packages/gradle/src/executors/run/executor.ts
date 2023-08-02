import { RunExecutorSchema } from './schema';
import { getProjectRoot } from '../utils/utils';
import { ExecutorContext } from '@nx/devkit';
import { execGradle } from '../../utils/exec-gradle';

export default async function runExecutor(
  options: RunExecutorSchema,
  context: ExecutorContext
) {
  const projectRoot = getProjectRoot(context);
  execGradle(['run'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  return {
    success: true,
  };
}
