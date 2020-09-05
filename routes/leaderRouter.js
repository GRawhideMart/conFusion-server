const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const leaderRouter = express.Router();

const Leaders = require('../models/leaders');

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
           .get((req,res,next) => {
               Leaders.find({})
                      .then(leaders => {
                          res.statusCode = 200;
                          res.setHeader('Content-Type','application/json');
                          res.json(leaders);
                      }, err => next(err))
                      .catch(err => next(err));
           })
           .post((req,res,next) => {
               Leaders.create(req.body)
                      .then(
                          leader => {
                              res.statusCode = 200;
                              res.setHeader('Content-Type', 'application/json');
                              res.json(leader);
                          }, err => next(err))
                      .catch(err => next(err));
           })
           .put((req,res,next) => {
               res.statusCode = 403;
               res.end('PUT operation not permitted on endpoint /leaders');
           })
           .delete((req,res,next) => {
               Leaders.deleteMany({})
                      .then(leader => {
                          res.statusCode = 200;
                          res.setHeader('Content-Type','application/json');
                          res.json(leader);
                      }, err => next(err))
                      .catch(err => next(err))
           })

leaderRouter.route('/:leaderId')
           .get((req,res,next) => {
               Leaders.findById(req.params.leaderId)
                      .then(leader => {
                        switch(leader) {
                            case null:
                                err = new Error('Leader ' + req.params.leaderId + ' not found');
                                err.status = 404;
                                return next(err);
                            default:
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(leader);
                        }
                      })
                      .catch(err => next(err));
           })
           .post((req,res,next) => {
               res.statusCode = 403;
               res.end('POST operation not allowed on single leader.\nA friendly reminder that the id gets assigned automatically');
           })
           .put((req,res,next) => {
               Leaders.findByIdAndUpdate(req.params.leaderId, {
                   $set: req.body
               }, { new: true })
                   .then(leader => {
                       res.statusCode = 200;
                       res.setHeader('Content-Type', 'application/json');
                       res.json(leader);
                   }, err => next(err))
                   .catch(err => next(err));
           })
           .delete((req,res,next) => {
               Leaders.findByIdAndDelete(req.params.leaderId)
                   .then(result => {
                       res.statusCode = 200;
                       res.setHeader('Content-Type', 'application/json');
                       res.json(result);
                   }, err => next(err))
                   .catch(err => next(err))
           });

module.exports = leaderRouter;