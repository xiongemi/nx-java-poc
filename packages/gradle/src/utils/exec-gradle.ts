import { workspaceRoot } from '@nx/devkit';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import {
  ExecFileSyncOptionsWithBufferEncoding,
  execFile,
  execFileSync,
} from 'node:child_process';
import { ExecFileOptions } from 'child_process';

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

export function execGradleAsync(
  args: ReadonlyArray<string>,
  execOptions: ExecFileOptions
) {
  const gradleBinaryPath = join(workspaceRoot, './gradlew');
  if (!existsSync(gradleBinaryPath)) {
    throw new Error('Gradle is not setup. Run "nx g @nx/gradle:init"');
  }

  return new Promise<Buffer>((res, rej) => {
    const cp = execFile(gradleBinaryPath, args, execOptions);

    let stdout = Buffer.from('');
    cp.stdout.on('data', (data) => {
      stdout += data;
    });

    cp.on('exit', (code) => {
      if (code === 0) {
        res(stdout);
      } else {
        rej(
          new Error(
            `Executing Gradle with ${args.join(' ')} failed with code: ${code}`
          )
        );
      }
    });
  });
}
