import * as migration_20251212_140700_initial_setup from './20251212_140700_initial_setup';
import * as migration_20251212_203551_fix_services_lock from './20251212_203551_fix_services_lock';

export const migrations = [
  {
    up: migration_20251212_140700_initial_setup.up,
    down: migration_20251212_140700_initial_setup.down,
    name: '20251212_140700_initial_setup',
  },
  {
    up: migration_20251212_203551_fix_services_lock.up,
    down: migration_20251212_203551_fix_services_lock.down,
    name: '20251212_203551_fix_services_lock'
  },
];
