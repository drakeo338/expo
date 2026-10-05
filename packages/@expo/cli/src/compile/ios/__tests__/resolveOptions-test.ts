import { vol } from 'memfs';

import rnFixture from '../../../prebuild/__tests__/fixtures/react-native-project';
import { resolveOptionsAsync } from '../resolveOptions';

describe(resolveOptionsAsync, () => {
  afterEach(() => vol.reset());

  it(`defaults to production`, async () => {
    await expect(resolveOptionsAsync('/app', {})).rejects.toThrow(
      'Production builds are not supported yet. Pass --dev to build in development mode.'
    );
  });

  it(`uses development for --dev`, async () => {
    vol.fromJSON(rnFixture, '/app');

    expect(await resolveOptionsAsync('/app', { dev: true })).toEqual({
      mode: 'development',
      xcodeProject: { name: '/app/ios/ReactNativeProject.xcodeproj', isWorkspace: false },
      scheme: 'ReactNativeProject',
      osType: 'iOS',
      configuration: 'Debug',
    });
  });

  it(`rejects a non-iOS app`, async () => {
    const pbxprojPath = 'ios/ReactNativeProject.xcodeproj/project.pbxproj';
    vol.fromJSON(
      {
        ...rnFixture,
        [pbxprojPath]: rnFixture[pbxprojPath].replace(
          /PRODUCT_NAME = ReactNativeProject;/g,
          'PRODUCT_NAME = ReactNativeProject; SDKROOT = appletvos;'
        ),
      },
      '/app'
    );

    await expect(resolveOptionsAsync('/app', { dev: true })).rejects.toThrow(
      'The ReactNativeProject scheme builds a tvOS app. compile:ios only supports iOS apps for now. Use `npx expo run:ios` to build it.'
    );
  });

  it(`rejects a malformed ios project`, async () => {
    vol.fromJSON({ 'ios/App.xcodeproj': null }, '/app');

    await expect(resolveOptionsAsync('/app', { dev: true })).rejects.toThrow(
      'The ios project is malformed. You can regenerate it with `npx expo prebuild`'
    );
  });

  it(`rejects --dev with --prod`, async () => {
    await expect(resolveOptionsAsync('/app', { dev: true, prod: true })).rejects.toThrow(
      'Specify at most one of: --dev, --prod'
    );
  });

  it(`rejects --prod`, async () => {
    await expect(resolveOptionsAsync('/app', { prod: true })).rejects.toThrow(
      'Production builds are not supported yet. Pass --dev to build in development mode.'
    );
  });
});
