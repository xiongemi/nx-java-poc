import { workspaceRoot } from '@nx/devkit';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import {
  ExecFileSyncOptionsWithBufferEncoding,
  execFileSync,
} from 'node:child_process';

export function execGradle(
  args: string[],
  execOptions: ExecFileSyncOptionsWithBufferEncoding
) {
  const gradleBinaryPath = join(workspaceRoot, './gradlew');
  if (!existsSync(gradleBinaryPath)) {
    throw new Error('Gradle is not setup. Run "nx g @nx/gradle:init"');
  }

  return execFileSync(gradleBinaryPath, args, execOptions);
}
