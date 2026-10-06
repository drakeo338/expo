import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

import * as Log from '../../log';
import { event } from '../events';
import type { ResolvedOptions } from './resolveOptions';
import { buildAsync, getAppPathAsync } from './xcodebuild';

export async function compileIosAsync(projectRoot: string, options: ResolvedOptions) {
  assertPlatform();

  const done = event.span();
  try {
    await buildAsync(options);
  } catch (error) {
    event('build:failed', { platform: 'ios', error: event.error(error as Error) });
    throw error;
  }
  done('build:done', {
    platform: 'ios',
    scheme: options.scheme,
    configuration: options.configuration,
  });

  let binaryPath = await getAppPathAsync(options);
  if (options.outputDir) {
    binaryPath = await copyBinaryToOutputAsync(binaryPath, options.outputDir);
  }
  Log.log(chalk`\n{green ✓} Build complete`);
  Log.log(chalk`{bold Binary:} ${binaryPath}`);
}

async function copyBinaryToOutputAsync(binaryPath: string, outputDir: string): Promise<string> {
  const outputPath = path.join(outputDir, path.basename(binaryPath));
  await fs.promises.mkdir(outputDir, { recursive: true });
  await fs.promises.cp(binaryPath, outputPath, { recursive: true });
  Log.log(chalk`{dim Copied to} ${outputPath}`);
  return outputPath;
}

function assertPlatform() {
  if (process.platform !== 'darwin') {
    Log.exit(
      chalk`iOS apps can only be built on macOS devices. Use {cyan eas build -p ios} to build in the cloud.`
    );
  }
}
