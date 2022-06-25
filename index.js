const dotenv = require("dotenv");
const express = require('express');
const {urlencoded} = require('express');
const app = express();
const cors = require('cors')

dotenv.config({ path: './config.env' });
const port = process.env.PORT;
require('./db');

app.use(urlencoded({ extended: true }));
app.use(cors())
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE,PATCH,"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
  });
app.use(express.json())
// Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
    console.log(`listning port at http://localhost:${port}`)
});