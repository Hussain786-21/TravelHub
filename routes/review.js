const express = require("express");
const router = express.Router({mergeParams: true });
const wrapAsyc = require("../utils/wrapAsyc.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {validateReview,isLoggedIn, isreviewauthor} = require("../middleware.js");
const reviewcontroller = require("../controllers/reviews.js");



//Reviews Post review Route
router.post("/",isLoggedIn,validateReview, wrapAsyc(reviewcontroller.addReview));

//delete review route
router.delete("/:reviewId",isLoggedIn,isreviewauthor, wrapAsyc(reviewcontroller.deleteReview));

module.exports = router;
