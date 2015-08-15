/**
 * Created by 300067113 and 200940914 on 10/08/2015.
 */
//General Setting
var express = require('express');
var router = express.Router();

/* GET farmers page. */
router.get('/', function(req, res) {
  //console.log(req.query.option);
  if (req.query) {
    if (req.query.option == 'p') {  //If Pending orders is chosen
      //console.log("In Pending Orders")
      res.render('farmer', {
        infoTitle: 'Your pending orders:',
        qResult: 'Bla bla test test '
      })
    }
    else{
      if (req.query.option == 'c') { //If Completed orders is chosen
        //console.log("In Complete Orders")
      }
      else {
        if (req.query.option == 'q') {//If Quota Managment is chosen
          //console.log("In Quota Managment")
        }
        else { //Nothing else
          res.render('farmer')
        };
      }
    }
  }
})



module.exports = router;
