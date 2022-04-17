const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    req.isAuth = false;
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!token && token == "") {
    req.isAuth = false;
    return next();
  }
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, JWT_SECRET_KEY);
  } catch (error) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  req.userId = token.userId;
  next();
};
