require("dotenv").config();
const _ = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const { use } = require("passport");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

///////////////////////////custDB section///////////////////////////////////////
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});

const custSchema = new mongoose.Schema({
    email: String, 
    password: String,
    googleId: String
});

custSchema.plugin(passportLocalMongoose);
custSchema.plugin(findOrCreate);
const Cust = new mongoose.model("Cust", custSchema); 

passport.use(Cust.createStrategy());
passport.serializeUser(function(cust, done){
    done(null, cust.id);
});
passport.deserializeUser(function(id, done){
    Cust.findById(id, function(err, cust){
        done(err, cust);
    })
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/home", 
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log(profile);
        Cust.findOrCreate({ googleId: profile.id }, function (err, cust) {
            return cb(err, cust);
        });
    }
));

app.get("/", function(req, res){
    res.render("homesec");
});
app.get("/register", function(req, res){
    res.render("register");
});
app.get("/login", function(req, res){
    res.render("login");
});


app.post("/register", function(req, res){
    bcrypt.hash(req.body.password, saltRounds)
    .then((hash) => {
        const newUser = new Cust({
            email: req.body.username, 
            password: hash
        });
        newUser.save().then(()=>{
            res.render("home");
        }).catch((err)=>{
            console.log(err);
        })
    });
});
app.post("/login", function(req, res){

    const username = req.body.username;
    const password = req.body.password;

    Cust.findOne({email: username})
    .then((foundUser) => {   //registered user
        if(foundUser){
            bcrypt.compare(password, foundUser.password)
            .then((result) => {//successful authentication
                if(result == true)
                    res.render("home");// result == true
            });
        }
    })
    .catch((err) => {
        console.log(err);
    });
});
///////////////////////////////////////////////////////////////////////////////////////////


app.get("/home", function(req, res){
    res.render("home");
});
app.get("/search", function(req, res){
    fs.readFile('items.json', function(error, data){
        if(error){
            res.status(500).end()
        }
        else{
            res.render('search', {
                items: JSON.parse(data)
            })
        }
    })
});
app.get("/product", function(req, res){
    fs.readFile('items.json', function(error, data){
        if(error){
            res.status(500).end()
        }
        else{
            res.render('product.ejs', {
                items: JSON.parse(data)
            })
        }
    })
});
app.get("/hoodies", function(req, res){
    fs.readFile('items.json', function(error, data){
        if(error){
            res.status(500).end()
        }
        else{
            res.render('hoodies.ejs', {
                items: JSON.parse(data)
            })
        }
    })
});
app.get("/dresses", function(req, res){
    fs.readFile('items.json', function(error, data){
        if(error){
            res.status(500).end()
        }
        else{
            res.render('dresses.ejs', {
                items: JSON.parse(data)
            })
        }
    })
});
app.get("/cart", function(req, res){
    fs.readFile('items.json', function(error, data){
        if(error){
            res.status(500).end()
        }
        else{
            res.render('cart', {
                // stripePublicKey: stripePublicKey,
                items: JSON.parse(data)
            })
        }
    })
});
app.get("/wishlist", function(req, res){
    res.render("wishlist");
});
app.get("/contact", function(req, res){
    res.render("contact");
});
app.get("/faq", function(req, res){
    res.render("faq");
});

app.post("/contact", function(req, res){
    console.log(" Request posted!");
    var name = req.body.name;
    var email = req.body.mail;
    var query = req.body.query;

    console.log(name, email + "\n" + query);
});


app.listen(3000, function(err){
    if(err){
        console.log(err);
    }else{
        console.log("Server Running");
    }
});
