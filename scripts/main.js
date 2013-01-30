//
// main.js
//
// Provides the view's input event bindings, tracks statistics,
// and sets up the plotter and its animation loop
//
// Written by Tadd Smyrnios
//

$(function () {
    
    $.trace.target = $("footer");

    $(".date-picker").datepicker();
    $(".time-picker").timepicker();

    var runDate, finishDate, processed, plotted, empty, errored;

    var renderStats = false;

    var lineReader = new LineReader();
    var plotter = new DatePlotter();

    var dateField = "";
    var yFields = [];
    var pointsPerRecord = 0;

    var uiLoop = new UiLoop(function () {
        while (lineReader.loadedLines.length > 0 && !lineReader.isCancelled) {
            var line = lineReader.loadedLines.shift().trim();
            try {
                if (line != "") {
                    var data = $.parseJSON(line);
                    if (data != null) {
                        for (var i = 0; i < yFields.length; i++) {
                            plotter.plot({ x: (new Date(data[dateField]).getTime()), y: parseFloat(data[yFields[i].label]), color: yFields[i].color });
                        }
                    }
                    plotted++;
                }
                else {
                    empty++;
                }
            }
            catch (e) {
                $.trace.write(lineReader.loadedLines.length + " " + lineReader.isCancelled);
                $.trace.write(["ERROR --- ", "Message: ", e, ", Line: ", line].join(""));
                errored++;
            }

            processed++;
        }

        if (renderStats && uiLoop.frame % uiLoop.fps == 0) {
            var progress = lineReader.reader.position / lineReader.reader.fileSize();

            var date = new Date();
            var recordsPerSecond;
            var finishValue = "", elapseValue = "";

            if (lineReader.isEof()) {
                finishDate = date;
                finishValue = finishDate.format("M/d/yyyy HH:mm:ss");
                var elapsedTime = finishDate.subtract(runDate);
                elapseValue = elapsedTime.toString();
                $("#records-remaining").text(0);
                renderStats = false;
            }
            $("#finish-date").text(finishValue);
            $("#elapsed-time").text(elapseValue);
            recordsPerSecond = Math.round(processed / ((date.getTime() - runDate.getTime()) / 1000));
            $("#progress").text(String(Math.floor(progress * 100)) + "% complete");
            $("#records-plotted").text(plotted);
            $("#records-empty").text(empty);
            $("#records-errored").text(errored);
            $("#records-waiting").text(lineReader.loadedLines.length);
            if ((uiLoop.frame % (uiLoop.fps * 10)) == 0) {
                if (lineReader.reader.position > 0) {
                    $("#records-remaining").text(String(Math.round((lineReader.reader.fileSize() * processed) / lineReader.reader.position) - processed));
                }
            }
            $("#records-per-second").text(recordsPerSecond);
            $("#points-per-second").text(recordsPerSecond * pointsPerRecord);
        }
    });

    var headerData = null;
    $("#load").bind("click", function () {
        $("#load-files-dialog").dialog("close");

        var files = $("#header-file")[0].files;
        if (!files.length) {
            alert('Please select a header file.');
            return;
        }


        lineReader.lineRead = function (e) {
            data = $.parseJSON(e.line)

            for (var propName in data) {

                var timestamp = Date.parse(data[propName]);

                if (!isNaN(timestamp)) {
                    if (!$("#date-field option").toArray().any(function (i) { return $(i).attr("value") == propName })) {
                        $("<option></option>")
                            .attr("value", propName)
                            .text(propName)
                            .attr("data-min", timestamp)
                            .attr("data-max", timestamp)
                            .appendTo($("#date-field"));
                    }
                    else {
                        var option = $("#date-field option[value='" + propName + "']");
                        option.attr("data-min", Math.min(parseFloat(option.attr("data-min")), timestamp))
                            .attr("data-max", Math.max(parseFloat(option.attr("data-max")), timestamp));
                    }
                }
                else {
                    var number = parseFloat(data[propName]);
                    if (!isNaN(number)) {
                        if (!$("#y-fields option").toArray().any(function (i) { return $(i).attr("value") == propName; })) {
                            var htmlColor = Color.hslToHtml(Math.random(), 1, .3);
                            $("<option></option>")
                                .css("color", htmlColor)
                                .attr("value", propName)
                                .attr("data-color", htmlColor)
                                .attr("data-min", number)
                                .attr("data-max", number)
                                .text(propName)
                                .appendTo($("#y-fields"));
                        }
                        else {
                            var option = $("#y-fields option[value='" + propName + "']");
                            option.attr("data-min", Math.min(option.attr("data-min"), number))
                                .attr("data-max", Math.max(option.attr("data-max"), number));
                        }
                    }
                }
            }
        };

        lineReader.eof = function () {
            var options = $("#y-fields option");
            var count = options.length;
            options.each(function (i, element) {
                var htmlColor = Color.hslToHtml(parseFloat(i) / parseFloat(count), 1, parseFloat((i % 3) + 3) / parseFloat(10));
                $(this).css("color", htmlColor).attr("data-color", htmlColor);
            });
        };

        $("#date-field").children("option").remove();
        $("#y-fields").children("option").remove();
        lineReader.readFile(files[0]);
    });

    var yFields = [];
    $("#map").bind("click", function (e) {
        var startDate = new Date($("#date-field option:selected").toArray().select(function (i) { return parseFloat($(i).attr("data-min")); }).min());
        var endDate = new Date($("#date-field option:selected").toArray().select(function (i) { return parseFloat($(i).attr("data-max")); }).max());

        $("#start-date").val(String(startDate.getMonth() + 1) + "/" + String(startDate.getDate()) + "/" + String(startDate.getFullYear()));
        $("#end-date").val(String(endDate.getMonth() + 1) + "/" + String(endDate.getDate()) + "/" + String(endDate.getFullYear()));
        $("#start-time").timepicker("setValue", { hour: startDate.getHours(), minute: startDate.getMinutes(), second: startDate.getSeconds() });
        $("#end-time").timepicker("setValue", { hour: endDate.getHours(), minute: endDate.getMinutes(), second: endDate.getSeconds() });
        yFields = [];
        var MIN_NUM = -9007199254740992;
        var MAX_NUM = 9007199254740992;
        var min = MAX_NUM;
        var max = MIN_NUM;

        $("#y-fields option:selected").each(function (i, element) {
            min = Math.min(parseFloat($(element).attr("data-min")), min);
            max = Math.max(parseFloat($(element).attr("data-max")), max);
        });

        min = min == MAX_NUM ? 0 : min;
        max = max == MIN_NUM ? 1 : max;

        $("#min-y").val(min);
        $("#max-y").val(max);

    });

    $("#start").bind("click", function () {
        $("#stop").trigger("click");

        dateField = $("#date-field option:selected").attr("value");
        yFields = [];
        $("#y-fields option:selected").each(function (i, element) {
            yFields.push({ label: $(element).attr("value"), color: $(element).attr("data-color") });
        });
        var startDate = new Date($("#start-date").val());
        var startTime = $("#start-time").timepicker("getValue");
        startDate.setHours(startTime.hour);
        startDate.setMinutes(startTime.minute);
        startDate.setSeconds(startTime.second);

        var endDate = new Date($("#end-date").val());
        var endTime = $("#end-time").timepicker("getValue");
        endDate.setHours(endTime.hour);
        endDate.setMinutes(endTime.minute);
        endDate.setSeconds(endTime.second);

        var files = $("#files")[0].files;
        if (!files.length) {
            alert('Please select a file.');
            return;
        }

        plotter.clear();
        plotter.setup(startDate, endDate, parseFloat($("#min-y").val()), parseFloat($("#max-y").val()));
        plotter.pointSize = 2;
        plotter.seriesX = [{ label: $("#date-field option:selected").attr("value")}];
        plotter.seriesY = yFields;
        plotter.setupGraph($("#graph"));

        runDate = new Date();
        processed = 0;
        plotted = 0;
        empty = 0;
        errored = 0;
        renderStats = true;
        pointsPerRecord = yFields.length;


        // start reading the file
        lineReader.readFile(files[0]);
        // start the animation loop
        uiLoop.start();

        $("#statistics").show();
        $("#run-date").text(runDate.format("M/d/yyyy HH:mm:ss"));
    });

    $("#stop").click(function () {
        uiLoop.stop();
        lineReader.lineRead = function (evt) { };
        lineReader.eof = function () { };
        lineReader.cancel();
    });

    $("#load-files-button").bind("click", function () {
        $("#load-files-dialog").dialog({ position: { my: "left top", at: "left bottom", of: $(this)} });
        resize();
    });

    $(window).resize(resize);
    resize();

    function resize() {
        var header = $("header");
        var content = $("#content");
        var input = $("#input");
        var output = $("#output");
        var viewer = $("#viewer");
        var footer = $("footer");

        var contentHeight = window.innerHeight - header.height() - footer.height() - 1;
        
        
        input.height(contentHeight);
        output.height(contentHeight);
        viewer.height(contentHeight - 20);

        input.width(395);
        output.width(header.width() - 400);

        //hack: for some reason the header width doesn't get updated properly until the content width is adjusted first
        input.width(395);
        output.width(header.width() - 410);
    }
});