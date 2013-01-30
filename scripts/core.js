//
// core.js
//
// Core extensions and components
//   - String functions
//   - TimeSpan Object
//   - Date functions (+ TimeSpan operators)
//   - Array functions
//   - Color functions
//
// Written by Tadd Smyrnios
//

String.prototype.padLeft = function (l, c) { return Array(l - this.length + 1).join(c || " ") + this }

String.prototype.replaceMany = function (dict) {
    var s = this;
    for (var prop in dict) {
        s = s.replace(prop, dict[prop]);
    }
    return s;
};

TimeSpan = function (totalMilliseconds) {
    this.setTime(totalMilliseconds);
};
TimeSpan.prototype = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
    totalYears: 0,
    totalDays: 0,
    totalHours: 0,
    totalMinutes: 0,
    totalSeconds: 0,
    totalMilliseconds: 0
};
TimeSpan.prototype.reset = function () {
    this.setTime(0);
    return this;
};
TimeSpan.prototype.set = function (days, hours, minutes, seconds, milliseconds) {
    this.setTime((days * 86400000) + (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + milliseconds);
    return this;
};
TimeSpan.prototype.setTime = function (totalMilliseconds) {
    var remainder = totalMilliseconds;
    var p = ["days", "hours", "minutes", "seconds"],
        tp = ["totalDays", "totalHours", "totalMinutes", "totalSeconds"],
        cv = [86400000, 3600000, 60000, 1000];

    for (var i = 0; i < cv.length; i++) {
        var v = Math.floor(remainder / cv[i]);
        this[p[i]] = v;
        remainder -= v * cv[i];
        this[tp[i]] = Math.floor(totalMilliseconds / cv[i]);
    }
    this.milliseconds = remainder;
    this.totalMilliseconds = totalMilliseconds;

    return this;
};
TimeSpan.prototype.add = function (timespan) {
    this.setTime(this.totalMilliseconds + timespan.totalMilliseconds);
    return this;
};
TimeSpan.prototype.subtract = function (timespan) {
    this.setTime(this.totalMilliseconds - timespan.totalMilliseconds);
    return this;
};
TimeSpan.prototype.format = function (format) {
    var output = format;
    output = output.replace("d", String(this.days));
    output = output.replace("HH", String(this.hours).padLeft(2, "0"));
    output = output.replace("H", String(this.hours));
    output = output.replace("mm", String(this.minutes).padLeft(2, "0"));
    output = output.replace("m", String(this.minutes));
    output = output.replace("ss", String(this.seconds).padLeft(2, "0"));
    output = output.replace("s", String(this.seconds));
    output = output.replace("fff", String(this.milliseconds).padLeft(3, "0"));
    output = output.replace("ff", String(Math.round(this.milliseconds / 10)).padLeft(2, "0"));
    output = output.replace("f", String(Math.round(this.milliseconds / 100)));
    return output;
};
TimeSpan.prototype.toString = function () {
    var formatArr = [];
    if (this.days > 0) { formatArr.push("d."); }
    formatArr.push("HH:mm:ss");
    if (this.milliseconds > 0) { formatArr.push(".fff"); }
    return this.format(formatArr.join(""));
};

var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

Date.prototype.format = function (format) {
    var output = format;
    output = output.replace("yyyy", String(this.getFullYear()));
    output = output.replace("yyy", String(this.getFullYear() % 1000).padLeft(3, "0"));
    output = output.replace("yy", String(this.getYear() % 100).padLeft(2, "0"));
    output = output.replace("y", String(this.getYear() % 100));
    output = output.replace("MMMM", MONTHS[this.getMonth()]);
    output = output.replace("MMM", MONTHS[this.getMonth()].substring(0, 3));
    output = output.replace("MM", String(this.getMonth() + 1).padLeft(2, "0"));
    output = output.replace("M", String(this.getMonth() + 1));
    output = output.replace("dddd", DAYS[this.getDay()]);
    output = output.replace("ddd", DAYS[this.getDay()].substring(0, 3));
    output = output.replace("D", DAYS[this.getDay()].substring(0, 1));
    output = output.replace("dd", String(this.getDate()).padLeft(2, "0"));
    output = output.replace("d", String(this.getDate()));
    output = output.replace("HH", String(this.getHours()).padLeft(2, "0"));
    output = output.replace("H", String(this.getHours()));
    output = output.replace("hh", String(this.getHours() % 12).padLeft(2, "0"));
    output = output.replace("h", String(this.getHours() % 12));
    output = output.replace("mm", String(this.getMinutes()).padLeft(2, "0"));
    output = output.replace("m", String(this.getMinutes()));
    output = output.replace("ss", String(this.getSeconds()).padLeft(2, "0"));
    output = output.replace("s", String(this.getSeconds()));
    output = output.replace("fff", String(this.getMilliseconds()).padLeft(3, "0"));
    output = output.replace("ff", String(Math.round(this.getMilliseconds() / 10)).padLeft(2, "0"));
    output = output.replace("f", String(Math.round(this.getMilliseconds() / 100)));
    output = output.replace("tt", this.getHours() >= 12 ? "pm" : "am");
    output = output.replace("t", this.getHours() >= 12 ? "p" : "a");
    return output;
};

Date.prototype.addTimeSpan = function (timespan) {
    this.setTime(this.getTime() + timespan.totalMilliseconds);
};
Date.prototype.subtractTimeSpan = function (timespan) {
    this.setTime(this.getTime() + timespan.totalMilliseconds);
};
Date.prototype.subtract = function (date) {
    return new TimeSpan(this.getTime() - date.getTime());
};

Array.prototype.select = function(selector){
    var newArr = [];
    for(var i=0;i<this.length;i++){
        newArr.push(selector(this[i]));
    }
    return newArr;
};
Array.prototype.where = function(predicate){
    var newArr = [];
    for(var i=0;i<this.length;i++){
        var item = this[i];
        if(predicate(item)){
            newArr.push(item);
        }
    }
    return newArr;
};
Array.prototype.max = function () {
    var max = -9007199254740992;
    for (var i = 0; i < this.length; i++) {
        max = Math.max(this[i], max);
    }
    return max;
};
Array.prototype.min = function () {
    var min = 9007199254740992;
    for (var i = 0; i < this.length; i++) {
        min = Math.min(this[i], min);
    }
    return min;
};
Array.prototype.any = function (predicate) {
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        if (predicate(item)) {
            return true;
        }
    }
    return false;
};

