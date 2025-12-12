import * as migration_20251212_134601_add_finance_fields from './20251212_134601_add_finance_fields';

export const migrations = [
  {
    up: migration_20251212_134601_add_finance_fields.up,
    down: migration_20251212_134601_add_finance_fields.down,
    name: '20251212_134601_add_finance_fields'
  },
];
