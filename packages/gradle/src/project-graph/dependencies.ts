import {
  ProjectGraph,
  ProjectGraphBuilder,
  ProjectGraphProcessorContext,
} from '@nx/devkit';
import { execGradle } from '../utils/exec-gradle';
import { basename } from 'node:path';

export function processProjectGraph(
  graph: ProjectGraph,
  context: ProjectGraphProcessorContext
) {
  const builder = new ProjectGraphBuilder(graph, context.fileMap);
  const dependencies = locateDependencies(graph, context);

  for (const dep of dependencies) {
    try {
      builder.addStaticDependency(dep.source, dep.target);
    } catch {}
  }

  return builder.getUpdatedProjectGraph();
}

function locateDependencies(
  graph: ProjectGraph,
  { filesToProcess, projectsConfigurations }: ProjectGraphProcessorContext
) {
  const dependencies: { source: string; target: string }[] = [];
  for (const [source, files] of Object.entries(filesToProcess)) {
    const hasGradleFile = files.some(
      (f) => basename(f.file) === 'build.gradle.kts'
    );

    if (hasGradleFile) {
      const projectRoot = projectsConfigurations.projects[source].root;
      const lines = execGradle(['dependencies'], {
        cwd: projectRoot,
      })
        .toString()
        .split('\n');
      let inDeps = false;
      for (const line of lines) {
        if (line.startsWith('implementation ')) {
          inDeps = true;
          continue;
        }

        if (inDeps) {
          if (line === '') {
            inDeps = false;
            continue;
          }
          const [indents, dep] = line.split('---');
          if (indents === '\\') {
            const target = dep.replace(/ \(n\)$/, '').trim();
            console.log(source, '=>', target);
            dependencies.push({
              source: source,
              target,
            });
          }
        }
      }
    }
  }
  return dependencies;
}
