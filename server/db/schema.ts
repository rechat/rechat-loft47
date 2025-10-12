import { pgTable, serial, varchar, timestamp, uuid, boolean } from 'drizzle-orm/pg-core'

export const rechatLoft47DealsMapping = pgTable('rechat_loft47_deals_mapping', {
  id: serial('id').primaryKey(), // int4 with sequence = serial

  loft47DealId: varchar('loft47_deal_id', { length: 255 }),

  rechatDealId: varchar('rechat_deal_id', { length: 255 }),

  createdAt: timestamp('created_at', {
    withTimezone: true,
    precision: 6
  }).defaultNow()
})

export const brandLoft47Credentials = pgTable('brand_loft47_credentials', {
  id: serial('id').primaryKey(),

  brandId: uuid('brand_id').notNull().unique(),

  loft47Email: varchar('loft47_email', { length: 255 }).notNull(),

  loft47Password: varchar('loft47_password', { length: 255 }).notNull(),

  isStaging: boolean('is_staging').notNull().default(false),

  createdAt: timestamp('created_at', {
    withTimezone: true,
    precision: 6
  }).defaultNow()
})
