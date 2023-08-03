import { ExecutorContext } from '@nx/devkit';
import { execGradle } from '../../utils/exec-gradle';
import { getProjectRoot } from '../utils/utils';
import { TestExecutorSchema } from './schema';

export default async function runExecutor(
  options: TestExecutorSchema,
  context: ExecutorContext
) {
  const projectRoot = getProjectRoot(context);
  execGradle(['test'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  return {
    success: true,
  };
}
