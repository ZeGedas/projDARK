exports.up = function(knex) {
    return knex.schema.table('users', (table) => {
      table.string('cover').nullable();
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('users', (table) => {
      table.dropColumn('cover');
    });
  };