Color = function() { };
Color._hslToRgb = function (h,s,l){
    var c = (1 - Math.abs((2 * l) - 1)) * s;
    var hx = (h % 1) * 6;
    var x = c * (1 - Math.abs((hx % 2) - 1));
    var m = l - (0.5 * c);
    var rgb = [0,0,0];
    if(hx < 1)      { rgb = [c,x,0]; }
    else if(hx < 2) { rgb = [x,c,0]; }
    else if(hx < 3) { rgb = [0,c,x]; }
    else if(hx < 4) { rgb = [0,x,c]; }
    else if(hx < 5) { rgb = [x,0,c]; }
    else if(hx < 6) { rgb = [c,0,x]; }
    else            { rgb = [0,0,0]; }
    return [rgb[0] + m, rgb[1] + m, rgb[2] + m ];
};

Color._to32Bit = function (arr) {
    var arr32 = [];
    for (var i = 0; i < arr.length; i++ ) {
        arr32.push(Math.floor(arr[i] * 255));
    }
    return arr32;
};

Color._toHex = function (arr) {
    var hexArr = [];
    for (var i=0;i<arr.length; i++) {
        hexArr.push(arr[i].toString(16));
    }
    return hexArr;
};

Color._toHtmlString = function (arr) {
    var htmlArr = [];
    for (var i = 0; i < arr.length; i++) {
        htmlArr.push(arr[i].padLeft(2,"0"));
    }
    return "#" + htmlArr.join("");
};

Color.hslToHtml = function (h, s, l) {
    return Color._toHtmlString(Color._toHex(Color._to32Bit(Color._hslToRgb(h, s, l))));
};