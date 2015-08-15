/**
 * Created by 300067113 and 200940914 on 10/08/2015.
 */
//General Setting
var express = require('express');
var router = express.Router();

/* GET Client page. */

router.get('/', function(req, res) {
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
        title: 'Client side - order managment',
        qTitle: 'Results for key: ' + query,
        qResult: queryresult
      });
    });
  }
  else{
    res.render('index', {
      title: 'Client side - Order managment',
      titleOfPage: 'Place a new order or check existing one: ',
      qTitle: '',
      qResult: ''
    })}});

/* GET Client page. */

router.get('/neworder', function(req, res) {
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
        title: 'Client side - order managment',
        qTitle: 'Results for key: ' + query,
        qResult: queryresult
      });
    });
  }
  else{
    res.render('index', {
      title: 'Client side - Order managment',
      titleOfPage: 'Place a new order or check existing one: ',
      qTitle: '',
      qResult: ''
    })}});

module.exports = router;
