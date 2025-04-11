exports.up = function(knex) {
    return knex.schema.createTable('notifications', function(table) {
      table.increments('id').primary();
      table.integer('recipient_id').unsigned().notNullable()
           .references('id').inTable('users').onDelete('CASCADE');
      table.integer('sender_id').unsigned().notNullable()
           .references('id').inTable('users').onDelete('CASCADE');
      table.string('type').notNullable(); // pvz: 'follow', 'like', 'comment'
      table.string('message').notNullable();
      table.boolean('read').defaultTo(false); // ar notifikacija perskaityta
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('notifications');
  };
  