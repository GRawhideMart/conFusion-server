const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
           .all((req,res,next) => {
               res.statusCode = 200;
               res.setHeader('Content-Type', 'text/plain');
               next();
           })
           .get((req,res,next) => {
               res.end('Will fetch the leaders for you');
           })
           .post((req,res,next) => {
               res.write('Posting new leader...\n');
               res.end('Posted leader:\n' + req.body.name + '\n' + req.body.description);
           })
           .put((req,res,next) => {
               res.statusCode = 403;
               res.end('PUT operation not permitted on endpoint ' + req.path);
           })
           .delete((req,res,next) => {
               res.end('This will delete all the leaders.');
           })

leaderRouter.route('/:leaderId')
           .get((req,res,next) => {
               res.end('Fetching leader with id ' + req.params.leaderId);
           })
           .post((req,res,next) => {
               res.statusCode = 403;
               res.end('POST operation not allowed on single leader.\nA friendly reminder that the id gets assigned automatically');
           })
           .put((req,res,next) => {
               res.write('Updating leader with id ' + req.params.leaderId);
               res.end('Updated leader:\nName: ' + req.body.name + '\nDescription: ' + req.body.description);
           })
           .delete((req,res,next) => {
               res.end('Deleting leader with ID ' + req.params.leaderId);
           });

module.exports = leaderRouter;