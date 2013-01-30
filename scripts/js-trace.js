//
// js-trace.js
//
// Provides a facility for debugging javascript functions by writing trace messages to the page
//
// Written by Tadd Smyrnios
//

; (function($) {
    $.trace = $({});

    $.extend($.trace, {
        isInitialized: false,
        isEnabled: true,
	target: $("body"),
        setup: function() {
            $.trace.trigger("setup");
            $.trace.isInitialized = true;
        },
        write: function(message) {
            if($.trace.isEnabled){
                if(!$.trace.isInitialized)
                    $.trace.setup();
                $.trace.trigger("written", message);
            }
        }
    });
})(jQuery);