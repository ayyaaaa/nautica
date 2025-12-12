import { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Platform Settings & Rates',
  access: {
    read: () => true, // Publicly readable for price calculation
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // Tab 1: General Info
        {
          label: 'General',
          fields: [
            { name: 'platformName', type: 'text', defaultValue: 'Nautica Harbor' },
            { name: 'supportPhone', type: 'text' },
            { name: 'supportEmail', type: 'email' },
          ],
        },
        // Tab 2: Berthing Rates
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
        // Tab 3: Service Rates (NEW)
        {
          label: 'Service Rates',
          fields: [
            {
              name: 'cleaningRate',
              type: 'number',
              label: 'Cleaning (Per Hour)',
              defaultValue: 150,
            },
            {
              name: 'waterRate',
              type: 'number',
              label: 'Water (Per Ton)',
              defaultValue: 50,
            },
            {
              name: 'fuelRate',
              type: 'number',
              label: 'Fuel Surcharge (Per Liter)',
              defaultValue: 25,
            },
            {
              name: 'wasteRate',
              type: 'number',
              label: 'Waste Disposal (Flat Fee)',
              defaultValue: 200,
            },
            {
              name: 'electricRate',
              type: 'number',
              label: 'Electricity (Per Unit)',
              defaultValue: 5,
            },
            {
              name: 'loadingRate',
              type: 'number',
              label: 'Loading/Unloading (Per Hour)',
              defaultValue: 100,
            },
          ],
        },
      ],
    },
  ],
}
