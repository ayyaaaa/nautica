import * as migration_20260111_114549_add_finance_fields_to_vessels from './20260111_114549_add_finance_fields_to_vessels';

export const migrations = [
  {
    up: migration_20260111_114549_add_finance_fields_to_vessels.up,
    down: migration_20260111_114549_add_finance_fields_to_vessels.down,
    name: '20260111_114549_add_finance_fields_to_vessels'
  },
];
