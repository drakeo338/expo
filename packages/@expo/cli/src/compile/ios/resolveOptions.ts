import path from 'path';

import { hasRequiredIOSFilesAsync } from '../../prebuild/clearNativeFolder';
import type { ProjectInfo, XcodeConfiguration } from '../../run/ios/XcodeBuild.types';
import { resolveNativeSchemePropsAsync } from '../../run/ios/options/resolveNativeScheme';
import { resolveXcodeProject } from '../../run/ios/options/resolveXcodeProject';
import type { OSType } from '../../start/platforms/ios/simctl';
import { isOSType } from '../../start/platforms/ios/simctl';
import { CommandError } from '../../utils/errors';
import type { EnvironmentMode } from '../../utils/nodeEnv';

export type Options = {
  dev?: boolean;
  prod?: boolean;
  outputDir?: string;
};

export type ResolvedOptions = {
  mode: EnvironmentMode;
  xcodeProject: ProjectInfo;
  scheme: string;
  osType: OSType;
  configuration: XcodeConfiguration;
  outputDir?: string;
};

export async function resolveOptionsAsync(
  projectRoot: string,
  options: Options
): Promise<ResolvedOptions> {
  if (options.dev && options.prod) {
    throw new CommandError('BAD_ARGS', 'Specify at most one of: --dev, --prod');
  }
  if (!options.dev) {
    throw new CommandError(
      'BAD_ARGS',
      'Production builds are not supported yet. Pass --dev to build in development mode.'
    );
  }

  const configuration: XcodeConfiguration = 'Debug';
  const xcodeProject = resolveXcodeProject(projectRoot);
  if (!(await hasRequiredIOSFilesAsync(projectRoot))) {
    throw new CommandError(
      'IOS_MALFORMED',
      'The ios project is malformed. You can regenerate it with `npx expo prebuild`'
    );
  }
  const { osType: schemeOsType, name: scheme } = await resolveNativeSchemePropsAsync(
    projectRoot,
    { configuration },
    xcodeProject
  );
  const osType: OSType = isOSType(schemeOsType) ? (schemeOsType as OSType) : 'iOS';
  if (osType !== 'iOS') {
    throw new CommandError(
      'UNSUPPORTED_OS_TYPE',
      `The ${scheme} scheme builds a ${osType} app. compile:ios only supports iOS apps for now. Use \`npx expo run:ios\` to build it.`
    );
  }

  return {
    mode: 'development',
    xcodeProject,
    scheme,
    osType,
    configuration,
    outputDir: options.outputDir ? path.resolve(projectRoot, options.outputDir) : undefined,
  };
}
