/**
 * Created by 300067113 on 03/06/2015.
 */
//AWS Related
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./awscred.json'); //Load the credentials from the JSON file
AWS.config.region = 'us-east-1'; //N. Virginia
var dynamodb = new AWS.DynamoDB(); //New DynamoDB Instance
var sqs = new AWS.SQS();
var ordersQueueUri = 'https://sqs.us-east-1.amazonaws.com/016493201532/farmersDirectOrders';
var ordersCounter;
var async = require('async');
var DISTRIBUTION_CENTERS = ["google", "microsoft", "intel"];

function getDetails(req, callback) {
    //console.log("In get name");
    //console.log(req);
    var params = { //Params to be sent according to the structure of the table (In PDF file).
        "TableName": "ClientDB2",
        "KeyConditionExpression":  "Phone = :phoneval",
        "ExpressionAttributeValues": {
            ":phoneval": {"N": req}
        }
    }

    dynamodb.query(params, function(err, data) {
        if (err) {
            console.log(err); // an error occurred
        }
        else {
            callback(data);
            //callback(data.Items[0].FirstName.S +" "+data.Items[0].Surname.S); //Return the name
        }
    });
}

function addDetails(req, callback) {
    //console.log("In add name");
    //console.log(req);
    var params = { //Params to be sent according to the structure of the table (In PDF file).
        Item: {
            Phone: {
                N: req.phone
            },
            Address: {
                S: req.address
            },
            FirstName: {
                S: req.firstname
            },
            Surname: {
                S: req.lastname
            }
        },
        TableName: "ClientDB2"
    }

    dynamodb.putItem(params, function(err, data) {
		if (err) {
				console.log(err); // an error occurred
			}
			else {
				 callback();
				//callback(data.Items[0].FirstName.S +" "+data.Items[0].Surname.S); //Return the name
			}
		});
	}

//Scan for all open orders on ordersDB
function getAllOrders(callback) { //Query allorders in the system
    var params = { //Params to be sent according to the structure of the table (In PDF file).
        "TableName": "ordersDB"
        }
    dynamodb.scan(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            callback(data);// successful response
        }
    });
}

function getOpenOrders(callback) { //Query all open orders
    var params = { //Params to be sent according to the structure of the table (In PDF file).
        "TableName": "ordersDB",
        "FilterExpression": "orderStatus = :openStatus",
        "ExpressionAttributeValues": {
            ":openStatus": {"S": "OPEN"}
        }
    }

    dynamodb.scan(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            callback(data);// successful response
        }
    });
}

/*
 * Divide open orders by centers.
 */
function getCenters(orders, callback) {
    var centers = {};
    var count = orders.length;
    async.forEach(orders, function(entry) {
        // get order info by orderID
        retrieveOrder(entry.orderID.S, function(orderInfo){
            if (centers[entry.Center.S]){
                centers[entry.Center.S].push(orderInfo.Items[0]);
            } else {
                centers[entry.Center.S] =  [orderInfo.Items[0]];
            }
            count--;
            if (count == 0){
                callback(centers);
            }
        });
    });
}

function updateCenters(callback){
    count = DISTRIBUTION_CENTERS.length;
    DISTRIBUTION_CENTERS.forEach(function(centerName) {
        sumCenter(centerName, function(centers){
            count--;
            if (count == 0){
                console.log("Finished");
                callback(centers); // Will get the data from the server
            }
        });
    });
}

function sumCenter(centerName, centerOrders){
    var count = centerOrders.length;
    var apples = 0;
    var tomatoes = 0;
    console.log('***'+centerOrders);
    async.forEach(centerOrders, function(order) {
        // get order info by orderID
        //console.log(order);
        apples += order.Apples.N*1;
        tomatoes += order.Tomatoes.N*1;
        count--;
        if (count == 0){
            console.log(centerName, ", apples:", apples ,", tomatoes: ", tomatoes);
            updateCenter({cName: centerName, fName: "Jack", offeredGoods: "Tomatoes" , orders : tomatoes});
            updateCenter({cName: centerName, fName: "Dani", offeredGoods: "Apples" , orders : apples});
        }
    });
}

