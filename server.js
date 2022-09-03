const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");

const app = require("./app");
const URI = process.env.DATABASE_URI.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("db connection successful");
  });

//-------------- SERVER STARTER---------------
const port = process.env.PORT || 3000;
app.listen(port, "127.0.0.1", () => {
  console.log(`App running on port ${port}`);
});
