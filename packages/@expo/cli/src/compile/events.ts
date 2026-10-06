import { events } from '2g';
import type { SerializedError } from '2g';

declare module '2g' {
  interface EventRegistry {
    'compile:build:done': {
      platform: 'ios';
      scheme: string;
      configuration: string;
    };
    'compile:build:failed': {
      platform: 'ios';
      error: SerializedError;
    };
  }
}

export const event = events('compile');
