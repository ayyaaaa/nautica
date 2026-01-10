import * as migration_20251215_164303_add_current_berth_to_vessels from './20251215_164303_add_current_berth_to_vessels';
import * as migration_20260110_111723_add_finance_fields_to_vessels from './20260110_111723_add_finance_fields_to_vessels';

export const migrations = [
  {
    up: migration_20251215_164303_add_current_berth_to_vessels.up,
    down: migration_20251215_164303_add_current_berth_to_vessels.down,
    name: '20251215_164303_add_current_berth_to_vessels',
  },
  {
    up: migration_20260110_111723_add_finance_fields_to_vessels.up,
    down: migration_20260110_111723_add_finance_fields_to_vessels.down,
    name: '20260110_111723_add_finance_fields_to_vessels'
  },
];
