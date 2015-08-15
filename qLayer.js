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

function getDetails(req, callback) {
    console.log("In get name");
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
            console.log(data.Items[0]); // successful response
            callback(data);
            //callback(data.Items[0].FirstName.S +" "+data.Items[0].Surname.S); //Return the name
        }
    });
}

function getOrders(req, callback) { //Query all orders under specific phone number
    console.log("In get orders");
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
    console.log("In retrieve order");
    console.log(req);
    var params = { //Params to be sent according to the structure of the table (In PDF file).
        "TableName": "orderByID",
        "KeyConditionExpression":  "orderID = :orderval",
        "ExpressionAttributeValues": {
            ":orderval": {"S": req}
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

function sendSQS(req, callback){
    console.log("In SQS send order to queue");
    var params = {
        MessageBody: "New order from " + req.FirstName +' '+req.Surname,
        QueueUrl: ordersQueueUri,
        DelaySeconds: 0,
        MessageAttributes: { //This are the actual order information
            Phone: {
                DataType: 'STRING_VALUE', /* required */
                BinaryListValues: [
                    "0547263799",
                ]
            },
            Apples: {
                DataType: 'STRING_VALUE', /* required */
                BinaryListValues: [
                    new Buffer('...') || 'STRING_VALUE',
                    /* more items */
                ],
                BinaryValue: new Buffer('...') || 'STRING_VALUE',
                StringListValues: [
                    'STRING_VALUE',
                    /* more items */
                ],
                StringValue: 'STRING_VALUE'
            },
            Tomatoes: {
                DataType: 'STRING_VALUE', /* required */
                BinaryListValues: [
                    new Buffer('...') || 'STRING_VALUE',
                    /* more items */
                ],
                BinaryValue: new Buffer('...') || 'STRING_VALUE',
                StringListValues: [
                    'STRING_VALUE',
                    /* more items */
                ],
                StringValue: 'STRING_VALUE'
            },
            Date: {
                DataType: 'STRING_VALUE', /* required */
                BinaryListValues: [
                    new Buffer('...') || 'STRING_VALUE',
                    /* more items */
                ],
                BinaryValue: new Buffer('...') || 'STRING_VALUE',
                StringListValues: [
                    'STRING_VALUE',
                    /* more items */
                ],
                StringValue: 'STRING_VALUE'
            },
            Day: {
                DataType: 'STRING_VALUE', /* required */
                BinaryListValues: [
                    new Buffer('...') || 'STRING_VALUE',
                    /* more items */
                ],
                BinaryValue: new Buffer('...') || 'STRING_VALUE',
                StringListValues: [
                    'STRING_VALUE',
                    /* more items */
                ],
                StringValue: 'STRING_VALUE'
            }
        }
    };
    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log("Error: ", err);
        } // an error occurred
        else {
            console.log('Victory, message sent for ' + encodeURIComponent(request.params.name) + '!');
            callback(req.FirstName +' '+req.Surname);
        };
    });
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
exports.sendSQS = sendSQS;
exports.getOrders = getOrders;
exports.retrieveOrder = retrieveOrder;