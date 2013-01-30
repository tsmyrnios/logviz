//
// js-trace-ui.js
//
// Provides the hooks and rendering logic for outputting the trace messages to the page
//
// Written by Tadd Smyrnios
//

$(function() {
    $.trace.bind("setup", function() {
        $("<style>#trace-messages { margin:10px 10px; border:solid 1px #999; background-color:#eee; padding:10px 15px; font: normal normal 12px/normal Courier; } #trace-messages ul { padding:0 0; list-style-type:none; } </style>").prependTo("head");
        $("<div id='trace-messages'><h3>Trace Messages</h3><ul></ul></div>").appendTo($.trace.target);
    });
    $.trace.bind("written", function(event, message) {
        var item = $("<li></li>");
        item.html(message);
        item.appendTo($("#trace-messages ul"));
    });
});