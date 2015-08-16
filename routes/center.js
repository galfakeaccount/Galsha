/**
 * Created by 300067113 and 200940914 on 10/08/2015.
 */
//General Setting
var express = require('express');
var router = express.Router();
var qLayer = require('../qLayer.js');

// middleware specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

router.get('/', function(req, res, next) {
    res.render('centerModel/center', {"shippingDay": 0, "numberOfOrders": 230});
});

router.get('/stock', function(req, res) {
    console.log("In stock info");
    qLayer.getQuota(function (data) {
        computeTotal(data, function(total){
            console.log(total);
            res.render('centerModel/stock', {
                totalOffering: total,
                farmerOffering: data
            })
        })
    })
});

router.get('/orders', function(req, res) {
    res.render('centerModel/orders', {monday: "4/8", thersday: "7/8"});
});

router.get('/organise', function(req, res) {
    // 1. get all open orders
    qLayer.getOpenOrders(function(data){
        console.log("In organize");
        console.log(data.Items);
        var centers = {};
        data.Items.forEach(function(entry, index) {
            // get order info by orderID
            qLayer.retrieveOrder(entry.orderID.S, function(orderInfo){
                console.log(orderInfo.Items);
                if (centers[entry.Center.S]){
                    centers[entry.Center.S].apples += orderInfo.Items.apples;
                    centers[entry.Center.S].tomatoes += orderInfo.Items.tomatoes;
                } else {
                    centers[entry.Center.S] =
                    {apples: orderInfo.Items.apples, tomatoes : orderInfo.Items.tomatoes, farmer: ""};
                }
                console.log("centers:", centers);
            });
        });

    });
    // 2. devide orders by centers
    // 3. for each center:
    //   a. query each orderId
    //   b. sum appels, and sum tomatoes - enter into new table

    res.render('centerModel/organise',
        {data: [{name: 'google', deliveryDate: '29082015', apples: '230', tomatoes: '120'},
            {name: 'microsoft', deliveryDate: '29082015', apples: '20', tomatoes: '80'}]
            , farmers: ['Ali', 'Jack', 'Danny']});
});




router.post('/orders', function(req, res) {
    if (req.body.get_all_orders) {
        qLayer.getAllOrders(function(data){
            res.render('centerModel/showOrders', {data: data.Items});
        });
    } else {
        console.log("Something alse");
        qLayer.getAllOrders(function(data){
            res.render('centerModel/showOrders', {data: data.Items});
        });
    }
});

router.post('/organise', function(req, res){
    console.log(req.body);
})

/*
 * Get current stock by farmer and item
 * Name - The name of the item.
 * Farmer - Farmer name.
 * stock - How much stock can this farmer offer this week.
 */
function getStock(){
    var items = [
        {"Name":"appals", "Farmer": "Gal", "stock":3},
        {"Name":"tomatoes", "Farmer": "Gal", "stock":12},
        {"Name":"tomatoes", "Farmer": "Omer", "stock":4}
    ];
    return items;
}
/**
 * Sums the data from all farmers into items total amount
 * @param data
 */
function computeTotal(data, callback){
    var appleSum = 0;
    var tomatoSum = 0;
    data.Items.forEach(function(entry){
        if(entry.offeredGoods.S == 'Tomatoes')
            tomatoSum = (tomatoSum*1 +entry.Capacity.N*1);
        else
            appleSum = (appleSum*1 +entry.Capacity.N*1);
    })
    total = [
        {"Name": "Apples", "Quota": appleSum},
        {"Name": "Tomatoes", "Quota": tomatoSum}
    ]
    callback(total);
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
