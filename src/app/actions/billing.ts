'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

function generateInvoiceId() {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `INV-${date}-${random}`
}

// ------------------------------------------------------------------
// GENERATE BERTH INVOICE (Hourly/Daily/Monthly Logic)
// ------------------------------------------------------------------
export async function generateBerthInvoice(berthId: string | number) {
  const payload = await getPayload({ config: configPromise })

  // 1. Fetch Berth
  const berth = await payload.findByID({ collection: 'berths', id: berthId, depth: 1 })
  if (!berth || !berth.vessel) return { error: 'Invalid Berth' }

  // 2. Fetch Rates
  const settings: any = await payload.findGlobal({ slug: 'site-settings' })
  const hourlyRate = settings.hourlyRate || 50
  const dailyRate = settings.dailyRate || 500
  const monthlyRate = settings.monthlyRate || 10000
  const yearlyRate = settings.yearlyRate || 100000

  // 3. Determine Line Item
  let description = `Berthing: ${berth.planType}`
  let unitPrice = 0
  let quantity = 1

  if (berth.planType === 'hourly') {
    const start = new Date(berth.startTime).getTime()
    const end = berth.endTime ? new Date(berth.endTime).getTime() : start + (3600000 * 24)
    const hours = Math.ceil((end - start) / 3600000) || 1
    
    unitPrice = hourlyRate
    quantity = hours
    description = `Hourly Berthing (${hours} hrs)`

  } else if (berth.planType === 'daily') {
    unitPrice = dailyRate
    description = 'Daily Berthing Rate'

  } else if (berth.planType === 'monthly') {
    unitPrice = monthlyRate
    description = 'Monthly Subscription'
  
  } else if (berth.planType === 'yearly') {
    unitPrice = yearlyRate
    description = 'Yearly Subscription'
  }

  // 4. Create Invoice
  await payload.create({
    collection: 'invoices',
    data: {
      invoiceNumber: generateInvoiceId(),
      status: 'issued',
      vessel: typeof berth.vessel === 'object' ? berth.vessel.id : berth.vessel,
      sourceType: 'berth',
      relatedBerth: berth.id,
      lineItems: [
        {
          description,
          quantity,
          unitPrice,
        }
      ]
    }
  })

  return { success: true }
}

// ------------------------------------------------------------------
// GENERATE SERVICE INVOICE (Smart Reverse-Calc)
// ------------------------------------------------------------------
export async function generateServiceInvoice(serviceId: string | number) {
  const payload = await getPayload({ config: configPromise })

  // 1. Fetch Service
  const service = await payload.findByID({ collection: 'services', id: serviceId, depth: 2 })
  if (!service) return { error: 'Service not found' }

  // 2. Fetch Tax to Reverse Engineer Base Price
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  const taxPercent = settings.taxPercentage || 6
  const taxMultiplier = 1 + (taxPercent / 100)

  // 3. Extract Base Price
  const costIncludingTax = service.totalCost || 0
  const basePrice = costIncludingTax / taxMultiplier

  const serviceName = typeof service.serviceType === 'object' ? service.serviceType.name : 'Service'

  // ✅ FIX: Convert serviceId to String before slicing
  const shortId = String(serviceId).slice(-4)

  // 4. Create Invoice
  await payload.create({
    collection: 'invoices',
    data: {
      invoiceNumber: generateInvoiceId(),
      status: 'issued',
      vessel: typeof service.vessel === 'object' ? service.vessel.id : service.vessel,
      sourceType: 'service',
      relatedService: service.id,
      lineItems: [
        {
          description: `${serviceName} (Req: ${shortId})`, // Updated line
          quantity: 1, 
          unitPrice: parseFloat(basePrice.toFixed(2)),
        }
      ]
    }
  })

  return { success: true }
}