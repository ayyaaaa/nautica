import { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Platform Settings & Rates',
  access: {
    read: () => true, // Publicly readable for price calculation
    update: ({ req: { user } }) => user?.role === 'superadmin' || user?.role === 'admin',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // Tab 1: General Info (Keep for platform-wide contacts)
        {
          label: 'General',
          fields: [
            { name: 'platformName', type: 'text', defaultValue: 'Nautica Harbor' },
            { name: 'supportPhone', type: 'text' },
            { name: 'supportEmail', type: 'email' },
          ],
        },
        // Tab 2: Berthing Rates & Tax (CRITICAL: Keep this)
        {
          label: 'Berthing Rates (MVR)',
          description: 'Set the base rates for vessel parking and applicable taxes.',
          fields: [
            {
              type: 'row', // Formatting for better UI
              fields: [
                {
                  name: 'hourlyRate',
                  type: 'number',
                  required: true,
                  defaultValue: 50,
                  label: 'Hourly Rate',
                },
                {
                  name: 'dailyRate',
                  type: 'number',
                  required: true,
                  defaultValue: 500,
                  label: 'Daily Rate',
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'monthlyRate',
                  type: 'number',
                  required: true,
                  defaultValue: 10000,
                  label: 'Monthly Rate',
                },
                {
                  name: 'yearlyRate',
                  type: 'number',
                  required: true,
                  defaultValue: 100000,
                  label: 'Yearly Rate',
                },
              ],
            },
            // GST Configuration
            {
              name: 'taxPercentage',
              type: 'number',
              label: 'GST / Tax (%)',
              defaultValue: 6,
              required: true,
              admin: {
                description: 'This percentage will be applied to all invoices.',
              },
            },
          ],
        },
        // REMOVED: Tab 3 (Service Rates) -> Now handled by 'service-types' collection
      ],
    },
  ],
}
