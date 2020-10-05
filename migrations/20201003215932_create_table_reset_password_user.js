
exports.up = function (knex) {
  return knex.schema
    .createTable('reset_password_user', table => {
      table.increments('id');
      table.string('code', 10)
        .notNullable().unique();
      table.integer('user_id')
        .unsigned()
        .index()
        .references('id')
        .inTable('user')
        .onDelete('CASCADE');
      table.string('timestamp', 100).notNullable();
    })
};

exports.down = function (knex) {
  return knex.schema
    .dropTable("reset_password_user");
};
