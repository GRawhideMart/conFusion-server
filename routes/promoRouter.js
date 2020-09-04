const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
           .all((req,res,next) => {
               res.statusCode = 200;
               res.setHeader('Content-Type', 'text/plain');
               next();
           })
           .get((req,res,next) => {
               res.end('Will fetch the promotions for you');
           })
           .post((req,res,next) => {
               res.write('Posting new promotion...\n');
               res.end('Posted promotion:\n' + req.body.name + '\n' + req.body.description);
           })
           .put((req,res,next) => {
               res.statusCode = 403;
               res.end('PUT operation not permitted on endpoint ' + req.path);
           })
           .delete((req,res,next) => {
               res.end('This will delete all the promotions.');
           })

promoRouter.route('/:promoId')
           .get((req,res,next) => {
               res.end('Fetching promo with id ' + req.params.promoId);
           })
           .post((req,res,next) => {
               res.statusCode = 403;
               res.end('POST operation not allowed on single promo.\nA friendly reminder that the id gets assigned automatically');
           })
           .put((req,res,next) => {
               res.write('Updating promo with id ' + req.params.promoId);
               res.end('Updated promo:\nName: ' + req.body.name + '\nDescription: ' + req.body.description);
           })
           .delete((req,res,next) => {
               res.end('Deleting promo with ID ' + req.params.promoId);
           });

module.exports = promoRouter;