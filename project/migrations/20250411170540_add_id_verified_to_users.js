exports.up = function(knex) {
    return knex.schema.table('users', function(table) {
      table.boolean('is_verified').defaultTo(false);
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('users', function(table) {
      table.dropColumn('is_verified');
    });
  };
  