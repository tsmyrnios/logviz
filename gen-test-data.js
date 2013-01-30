#!/usr/bin/env node
require('./scripts/core.js');
var program = require('commander')
    .version('1.0.0')
    .option('-r, --records <count>', 'The amount of records to generate')
    .option('-s, --series <count>', 'The amount of series to generate')
    .option('-h, --header <path>', 'Header file output path')
    .option('-d, --details <path>', 'Details file output path')
    .parse(process.argv),
    fs = require('fs');


var records = [];
var minRec = {};
var maxRec = {};
var MIN_NUM = -9007199254740992;
var MAX_NUM = 9007199254740992;

var startDate = new Date();
var interval = 1000;
for(var i=0;i<program.records;i++){
    var record = { 'date':new Date(startDate.getTime() + (i*interval)).format('yyyy-MM-dd HH:mm:ss')};
    for(var j=0;j<program.series;j++){
        var name = 'p' + String(j);
        var val = ((Math.random()*2)-1) + ((i>0)?parseFloat(records[i-1][name]):0);
        record[name] = val;
        minRec[name] = Math.min(minRec[name] ? minRec[name] : MAX_NUM, val);
        maxRec[name] = Math.max(maxRec[name] ? maxRec[name] : MIN_NUM, val);
    }
    records.push(record);
}

if(records.length > 0){
    minRec['date'] = records[0]['date'];
    maxRec['date'] = records[records.length-1]['date'];
}

var output = function(arr){ return arr.map(function(r){ return JSON.stringify(r); }).join('\n'); }
fs.writeFileSync(__dirname + '/' + program.header,output([minRec,maxRec]),'utf8');
fs.writeFileSync(__dirname + '/' + program.details,output(records),'utf8');