import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const rechatLoft47DealsMapping = pgTable('rechat_loft47_deals_mapping', {
  id: serial('id').primaryKey(), // int4 with sequence = serial

  loft47DealId: varchar('loft47_deal_id', { length: 255 }),

  rechatDealId: varchar('rechat_deal_id', { length: 255 }),

  createdAt: timestamp('created_at', { withTimezone: true, precision: 6 })
    .defaultNow(),
});