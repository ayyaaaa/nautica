import * as migration_20251215_162358_add_current_berth_to_vessels from './20251215_162358_add_current_berth_to_vessels';

export const migrations = [
  {
    up: migration_20251215_162358_add_current_berth_to_vessels.up,
    down: migration_20251215_162358_add_current_berth_to_vessels.down,
    name: '20251215_162358_add_current_berth_to_vessels'
  },
];
