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
      console.log(data);
      if (data.Count != 0){
        res.render('neworder', {
          title: 'New Order',
          phoneN: query,
          fName: data.Items[0].FirstName.S,
          sName: data.Items[0].Surname.S,
          storedAddress: data.Items[0].Address.S,
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
  //Search for client on ClientDB - add it
  qLayer.getDetails(req.body.phone, function (data){
    if (data.Count == 0){//No entry - add it
      console.log("No matches found on DB - Adding to our client DB table")
      qLayer.addDetails(req.body)
    }
  });
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
  if (req.query.query != '') {
    qLayer.getOrders(req.query.query, function (data) {
      if (data.Count != 0) {//Results found
        console.log('***' + data.Items[0].Center.S);
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
  }
  else {
    res.render('client', {
      title: 'Client side - Order managment',
      titleOfPage: 'Place a new order or check existing one: ',
      qTitle: 'Please enter valid phone ',
      qResult: ''
    });
  }
});


/* GET specific order page. */
router.get('/pullorder', function(req, res) {
  console.log(req);
  qLayer.retrieveOrder(req.query.orderID, function (data) {
    if (data.Count != 0 && data != '') {//Results found
      console.log(data.Items[0].supplyDate.N);
      var fulldate = (data.Items[0].supplyDate.N);
      var yr = fulldate.substring(0,4);
      var month = fulldate.substring(4,6);
      var day = fulldate.substring(6,8);
      res.render('pullorder', {
        title: 'Order History',
        titleOfPage: 'Here are the details for order ' +req.query.orderID+ ':',
        oApples: data.Items[0].Apples.N,
        oTomatoes: data.Items[0].Tomatoes.N,
        oDate: ''+day+'/'+month+'/'+yr,
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
