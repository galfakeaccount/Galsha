/**
 * Created by 300067113 and 200940914 on 10/08/2015.
 */
//General Setting
var express = require('express');
var router = express.Router();

// middleware specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

router.get('/', function(req, res, next) {
    res.render('center', {"shippingDay": 0, "numberOfOrders": 230});
});

router.get('/stock', function(req, res, next) {
    // get summery of stock

    //getSummeryOfStock(items);
    var items = [
        {"Name":"bananas", "InStock":12, "Ordered":3},
        {"Name":"tomatos", "InStock":34, "Ordered":23}
    ];
    res.render('stock', {itemlist: items});
});

module.exports = router;
