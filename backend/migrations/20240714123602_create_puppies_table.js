exports.up = function (knex) {
  return knex.schema.createTable("puppies", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.integer("age").notNullable();
    table.enum("gender", ["male", "female"]).notNullable();
    table.boolean("isVaccinated").notNullable();
    table.boolean("isNeutered").notNullable();
    table.enum("size", ["small", "medium", "large"]).notNullable();
    table.string("breed").notNullable();
    table.json("traits").notNullable();
    table.string("photoUrl").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("puppies");
};