function updateCenter(req){
    var params = {
        TableName: 'totalOrders',
        Item: {
            centerName: {
                S: req.cName
            },
            farmerName: {
                S: req.fName
            },
            offeredGoods: {
                S: req.itemToUpdate
            },
            orders: {
                N: req.OrdersTotal
            }
        }
    }
    dynamodb.putItem(params, function (err, data) {
        if (err) {
            console.log(err); // an error occurred
        }
        else {
            console.log(data); // successful response
            callback();
        }
    })
}

function getOrders(req, callback) { //Query all orders under specific phone number
    var params = { //Params to be sent according to the structure of the table (In PDF file).
        "TableName": "ordersDB",
        "KeyConditionExpression":  "Phone = :phoneval",
        "ExpressionAttributeValues": {
            ":phoneval": {"S": req}
        }
    }
    dynamodb.query(params, function(err, data) {
        if (err) {
            console.log(err); // an error occurred
        }
        else {
            console.log(data); // successful response
            callback(data);
        }
    });
}

function retrieveOrder(req, callback) { //Get a specific order
    if (req) {
        var params = { //Params to be sent according to the structure of the table (In PDF file).
            "TableName": "orderByID",
            "KeyConditionExpression": "orderID = :orderval",
            "ExpressionAttributeValues": {
                ":orderval": {"S": req}
            }
        }

        dynamodb.query(params, function (err, data) {
            if (err) {
                //console.log(err); // an error occurred
            }
            else {
                //console.log(data); // successful response
                callback(data);
            }
        });
    }
    else{
        callback('');
    }
}

function sendOrder(req, callback) {
    //console.log(req);
    //console.log("In send order to DB");
    //Get counter from dynamoDB
    var miniparams = {
        TableName: 'sequenceOrder',
        Key: {
            "Counter": {
                "S": "MAIN"
            }
        }
    }
    dynamodb.getItem(miniparams, function (error, counter) {
        if (error) {
            //console.log("Error: ", error, error.stack);
        } else {
            ordersCounter = counter.Item.SeqVal.N;
            var params = {
                Item: {
                    Phone: {
                        S: req.phone
                    },
                    deliveryDate: {
                        S: req.ddate
                    },
                    Center: {
                        S: req.pickuploc
                    },
                    orderStatus: {
                        S: "OPEN"
                    },
                    orderID: {
                        S: "" + ordersCounter
                    }
                },
                TableName: "ordersDB"
            };
            dynamodb.putItem(params, function (error, data) {
                if (error) {
                    //console.log("Error: ", error, error.stack);
                } else {
                    //Add to orderByID
                    var tomatoGr = 0;
                    var appleGr = 0;
                    i = 0;
                    if (Object.prototype.toString.call(req.item) === '[object Array]') { //There are multiple entries in order
                        req.item.forEach(function (entry) {
                            if (entry == 'tomatoes') {
                                tomatoGr = (tomatoGr * 1 + req.amount[i] * 1);
                            }
                            if (entry == 'apples') {
                                appleGr = (appleGr * 1 + req.amount[i] * 1);
                            }
                            i++;
                        })
                    }
                    else { //Only single value
                        if (req.item == 'tomatoes') {
                            tomatoGr = req.amount;
                        }
                        if (req.item == 'apples') {
                            appleGr = req.amount;
                        }
                    }
                    var paramsTwo = {
                        Item: {
                            orderID: {
                                S: "" + ordersCounter
                            },
                            supplyDate: {
                                N: req.ddate
                            },
                            deliveryDay: {
                                S: "M"
                            },
                            Apples: {
                                N: "" + appleGr
                            },
                            Tomatoes: {
                                N: "" + tomatoGr
                            }
                        },
                        TableName: "orderByID"
                    };
                    ordersCounter++;
                    dynamodb.putItem(paramsTwo, function (error, data) {
                        if (error) {
                            console.log("Error: ", error, error.stack);
                        } else {
                            var countParams = {
                                TableName: 'sequenceOrder',
                                Item: {
                                    Counter: {
                                        S: "MAIN"
                                    },
                                    SeqVal: {
                                        N: ordersCounter.toString()
                                    }
                                }
                            }
                            dynamodb.putItem(countParams, function (error, data) {
                                if (error) {
                                    console.log("Error: ", error, error.stack);
                                } else {
                                    callback();
                                }
                                //Update counter and callback
                            })
                        }
                    })
                }
            })
        }
    })
}

    //Set new Counter

