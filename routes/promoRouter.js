const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Promos = require('../models/promotions');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
           .get((req,res,next) => {
               Promos.find({})
                     .then(promo => {
                         res.statusCode = 200;
                         res.setHeader('Content-Type','application/json');
                         res.json(promo)
                     }, err => next(err))
                     .catch(err => next(err));
           })
            .post(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
               Promos.create(req.body)
                     .then(promo => {
                         res.statusCode = 200;
                         res.setHeader('Content-Type','application/json');
                         res.json(promo);
                     },err => next(err))
                     .catch(err => next(err))
           })
            .put(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
               res.statusCode = 403;
               res.end('PUT operation not permitted on /promotions');
           })
            .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
               Promos.deleteMany({})
                     .then(result => {
                         res.statusCode = 200;
                         res.setHeader('Content-Type','application/json');
                         res.json(result);
                     }, err => console.log(err))
                     .catch(err => console.log(err));
           })

promoRouter.route('/:promoId')
           .get((req,res,next) => {
               Promos.findById(req.params.promoId)
                     .then(promo => {
                         switch(promo) {
                             case null:
                                 err = new Error('Promo ' + req.params.promoId + ' not found');
                                 err.status = 404;
                                 return next(err);
                             default:
                                 res.statusCode = 200;
                                 res.setHeader('Content-Type','application/json');
                                 res.json(promo);
                         }
                     }, err => next(err))
                     .catch(err => next(err));
           })
            .post(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
               res.statusCode = 403;
               res.end('POST operation not allowed on single promo.\nA friendly reminder that the id gets assigned automatically');
           })
            .put(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
               Promos.findByIdAndUpdate(req.params.promoId, {
                   $set: req.body
               }, { new: true })
                     .then(promo => {
                         res.statusCode = 200;
                         res.setHeader('Content-Type','application/json');
                         res.json(promo);
                     }, err => next(err))
                     .catch(err => next(err));
           })
            .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
               Promos.findByIdAndDelete(req.params.promoId)
                     .then(result => {
                         res.statusCode = 200;
                         res.setHeader('Content-Type','application/json');
                         res.json(result);
                     }, err => next(err))
                     .catch(err => next(err))
           });

module.exports = promoRouter;