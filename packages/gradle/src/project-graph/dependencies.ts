import {
  ProjectGraph,
  ProjectGraphBuilder,
  ProjectGraphProcessorContext,
} from '@nx/devkit';
import { execGradle } from '../utils/exec-gradle';
import { basename, dirname } from 'node:path';

export function processProjectGraph(
  graph: ProjectGraph,
  context: ProjectGraphProcessorContext
) {
  const builder = new ProjectGraphBuilder(graph, context.fileMap);
  const dependencies = locateDependencies(graph, context);

  for (const dep of dependencies) {
    try {
      builder.addStaticDependency(dep.source, dep.target, dep.file);
    } catch {}
  }

  return builder.getUpdatedProjectGraph();
}

const gradleConfigFileNames = new Set(['build.gradle', 'build.gradle.kts']);

function locateDependencies(
  graph: ProjectGraph,
  { filesToProcess, projectsConfigurations }: ProjectGraphProcessorContext
) {
  const dependencies: { source: string; target: string; file: string }[] = [];
  for (const [source, files] of Object.entries(filesToProcess)) {
    for (const file of files) {
      if (gradleConfigFileNames.has(basename(file.file))) {
        const projectRoot = dirname(file.file);
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
            const [indents, dep] = line.split('--- ');
            if (indents === '\\' && dep.startsWith('project ')) {
              const target = dep
                .substring('project '.length)
                .replace(/ \(n\)$/, '')
                .trim();
              console.log(source, '=>', target);
              dependencies.push({
                source: source,
                target,
                file: file.file,
              });
            }
          }
        }
      }
    }
  }
  return dependencies;
}
