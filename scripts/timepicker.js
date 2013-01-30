//
// timepicker.js
//
// jQuery plugin for creating a time picker
//
// Written by Tadd Smyrnios
//

;(function ($) {
    var methods = {
        init: function(options){
            return this.each(function(i, element) {
                var $element = $(element);

                $element.children().empty().remove();

                var $hourSelect = $("<select></select>").attr("class","time-picker-hour").appendTo($element);
                var $minuteSelect = $("<select></select>").attr("class","time-picker-minute").appendTo($element);
                var $secondSelect = $("<select></select>").attr("class","time-picker-second").appendTo($element);

                for(var i=0;i<24;i++){
                    $("<option></option>").val(i).text(String(i).padLeft(2,"0")).appendTo($hourSelect);
                }

                for(var i=0;i<60;i++){
                    $("<option></option>").val(i).text(String(i).padLeft(2,"0")).appendTo($minuteSelect);
                    $("<option></option>").val(i).text(String(i).padLeft(2,"0")).appendTo($secondSelect);
                }
            });
        },
        getValue: function(){
            var value = "";
            this.each(function(i, element) {
                var $element = $(element);
                value = {
                    hour: $element.find(".time-picker-hour option:selected").attr("value"),
                    minute: $element.find(".time-picker-minute option:selected").attr("value"),
                    second: $element.find(".time-picker-second option:selected").attr("value")
                };
            });
            return value;
        },
        setValue: function(options){
            this.each(function(i, element) {
                var $element = $(element);
                $element.find(".time-picker-hour option[value=" + String(options.hour) + "]").attr("selected", true);
                $element.find(".time-picker-minute option[value=" + String(options.minute) + "]").attr("selected", true);
                $element.find(".time-picker-second option[value=" + String(options.second) + "]").attr("selected", true);
            });
        }
    };
    
    $.fn.extend({

        timepicker: function(method) {

             // Method calling logic
            if ( methods[method] ) {
              return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
            } else if ( typeof method === 'object' || ! method ) {
              return methods.init.apply( this, arguments );
            } else {
              $.error( 'Method ' +  method + ' does not exist on jQuery.timepicker' );
            }  

            
        }
    });
})(jQuery);