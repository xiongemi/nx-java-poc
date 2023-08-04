import {
  ProjectFileMap,
  ProjectGraph,
  ProjectGraphBuilder,
  ProjectGraphProcessorContext,
  workspaceRoot,
} from '@nx/devkit';
import { execGradleAsync } from '../utils/exec-gradle';
import { basename, dirname, relative } from 'node:path';
import {
  createProjectRootMappings,
  findProjectForPath,
  ProjectRootMappings,
} from 'nx/src/project-graph/utils/find-project-for-path';

export async function processProjectGraph(
  graph: ProjectGraph,
  context: ProjectGraphProcessorContext
) {
  const builder = new ProjectGraphBuilder(graph, context.fileMap);
  const projectRootMappings = createProjectRootMappings(graph.nodes);
  console.time('locating gradle dependencies');
  const dependencies = await locateDependencies(projectRootMappings, context);
  console.timeEnd('locating gradle dependencies');

  for (const dep of dependencies) {
    try {
      builder.addStaticDependency(dep.source, dep.target, dep.file);
    } catch {
      /* noop */
    }
  }

  return builder.getUpdatedProjectGraph();
}

const gradleConfigFileNames = new Set(['build.gradle', 'build.gradle.kts']);

function findGradleFiles(filesToProcess: ProjectFileMap) {
  const gradleFiles: [string, string][] = [];

  for (const [source, files] of Object.entries(filesToProcess)) {
    for (const file of files) {
      if (gradleConfigFileNames.has(basename(file.file))) {
        gradleFiles.push([source, file.file]);
      }
    }
  }
  return gradleFiles;
}

async function locateDependencies(
  projectRootMappings: ProjectRootMappings,
  { filesToProcess }: ProjectGraphProcessorContext
): Promise<
  {
    source: string;
    target: string;
    file: string;
  }[]
> {
  const gradleFiles = findGradleFiles(filesToProcess);
  return (
    await Promise.all(
      gradleFiles.map(async ([source, gradleFile]) => {
        const projectRoot = dirname(gradleFile);
        console.time('getting gradle dependencies for ' + projectRoot);
        const lines = (
          await execGradleAsync(
            [
              'dependencies',
              '--configuration=implementationDependenciesMetadata',
            ],
            {
              cwd: projectRoot,
            }
          )
        )
          .toString()
          .split('\n');
        console.timeEnd('getting gradle dependencies for ' + projectRoot);
        let inDeps = false;
        const gradleProjectDependencies: string[] = [];
        console.time('processing output for ' + projectRoot);
        for (const line of lines) {
          if (line.startsWith('implementationDependenciesMetadata')) {
            inDeps = true;
            continue;
          }

          if (inDeps) {
            if (line === '') {
              inDeps = false;
              continue;
            }
            const [indents, dep] = line.split('--- ');
            if (
              (indents === '\\' || indents === '+') &&
              dep.startsWith('project ')
            ) {
              const targetGradleProjectName = dep
                .substring('project '.length)
                .replace(/ \(n\)$/, '')
                .trim();
              gradleProjectDependencies.push(targetGradleProjectName);
            }
          }
        }
        console.timeEnd('processing output for ' + projectRoot);

        console.time('getting nx names for ' + projectRoot);
        const deps = Promise.all(
          gradleProjectDependencies.map(async (gradleProjectName) => {
            const target = await getNxProjectName(
              gradleProjectName,
              projectRootMappings
            );
            return {
              source: source,
              target,
              file: gradleFile,
            };
          })
        );
        console.timeEnd('getting nx names for ' + projectRoot);

        return deps;
      })
    )
  ).flat();
}

const gradleToNxProjectMap = new Map<string, string>();

async function getNxProjectName(
  gradleProjectName: string,
  projectRootMappings: ProjectRootMappings
): Promise<string> {
  if (gradleToNxProjectMap.has(gradleProjectName)) {
    return gradleToNxProjectMap.get(gradleProjectName);
  }
  const gradleProjectProperties = (
    await execGradleAsync([gradleProjectName + ':properties'], {})
  ).toString();
  for (const line of gradleProjectProperties.split('\n')) {
    if (line.startsWith('buildFile: ')) {
      const buildFilePath = relative(
        workspaceRoot,
        line.substring('buildFile: '.length).trim()
      );

      const nxProjectName = findProjectForPath(
        buildFilePath,
        projectRootMappings
      );
      gradleToNxProjectMap.set(gradleProjectName, nxProjectName);

      return nxProjectName;
    }
  }
}
