const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const { search, category } = req.query;
  const query = category ? { category }
    : search ? { $or: [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ]}
    : {};
  const allListings = await Listing.find(query);
  res.render("listings/index.ejs", { allListings, category: category || "", search: search || "" });
};

module.exports.newform = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showlisting = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      }
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createlisting = async (req, res, next) => {
  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
  }).send();
  const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.images = images;
  newListing.geometry = response.body.features[0].geometry;
  await newListing.save();
  req.flash("success", "New listing was created!");
  res.redirect("/listings");
};

module.exports.editlisting = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  let originalimages = listing.images.map(img => ({
    url: img.url.replace("/upload", "/upload/w_250"),
    filename: img.filename
  }));
  res.render("listings/edit.ejs", { listing, originalimages });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
    listing.images.push(...newImages);
    await listing.save();
  }
  req.flash("success", "Listing was updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing was deleted!");
  res.redirect("/listings");
}