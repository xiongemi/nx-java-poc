/* eslint-disable */
export default {
  displayName: 'tools-plugins-@nx-gradle-e2e',
  preset: '../../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/tools/plugins/@nx/gradle-e2e',
  globalSetup: '../../../../tools/scripts/start-local-registry.ts',
  globalTeardown: '../../../../tools/scripts/stop-local-registry.ts',
};
