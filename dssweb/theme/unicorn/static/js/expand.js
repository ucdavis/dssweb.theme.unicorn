/* Change history: 
	  KS: JavaScript Document
		
  - 2014-06-12 RAK: Fix style assignment error and add debug and toggleActive mode
  - 
  TODO:
  
  - Refactor ...
	-- Evaluate  exposing activeMq to backbone event queue 
	  
*/

/* toggles the text shown on bio */

$(function () {
    var debug = true;
    var toggleActive = true;
		var activeMQ;  // Stores the screen size
		var currentMQ = "unknown"; // set the default screen size
		 
    $('.btn-more').click(function (event) {

        event.preventDefault(); /* prevent the a from changing the url */
        $(this).parents('#about-bio').find('.more_text').show();
        $('.btn-more').hide();
        $('.btn-less').show();
    });

    $('.btn-less').click(function (event) {

        event.preventDefault();
        $(this).parents('#about-bio').find('.more_text').hide();
        $('.btn-less').hide();
        $('.btn-more').show();
    });

    /*--used for tabs view---*/
    $('#myTab a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    // Add Events Cross-browser
    var event = {
        add: function (elem, type, fn) {
            if (elem.attachEvent) {
                elem['e' + type + fn] = fn;
                elem[type + fn] = function () {
                    elem['e' + type + fn](window.event);
                }
                elem.attachEvent('on' + type, elem[type + fn]);
            } else
                elem.addEventListener(type, fn, false);
        }
    };

    // Set default
   

    // Checks CSS value in active media query and syncs Javascript functionality
    var mqSync = function () {
			
        // Fix for Opera issue when using font-family to store value
        if (window.opera) {
           activeMQ = window.getComputedStyle(document.body, ':after').getPropertyValue('content-main');
        }
        // For all other modern browsers
        else if (window.getComputedStyle) {
           activeMQ = window.getComputedStyle(document.head, null).getPropertyValue('font-family');
        }
        // For oldIE
        else {
            // Use .getCompStyle instead of .getComputedStyle so above check for window.getComputedStyle never fires true for old browsers
            window.getCompStyle = function (el, pseudo) {
                this.el = el;
                this.getPropertyValue = function (prop) {
                    var re = /(\-([a-z]){1})/g;
                    if (prop == 'float') prop = 'styleFloat';
                    if (re.test(prop)) {
                        prop = prop.replace(re, function () {
                            return arguments[2].toUpperCase();
                        });
                    }
                    return el.currentStyle[prop] ? el.currentStyle[prop] : null;
                }
                return this;
            }
            var compStyle = window.getCompStyle(document.getElementsByTagName('head')[0], "");
            activeMQ = compStyle.getPropertyValue("font-family");
        }

        activeMQ = activeMQ.replace(/"/g, "");
        activeMQ = activeMQ.replace(/'/g, "");

        // Conditions for each breakpoint
        if (activeMQ != currentMQ) {

						// If the detected screen size is Mobile Extra Small 0px-449px
            if (activeMQ == 'XS') {
                currentMQ = activeMQ;
								utilStack();
                collapsedView();

            }
						// If the detected screen size is Mobile 450px-599px
            if (activeMQ == 'S') {
                currentMQ = activeMQ;
								utilStack();							 
								collapsedView();							
            }
						// If the detected screen size is Tablet 600px-959px
            if (activeMQ == 'M') {
                currentMQ = activeMQ;
								if  ( ($("body.ourpeople").length != 0) || ($("body.home").length != 0) ) {
									 expandedView();
									 
								}
								/*
								else if($("body.ourpeople").length != 0){
								collapsedView();	
								rmvStack();
								
								}
								*/
            }
						// If the detected screen size is Desktop 960px and up
            if (activeMQ == 'L') {
                currentMQ = activeMQ;
								rmvStack();
                expandedView();

            }
        }
    }; // End mqSync


    if (toggleActive) {
        mqSync();

        // Run on resize
        event.add(window, "resize", mqSync);
    }

    if (debug) {
        $(window).resize(function () {
            console.log($(this).width());
						console.log('expand.js detected screen size: ' + currentMQ);
        });
    }

    function expandedView() {
       	// Index page
			  //$(".ls-content").removeClass("tab-content");
       // $(".landscape div").removeClass("tab-pane");
        //$(".nav-tabs").hide();
				
        /* If Bio Page */
				if ($("body.bio").length != 0) {
            // Remove the panel effects and then show the headers
						$("#about-bio").removeClass("panel panel-default");
            $(".content-bio-container").removeClass(".panel-group");
            $(".btn-more").show(); 
						$("#about-bio div").removeClass("panel panel-default");
						$("#about-bio h3").show();
						
						// hide the extra text until the show more button is clicked                                    
            $("#contC,#contB").addClass("more_text");
						
           
        }
				// Remove the panel body effect 
				//$(".collapsible").children().removeClass("panel-body");
				
        // Remove the data-toggle attribute to allow the links to work in desktop
				$(".panel-title a").removeAttr('data-toggle');
				$(".nav > li a").removeAttr('data-toggle');
				
				// drop-on class added to element to manage desktop/mobile hover/no-hover
				$(".nav > li").addClass("drop-on");
				
				// Prevent the sidebars from behaving like panels when in desktop view
				$(".sidebar-panel").removeClass("panel-collapse collapse in");       							
				$(".sidebar").children().removeClass("panel panel-default");
				
				// Fix for contA height not being reset to auto	
				$(".collapsible").css("height", "auto");
				
				$(".content-main div").children().removeClass("panel-collapse collapse active");
				$(".content-main .panel-heading").hide();
				$(".panel-group").children().removeClass("panel panel-default")        
        $(".more_text").hide();
				
				// Remove the open class from an open dropdown list to prevent an open dropdown list on desktop view
				$(".nav li").removeClass("open");
	   }

    function collapsedView() {
				// Index page
        //$(".ls-content").addClass("tab-content");
        //$(".landscape div").addClass("tab-pane");
        //$(".landscape").removeClass("tab-content");
        $("#contA").addClass("active");
       // $(".nav-tabs").show();
							  			     
        if ($("body.bio").length == 0) {		
						// Add accordion effects to sidebar			  
            $(".sidebar").children().addClass("panel panel-default");
						$(".panel-group").children().addClass("panel panel-default");
            $(".sidebar-panel").addClass("panel-collapse collapse");
            $(".collapse div").addClass("panel-body");

        }
				/* If Bio Page */
				else if ($("body.bio").length != 0) {
						// Add accordion effects to sidebar			  
            $(".content-bio-container").addClass("panel-group");
						$("#about-bio > div").addClass("panel panel-default");
						$("#sidebar-bio-right > div").addClass("panel panel-default");
						$(".btn-bio").hide();
						$("#about-bio h3").hide();
        }
				// Add the collapse on toggle attribute to the panel headers
				$(".panel-title a").attr("data-toggle","collapse");
				$(".collapsible").addClass("panel-collapse collapse");
        $(".collapse > div").addClass("panel-body");
				
				// Remove the dropdown on hover effect from the navbar parent items
				$(".nav > li").removeClass("drop-on");
				$(".panel-heading").show();
        $(".more_text").hide();			
				// Add the dropdown on toggle attribute to the panel headers	
				$(".par > a").attr("data-toggle","dropdown");
   		
				// Prevent the panel-title headers from redirecting the page and shows .panel-body content
        $(".panel-title a").click(function (e) {
            e.preventDefault();
            $($(this).data("target")).show();			
				});	
       
			 // Work around to allow the menu dropdown links to work
			 // TODO: This is a temporary workaround
			 //$('ul.nav li').find('a').on('click', function() {
				//		window.location = $(this).attr('href');
				//});
				
    }
		/* footer utility menu stack */
		function utilStack(){
			// Stack the menu vertically
		  $("#utility nav ul li").addClass("col-xs-3 col-sm-3 col-md-3 col-lg-3");				
		}
		function rmvStack(){
			// Line the menu horizontally
			$("#utility nav ul li").removeClass("col-xs-3 col-sm-3 col-md-3 col-lg-3");					
		}
});