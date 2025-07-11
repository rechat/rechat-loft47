import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('deals', function(table) {
    table.increments('id');
    table.string('loft47_id');
    table.string('deal_id');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('deals');
}

