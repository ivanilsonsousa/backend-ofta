
exports.up = function (knex) {
  return knex.schema
    .createTable('user', table => {
      table.increments('id');
      table.string('user', 255).notNullable().unique();
      table.string('email', 255).notNullable().unique();
      table.string('name', 255).notNullable();
      table.string('password', 255).notNullable();
    })
};

exports.down = function (knex) {
  return knex.schema
    .dropTable("user");
};
