import * as migration_20251212_214338_initial_setup from './20251212_214338_initial_setup';

export const migrations = [
  {
    up: migration_20251212_214338_initial_setup.up,
    down: migration_20251212_214338_initial_setup.down,
    name: '20251212_214338_initial_setup'
  },
];
