import spawnAsync from '@expo/spawn-async';

import { buildAsync, getAppPathAsync, getXcodeBuildArgs } from '../xcodebuild';

const props = {
  configuration: 'Debug' as const,
  scheme: 'my-app',
  xcodeProject: {
    isWorkspace: true,
    name: 'my-app.xcworkspace',
  },
};

describe(buildAsync, () => {
  it(`builds`, async () => {
    await buildAsync(props);

    expect(spawnAsync).toHaveBeenCalledWith(
      'xcodebuild',
      [
        '-workspace',
        'my-app.xcworkspace',
        '-configuration',
        'Debug',
        '-scheme',
        'my-app',
        '-destination',
        'generic/platform=iOS Simulator',
        'COCOAPODS_PARALLEL_CODE_SIGN=true',
        'COMPILER_INDEX_STORE_ENABLE=NO',
      ],
      { stdio: 'inherit', env: expect.objectContaining({ RCT_NO_LAUNCH_PACKAGER: 'true' }) }
    );
  });

  it(`throws when xcodebuild fails`, async () => {
    jest.mocked(spawnAsync).mockRejectedValueOnce(Object.assign(new Error(), { status: 65 }));

    await expect(buildAsync(props)).rejects.toThrow(
      'Failed to build iOS project. "xcodebuild" exited with error code 65.'
    );
  });
});

describe(getAppPathAsync, () => {
  it(`returns the built app path`, async () => {
    jest.mocked(spawnAsync).mockResolvedValueOnce({
      stdout: JSON.stringify([
        {
          target: 'my-app',
          buildSettings: {
            TARGET_BUILD_DIR: '/DerivedData/Build/Products/Debug-iphonesimulator',
            WRAPPER_NAME: 'my-app.app',
          },
        },
      ]),
    } as any);

    await expect(getAppPathAsync(props)).resolves.toBe(
      '/DerivedData/Build/Products/Debug-iphonesimulator/my-app.app'
    );
    expect(spawnAsync).toHaveBeenCalledWith('xcodebuild', [
      ...getXcodeBuildArgs(props),
      '-showBuildSettings',
      '-json',
    ]);
  });
});
