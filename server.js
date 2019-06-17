var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");


// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();


// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

require("./routes/apiroutes")(app);
require("./routes/htmlroutes")(app);
const mongodburl = process.env.MONGODB_URI || "mongodb://scrapeproject:seesaw123@ds139037.mlab.com:39037/heroku_6dwbsqwz"
// Connect to the Mongo DB
mongoose.connect(mongodburl, { useNewUrlParser: true });


// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

