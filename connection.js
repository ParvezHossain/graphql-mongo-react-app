require("dotenv").config();
const mongoose = require("mongoose");

const express = require("express");
const app = express();

const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const uri = `mongodb+srv://lazyengineer:${encodeURIComponent(
  MONGO_PASSWORD,
)}@cluster0.qqu8g.mongodb.net/graphql-mongo-react-app?retryWrites=true&w=majority`;

function startServer() {
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      app.listen(3000, () => {
        console.log(`Server is listening on port: 3000`);
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = {
  startServer,
  app,
};
