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
    qLayer.getDetails(query, function (data){
      if (data.Count != 0){
        res.render('neworder', {
          title: 'New Order',
          phoneN: query,
          fName: data.Items[0].FirstName.S,
          sName: data.Items[0].Surname.S,
          storedAddress: '20 Mazeh St, Tel Aviv',
          qTitle: 'Hello '+data.Items[0].FirstName.S +', Welcome back!', //Get the name that is assosiated to the phone number from the client DB on DynamoDB
          qResult: '' //Here store all the form for the order
        });
      }
      else{
        res.render('neworder', {
          title: 'New Order',
          phoneN: query,
          fName: '',
          sName: '',
          storedAddress: '',
          qTitle: 'Hello new user, please fill in your details below',
          qResult: '' //Here store all the form for the order
        });
      }
    });
  }
  else{
    res.render('client', {
      title: 'Client side - Order managment',
      titleOfPage: 'Place a new order or check existing one: ',
      qTitle: 'Please enter valid phone ',
      qResult: ''
    })}});

/* POST execute order page. */
router.post('/placeorder', function(req, res) {
  console.log(req.body);
  //Send order info to SQS to wait for pickup by the distribution center module
  qLayer.sendSQS(req.body, function (res) {
    res.render('orderDone', {
      title: 'Thank you ' +res + ', your order has been placed.',
      qTitle: '',
      qResult: ''
    });
  });
});

module.exports = router;
