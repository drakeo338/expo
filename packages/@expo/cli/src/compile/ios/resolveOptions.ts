import { CommandError } from '../../utils/errors';
import type { EnvironmentMode } from '../../utils/nodeEnv';

export type Options = {
  dev?: boolean;
  prod?: boolean;
};

export type ResolvedOptions = {
  mode: EnvironmentMode;
};

export function resolveOptions(options: Options): ResolvedOptions {
  if (options.dev && options.prod) {
    throw new CommandError('BAD_ARGS', 'Specify at most one of: --dev, --prod');
  }
  if (options.prod) {
    throw new CommandError('BAD_ARGS', '--prod is not supported yet.');
  }

  return { mode: 'development' };
}
