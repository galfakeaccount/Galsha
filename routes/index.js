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

/* GET farmers page. */
router.get('/farmer', function(req, res) {
  res.render('farmer')});

/* GET Client page. */
router.get('/client', function(req, res) {
  var url = require('url');
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  var queryresult = "*";
  query = JSON.stringify(query);
  var n = query.indexOf(":");
  query = query.substring(n+2, query.length-2);
  if (query.length != 0 && query != '{') {
    qLayer.getResults(query, function (queryresult) {
      res.render('index', {
        title: 'Cloud Computing: Final Project',
        qTitle: 'Results for key: ' + query,
        qResult: queryresult
      });
    });
  }
  else{
    console.log("Inside index return");
    res.render('index', {
      title: 'Cloud Computing: Final Project',
      titleOfPage: 'Place a new order or check existing one: ',
      qTitle: '',
      qResult: ''
    })}});

router.get('/center', function(req, res, next) {
  res.render('center', {"shippingDay": 0, "numberOfOrders": 230});
});

router.get('/stock', function(req, res, next) {
  // get summery of stock
  console.log('LOG:stock status');

  //getSummeryOfStock(items);
  var items = [
    {"Name":"bananas", "InStock":12, "Ordered":3},
    {"Name":"tomatos", "InStock":34, "Ordered":23}
  ];
  res.render('stock', items);
});

module.exports = router;
