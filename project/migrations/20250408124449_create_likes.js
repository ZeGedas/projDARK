exports.up = function(knex) {
  return knex.schema.createTable('likes', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('post_id').unsigned().references('id').inTable('posts').onDelete('CASCADE');
    table.unique(['user_id', 'post_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('likes');
};
