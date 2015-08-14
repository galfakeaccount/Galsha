/**
 * Created by 300067113 on 03/06/2015.
 */
//AWS Related
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./awscred.json'); //Load the credentials from the JSON file
AWS.config.region = 'us-east-1'; //N. Virginia
var dynamodb = new AWS.DynamoDB(); //New DynamoDB Instance

// Requires
var validator = require('validator');
var csvFile = 'output.csv';
var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader(csvFile);
var map = {};
var runSeq = 0;

function dynamoSend(word, url){

    var ranking = 0;
    //Assure there is always a ranking
    if (map[url]) {
        ranking = map[url];
    }
    //Add to DynamoDB
    var params = {
        Item: {
            Word: {
                S: word
            },
            URLID: {
                S: url
            },
            rank: {
                N: ranking + ""
            }
        },
        TableName: "EX2-TABLE"
    };
    dynamodb.putItem(params, function (error, data) {
        if (error) {
            console.log("Error: ", error, error.stack);
        } else {
            //console.log("Row ", JSON.stringify(params), " Inserted!");
        }
    });
}
function updateMap(flag){
    console.log("In updateMap");
    lr.on('error', function (err) {
        console.log("Error reading the file");
    });

    lr.on('line', function (line) {
        // pause emitting of lines...
        lr.pause();
        //console.log("Line paused");
        // Async processing of lines and map them.
        //Split line and fetch word
        var lineSplit = line.split(",");
        var word = lineSplit[0];

        //First run - map url and ranking
        if (validator.isURL(word)) {
            if (flag == 0) { //First run - update ranking in map
                //console.log("Found URL: " + word);
                var ranking = lineSplit[1]; //Only ranking
                map[word] = ranking;
            }
        }
        else { //Second run and a word - check if flag = 1
            if (flag == 1) {
                for (var i = 1; i < lineSplit.length; i++) { //Send each website assigned to the same key to insert to DynamoDB
                    dynamoSend(word, lineSplit[i]);
                }
            }
        }

        setTimeout(function () {
            // ...and continue emitting lines.
            lr.resume();
        }, 1);
    });

    lr.on('end', function () {
        if (runSeq == 0){
            runSeq++;
            lr = new LineByLineReader(csvFile);
            updateMap(runSeq);
        }
        else {
            lr.close();
            console.log("Done uploading to DynamoDB!");
        }
    });
}
updateMap(runSeq);
