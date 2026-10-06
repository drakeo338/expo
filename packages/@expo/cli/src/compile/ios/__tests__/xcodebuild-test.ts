import spawnAsync from '@expo/spawn-async';

import { buildAsync, getXcodeBuildArgs } from '../xcodebuild';

describe(getXcodeBuildArgs, () => {
  it(`returns generic simulator arguments`, () => {
    expect(
      getXcodeBuildArgs({
        configuration: 'Debug',
        scheme: 'my-app',
        xcodeProject: {
          isWorkspace: true,
          name: 'my-app.xcworkspace',
        },
      })
    ).toEqual([
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
    ]);
  });
});

describe(buildAsync, () => {
  const props = {
    configuration: 'Debug' as const,
    scheme: 'my-app',
    xcodeProject: {
      isWorkspace: true,
      name: 'my-app.xcworkspace',
    },
  };

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
