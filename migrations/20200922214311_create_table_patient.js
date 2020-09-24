
exports.up = function (knex) {
  return knex.schema
    .createTable('patient', table => {
      table.increments('id');
      table.string('cpf', 255).notNullable();
      table.string('name', 255).notNullable();
      table.string('fone', 255).notNullable();
      table.string('occupation', 255);
      table.integer('age', 12).notNullable();
      table.integer('gender', 5).notNullable();
    })
};

exports.down = function (knex) {
  return knex.schema
    .dropTable("patient");
};
