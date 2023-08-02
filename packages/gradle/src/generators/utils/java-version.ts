import { execFileSync } from 'node:child_process';

export const enum JavaVersion {
  Java17 = 'java17',
  Java18 = 'java18',
  Latest = Java18,
}

export function detectJavaVersion() {
  try {
    const javaVersionOutput = execFileSync('java', ['-version']).toString();

    if (/openjsdk version "17\.\d+.\d+"/.test(javaVersionOutput)) {
      return JavaVersion.Java17;
    }

    if (/openjsdk version "1\.8\.\d+_\d+"/.test(javaVersionOutput)) {
      return JavaVersion.Java18;
    }

    return JavaVersion.Latest;
  } catch {
    return null;
  }
}
