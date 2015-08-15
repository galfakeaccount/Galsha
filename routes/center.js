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
    res.render('centerModel/center', {"shippingDay": 0, "numberOfOrders": 230});
});

router.get('/stock', function(req, res, next) {
    var items = getStock();
    var totalItems = getSummeryOfStock();
    res.render('centerModel/stock', {totalOffering: totalItems, farmerOffering: items});
});

router.get('/orders', function(req, res) {
    res.render('centerModel/orders', {monday: "4/8", thersday: "7/8"});
});

router.get('/organise', function(req, res) {
    res.render('centerModel/organise', {});
});

/*
 * Get current stock by farmer and item
 * Name - The name of the item.
 * Farmer - Farmer name.
 * stock - How much stock can this farmer offer this week.
 */
function getStock(){
    var items = [
        {"Name":"bananas", "Farmer": "Gal", "stock":3},
        {"Name":"tomatos", "Farmer": "Gal", "stock":12},
        {"Name":"tomatos", "Farmer": "Omer", "stock":4}
    ];
    return items;
}

/*
 * Get a summery of the current stock.
 * Name - The name of the item.
 * InStock - How much stock was in the beginning.
 * Ordered - How much stock jas been ordered from this item.
 */
function getSummeryOfStock(){
    var items = [
        {"Name":"bananas", "InStock":12, "Ordered":3},
        {"Name":"tomatos", "InStock":34, "Ordered":23}
    ];
    return items;
}

module.exports = router;
