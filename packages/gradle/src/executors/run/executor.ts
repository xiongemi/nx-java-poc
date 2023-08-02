import { RunExecutorSchema } from './schema';
import { execGradle, getProjectRoot } from '../utils/utils';
import { ExecutorContext } from '@nx/devkit';

export default async function runExecutor(
  options: RunExecutorSchema,
  context: ExecutorContext
) {
  const projectRoot = getProjectRoot(context);
  execGradle(['run'], projectRoot, context);
  return {
    success: true,
  };
}
