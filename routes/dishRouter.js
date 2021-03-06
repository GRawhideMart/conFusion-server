const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json()); // dishRouter is an instance of express object, so it's the same as const app

dishRouter.route('/')
          .get((req,res,next) => {
              Dishes.find({})
                    .populate('comments.author')
                    .then(dishes => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dishes);
                    }, err => next(err))
                    .catch(err => next(err));
          })
          .post(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
              Dishes.create(req.body)
                    .then(dish => {
                        console.log('Created dish ', dish);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    }, err => console.log(err))
                    .catch(err => console.log(err));
          })
          .put(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
              res.statusCode = 403;
              res.end('PUT not allowed on endpoint /dishes');
          })
          .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
              Dishes.remove({})
                    .then(resp => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(resp);
                    }, err => console.log(err))
                    .catch(err => console.log(err));
          });

dishRouter.route('/:dishId')
          .get((req,res,next) => {
                Dishes.findById(req.params.dishId)
                      .populate('comments.author')
                      .then(dish => {
                          res.statusCode = 200;
                          res.setHeader('Content-Type','application/json');
                          res.json(dish);
                      }, err => console.log(err))
                      .catch(err => console.log(err));
         })
          .post(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
                res.statusCode = 403;
                res.end('POST operation not permitted on single id.\nA friendly reminder that id gets assigned automatically');
         })
          .put(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
                Dishes.findByIdAndUpdate(req.params.dishId, {
                    $set: req.body
                }, { new: true })
                      .then(dish => {
                          res.statusCode = 200;
                          res.setHeader('Content-Type','application/json');
                          res.json(dish);
                      }, err => console.log(err))
                      .catch(err => console.log(err));
         })
          .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
                Dishes.findByIdAndRemove(req.params.dishId)
                      .then(resp => {
                          res.statusCode = 200;
                          res.setHeader('Content-Type', 'application/json');
                          res.json(resp);
                      }, err => console.log(err))
                      .catch(err => console.log(err));
         });

dishRouter.route('/:dishId/comments')
          .get((req,res,next) => {
              Dishes.findById(req.params.dishId)
                    .populate('comments.author')
                    .then(dish => {
                        if (dish != null) {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish.comments);
                        } else {
                            err = new Error('Dish ' + req.params.dishId + ' not found');
                            err.status = 404;
                            return next(err);
                        }
                    }, err => next(err))
                    .catch(err => next(err));
          })
          .post(authenticate.verifyUser, (req,res,next) => {
              Dishes.findById(req.params.dishId)
                    .then(dish => {
                        if (dish != null) {
                            req.body.author = req.user._id;
                            dish.comments.push(req.body);
                            dish.save()
                                .then(dish => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish);
                                }, err => next(err));
                        } else {
                            err = new Error('Dish ' + req.params.dishId + ' not found');
                            err.status = 404;
                            return next(err);
                        }
                    }, err => next(err))
                    .catch(err => next(err));
          })
          .put(authenticate.verifyUser, (req,res,next) => {
              res.statusCode = 403;
              res.end('PUT operation not supported on /dishes/' + req.params.dishId + '/comments');
          })
          .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
              Dishes.findById(req.params.dishId)
                    .then(dish => {
                        if (dish != null) {
                            for (let i = 0; i < dish.comments.length; i++) {
                                dish.comments.id(dish.comments[i]._id).remove(); // Standard procedure for targeting nested subdocuments. See docs for details
                            }
                            dish.save()
                                .then(dish => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish);
                                }, err => next(err));
                        } else {
                            err = new Error('Dish ' + req.params.dishId + ' not found');
                            err.status = 404;
                            return next(err);
                        }
                    })
                    .catch(err => next(err));
          });

dishRouter.route('/:dishId/comments/:commentId')
          .get((req,res,next) => {
              Dishes.findById(req.params.dishId)
                    .populate('comments.author')
                    .then(dish => {
                        switch(dish) {
                            case null:
                                err = new Error('Dish ' + req.params.dishId + ' not found');
                                err.status = 404;
                                return next(err);
                            
                            default:
                                if(dish.comments.id(req.params.commentId) === null) {
                                    err = new Error('Comment ' + req.params.commentId + ' not found');
                                    err.status = 404;
                                    return next(err);
                                } else {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type','application/json');
                                    res.json(dish.comments.id(req.params.commentId));
                                }
                        }
                    }, err => next(err))
                    .catch(err => next(err));
          })
          .post(authenticate.verifyUser, (req,res,next) => {
              res.statusCode = 403;
              res.end('POST operation not allowed on /dishes/' + req.params.dishId + '/comments/' + req.params.commentId + '\nA friendly reminder that the user (you) is not the one determining the id of the comment. So don\'t try.');
          })
          .put(authenticate.verifyUser, (req,res,next) => {
              Dishes.findById(req.params.dishId)
                    .then(dish => {
                        switch(dish) {
                            case null:
                                err = new Error('Dish ' + req.params.dishId + ' not found');
                                err.status = 404;
                                return next(err);
                            
                            default:
                                if(dish.comments.id(req.params.commentId) === null) {
                                    err = new Error('Comment ' + req.params.commentId + ' not found');
                                    err.status = 404;
                                    return next(err);
                                } else if(dish.comments.id(req.params.commentId) != null && dish.comments.id(req.params.commentId).author.equals(req.user._id)) {
                                    if(req.body.rating) dish.comments.id(req.params.commentId).rating = req.body.rating;
                                    if(req.body.comment) dish.comments.id(req.params.commentId).comment = req.body.comment;
                                    dish.save()
                                        .then(dish => {
                                            Dishes.findById(dish._id)
                                                  .populate('comments.author')
                                                  .then(dish => {
                                                      res.statusCode = 200;
                                                      res.setHeader('Content-Type','application/json');
                                                      res.json(dish);
                                                  }, err => next(err))
                                        })
                                }
                        }
                    }, err => next(err))
                    .catch(err => next(err));
          })
          .delete(authenticate.verifyUser, (req, res, next) => {
              Dishes.findById(req.params.dishId)
                  .then(dish => {
                      switch (dish) {
                          case null:
                              err = new Error('Dish ' + req.params.dishId + ' not found');
                              err.status = 404;
                              return next(err);
                      
                          default:
                              if (dish.comments.id(req.params.commentId) === null) {
                                  err = new Error('Comment ' + req.params.commentId + ' not found');
                                  err.status = 404;
                                  return next(err);
                              } else {
                                  dish.comments.id(req.params.commentId).remove();
                                  dish.save()
                                      .then(dish => {
                                          Dishes.findById(dish._id)
                                              .populate('comments.author')
                                              .then(dish => {
                                                  res.statusCode = 200;
                                                  res.setHeader('Content-Type', 'application/json');
                                                  res.json(dish);
                                              }, err => next(err))
                                      })
                              }
                      }
                  }, err => next(err))
                  .catch(err => next(err));
          })

module.exports = dishRouter;