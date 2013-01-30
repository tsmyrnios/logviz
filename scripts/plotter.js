//
// plotter.js
//
// Contains Plotter class which contains functions for drawing a graph on an html canvas
// as well as a derived DatePlotter class which automatically draws the time series according
// to the start and end time frame
//
// Written by Tadd Smyrnios
//

Plotter = function() {};
Plotter.prototype = {
    viewerStartX: 0,
    viewerEndX: 1,
    viewerStartY: 0,
    viewerEndY: 1,
    scaleX: 1,
    scaleY: 1,
    originOffsetX: 0,
    originOffsetY: 0,
    seriesX: [],
    seriesY: [],
    gridLinesX: [],
    gridLinesY: [],
    gridLinesFont: "7px Courier",
    actualOriginOffsetX: 0,
    actualOriginOffsetY: 0,
    ctx: null,
    graphOffsetX: 100,
    graphOffsetY: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    graphWidth: 0,
    graphHeight: 0,
    pointSize: 1,
    seriesFont: "9px Courier",
    drawPoint: function (style, size, x, y) {
        var tx = this._translateX(x);
        var ty = this._translateY(y);
        if (tx >= this.graphOffsetX && tx <= (this.graphOffsetX + this.graphWidth) && ty >= this.graphOffsetY && ty <= (this.graphOffsetY + this.graphHeight)) {
            this._drawPoint(style, size, tx, ty - (this.pointSize / 2));
        }
    },
    _translateX: function (x) {
        return this.graphOffsetX + ((x - this.viewerStartX) * (this.graphWidth / this.scaleX));
    },
    _translateY: function (y) {
        return this.graphOffsetY + (this.graphHeight - ((y - this.viewerStartY) * (this.graphHeight / this.scaleY)));
    },
    _translateW: function (w) {
        return w * (this.graphWidth / this.scaleX);
    },
    _translateH: function (h) {
        return h * (this.graphHeight / this.scaleY);
    },
    _drawPoint: function (style, size, x, y) {
        this.ctx.strokeStyle = style;
        this.ctx.strokeWidth = size;
        this.ctx.lineWidth = size;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x, y + size);
        this.ctx.stroke();
    },
    _drawLine: function (style, size, sx, sy, ex, ey) {
        this.ctx.strokeStyle = style;
        this.ctx.strokeWidth = size;
        this.ctx.beginPath();
        this.ctx.moveTo(sx, sy);
        this.ctx.lineTo(ex, ey);
        this.ctx.stroke();
    },
    _drawText: function (strokeStyle, strokeSize, font, text, x, y) {
        this.ctx.strokeStyle = strokeStyle;
        this.ctx.strokeWidth = strokeSize;
        this.ctx.lineWidth = strokeSize;
        this.ctx.font = font;
        this.ctx.strokeText(String(text), x, y);
    },
    _drawRotatedText: function (strokeStyle, strokeSize, font, text, x, y, angle) {
        this.ctx.strokeStyle = strokeStyle;
        this.ctx.strokeWidth = strokeSize;
        this.ctx.lineWidth = strokeSize;
        this.ctx.font = font;
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle * (Math.PI / 180))
        this.ctx.strokeText(String(text), 0, 0);
        this.ctx.restore();
    },
    _drawRect: function (strokeStyle, strokeSize, x, y, w, h) {
        this.ctx.strokeStyle = strokeStyle;
        this.ctx.strokeWidth = strokeSize;
        this.ctx.lineWidth = strokeSize;
        this.ctx.beginPath();
        this.ctx.rect(x, y, w, h);
        this.ctx.stroke();
    },
    _drawFilledRect: function (strokeStyle, strokeSize, fillStyle, x, y, w, h) {
        this.ctx.strokeStyle = strokeStyle;
        this.ctx.strokeWidth = strokeSize;
        this.ctx.lineWidth = strokeSize;
        this.ctx.beginPath();
        this.ctx.fillStyle = fillStyle;
        this.ctx.fillRect(x, y, w, h);
        this.ctx.rect(x, y, w, h);
        this.ctx.stroke();
    },
    setupGraph: function (canvas) {
        this.canvasWidth = canvas.width();
        this.canvasHeight = canvas.height();

        this.graphWidth = this.canvasWidth - this.graphOffsetX;
        this.graphHeight = this.canvasHeight - this.graphOffsetY - 50;

        this.ctx = canvas[0].getContext("2d");

        this.scaleX = this.viewerEndX - this.viewerStartX;
        this.scaleY = this.viewerEndY - this.viewerStartY;

        this.actualOriginOffsetX = this._translateX(0);
        this.actualOriginOffsetY = this._translateY(0);

        // graph box
        this._drawRect("#999", 1, this.graphOffsetX, this.graphOffsetY, this.graphWidth, this.graphHeight);

        // X origin line
        this._drawLine("#000", 1, this.actualOriginOffsetX, 0, this.actualOriginOffsetX, this.graphHeight);

        // Y origin line
        this._drawLine("#000", 1, this.graphOffsetX, this.actualOriginOffsetY, this.canvasWidth, this.actualOriginOffsetY);

        // X series
        for (var i = 0; i < this.seriesX.length; i++) {
            this._drawText("#000", 1, this.seriesFont, this.seriesX[i].label, this.graphOffsetX + ((this.graphWidth - (this.seriesX[i].label.length * 2)) / 2), this.graphOffsetY + this.graphHeight + 30);
        }

        // Y series
        for (var i = 0; i < this.seriesY.length; i++) {
            var y = this.graphOffsetY + this.graphHeight - (this.seriesY.length * 20) + (i * 20);
            this._drawFilledRect(this.seriesY[i].color, 1, this.seriesY[i].color, 2, y, 11, 11);
            this._drawRotatedText("#000", 1, this.seriesFont, this.seriesY[i].label, 18, y + 8, -60);
        }

        // X grid lines
        for (var i = 0; i < this.gridLinesX.length; i++) {
            var x = this._translateX(this.gridLinesX[i].value);
            // tick mark
            this._drawLine("#000", 1, x, this.graphOffsetY + this.graphHeight, x, this.graphOffsetY + this.graphHeight + 4);

            // grid line
            this._drawLine("#ddd", 1, x, this.graphOffsetY, x, this.graphOffsetY + this.graphHeight);

            // series label
            this._drawText("#000", 1, "7px Courier", this.gridLinesX[i].label, x - (this.gridLinesX[i].label.length * 2), this.graphOffsetY + this.graphHeight + 12);
        }

        // Y grid lines
        for (var i = 0; i < this.gridLinesY.length; i++) {
            var y = this._translateY(this.gridLinesY[i].value);  // the series value converted to canvas coordinates

            // tick mark
            this._drawLine("#000", 1, this.graphOffsetX - 4, y, this.graphOffsetX, y);

            // grid line
            this._drawLine("#ddd", 1, this.graphOffsetX, y, this.graphOffsetX + this.graphWidth, y);

            // series label
            this._drawText("#000", 1, "7px Courier", this.gridLinesY[i].label, this.graphOffsetX - (this.gridLinesY[i].label.length * 4) - 10, y + 3);
        }
    },
    plot: function (data) {
        this.drawPoint(data.color ? data.color : "#0066cc", this.pointSize, data.x, data.y);
    },
    clear: function () {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
        this.viewerStartX = 0;
        this.viewerEndX = 1;
        this.viewerStartY = 0;
        this.viewerEndY = 1;
        this.scaleX = 1;
        this.scaleY = 1;
        this.seriesX = [];
        this.seriesY = [];
        this.gridLinesX = [];
        this.gridLinesY = [];
        this.actualOriginOffsetX = 0;
        this.actualOriginOffsetY = 0;
        this.graphOffsetX = 100;
        this.graphOffsetY = 0;
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        this.graphWidth = 0;
        this.graphHeight = 0;
        this.pointSize = 1;
    }
};

