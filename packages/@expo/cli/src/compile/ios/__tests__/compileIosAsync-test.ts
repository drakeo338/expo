import { Log } from '../../../log';
import { compileIosAsync } from '../compileIosAsync';
import type { ResolvedOptions } from '../resolveOptions';
import { buildAsync } from '../xcodebuild';

jest.mock('../../../log');
jest.mock('../xcodebuild');

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
  });
});
