let express = require("express"); 
let path = require("path");

const app = express();
app.use(express.static(__dirname + "/public"));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

const port = process.env.PORT ? process.env.PORT : 3000;
const server = app.listen(port);
module.exports = server;
