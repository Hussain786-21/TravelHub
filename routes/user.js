const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsyc = require("../utils/wrapAsyc.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const usercontroller = require("../controllers/users.js");

router.route("/signup")
    .get(usercontroller.rendersignupform)
    .post(wrapAsyc(usercontroller.signup));

router.route("/login")
    .get(usercontroller.renderloginform)
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),usercontroller.login);

router.get("/logout", usercontroller.logout);

module.exports = router;