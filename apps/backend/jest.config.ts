import type {Config} from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	rootDir: '.',
	testRegex: '.*\\.spec\\.ts$',
	transform: {
		'^.+\\.(t|j)s$': ['ts-jest', {tsconfig: 'tsconfig.json'}],
	},
	moduleNameMapper: {
		'^@backend/(.*)$': '<rootDir>/src/$1',
	},
};

export default config;
