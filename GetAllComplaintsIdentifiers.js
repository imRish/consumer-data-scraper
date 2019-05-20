var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var fs = require('fs');

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
// var database = firebase.database();

app.get('/scrape/', function(req, res){

	 // The URL we will scrape from - in our example Anchorman 2.
	var list = [];


   getComplaints(401);

   function writeUserData(page, complaintId) {
      firebase.database().ref('complaint-index/' + page).set({
        id: complaintId
      });
    }



    function getComplaints(page){

    	console.log(page);
    	url = 'http://www.jagograhakjago.com/consumer-complaints/?id1='+page;

	    request(url, function(error, response, html){
	    	console.log('I am at '+ url);

	        // First we'll check to make sure no errors occurred when making the request
	        var list = [];
	        if(!error){
	            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

	            var $ = cheerio.load(html);

	            $('.article').filter(function(){
	            	$('.complaint').each(function(i, elem){
	            		var val = ($(this).find('a').attr('href'));
	            		if(val){
							val = val.split('=');
							list.push(val[1]);

	            		}

	            	});
	            	// res.send(list);
	            	// writeUserData(page, list);
	            });
	            list.forEach(function(elem){
						fs.appendFile('id.txt', elem+',', function (err) {
						  if (err) throw err;
						});

	            	});

	            	list = [];

	 	    }
	 	    if(page < 450 ){
				console.log('here');
				getComplaints(page+1);
			}
	    });
	}
});

app.get('/get-id/', function(req, res){
	var list = [];
	// for(i = 0; i < 400 ; i++){
	// 	var db = firebase.database().ref('/complaint-id/' + i).on('value').then(function(snapshot) {
	// 		res.send(snapshot);
	// });
	// }
	//
	function getData(page){
		firebase.database().ref('/complaint-id/' + 1).once('value').then(function(snapshot) {
			Array.from(snapshot.val().id).forEach(function(a){
				list.push(a);
			});

		});

	}
});

app.listen('3001')


console.log('Magic happens on port 3001');

exports = module.exports = app;