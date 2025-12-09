import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Businesses } from './collections/Businesses'
import { Vessels } from './collections/Vessels'
import { Berths } from './collections/Berths'
import { ServiceRequests } from './collections/ServiceRequests'
import { Payments } from './collections/Payments'
import { SiteSettings } from './collections/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // 1. Define your Server URL (Critical for VPS)
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',

  // 2. CORS & CSRF (Allow your frontend to talk to Payload)
  // Add your frontend domain here when you deploy (e.g., 'https://my-harbor-app.com')
  cors: [process.env.PAYLOAD_PUBLIC_SERVER_URL || ''].filter(Boolean),
  csrf: [process.env.PAYLOAD_PUBLIC_SERVER_URL || ''].filter(Boolean),

  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  // 3. Collections
  collections: [Users, Media, Businesses, Vessels, Berths, ServiceRequests, Payments],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),

  // 4. Sharp is required for image resizing
  sharp,

  plugins: [
    // No storage plugin needed for Local Storage in v3.
    // Payload will default to saving files in a './media' folder.
  ],
})
