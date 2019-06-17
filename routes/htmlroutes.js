const path = require("path");
module.exports = function (app) {
    app.get("/", function (req, res) {
        res.sendFile(path.join(__dirname, "/../public/index.html"))
    })
    app.get("/scraped", function (req, res) {
        res.sendFile(path.join(__dirname, "/../public/scraped.html"))
    })

}
