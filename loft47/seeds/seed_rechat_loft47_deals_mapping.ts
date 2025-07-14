import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("rechat_loft47_deals_mapping").del();

  // Inserts seed entries
  await knex("rechat_loft47_deals_mapping").insert([
    { id: 1, loft47_deal_id: "123", rechat_deal_id: "456", created_at: new Date() },
    { id: 2, loft47_deal_id: "789", rechat_deal_id: "101", created_at: new Date() },
    { id: 3, loft47_deal_id: "112", rechat_deal_id: "113", created_at: new Date() }
  ]);
};
