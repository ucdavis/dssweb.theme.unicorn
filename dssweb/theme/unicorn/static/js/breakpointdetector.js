'use strict';

var Z63 = (function (parent, $) {

    var MediaQueryListener = function() {
        this.afterElement = window.getComputedStyle ? window.getComputedStyle(document.body, ':after') : false;
        this.currentBreakpoint = '';
        this.lastBreakpoint = '';
        this.init();
    };

    MediaQueryListener.prototype = {

        init: function () {
            var self = this;
            
            if(!self.afterElement) {
                return;
            }

            self._resizeListener();

        },
        _resizeListener: function () {
            var self = this;

            $(window).on('resize orientationchange load', function() {
                // Regexp for removing quotes added by various browsers
                self.currentBreakpoint = self.afterElement.getPropertyValue('content').replace(/^["']|["']$/g, '');
                
                if (self.currentBreakpoint !== self.lastBreakpoint) {
                    $(window).trigger('breakpoint-change', self.currentBreakpoint);
                    self.lastBreakpoint = self.currentBreakpoint;
                }
                
            });
        }

    };

    parent.mediaqueryListener = parent.mediaqueryListener || new MediaQueryListener();

    return parent;

}(Z63 || {}, jQuery));

$(window).on('breakpoint-change', function(e, breakpoint) {
	
	debugger;

    if(breakpoint === 'bp-small') {
       window.oday=14;
    }

    if(breakpoint === 'bp-medium') {
        window.oday=8;
    }

    if(breakpoint === 'bp-large') {
        window.oday=3;
    }
});