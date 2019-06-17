
var axios = require("axios");
var cheerio = require("cheerio");
var Article = require("../models/Article");
var Note = require("../models/Note");

module.exports = function (app) {



    app.get("/scrape", function (req, res) {
        // First, we grab the body of the html with axios
        console.log("hi")
        axios.get("https://www.psychologytoday.com/us/blog/hide-and-seek").then(function (response) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(response.data);
            var results = []

            // Now, we grab every h2 within an article tag, and do the following:
            $(".blog_entry--teaser").each(function (i, element) {
                // Save an empty result object
                var singlearticle = {};


                // Add the text and href of every link, and save them as properties of the result object
                singlearticle.title = $(this).children(".blog_entry__text").children("h2").children("a").text();
                singlearticle.link = $(this).children(".blog_entry__text").children("h2").children("a").attr("href");
                singlearticle.text = $(this).children(".blog_entry__text").children("p.blog_entry__teaser").text();
                results.push(singlearticle);


            });
            Article.remove({}, function (error) {
                if (error) {
                    console.log(error);
                }

            })

            Article.create(results, function (error, data) {
                if (error) {
                    console.log(error);
                }
                else {
                    res.redirect("/scraped")
                }

            })



        });
    });
    // Route for getting all Articles from the db
    app.get("/articles", function (req, res) {
        Article.remove({})
        // Grab every document in the Articles collection
        Article.find({})
            .then(function (data) {
                // If we were able to successfully find Articles, send them back to the client
                res.json(data);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for grabbing a specific Article by id, populate it with it's note
    app.get("/articles/:id", function (req, res) {
        Article.findOneAndUpdate({ _id: req.params.id }, { saved: true }, function (error, update) {
            // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
            Article.findOne({ _id: req.params.id })
                // ..and populate all of the notes associated with it
                .populate("note")
                .then(function (data) {

                    // If we were able to successfully find an Article with the given id, send it back to the client
                    res.json(data);
                })
                .catch(function (err) {
                    // If an error occurred, send it to the client
                    res.json(err);
                });
        });

    });

    // Route for saving/updating an Article's associated Note
    app.post("/articles/:id", function (req, res) {
        // Create a new note and pass the req.body to the entry

        Note.create(req.body)
            .then(function (dbNote) {

                // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
                // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
                // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                return Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
            })
            .then(function (data) {
                // If we were able to successfully update an Article, send it back to the client
                res.json(data);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    app.delete("/articles/:id", function (req, res) {
        Article.findOneAndUpdate({ _id: req.params.id }, { saved: false }, function (error, update) {
            // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
            Article.findOne({ _id: req.params.id })
                // ..and populate all of the notes associated with it
                .populate("note")
                .then(function (data) {

                    // If we were able to successfully find an Article with the given id, send it back to the client
                    res.json(data);
                })
                .catch(function (err) {
                    // If an error occurred, send it to the client
                    res.json(err);
                });
        });

    });
    app.delete("/notes/:id", function (req, res) {
        Note.remove({ _id: req.params.id }, function (error, update) {
            // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
            if (error) {
                console.log(error)
            }
            else {
                res.json(update)
            }
        });

    });

    app.put("/note/:id", function (req, res) {
        Note.findOneAndUpdate({ _id: req.params.id }, {
            title: "",
            body: "",

        },
            function (error, update) {
                // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
                if (error) {
                    console.log(error);
                }
                else {
                    res.redirect("/scraped");
                }
            });

    });
}