function getQuota(callback){
    console.log("In get quota");
    var params = { //Params to be sent according to the structure of the table (In PDF file).
        "TableName": "farmersQuota"
    }
    dynamodb.scan(params, function (err, data) {
        if (err) {
            console.log(err); // an error occurred
        }
        else {
            console.log(data); // successful response
            callback(data);
        }
    })
}

function updateQuota(req, callback){
    console.log("In update quota");
    console.log(req);
    var params = {
        TableName: 'farmersQuota',
        Item: {
            farmerName: {
                S: req.fName
            },
            offeredGoods: {
                S: req.itemToUpdate
            },
            Capacity: {
                N: req.newQuota
            }
        }
    }
    dynamodb.putItem(params, function (err, data) {
        if (err) {
            console.log(err); // an error occurred
        }
        else {
            console.log(data); // successful response
            callback();
        }
    })
}
function updateFarmerDB(req, callback){
    console.log("In update farmers");
    console.log(req);
    var params = {
        TableName: 'ordersTotalKg',
        Item: {
            Farmer: {
                S: req.fName
            },
            deliveryDate: {
                S: req.itemToUpdate
            },
            Center: {
                N: req.newQuota
            },
            Goods: {
                N: req.newQuota
            },
            Amount: {
                N: req.newQuota
            }
        }
    }
    dynamodb.putItem(params, function (err, data) {
        if (err) {
            console.log(err); // an error occurred
        }
        else {
            console.log(data); // successful response
            callback();
        }
    })
}
function getResults(req, callback) {
    //console.log("Entered getResults");
    //console.log(req);
    /*
    var reply ="";
    var params = { //Params to be sent according to the structure of the table (In PDF file).
        "TableName": "OrdersDB",
        "KeyConditionExpression": "Word = :v_title",
        "IndexName" : "ranki", //Sort according to rank
        "ExpressionAttributeValues": {
            ":v_title": {"S": req}
        },
        "ProjectionExpression": "URLID",
        "ScanIndexForward": false //Highest rank first
    }
    dynamodb.query(params, function(err, data) { //Query to DynamoDB
        if (err) {
            console.log(err);
        }
        else {
            console.log(JSON.stringify(data));
            for (var id in data.Items) { //Build the response string to be sent back to welcome.js
                var website = JSON.stringify(data.Items[id]);
                //console.log(website);
                var location = website.indexOf("}") - 1;
                reply = reply + website.substring(15, location) + " <<>> "; //Hardcoded to trim according to the unique table
            }
            callback(reply.substring(0,reply.length - 5)); //Done, return reply content.
        }
    });
    */
    callback("Yes sir");
}

exports.getResults = getResults;
exports.getDetails = getDetails;
exports.sendOrder = sendOrder;
exports.getOrders = getOrders;
exports.retrieveOrder = retrieveOrder;
exports.getQuota = getQuota;
exports.updateQuota = updateQuota;
exports.addDetails = addDetails;
exports.getAllOrders = getAllOrders;
exports.getOpenOrders = getOpenOrders;
exports.getCenters = getCenters;
exports.updateCenters = updateCenters;
exports.updateFarmerDB = updateFarmerDB;
