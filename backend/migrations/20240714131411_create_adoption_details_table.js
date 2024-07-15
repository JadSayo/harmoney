exports.up = function (knex) {
  return knex.schema.createTable("adoption_details", function (table) {
    table.increments("id").primary();
    table.integer("puppy_id").unsigned().notNullable();
    table
      .foreign("puppy_id")
      .references("id")
      .inTable("puppies")
      .onDelete("CASCADE");
    table.integer("adopter_id").unsigned().notNullable();
    table
      .foreign("adopter_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.timestamp("adoption_date").defaultTo(knex.fn.now()).notNullable(); // Use TIMESTAMP with default CURRENT_TIMESTAMP
    table.timestamps(true, true); // Adds created_at and updated_at columns
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("adoption_details");
};
