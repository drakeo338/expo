import type { ProjectInfo } from '../../run/ios/XcodeBuild.types';
import { resolveNativeSchemePropsAsync } from '../../run/ios/options/resolveNativeScheme';
import { resolveXcodeProject } from '../../run/ios/options/resolveXcodeProject';
import { CommandError } from '../../utils/errors';
import type { EnvironmentMode } from '../../utils/nodeEnv';

export type Options = {
  dev?: boolean;
  prod?: boolean;
};

export type ResolvedOptions = {
  mode: EnvironmentMode;
  xcodeProject: ProjectInfo;
  scheme: string;
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

  const xcodeProject = resolveXcodeProject(projectRoot);
  const { name: scheme } = await resolveNativeSchemePropsAsync(
    projectRoot,
    { configuration: 'Debug' },
    xcodeProject
  );

  return { mode: 'development', xcodeProject, scheme };
}
