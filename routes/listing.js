const express = require("express");
const router = express.Router();
const wrapAsyc = require("../utils/wrapAsyc.js");
const expresserror = require("../utils/expresserror.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isowner } = require("../middleware.js");
const listingcontroller = require("../controllers/listings.js");
const multer  =  require('multer')
const { storage } = require("../cloudconfig.js");
const upload  =  multer({ storage });


const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new expresserror(400, errMsg);
  } else {
    next();
  }
};

//create listing
router
  .route("/")
  .get(wrapAsyc(listingcontroller.index))
  .post(isLoggedIn, upload.array("listing[images]", 5), wrapAsyc(listingcontroller.createlisting));
  


//New Route
router.get("/new", isLoggedIn, listingcontroller.newform);

//update listing
router.route("/:id")
  .get(wrapAsyc(listingcontroller.showlisting))
  .put(isLoggedIn, isowner, upload.array("listing[images]", 5), wrapAsyc(listingcontroller.updateListing))
  .delete(isLoggedIn, isowner, wrapAsyc(listingcontroller.deleteListing));


//Edit Route
router.get("/:id/edit", isLoggedIn, isowner, wrapAsyc(listingcontroller.editlisting));  

// //New Route
// router.get("/new", isLoggedIn, listingcontroller.newform);

// //Show Route
// router.get("/:id", wrapAsyc(listingcontroller.showlisting));

// //Update Route
// router.put("/:id", isLoggedIn, isowner, validateListing, wrapAsyc(listingcontroller.updateListing));

// //Delete Route
// router.delete("/:id", isLoggedIn, isowner, wrapAsyc(listingcontroller.deleteListing));

module.exports = router;