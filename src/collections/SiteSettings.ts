import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Platform Settings & Rates',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            { name: 'platformName', type: 'text', defaultValue: 'Harbor Management System' },
            { name: 'supportPhone', type: 'text' },
            { name: 'supportEmail', type: 'email' },
          ],
        },
        {
          label: 'Berthing Rates (MVR)',
          fields: [
            { name: 'hourlyRate', type: 'number', required: true, defaultValue: 50 },
            { name: 'dailyRate', type: 'number', required: true, defaultValue: 500 },
            { name: 'monthlyRate', type: 'number', required: true, defaultValue: 10000 },
            { name: 'yearlyRate', type: 'number', required: true, defaultValue: 100000 },
            { name: 'taxPercentage', type: 'number', label: 'GST (%)', defaultValue: 6 },
          ],
        },
        {
          label: 'Service Base Rates',
          fields: [
            { name: 'cleaningRate', type: 'number', label: 'Cleaning Base Rate' },
            { name: 'waterRate', type: 'number', label: 'Water (per ton)' },
          ],
        },
      ],
    },
  ],
}
