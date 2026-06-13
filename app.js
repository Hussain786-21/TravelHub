if(process.env.NODE_ENV != "production") {
  require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate  = require("ejs-mate");
const listingsrouter  = require("./routes/listing.js");
const reviewsrouter = require("./routes/review.js");
const Userrouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dburl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dburl, {
    tls: true,
    tlsAllowInvalidCertificates: false,
  });
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname, "/public")));
const expresserror = require("./utils/expresserror.js");



const secret = process.env.SESSION_SECRET || "fallbacksecret";

const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: { secret },
  touchAfter: 24 * 3600,
});

store.on("error", (e) => {
  console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
  store,
  secret,
  resave : false,
  saveUninitialized : true,
  cookie : {
    expires : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly : true,
  },
};


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.curruser = req.user;
    next();
});

// app.get("/demouser", async(req, res) => {
//   let fakeUser = new User({
//     email : "student@gmail.com",
//     username : "delta-student",
//   });
//   let registereduser = await User.register(fakeUser, "helloworld");
//   res.send(registereduser);
// });

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/", Userrouter);
app.use("/listings", listingsrouter);
app.use("/listings/:id/reviews", reviewsrouter);


app.all("*", (req, res, next) => {
  next(new expresserror(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  let {statusCode = 500, message = "Something went wrong!"} = err;
  res.locals.curruser = req.user;
  res.locals.success = "";
  res.locals.error = "";
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});


