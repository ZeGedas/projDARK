exports.up = function(knex) {
  return knex.schema.createTable('comments', (table) => {
    table.increments('id').primary();
    table.text('content').notNullable();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('post_id').unsigned().references('id').inTable('posts').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('comments');
};
