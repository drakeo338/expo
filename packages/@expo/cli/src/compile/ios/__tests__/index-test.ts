import { expoCompileIos } from '../index';

jest.mock('../../../utils/args', () => ({
  assertArgs: jest.fn(),
  getProjectRoot: jest.fn(() => '/app'),
  printHelp: jest.fn(),
}));
jest.mock('../../../utils/nodeEnv.js', () => ({ loadEnvFiles: jest.fn() }), {
  virtual: true,
});
jest.mock('../../../utils/errors', () => ({ logCmdError: jest.fn() }));
jest.mock('../../../log');
jest.mock('../resolveOptions.js', () => ({ resolveOptions: jest.fn(() => ({})) }), {
  virtual: true,
});

const { assertArgs } = require('../../../utils/args') as { assertArgs: jest.Mock };
const { loadEnvFiles } = require('../../../utils/nodeEnv.js') as { loadEnvFiles: jest.Mock };
const { logCmdError } = require('../../../utils/errors') as { logCmdError: jest.Mock };
const { resolveOptions } = require('../resolveOptions.js') as { resolveOptions: jest.Mock };

it.each([
  { args: {}, mode: 'development' },
  { args: { '--prod': true }, mode: 'production' },
])('loads $mode env files before resolving compile:ios options', async ({ args, mode }) => {
  assertArgs.mockReturnValue(args);

  await expoCompileIos([]);

  expect(loadEnvFiles).toHaveBeenCalledWith('/app', { mode });
  expect(loadEnvFiles.mock.invocationCallOrder[0]).toBeLessThan(
    resolveOptions.mock.invocationCallOrder[0]!
  );
});

it('handles env file errors', async () => {
  const error = new Error('env error');
  assertArgs.mockReturnValue({});
  loadEnvFiles.mockImplementationOnce(() => {
    throw error;
  });

  await expoCompileIos([]);

  expect(logCmdError).toHaveBeenCalledWith(error);
});
