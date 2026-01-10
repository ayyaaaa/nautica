import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob' // <--- IMPORT THIS
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Businesses } from './collections/Businesses'
import { Vessels } from './collections/Vessels'
import { Berths } from './collections/Berths'
import { Payments } from './collections/Payments'
import { SiteSettings } from './collections/SiteSettings'
import { Services } from './collections/Services' // <--- IMPORT
import { BerthingSlots } from './collections/BerthingSlots'
import { ServiceTypes } from './collections/ServiceTypes'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Businesses,
    Vessels,
    Services,
    Payments,
    Berths,
    BerthingSlots,
    ServiceTypes,
  ],
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
    push: true,
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: true, // Only enable if you have the token (useful to keep false locally if you want)
      collections: {
        media: true, // Enable for your 'media' collection
        // If you have other upload collections, list them here
      },
      token: process.env.BLOB_READ_WRITE_TOKEN, // Vercel injects this automatically in production
    }),
  ],
})
