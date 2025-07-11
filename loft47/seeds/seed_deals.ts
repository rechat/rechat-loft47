import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("deals").del();

  // Inserts seed entries
  await knex("deals").insert([
    { id: 1, loft47_id: "123", deal_id: "456", created_at: new Date() },
    { id: 2, loft47_id: "789", deal_id: "101", created_at: new Date() },
    { id: 3, loft47_id: "112", deal_id: "113", created_at: new Date() }
  ]);
};
