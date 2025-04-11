exports.up = function(knex) {
    return knex.schema.table('notifications', function(table) {
      table.integer('post_id').unsigned().nullable()
           .references('id').inTable('posts').onDelete('CASCADE');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('notifications', function(table) {
      table.dropColumn('post_id');
    });
  };
  