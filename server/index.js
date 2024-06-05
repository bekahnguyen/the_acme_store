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
//server/index.js
app.use(express.json());
app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    console.log(req.body);
    res.status(201).send(
      await createFavorite({
        product_id: req.body.product_id,
        user_id: req.params.id,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/users/:id/favorites", async (req, res, next) => {
  try {
    console.log(req.body);
    res.status(204).send(
      await destroyFavorite({
        product_id: req.body.product_id,
        user_id: req.params.id,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

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
  // const noSkills = await destroyFavorite(alfredFavorites[0].id, alfred.id);
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};
init();
