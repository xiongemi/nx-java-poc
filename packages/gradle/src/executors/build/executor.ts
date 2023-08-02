import { ExecutorContext } from '@nx/devkit';
import { BuildExecutorSchema } from './schema';
import { execGradle, getProjectRoot } from '../utils/utils';

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
) {
  const projectRoot = getProjectRoot(context);
  execGradle(['build'], projectRoot, context);

  return {
    success: true,
  };
}
