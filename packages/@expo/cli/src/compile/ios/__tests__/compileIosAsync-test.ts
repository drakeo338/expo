import { Log } from '../../../log';
import { event } from '../../events';
import { compileIosAsync } from '../compileIosAsync';
import type { ResolvedOptions } from '../resolveOptions';
import { buildAsync } from '../xcodebuild';

jest.mock('../../../log');
jest.mock('../xcodebuild');
jest.mock('../../events', () => {
  const done = jest.fn();
  return {
    event: Object.assign(jest.fn(), {
      span: jest.fn(() => done),
      error: jest.fn((error) => error),
    }),
  };
});

const mockPlatform = (value: typeof process.platform) =>
  Object.defineProperty(process, 'platform', {
    value,
  });

const platform = process.platform;

afterEach(() => {
  mockPlatform(platform);
});

const options: ResolvedOptions = {
  mode: 'development',
  xcodeProject: { name: '/app/ios/app.xcworkspace', isWorkspace: true },
  scheme: 'app',
  osType: 'iOS',
  configuration: 'Debug',
};

describe(compileIosAsync, () => {
  it(`asserts that the function only runs on darwin machines`, async () => {
    mockPlatform('win32');
    await expect(compileIosAsync('/app', options)).rejects.toThrow(/EXIT_CALLED/);
    expect(Log.exit).toHaveBeenCalledWith(expect.stringMatching(/eas build -p ios/));
    expect(buildAsync).not.toHaveBeenCalled();
  });

  it(`builds the app`, async () => {
    mockPlatform('darwin');
    await compileIosAsync('/app', options);
    expect(buildAsync).toHaveBeenCalledWith(options);
    expect(jest.mocked(event.span).mock.results[0]?.value).toHaveBeenCalledWith('build:done', {
      platform: 'ios',
      scheme: 'app',
      configuration: 'Debug',
    });
  });

  it(`reports a failed build`, async () => {
    mockPlatform('darwin');
    const error = new Error('build failed');
    jest.mocked(buildAsync).mockRejectedValueOnce(error);
    await expect(compileIosAsync('/app', options)).rejects.toBe(error);
    expect(event).toHaveBeenCalledWith('build:failed', { platform: 'ios', error });
  });
});
