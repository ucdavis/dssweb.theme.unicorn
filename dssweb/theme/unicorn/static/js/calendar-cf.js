;(function($){
	
	var activeMQ;
	var targetEl = "todays-event";
	var days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
		
	$(document).ready(function() {
				
		var mqSync = function () {
	        // Fix for Opera issue when using font-family to store value
	        if (window.opera) {
						// TODO: Check that content is available after changing this from class to id
	           activeMQ = window.getComputedStyle(document.body, ':after').getPropertyValue('content');
	        }
	        // For all other modern browsers
	        else if (window.getComputedStyle) {
	           activeMQ = window.getComputedStyle(document.head, null).getPropertyValue('font-family');
	        }
	        // For oldIE
	        else {
	            // Use .getCompStyle instead of .getComputedStyle so above check for window.getComputedStyle never fires true for old browsers
	            window.getCompStyle = function (el, pseudo) {
								this.pseudo = pseudo;
	                this.el = el;
	                this.getPropertyValue = function (prop) {
	                    var re = /(\-([a-z]){1})/g;
	                    if (prop === 'float') {
												prop = 'styleFloat';
											}
	                    if (re.test(prop)) {
	                        prop = prop.replace(re, function () {
	                            return arguments[2].toUpperCase();
	                        });
	                    }
	                    return el.currentStyle[prop] ? el.currentStyle[prop] : null;
	                };
	                return this;
	            };
	            var compStyle = window.getCompStyle(document.getElementsByTagName('head')[0], "");
	            activeMQ = compStyle.getPropertyValue("font-family");
	        }
	        activeMQ = activeMQ.replace(/"/g, "");
	        activeMQ = activeMQ.replace(/'/g, "");
	    }; // End mqSync
			
			// Collect todays events for initial display on mobile page load
			function processTodaysEvents() {
				var x = 0;
				var event_id = 'active-event-';
				
				if($(('.'+targetEl)).length !== 0) {

					var events = $('<div id="events" />');
					$('#content').append($(events));
					
		      $(('.'+targetEl)).each(function () {
						// note: the element todays-event are located two deep in a td element
						if($(this).parent().parent().prop('tagName').toLowerCase() === 'td') {
							$(this).parent().parent().addClass('selected-day');
							//var datestr = getDateStr($(this).parent().parent());
							var td = $(this).parent().parent().find('.date'); // !!!
							var day = $(td).text();
							var index = $(td).parentsUntil('tr').index();
							var weekday = days[index];
							var arr = $('.fc-header-title').text().split(' ');
							var mo = arr[0];
							var yr = arr[1];
							var datestr = weekday + ", " + mo + " " + day + ", " + yr;
						}
						
						var el = $(this).clone();
						// Calculate date from context; Day, Month N, Year			
						el.prepend('<h3>'+ datestr +'</h3>').wrapInner('<div id="'+ event_id + x + '" class="event-item"></div>');
						$('#events').append(el);
						++x;
		      });
				}			
			}	
			
			function smoothScrollTo(anchor) {
				// Smooth scroll to offset of anchor ...
				//if(hashTagActive !== anchor) { // panel is open and no active hash
          //calculate destination place
          var dest = 0;
          if ($(anchor).offset().top > $(document).height() - $(window).height()) {
              dest = $(document).height() - $(window).height();
          } else {
              dest = $(anchor).offset().top;
          }
					dest -= 35; // offset to scroll to panel-heading
          //go to destination
          $('html,body').animate({
              scrollTop: dest
          }, 500, 'swing');
					
          //hashTagActive = anchor;
					//}
			}
			/* 
			 * Format events from a table cell and place on page below calendar
			 * @param target the TD element container of the element clicked
			 * @param targetItemId the selector name of individual events within the cell
			 * @paream datestr the constructed date of the event
			 * TODO: Wrong event is placed when clicking cells, e.g., click 30 then click 1
			 * This should show the "Levine Family" event
			 */
			function formatEvents(target, targetItemId, datestr) {
				var x = 0;
				var event_id = 'active-event-';
				
				// Remove events
				$('#events').empty();
				
	      $(target).find(targetItemId).each(function () {	
					var el = $(this).clone();
					var anchor = event_id + x;
					el.prepend('<h3>'+ datestr +'</h3>').wrapInner('<div id="'+anchor+'" class="event-item"></div>');
					$('#events').append(el);
					
					++x;
	      });
				smoothScrollTo('#events');
			}
			
			// Cell click callback to display events on mobile
			function showEvents(target) {
				// Make sure we're passing the .date target in case the .day area clicked
				var targetClass = $(target).attr('class');
				if($(target).attr('class') === 'day') {
					target = $(target).parent().find('.date');
				}
				var datestr = getDateStr(target);
				//$('#events').remove();
				
				// Remove other highlights
	      $('#calendar td').each(function () {
					$(this).removeClass('selected-day');
	      });
				$(target).parent().addClass('selected-day');
				formatEvents($(target).parent(), '.fc-event', datestr);
			}
			
			
			// Construct a date string based on the calendar .fc-header-title and td index / days mapping
			// Important: target needs to be the .date element
			function getDateStr(target) { 
				if($(target).attr('class') !== 'date') {
					return 'Unknown date';
				}
				var days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
				
				var day = $(target).text(); // TODO: Check whether element is consistent
				var td = target;
				var index = $(td).parentsUntil('tr').index(); // !!!
				var weekday = days[index];
				var arr = $('.fc-header-title').text().split(' ');
				var mo = arr[0];
				var yr = arr[1];
				
				return weekday + ", " + mo + " " + day + ", " + yr;
			}
			
			
			// Main ...
			
			mqSync();
			
			if(activeMQ === 'S') {
				if($('.sb-subitems').length !== 0) {
					$('#content').append($('.sb-subitems').addClass('calendar-processed'));
				}
				
				// Default show events that have the class todays-events assigned
				processTodaysEvents();
				
				// Hotlink cells with events ... where the unicorn happens
	      $('.eventful').each(function () {
					$(this).click(function(event) {
						showEvents(event.target);
					});
	      });
			}
			
	});
	
})(jQuery);
