require("dotenv").config();
const express = require("express");
const app = express();


app.get('/hello', (req, res) => {
    res.send("Hello World");
})

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});



