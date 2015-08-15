/**
 * Created by 300067113 and 200940914 on 10/08/2015.
 */
//General Setting
var express = require('express');
var router = express.Router();
var qLayer = require('../qLayer.js');

/* GET Client page. */
router.get('/', function(req, res) {
  res.render('client', {
      title: 'Client side - Order managment',
      titleOfPage: 'Place a new order or check existing one: ',
      qTitle: '',
      qResult: ''
    })});

/* GET New order page. */
router.get('/neworder', function(req, res) {
  console.log(req.query.query);
  query = req.query.query;
  if (query.length != 0 && query != '{') { //There is a value in query
    qLayer.getDetails(query, function (name){
        res.render('neworder', {
          title: 'New Order',
          qTitle: 'Hello '+name +', Welcome back!', //Get the name that is assositated to the phone number from the client DB on DynamoDB
          qResult: '' //Here store all the form for the order
        });
      });
  }
  else{
    res.render('client', {
      title: 'Client side - Order managment',
      titleOfPage: 'Place a new order or check existing one: ',
      qTitle: 'Please enter valid phone ',
      qResult: ''
    })}});

/* GET execute order page. */
router.post('/placeorder', function(req, res) {
  console.log(req);
  query = req.query.query;
  if (query.length != 0 && query != '{') { //There is a value in query
    qLayer.getDetails(query, function (name) {
      res.render('orderDone', {
        title: 'Thank you ' + name + ', your order has been placed.',
        qTitle: '',
        qResult: ''
      });
    });
  }
});

module.exports = router;
