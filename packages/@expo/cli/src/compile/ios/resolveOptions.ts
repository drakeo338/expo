import type { ProjectInfo } from '../../run/ios/XcodeBuild.types';
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
};

export function resolveOptions(projectRoot: string, options: Options): ResolvedOptions {
  if (options.dev && options.prod) {
    throw new CommandError('BAD_ARGS', 'Specify at most one of: --dev, --prod');
  }
  if (options.prod) {
    throw new CommandError('BAD_ARGS', '--prod is not supported yet.');
  }

  return { mode: 'development', xcodeProject: resolveXcodeProject(projectRoot) };
}
