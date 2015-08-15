/**
 * Created by 300067113 and 200940914 on 10/08/2015.
 */
//General Setting
var express = require('express');
var router = express.Router();

/* GET farmers page. */
router.get('/', function(req, res) {
  res.render('farmer')});

module.exports = router;
