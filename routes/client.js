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
  //Search for client on ClientDB - add it

  //Send order info to dynamoDB
  qLayer.sendOrder(req.body, function (data) {
    res.render('orderdone', {
      title: 'Thank you ' +req.body.firstname+ ', your order has been placed.',
      qTitle: '',
      qResult: ''
    });
  });
});
/* GET existing order page. */
router.get('/existingorder', function(req, res) {
  qLayer.getOrders(req.query.query, function (data) {
    if (data.Count != 0) {//Results found
      res.render('existingorder', {
        title: 'Order History',
        titleOfPage: 'This is your order history: ',
        oHistory: data,
        qTitle: '',
        qResult: ''
      })
    }
    else { //No results found
      res.render('existingorder', {
        title: 'Order History',
        titleOfPage: 'No previous orders for this phone number',
        oHistory: '',
        qTitle: '',
        qResult: ''
      })
    }
  })
});

/* GET specific order page. */
router.get('/pullorder', function(req, res) {
  console.log(req);
  qLayer.retrieveOrder(req.query.orderID, function (data) {
    if (data.Count != 0) {//Results found
      var yr = req.query.orderID.substring(0,4);
      var month = req.query.orderID.substring(5,6);
      res.render('pullorder', {
        title: 'Order History',
        titleOfPage: 'Here are the details for order ' +req.query.orderID+ ':',
        oApples: data.Items[0].Apple.N,
        oTomatoes: data.Items[0].Tomatoes.N,
        oDate: ''+month+'/'+yr,
        qTitle: '',
        qResult: ''
      })
    }
    else { //No results found
      res.render('pullorder', {
        title: 'Order History',
        titleOfPage: 'No such order ID in our DB.',
        oHistory: '',
        oApples: 'NA',
        oTomatoes: 'NA',
        oDate: '',
        qTitle: '',
        qResult: ''
      })
    }
  })
});

module.exports = router;
