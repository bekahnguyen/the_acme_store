const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_store_db"
);
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const createTables = async () => {
  const SQL = `
  DROP TABLE IF EXISTS favorite;
  DROP TABLE IF EXISTS product;
  DROP TABLE IF EXISTS users;
    CREATE TABLE users(
        id UUID PRIMARY KEY,
        username VARCHAR UNIQUE,
        password VARCHAR
    );
    CREATE TABLE product(
        id UUID PRIMARY KEY,
       name VARCHAR
    );
    CREATE TABLE favorite(
        id UUID PRIMARY KEY,
        product_id UUID REFERENCES product(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        CONSTRAINT unique_user_id_product_id UNIQUE (user_id, product_id)
    )
    `;
  await client.query(SQL);
};

const createUser = async ({ username, password }) => {
  password = await bcrypt.hash(password, 5);
  const SQL = `
INSERT into users(id, username, password)
VALUES($1,$2,$3)
RETURNING *`;
  const response = await client.query(SQL, [uuid.v4(), username, password]);
  return response.rows[0];
};

const createProduct = async ({ name }) => {
  const SQL = `
  INSERT into product(id, name)
  VALUES($1,$2)
  RETURNING *`;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createFavorite = async ({ product_id, user_id }) => {
  const SQL = `
    INSERT into favorite(id, product_id, user_id)
    VALUES($1,$2,$3)
    RETURNING *`;
  const response = await client.query(SQL, [uuid.v4(), product_id, user_id]);
  return response.rows[0];
};

const fetchFavorites = async (user_id) => {
  console.log(user_id);
  const SQL = `
      SELECT * FROM favorite WHERE user_id=$1
      ;
    `;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
};

const destroyFavorite = async (id, user_id) => {
  const SQL = `
    DELETE FROM favorite
    WHERE id = $1 AND user_id = $2
  `;
  await client.query(SQL, [id, user_id]);
};

const fetchUsers = async () => {
  const SQL = `
    SELECT * FROM users;
    `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchProducts = async () => {
  const SQL = `
      SELECT * FROM "product";
      `;
  const response = await client.query(SQL);
  return response.rows;
};
module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
};
