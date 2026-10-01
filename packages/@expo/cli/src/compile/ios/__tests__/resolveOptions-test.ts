import { vol } from 'memfs';

import rnFixture from '../../../prebuild/__tests__/fixtures/react-native-project';
import { resolveOptionsAsync } from '../resolveOptions';

describe(resolveOptionsAsync, () => {
  afterEach(() => vol.reset());

  it(`defaults to development`, async () => {
    vol.fromJSON(rnFixture, '/app');

    expect(await resolveOptionsAsync('/app', {})).toEqual({
      mode: 'development',
      xcodeProject: { name: '/app/ios/ReactNativeProject.xcodeproj', isWorkspace: false },
      scheme: 'ReactNativeProject',
    });
  });

  it(`uses development for --dev`, async () => {
    vol.fromJSON(rnFixture, '/app');

    expect(await resolveOptionsAsync('/app', { dev: true })).toEqual({
      mode: 'development',
      xcodeProject: { name: '/app/ios/ReactNativeProject.xcodeproj', isWorkspace: false },
      scheme: 'ReactNativeProject',
    });
  });

  it(`rejects --dev with --prod`, async () => {
    await expect(resolveOptionsAsync('/app', { dev: true, prod: true })).rejects.toThrow(
      'Specify at most one of: --dev, --prod'
    );
  });

  it(`rejects --prod`, async () => {
    await expect(resolveOptionsAsync('/app', { prod: true })).rejects.toThrow(
      '--prod is not supported yet.'
    );
  });
});
