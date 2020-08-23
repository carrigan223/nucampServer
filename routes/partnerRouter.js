const express = require("express");
const bodyParser = require("body-parser");
const Partner = require("../models/partner");
const authenticate = require("../authenticate"); 

const partnerRouter = express.Router();

partnerRouter.use(bodyParser.json());

partnerRouter
  .route("/")

  .get((req, res, next) => {
    Partner.find()
      .then((partners) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(partners);
      })
      .catch((err) => next(err));
  })

  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.create(req.body)
      .then((partner) => {
        console.log("Partner Created", partner);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(partner);
      })
      .catch((err) => next(err));
  })

  .put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /partners");
  })

  .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.deleteMany()
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch((err) => next(err));
  });

partnerRouter
  .route("/:partnerId")
  .get((req, res, next) => {
    Partner.findById(req.params.partnerId)
      .then((partner) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(partner);
      })
      .catch((err) => next(err));
  })

  .post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `Post operation not supported on /partners/${req.params.partnerId}`
    );
  })

  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    Partner.findByIdAndUpdate(
      req.params.partnerId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then((partner) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(partner);
      })
      .catch((err) => next(err));
  })

  .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.findByIdAndDelete(req.params.partnerId)
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch((err) => next(err));
  });

//   .all((req, res, next) => {
//     res.statusCode = 200;
//     res.setHeader("Content-Type", "text/plain");
//     next();
//   })

//   .get((req, res) => {
//     res.end("Will send all the partners to you");
//   })

//   .post((req, res) => {
//     res.end(
//       `Will add the partner: ${req.body.name} with description: ${req.body.description}`
//     );
//   })

//   .put((req, res) => {
//     res.statusCode = 403;
//     res.end("PUT operation not supported on /partners");
//   })

//   .delete((req, res) => {
//     res.end("Deleting all partners");
//   });

// partnerRouter
//   .route("/:partnerId")
//   .all((req, res, next) => {
//     res.statusCode = 200;
//     res.setHeader("Content-Type", "text/plain");
//     next();
//   })
//   .get((req, res) => {
//     res.end(`Will send details of the partner: ${req.params.partnerId} to you`);
//   })

//   .post((req, res) => {
//     res.end(
//       `Will add the partner: ${req.body.name} with description: ${req.body.description}`
//     );
//   })

//   .put((req, res) => {
//     //res.statusCode = 403;
//     res.end(
//       `Updating partner: ${req.params.partnerId} Will update the partner: ${req.body.name} with description: ${req.body.description} `
//     );
//   })

//   .delete((req, res) => {
//     res.end(`Deleting partner: ${req.params.partnerId}`);
//   });

module.exports = partnerRouter;
