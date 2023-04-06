const Joi = require("joi");
const express = require("express");
const mongoose = require("mongoose");
const users = require("./routes/users");
const auth = require("./routes/auth");
const bodyparse = require('body-parser');
const config = require("config");
const app = express();
const cors = require('cors');

app.use(cors({ exposedHeaders: 'x-auth-token' }))
app.set('view engine', 'ejs');
app.use(bodyparse.json());
app.use(express.json());
app.use(bodyparse.urlencoded( { extended: true }));
app.use(express.static("public"));

if(!config.has("jwtPrivateKey")){
    console.error("FATAL ERROR: jwtPrivateKey is not defined.");
    process.exit(1);
}
mongoose.connect("mongodb://127.0.0.1:27017/HobbyWebsite")
        .then( () => console.log("Connected to MongoDB..."))
        .catch(err => console.error("Could not connect to MongoDB", err));


app.get('/signup', (req, res) => {
    res.render('signup');
})

app.use("/api/users", users);
app.use("/api/auth", auth);
app.get('/welcome', (req, res) => {
    const token = req.headers['x-auth-token'];
    res.render('welcome');
})

app.get("/", (req, res) => {
    res.render('index');
});

app.listen(3000, () => {
    console.log("Listening to port 3000...");
});
