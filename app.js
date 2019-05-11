var express = require("express");
var request = require('request');
var mongoose = require("mongoose");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");

var User = require("./models/user");
var app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

mongoose.connect("mongodb://localhost/job_board_app");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    secret: "jobs",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req, res) {
   res.render("home");
});
app.get("/error",function(req, res) {
    res.render("error");
});

app.get("/jobs",isLoggedIn,function(req, res) {
    var url = "https://jobs.github.com/positions.json?page=1" ;

    request(url, function(error,response,body){
        var data=JSON.parse(body);
        if(data.status == "error") {
            res.render("error") ;
        }
        else {
            // console.log(data);
            res.render("jobs",{data:data});
        }
    });
});


// AUTH ROUTES
app.get("/register",function(req, res) {
    res.render('register');
});
app.post("/register",function(req, res) {
    req.body.username
    req.body.password
    User.register(new User({username: req.body.username}), req.body.password, function(err,user) {
        if(err){
            console.log(err);
            return res.render("error");
        }
        passport.authenticate("local")(req,res, function(){
            res.redirect("/jobs")
        });
    });

});

app.get("/login",function(req, res) {
    res.render("login")
});

app.post("/login",passport.authenticate("local", {
    successRedirect: "/jobs",
    failureRedirect: "/error"
}),function(req, res) {


});

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
})

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect("/login");

}


app.listen(process.env.PORT || 8080, process.env.ID, function() {
    console.log("server started");
});