exports.up = function(knex) {
    return knex.schema.createTable('follows', (table) => {
      table.increments('id').primary();
      table.integer('follower_id').unsigned().notNullable().references('id').inTable('users');
      table.integer('following_id').unsigned().notNullable().references('id').inTable('users');
      table.unique(['follower_id', 'following_id']);
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('follows');
  };