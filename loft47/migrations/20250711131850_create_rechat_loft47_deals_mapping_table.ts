import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('rechat_loft47_deals_mapping', function(table) {
    table.increments('id');
    table.string('loft47_deal_id');
    table.string('rechat_deal_id');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('rechat_loft47_deals_mapping');
}

