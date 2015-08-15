/**
 * Created by 300067113 and 200940914 on 10/08/2015.
 */
//General Setting
var express = require('express');
var router = express.Router();
var qLayer = require('../qLayer.js');

/* GET farmers page. */
router.get('/', function(req, res) {
  //console.log(req.query.option);
  if (req.query) {
    if (req.query.option == 'p') {  //If Pending orders is chosen
      //console.log("In Pending Orders")
      res.render('farmer', {
        infoTitle: 'Your pending orders:',
        resultValues: 'Pending',
        qResult: 'Bla bla test test ' //Put here the stuff you pull out of dynamoDB
      })
    }
    else {
      if (req.query.option == 'c') { //If Completed orders is chosen
        //console.log("In Complete Orders")
        res.render('farmer', {
          infoTitle: 'Your completed orders:',
          resultValues: 'Completed',
          qResult: 'Bla bla test test ' //Put here the stuff you pull out of dynamoDB
        })
      }
      else {
        if (req.query.option == 'q') {//If Quota Managment is chosen
          qLayer.getQuota(function (data) {
            res.render('farmer', {
              infoTitle: 'Your current quota:',
              resultValues: 'Quota',
              qResult: data //Put here the stuff you pull out of dynamoDB
            })
          })
        }
        else { //Nothing else
          res.render('farmer')
        }
      }
    }
  }
});

/* GET Update Quota page. */
router.get('/updateQuota', function(req, res) {
    qLayer.updateQuota(req.query, function (data) {
      console.log(data);
      res.render('farmer', {
          infoTitle: 'Quota has been updated.',
          resultValues: '',
          qResult: ''
        });
    })
  });



module.exports = router;
