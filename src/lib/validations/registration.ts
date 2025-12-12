import { z } from 'zod'

// --- 1. Base Schema ---
const baseSchema = z.object({
  // Step 1: Registration Type
  registrationType: z.enum(['permanent', 'temporary', 'hourly']),

  // Step 2: Operator (Personal) Info
  operatorName: z.string().min(2, 'Name must be at least 2 characters.'),
  operatorId: z.string().min(3, 'ID Card or Passport number is required.'),
  operatorEmail: z.string().email('Please enter a valid email address.'),
  operatorPhone: z.string().min(7, 'Contact number is required.'),
  operatorAddress: z.object({
    houseName: z.string().optional(),
    street: z.string().optional(),
    island: z.string().min(2, 'Island / Atoll is required.'),
    zipCode: z.string().optional(),
  }),

  // FIX: Change string() to any() so it accepts File objects
  operatorIdDoc: z.any().refine((file) => file, 'ID Card copy is required.'),
  operatorPhoto: z.any().refine((file) => file, 'Passport-size photo is required.'),

  // Logic Switches
  isBusiness: z.boolean().default(false),
  isOwner: z.boolean().default(true),

  // Business Info
  businessName: z.string().optional(),
  businessRegNo: z.string().optional(),
  businessEmail: z.string().optional(),
  businessPhone: z.string().optional(),
  businessRegDoc: z.string().optional(),

  // Owner Info
  ownerName: z.string().optional(),
  ownerId: z.string().optional(),
  ownerEmail: z.string().optional(),
  ownerPhone: z.string().optional(),
  ownerAddress: z
    .object({
      houseName: z.string().optional(),
      street: z.string().optional(),
      island: z.string().optional(),
    })
    .optional(),
  ownerIdDoc: z.string().optional(),

  // Step 3: Vessel Info
  vesselName: z.string().min(2, 'Vessel Name is required.'),
  vesselRegNo: z.string().min(2, 'Registration Number is required.'),

  vesselType: z.enum([
    'DHOANI',
    'LAUNCH',
    'BOAT',
    'BOKKURA',
    'BAHTHELI',
    'DINGHY',
    'BARGE',
    'YACHT',
    'TUG',
    'SUBMARINE',
    'PASSENGER FERRY',
    'OTHER',
  ]),

  useType: z.enum(['Passenger', 'Fishing', 'Cargo', 'Diving', 'Excursion', 'Other']),

  // Vessel Specs
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  engineType: z.enum(['Inboard', 'Outboard']).optional(),
  fuelType: z.enum(['Diesel', 'Petrol']).optional(),
  numberOfEngines: z.coerce.number().optional(),

  // FIX: Change to any() for file upload
  vesselRegDoc: z.any().optional(),
})

// --- 2. Refinement (The Logic Layer) ---
export const registrationSchema = baseSchema.superRefine((data, ctx) => {
  // LOGIC A: If representing a Business
  if (data.isBusiness) {
    if (!data.businessName)
      ctx.addIssue({
        code: 'custom',
        path: ['businessName'],
        message: 'Business Name is required.',
      })
    if (!data.businessRegNo)
      ctx.addIssue({
        code: 'custom',
        path: ['businessRegNo'],
        message: 'Registration Number is required.',
      })
  }

  // LOGIC B: If Operator is NOT the Owner
  if (!data.isOwner) {
    if (!data.ownerName)
      ctx.addIssue({ code: 'custom', path: ['ownerName'], message: 'Owner Name is required.' })
    if (!data.ownerPhone)
      ctx.addIssue({ code: 'custom', path: ['ownerPhone'], message: 'Owner Phone is required.' })

    // Validate Owner Address
    if (!data.ownerAddress?.island) {
      ctx.addIssue({
        code: 'custom',
        path: ['ownerAddress', 'island'],
        message: 'Owner Island/Atoll is required.',
      })
    }
  }

  // LOGIC C: If Registration is PERMANENT
  if (data.registrationType === 'permanent') {
    if (!data.length)
      ctx.addIssue({ code: 'custom', path: ['length'], message: 'Length is required.' })
    if (!data.width)
      ctx.addIssue({ code: 'custom', path: ['width'], message: 'Width is required.' })
    if (!data.fuelType)
      ctx.addIssue({ code: 'custom', path: ['fuelType'], message: 'Fuel Type is required.' })

    // Strict check for document presence
    if (!data.vesselRegDoc) {
      ctx.addIssue({
        code: 'custom',
        path: ['vesselRegDoc'],
        message: 'Vessel Registration Document is required.',
      })
    }
  }
})

// --- 3. Export Type ---
export type RegistrationFormValues = z.infer<typeof baseSchema>
