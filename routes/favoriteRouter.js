const express = require("express");
const bodyParser = require("body-parser");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find()
      .populate("user")
      .populate("campsites")
      .then((favorites) => {
        res.statusCode = 200;
        console.log("this is favorites", favorites);
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      })
      .catch((err) => next(err));
  })
  //running post, run through through middleWare,
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //we are checking to see if our user has a Favorite document
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        //then if we have one we are taking in our req.body, if we have a body continue
        //otherwise thrown to error on line 55
        if (favorite) {
          console.log(
            "this is favorite:",
            favorite,
            "this is req.body:",
            req.body
          );
          //we are taking in the request body which is coming as an array
          //we are then running the forEach method to run through our array
          req.body.forEach((fav) => {
            //declaring favArray so we are not read as undefined
            const favArray = favorite.campsite;
            console.log(
              "this is fav._id:",
              fav._id,
              "this is favorite.campsite:",
              favArray
            );
            //checking to make sure the array doesnt already contain the campsite id
            if (!favArray.includes(fav._id)) {
              //if not in the array we will push it to the array
              favArray.push(fav._id);
            }
          });
          //we are then saving the favorite document and returning a successfull response
          favorite
            .save()
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        } else {
          //this else block is creating a favorite document based upon our schema if one is not found for the user
          //and it is then pushing the campites onto the newly created document
          Favorite.create({ user: req.user._id, campsites: req.body })
            .then((favorite) => {
              if (favorite) {
                req.body.forEach((fav) => {
                  const favArray = favorite.campsite;
                  favArray.push(fav._id);
                });
                favorite.save().then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                });
              }
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorite");
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.deleteMany()
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Favorite.findById(req.params.campsiteId)
      .populate("comments.author")
      .then((campsite) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(campsite);
      })
      .catch((err) => next(err));
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          const favArray = favorite.campsite;
          if (!favArray.includes(req.params.campsiteId)) {
            favArray.push(req.params.campsiteId);
            favorite
              .save()
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "applicatioin/json");
                res.json(favorite);
              })
              .catch((err) => next(err));
          } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end("This campsite has already been saved to favorites");
          }
        } else {
          //this else block is creating a favorite document based upon our schema if one is not found for the user
          Favorite.create({ user: req.user._id, campsites: req.body })
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorite");
  })
// adjust so you can delete singular campsites then clean up code
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findByIdAndDelete(req.params.campsiteId)
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
