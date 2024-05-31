const {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
} = require("./db");

const express = require("express");
const app = express();

// //ROUTES:
// GET /api/users - returns array of users

// GET /api/products - returns an array of products
// GET /api/users/:id/favorites - returns an array of favorites for a user
// POST /api/users/:id/favorites - payload: a product_id
// returns the created favorite with a status code of 201
// DELETE /api/users/:userId/favorites/:id - deletes a favorite for a user, returns nothing with a status code of 204

const init = async () => {
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");
  const [alfred, sebastion, dean, jumprope, dumbbells, yogamat] =
    await Promise.all([
      createUser({ username: "Al", password: "123" }),
      createUser({ username: "Seb", password: "ABC" }),
      createUser({ username: "Dean", password: "ABCez123" }),
      createProduct({ name: "JumpRope" }),
      createProduct({ name: "Dumbbells" }),
      createProduct({ name: "YogaMat" }),
    ]);
  const users = await fetchUsers();
  const products = await fetchProducts();
  // console.log(products);
  // console.log(users);
  //for my own practice and understanding...
  //tried this two ways 1- how the guided practice showed it vs 2 - how John did it during class
  // on the one hand, you assign each user to a variable on line 17, on the other, you access user by index in the array of users
  const userFavorites = await Promise.all([
    createFavorite({ product_id: jumprope.id, user_id: alfred.id }),
    createFavorite({ product_id: dumbbells.id, user_id: sebastion.id }),
    createFavorite({ product_id: yogamat.id, user_id: dean.id }),
    createFavorite({ product_id: dumbbells.id, user_id: dean.id }),
    // createFavorite({ product_id: products[1].id, user_id: users[0].id }),
  ]);
  const alfredFavorites = await fetchFavorites(alfred.id);
  const deanFavorites = await fetchFavorites(dean.id);
  console.log("dean's favorite items:", deanFavorites);
  // console.log(userFavorites);
  console.log("Favorite Products of Alfred:", alfredFavorites);

  // i can't figure out how to delete this?
  const noSkills = await destroyFavorite(alfredFavorites[0].id, alfred.id);
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};
init();
