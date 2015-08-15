/**
 * Created by 300067113 and 200940914 on 10/08/2015.
 */
//General Setting
var express = require('express');
var router = express.Router();
var qLayer = require('../queryLayer');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('welcome')});


module.exports = router;
