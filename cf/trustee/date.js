/*eslint no-console: 0*/
"use strict";

var request = require('request');
var options = {
  'method': 'GET',
  'url': 'https://api.binance.com/api/v3/time',
  'headers': {
    'Content-Type': 'application/json'
  }
};
request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log("server time: " + (JSON.parse(response.body)).serverTime);
    let now = new Date();
    console.log(" local time: " + now.getTime());
    // https://javascript.info/date
    // new Date(year, month-1, date, hours, minutes, seconds, ms)
    let start = 8;
    let limit = 3;
    let s_ago = new Date(2021, 0, start-1);
    let start_time = s_ago.getTime();
    console.log(" s_ago time: " + start_time);
    let e_ago = new Date(2021, 0, start+limit-1);
    let end_time = e_ago.getTime();
    console.log(" e_ago time: " + end_time);

    console.log("");

    var request2 = require('request');
    let symbol = 'THETAUSDT';
    var options2 = {
        'method': 'GET',
        'url': 'https://api.binance.com/api/v3/klines?symbol='+symbol+'&interval=1d&startTime='+start_time+'&endTime='+end_time+'&limit='+limit+'',
        'headers': {
          'Content-Type': 'application/json'
        }
      };
      request2(options2, function (error, response) {
        if (error) throw new Error(error);
        var results = JSON.parse(response.body);
          results.forEach(result => {
              let rate_date = new Date(result[0]);
            console.log("  ===: " + rate_date.getUTCFullYear() + "-" + (rate_date.getUTCMonth()+1) + "-" + (rate_date.getUTCDate()) + " ");
            console.log(" open: " + result[1]);
            console.log(" high: " + result[2]);
            console.log("  low: " + result[3]);
            console.log("close: " + result[4]);
            console.log("");
        });
        // console.log(JSON.stringify((JSON.parse(response.body)),null,2));
      });


});