DatePlotter = function () {
};
DatePlotter.prototype = new Plotter();
DatePlotter.prototype.setup = function (startDate, endDate, startY, endY) {
    this.viewerStartX = startDate.getTime();
    this.viewerEndX = endDate.getTime();
    this.viewerStartY = startY;
    this.viewerEndY = endY;

    var elapsedMilliseconds = this.viewerEndX - this.viewerStartX;

    var rangeY = Math.abs(this.viewerEndY - this.viewerStartY);
    var pow = Math.log(rangeY) / Math.log(10);
    var propUnitY = Math.pow(10, Math.ceil(pow - 1));
    var unitY = propUnitY;
    if (rangeY < (propUnitY * 2)) {
        unitY = Math.pow(10, Math.ceil(pow - 1) - 1);
    }
    for (var i = Math.ceil(this.viewerStartY / unitY) * unitY; i < this.viewerEndY; i += unitY) {
        this.gridLinesY.push({ label: String(i), value: i });
    }

    var totalSeconds = elapsedMilliseconds / 1000;
    var totalMinutes = elapsedMilliseconds / 60000;
    var totalHours = elapsedMilliseconds / 3600000;
    var totalDays = elapsedMilliseconds / (24 * 3600000);
    var unitXType = "hour";
    var unitX = 0; // hours
    if (totalSeconds <= 30) { unitXType = "second"; unitX = 1000; }
    else if (totalMinutes <= 30) { unitXType = "minute"; unitX = 60000; }
    else if (totalHours <= 2) { unitXType = "quarter-hour"; unitX = 900000; }
    else if (totalHours <= 4) { unitXType = "half-hour"; unitX = 1800000; }
    else if (totalDays <= 2) { unitXType = "hour"; unitX = 3600000; }
    else if (totalDays <= 7) { unitXType = "day"; unitX = 24 * 3600000; }
    else if (totalDays <= 30) { unitXType = "date"; unitX = 24 * 3600000; }
    else if (totalDays <= (365 * 2)) { unitXType = "month"; }
    else { unitXType = "year"; unitX = 365 * 24 * 3600000; }

    if (unitX > 0) {
        var startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
        var startDayMilliseconds = startDay.getTime();
        var startX = (Math.ceil((startDate.getTime() - startDayMilliseconds) / unitX) * unitX) + startDayMilliseconds;
        var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (var i = 0; i < (elapsedMilliseconds / unitX); i++) {
            var label = "";
            var dt = new Date();
            dt.setTime(startX + (i * unitX));
            switch (unitXType) {
                case "second": label = String(dt.getSeconds()); break;
                case "minute": label = String(dt.getMinutes()); break;
                case "quarter-hour": label = String(dt.getMinutes()); break;
                case "half-hour": label = String(dt.getMinutes()); break;
                case "day": label = days[dt.getDay()] + "/" + dt.getDate(); break;
                case "date": label = i == 0 ? dt.format("M/d/yyyy") : dt.format("M/d"); break;
                case "year": label = dt.getFullYear(); break;
                default: label = (dt.getHours() == 0 ? "(" + String(dt.getMonth() + 1) + "/" + String(dt.getDate()) + ")" : "") + String(dt.getHours()).padLeft(2, "0"); break;
            }
            this.gridLinesX.push({ label: String(label), value: dt.getTime() });
        }
    }
    else {
        if (unitXType == "month") {
            var currentMonth = new Date(startDate.getMonth() == 11 ? startDate.getFullYear() + 1 : startDate.getFullYear(), (startDate.getMonth() + 1) % 12, 1, 0, 0, 0, 0);
            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var currentMilliseconds = currentMonth.getTime();
            while (currentMilliseconds < endDate.getTime()) {
                this.gridLinesX.push({ label: currentMonth.getMonth() % 12 == 0 ? String(currentMonth.getFullYear()) : (totalDays < 200 ? months[currentMonth.getMonth()] : (totalDays < 300 ? months[currentMonth.getMonth()].substring(0, 3) : months[currentMonth.getMonth()].substring(0, 1))), value: currentMilliseconds });
                currentMonth = new Date(currentMonth.getMonth() == 11 ? currentMonth.getFullYear() + 1 : currentMonth.getFullYear(), (currentMonth.getMonth() + 1) % 12, 1, 0, 0, 0, 0);
                currentMilliseconds = currentMonth.getTime();
            }
        }
    }
};