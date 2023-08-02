import { ExecutorContext } from '@nx/devkit';

export function getProjectRoot(context: ExecutorContext) {
  return context.projectsConfigurations.projects[context.projectName].root;
}
