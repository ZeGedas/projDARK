exports.up = function(knex) {
    return knex.schema.table('posts', function(table) {
      table.string('media');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('posts', function(table) {
      table.dropColumn('media');
    });
  };
  