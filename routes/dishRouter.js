const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json()); // dishRouter is an instance of express object, so it's the same as const app

dishRouter.route('/')
          .all((req,res,next) => {
              res.statusCode = 200;
              res.setHeader('Content-Type','text/plain');
              next(); // next is necessary here, otherwise the execution will stop here for every type of REST method.
          })
          .get((req,res,next) => {
              res.end('Will send all dishes to you');
          })
          .post((req,res,next) => {
              res.end('Will add the dish ' + req.body.name + ' with details ' + req.body.description);
          })
          .put((req,res,next) => {
              res.statusCode = 403;
              res.end('PUT not allowed on endpoint ' + req.path);
          })
          .delete((req,res,next) => {
              res.end('Will delete all dishes');
          });

dishRouter.route('/:dishId')
          .get((req,res,next) => {
                res.end('Will send all parameters of dish with id ' + req.params.dishId);
         })
          .post((req,res,next) => {
                res.statusCode = 403;
                res.end('POST operation not permitted on ' + req.path);
         })
          .put((req,res,next) => {
                res.write('Will modify the dish with id ' + req.params.dishId + '\n')
                res.end('Updated dish ' + req.body.name + ' with details ' + req.body.description);
         })
          .delete((req, res, next) => {
                res.end('Deleting dish: ' + req.params.dishId);
         });

module.exports = dishRouter;