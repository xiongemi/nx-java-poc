import {
  CreateDependenciesContext,
  DependencyType,
  ProjectFileMap,
  ProjectGraph,
  ProjectGraphBuilder,
  ProjectGraphDependencyWithFile,
  ProjectGraphProcessorContext,
  validateDependency,
  workspaceRoot,
} from '@nx/devkit';
import { execGradleAsync } from '../utils/exec-gradle';
import { basename, relative } from 'node:path';
import {
  createProjectRootMappings,
  findProjectForPath,
  ProjectRootMappings,
} from 'nx/src/project-graph/utils/find-project-for-path';
import { readFileSync } from 'node:fs';

export const createDependencies = async ({
  filesToProcess,
  graph,
}: Pick<CreateDependenciesContext, 'filesToProcess' | 'graph'>) => {
  const projectRootMappings = createProjectRootMappings(graph.nodes);
  let dependencies: ProjectGraphDependencyWithFile[] = [];
  console.time('executing gradle commands');
  const projectReportLines = (await execGradleAsync(['projectReport'], {}))
    .toString()
    .split('\n');
  console.timeEnd('executing gradle commands');
  const { gradleProjectToNxProjectMap, buildFileToDepsMap } =
    processProjectReports(projectReportLines, projectRootMappings);

  const gradleFiles = findGradleFiles(filesToProcess);

  for (const [source, gradleFile] of gradleFiles) {
    const depsFile = buildFileToDepsMap.get(gradleFile);

    dependencies = dependencies.concat(
      processGradleDependencies(
        depsFile,
        gradleProjectToNxProjectMap,
        source,
        gradleFile,
        graph
      )
    );
  }
  return dependencies;
};

export async function processProjectGraph(
  graph: ProjectGraph,
  context: ProjectGraphProcessorContext
) {
  const builder = new ProjectGraphBuilder(graph, context.fileMap);
  console.time('locating gradle dependencies');
  const dependencies = await createDependencies({
    filesToProcess: context.filesToProcess,
    graph,
  });
  console.timeEnd('locating gradle dependencies');

  for (const dep of dependencies) {
    builder.addStaticDependency(dep.source, dep.target, dep.sourceFile);
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

function processProjectReports(
  projectReportLines: string[],
  projectRootMappings: Map<string, string>
) {
  const gradleProjectToNxProjectMap = new Map<string, string>();
  const buildFileToNxProjectMap = new Map<string, string>();
  const dependenciesMap = new Map<string, string>();
  const buildFileToDepsMap = new Map<string, string>();
  projectReportLines.forEach((line, index) => {
    if (line.startsWith('> Task ')) {
      const nextLine = projectReportLines[index + 1];
      if (line.endsWith(':dependencyReport')) {
        const gradleProject = line.substring(
          '> Task '.length,
          line.length - ':dependencyReport'.length
        );
        const [_, file] = nextLine.split('file://');
        dependenciesMap.set(gradleProject, file);
      }
      if (line.endsWith('propertyReport')) {
        const gradleProject = line.substring(
          '> Task '.length,
          line.length - ':propertyReport'.length
        );
        const [_, file] = nextLine.split('file://');
        const absBuildFilePath = readFileSync(file)
          .toString()
          .split('\n')
          .find((line) => {
            return line.startsWith('buildFile: ');
          })
          ?.substring('buildFile: '.length);
        if (!absBuildFilePath) {
          return;
        }
        const buildFile = relative(workspaceRoot, absBuildFilePath);
        buildFileToDepsMap.set(buildFile, dependenciesMap.get(gradleProject));
        const nxProject = findProjectForPath(buildFile, projectRootMappings);
        gradleProjectToNxProjectMap.set(gradleProject, nxProject);
        buildFileToNxProjectMap.set(buildFile, nxProject);
      }
    }
  });
  return { gradleProjectToNxProjectMap, buildFileToDepsMap };
}

function processGradleDependencies(
  depsFile: string,
  gradleProjectToNxProjectMap: Map<string, string>,
  source: string,
  gradleFile: string,
  graph: ProjectGraph
) {
  const dependencies: ProjectGraphDependencyWithFile[] = [];
  const lines = readFileSync(depsFile).toString().split('\n');
  let inDeps = false;
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
      if ((indents === '\\' || indents === '+') && dep.startsWith('project ')) {
        const gradleProjectName = dep
          .substring('project '.length)
          .replace(/ \(n\)$/, '')
          .trim();
        const target = gradleProjectToNxProjectMap.get(gradleProjectName);
        const dependency: ProjectGraphDependencyWithFile = {
          source: source,
          target,
          dependencyType: DependencyType.static,
          sourceFile: gradleFile,
        };
        try {
          validateDependency(graph, dependency);
          dependencies.push(dependency);
        } catch {
          /* empty */
        }
      }
    }
  }
  return dependencies;
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
