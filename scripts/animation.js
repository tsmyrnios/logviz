//
// animation.js
//
// Contains the UiLoop for allowing non-thread blocking UI redraws
//
// Written by Tadd Smyrnios
//

UiLoop = function (draw) {
    this.draw = draw;
    this.id = UiLoop.instances.push(this) - 1;
};
UiLoop.instances = [];
UiLoop.prototype = {
    id: 0,
    frame: 0,
    fps: 10,
    start: function () {
        this._intervalId = setInterval("UiLoop.instances[" + this.id + "].run()", 1000 / this.fps);
        renderStats = true;
    },
    run: function () {
        this.draw();
        this.frame++;
    },
    draw: function () { },
    stop: function () {
        clearInterval(this._intervalId);
    }
};