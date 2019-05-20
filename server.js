var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var fs = require('fs');
var syncReq = require('sync-request');
var router = express.Router();
var http = require('http');

var firebase = require('firebase');

var config = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
};

var firebaseApp = firebase.initializeApp(config);
var database = firebase.database();

app.get('/run/', function(req, res) {

    var responses = [];
    var completed_requests = 0;
    var data = fs.readFileSync('id.txt');
    var urls = (data.toString()).split(',');

    for (i=0; i<urls.length ; i++) {
        (function(index) {
            setTimeout(function() {
            	// console.log((100*index)/(urls.length))

                http.get('http://localhost:3000/scrape/' + urls[index], function(res) {
                    completed_requests++;
                    if (completed_requests == urls.length) {
                        console.log('done');
                    }
                });
            }, i * 1000);
        })(i);
    }

});



app.get('/scrape/:url', function(req, res) {
    var list = [];


    getComplaint(req.params.url);

    function writeUserData(complaintId, nameOfConsumer, city, state, against, detail) {
        firebase.database().ref('complaint/' + complaintId).set({
            nameOfConsumer: nameOfConsumer,
            city: city,
            state: state,
            against: against,
            detail: detail,
        });
    }

    function getComplaint(url) {

        var id = url;
        url = 'http://www.jagograhakjago.com/view-complaint/?compid=' + url;

        request(url, function(error, response, html) {
            // console.log('I am at ' + url);

            // First we'll check to make sure no errors occurred when making the request

            if (!error) {
                // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

                var $ = cheerio.load(html);



                $('.complaint-right').filter(function() {

                    var arr = [];

                    var complaint = ['', '', '', '', '', ''];

                    var data = $('p').each(function(index, element) {

                        arr.push($(this).text());

                    });


                    arr = arr.filter(function(n) {
                        return n != ''
                    });
                    var counter = 0;
                    arr.forEach(function(record) {
                        counter++;
                        switch (counter) {
                            case 1:
                                complaint[0] = (record.split(':'))[1];
                                break;
                            case 2:
                                complaint[1] = (record.split(':'))[1];
                                break;
                            case 3:
                                complaint[2] = (record.split(':'))[1];
                                break;
                            case 4:
                                complaint[3] = (record.split(':'))[1];
                                break;
                            case 5:
                                complaint[4] = (record.split(':'))[1];
                                break;
                            default:
                                complaint[5] += record;
                        }
                    });
                    // console.log(complaint.toString());
                    if (complaint.length >= 6) {
                        console.log('Saving to firebase ' + complaint[0]);
                        writeUserData(complaint[0], complaint[1], complaint[2], complaint[3], complaint[4], complaint[5]);
                        return "OK";
                    }
                    return "KO";


                });
                res.send("OK");
                res.end();

                return;


                // Finally, we'll define the variables we're going to capture




            }
        });
    }
});

app.listen('3000')


console.log('Magic happens on port 3000');

exports = module.exports = app;