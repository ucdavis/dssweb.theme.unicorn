;(function($){
  /* code here runs instantly as opposed to $(function(){ ... }); which waits for DOM making ready function unness */	
  var debug = true;
  var toggleActive = true;
	var activeMQ;  // Stores the screen size
	var currentMQ = "unknown"; // set the default screen size
	var front = false;
	// Banner port heights. Note: Sync with values in sass/_variables.scss
	var banner_hb_ratio = 0.7292; // Representing the ratio top-row-height / banner-height (may need adjustment if styles change)
	var front_banner_height = 474; // was 565 prior to 2014-10-13 RAK
	var front_tablet_banner_height = 432;
	var shadow_am_viewport_height = 418;
	var vcardiced = false;
	var biocardiced = false;
	var processed = false;
	var hashTagActive = "";

	/*
	 * splitPath utility function
	 * @param path the path to process
	 * @return the object with directory/part and file name/part
	 */	
	function splitPath(path) {
	  var dirPart, filePart;
	  path.replace(/^(.*\/)?([^/]*)$/, function(_, dir, file) {
	    dirPart = dir; filePart = file;
	  });
	  return { dirPart: dirPart, filePart: filePart };
	}
	
	/*
	 * HappyDone callback function to position banner-caption element
	 * Calculate right-most border of last happy box for alignment of content beneath the happybox container
	 * Requires element #banner-caption and happy box container with multiple .panel-body elements
	 * Right position is .panel-body - .narrow-col as long as top-panel-row and middle-row (caption parent) have same content width
	 */
	function happyDone() {
		if(($('#banner-caption').length !== 0) && ($('.panel-body').length !== 0)) {
			var context = $('#top-panel-row');
			var cw = context.width();
			var cwl = context.position().left;
			var pb = context.find('.panel-body:last-child');
			var nc = pb.find('.narrow-col:last-child');
			var ncw = 0;
			var ncpl = 0;
			
			if(nc) { // calculate right margin based on pb - nc, assuming left nc margin is 0
				ncw = nc.width();
				ncpl = nc.position().left;
				rightBoxMargin = pb.width() - ncw;
			}
			
			$('#banner-caption').css('right', rightBoxMargin);

		}
	}
	
	$(document).ready(function() {
		
		// JQuery version
		if(debug) {
			if(typeof window.console !== "undefined") {
				window.console.log("JQuery version:  " + $.fn.jquery);
			}
		}
				
		// Menu active trail ... variable is assigned in page. Don't worry about CodeKit error here
		// This allows page to identify which main menu item it belongs to and that should be highlighted
		if(typeof active_trail !== 'undefined') {
			$(active_trail).addClass("active-trail");
		}
		
		
		// TODO: Consider doing this with LiveSearch list items; feels much more responsive if entire LI is hot.
		// Add / remove .LSRow for LiveSearch LI hotlinking. Would need this as a function and without body.home specificity for livesearch updates.
		
		$('#searchi').focus(function() {
			$('#LSResult').show();
		});
		$('#searchi').blur(function() {
			$('#LSResult').hide();
		});
		
		
		var hotlinkLiveSearch = function () {
      $('.LSRow').each(function () {
				if($(this).find('a')) {
					var url = $(this).find('a').attr('href');
					$(this).click(function() {
						window.open(url);
					});
				}
      });
		};
		
		// Bend blockquotes
		if($('blockquote').length !== 0) {
			$('blockquote').addClass('open-quote');
			$('blockquote').wrapInner('<span class="bq-content" />');
			$('blockquote').wrapInner('<span class="close-quote" />');
		}
		
		// Misc. Fixes
		var apply_fixes = function () {
			var msViewportStyle = null;
			/// SNAP MODE FIXES
			
			// MS Surface snap fix
			// See http://www.mobilexweb.com/blog/windows-8-surface-ie10-html5
			if (navigator.userAgent.match(/Windows NT 6.2; ARM(.+)Touch/)) {
		    msViewportStyle = document.createElement("style");
		    msViewportStyle.appendChild(
		      document.createTextNode(
		          "@-ms-viewport{width:device-width}"
		      )
		    );
		    document.getElementsByTagName("head")[0].
		    	appendChild(msViewportStyle);
			}
			
			// Lumia 820 and HTC 8X fix
			// See http://timkadlec.com/2013/01/windows-phone-8-and-device-width/
			if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
		    msViewportStyle = document.createElement("style");
		    msViewportStyle.appendChild(
	        document.createTextNode(
	            "@-ms-viewport{width:auto!important}"
	        )
		    );
		    document.getElementsByTagName("head")[0].
		    	appendChild(msViewportStyle);
			}
			
			// Fix 1px jog on Bootstrap collapse animation
			// Note: disables collapse on iPhone
			/*$('.collapse').on('show.bs.collapse hide.bs.collapse', function(e) {
			    e.preventDefault();
	    });
	    $('[data-toggle="collapse"]').on('click', function(e) {
	        e.preventDefault();
	        $($(this).attr('data-target')).toggleClass('in');
	    });*/
				
			// Input field placeholders; Just add .placeholder to the form class to have .form-row labels placed as placeholders on input items
			if($('form.placeholders').length !== 0) {
				$('form.placeholders .form-row').each(function () {
					var label_txt = $(this).find('label').text();
					$(this).find('input, textarea').attr('placeholder', label_txt);
				});
			}
						
		};
		
		apply_fixes();
		
		// foundation top-bar support. 
		// Note: Add after any JavaScript constructed markup that relies on foundation
		$(document).foundation(); 
		
		/* thumbify t6 template showing collapsible / accordion in tablet and desktop 
		 * @param activeMQ the breakpoint
		 * @param startTag the selector from which to finish processing 
		 * @param containerTag the innermost content selector
		 * @param targetTag the selector to receive image placement
		 * @param invert the boolean whether to move the image into the collapsible panel or to move above
		 * 
		 */
		var thumbify = function (activeMQ, startTag, containerTag, targetTag, invert) {
			var comboSelector = startTag + ' ' + containerTag;
			var MLTarget = null;
			
			 $(comboSelector).each(function () {
				 if((activeMQ === "M") || (activeMQ === "L")) {
					MLTarget = targetTag + " a"; // desktop/tablet: put thumb into the gold bar left of title
				} else {
					if(invert) {
						MLTarget = ".panel-body"; // mobile: put thumb before text within the collapsed panel
					} else {
						// Move the image to top of current selector
					}
					// prep to retrieve "m-" version of image ...
					var img = $(this).find('.thumb');
					var img_src = img.attr('src');
					
					//var dlim_pos = img_src.substring(0, img_src.lastIndexOf("/"));
					//var part_path = img_src.substring(0, dlim_pos);
					var file_parts = splitPath(img_src);
					var new_src = file_parts.dirPart + "m-" + file_parts.filePart;
					img.attr('src',new_src);
					
					if(typeof window.console !== "undefined") {
		        window.console.log("Bootstrapify_func: " + new_src + ", dirPart = " + file_parts.dirPart + ", filePart = " + file_parts.filePart);
					}
					
				}
				
				if(MLTarget) {
					var rt = $(this).find(MLTarget);
			 		rt.wrapInner('<span class="thumb-txt" />');
			 		rt.prepend($(this).find('.thumb'));
					$(this).addClass("thumbify-processed");
				} else {
					$(this).prepend($(this).find('.thumb').addClass('thumbify-prepended'));
				}
				
			 });
			 collapsedSection(startTag);
		};
		
		// Make collapse panel-group active ...
    var collapsedSection = function (selector) {
				$(selector+" .panel-group").children().addClass("panel panel-default");
				$(selector+" .panel-group .collapsible").addClass("panel-collapse collapse");
				$(selector+" .panel-group .collapsible").removeClass('in');
				
        //$(".collapse > div").addClass("panel-body"); // Check if not applied ...

				$(selector+" .panel-title a").attr('data-toggle','collapse'); // for open/close
				
				
				// Prevent the panel-title headers from redirecting the page and shows .panel-body content
        $(selector+" .panel-title a").click(function (e) {
            e.preventDefault();
            $($(this).data("target")).show();			
				});
			
    };
		
		// BOOTSTRAPIFY //////////////////////////////////////////////////
		var bootstrapify_func = function (mobile, collectionSelector, itemSelector, heading, contentClassName, panelGroupID, startIndex) {
			var hasLink = false;
			var i = startIndex;
			if($(collectionSelector).length !== 0) {
				
				// Wrap inner as panel-group
				$(collectionSelector).wrapInner('<div id="'+panelGroupID+'" class="panel-group"></div>');
				
				// Process each item within panel-group
				var comboSelector = collectionSelector + " " + itemSelector;

	      $(comboSelector).each(function () {
					
					var el = $(this);
					//var id = ('accordion'+i);
					var aid = ('acont'+i);
					var pid = ('panel'+i);
					
					//el.addClass('panel-group');
					//el.attr('id',('accordion'+i));
					//el.wrapInner('<div id="'+pid+'" class="panel panel-default" />');
				
					el.addClass('panel panel-default');
					el.attr('id',pid);
										
					var titleEl = el.find(heading);
					// TODO: Handle cases where h3 heading not available
					titleEl.wrap('<div class="panel-heading" />');
					titleEl.addClass("panel-title");
					
					// Before we wrap in a link check if a link already exists, and use that instead
					var moreUrl = titleEl.find('a').attr('href');
					if((typeof titleEl.find('a').attr('href')) === 'string') {
						hasLink = true;
						titleEl.find('a').addClass('collapsed').
							attr('data-parent',panelGroupID).
							attr('data-target','#'+aid).
							attr('data-toggle','collapse');
					} else {
						titleEl.wrapInner('<a class="collapsed" data-parent="'+panelGroupID+'" data-target="#'+aid+'" data-toggle="collapse"></a>');
					}
					
					var bodyEl = el.find(contentClassName);
					bodyEl.addClass('panel-body');
					bodyEl.wrap('<div class="collapsible panel-collapse collapse" id="'+aid+'"></div>');
					
					if(typeof window.console !== "undefined") {
		        window.console.log("Bootstrapify_func: " + titleEl.text() + " has link: " + hasLink + ", collapsible is: " + el.find('.collapsible').length);
					}
					
					if(hasLink) {
						var readmore = $('<a />').addClass('readmore').attr('href', moreUrl).text("Read More");
						if(el.find('.collapsible ' + contentClassName).length !== 0) {
							if(el.find('.after-readmore').length !== 0) {
								readmore.insertBefore(el.find('.after-readmore'));
							} else {
								el.find('.collapsible ' + contentClassName).append(readmore);
							}
						} else {
							if(el.find('.after-readmore').length !== 0) {
								readmore.insertBefore(el.find('.after-readmore'));
							} else {
								el.find('.collapsible').append(readmore);
							}
							
						}
					}

					++i;
					hasLink = false;
	      });
				return i+1;
			}		
			return i;
		};

		var bootstrapify = function (mq) {
			var portletNum = 20;
			var mobile = ((mq === "XS") || (mq === "S")) ? true : false;
			if(typeof window.console !== "undefined") {
        window.console.log("Is mobile: ActiveMQ: " + activeMQ + ", Mobile: "+ mobile);
			}
			// TODO: sidebar-right relies on collapsible selectors for styling; fix that and only process for mobile
			portletNum = bootstrapify_func(mobile, '#thumb-section','section', 'h3', '.inline-content', 'accordion-thumb', portletNum);
			portletNum = bootstrapify_func(mobile, '.sidebar-right','.portlet', 'h3', '.portlet-content', 'accordion-sr', portletNum);

			if(mobile) {
				portletNum = bootstrapify_func(mobile, '#cm-section','section', 'h2', '.inline-content', 'accordion-cm', portletNum);
				portletNum = bootstrapify_func(mobile, '#event-description', '', 'h3', '.inline-content', 'accordion-e', portletNum);
			}
			
		};
		
		// PLUGIN CANDIDATES /////////////////////////////////////////////
		// Process .picture into figure/figcaption
		// TODO: Plugin
		if($('.picture').length !== 0) {
			
      $('.picture img').each(function () {
				var title = $(this).attr('title');
				$(this).wrap('<figure class="picture-processed" />');
				if((typeof title !== 'undefined')) {
					$(this).parent().append("<figcaption>"+title+"</figcaption>");
				} else if($('.picture figcaption').length !== 0) {
					$(this).parent().append("<figcaption>"+$('.picture figcaption').html()+"</figcaption>");
					$('.picture figcaption').remove();
				}
				
      });
		}		
		
		// Subtract height of figcaption from breadcrumb visually oriented on bottom of image
		// Minimize content-row top margin if banner has caption
		// Call this ONLY after picture processing
		// figcaption
		if(($('#banner-row').length !== 0) && ($('#banner-row figcaption').length !== 0)) {
			// Note: figcaption doesn't existing until processed so use approx 25px height
			var fcmt = $('#banner-row figcaption').height() + 6;
			var mt = ( $('#content-row').css('margin-top').replace('px','') - fcmt);
			$('#content-row').css('margin-top', mt);
		}
		// .figcaption
		if(($('#banner-row').length !== 0) && ($('#banner-row .figcaption').length !== 0)) {
			// Note: figcaption doesn't existing until processed so use approx 25px height
			var fcmt = $('#banner-row .figcaption').outerHeight();
			var mt = ( $('#content-row').css('margin-top').replace('px','') - fcmt);
			$('#content-row').css('margin-top', mt);
		}		
		
		// Process download file icons
		// TODO: Plugin ... with option to add id's which should be checked for file type icon placement
		if($('#downloads').length !== 0) {
      $('#downloads li').each(function () {
				// Method using href
				var a = $(this).find('a');
				var c = a.attr('href').split(".");
				if( c.length === 1 || ( c[0] === "" && c.length === 2 ) ) {
				    // handle errors
				} else {
					a.addClass(c.pop()+'-icon icon-processed');
				}
				// Method using filetype class in cases where PDF or other extension not available
				/*if($(this).has('span.pdf-filetype')) {
					$(this).find('a').addClass('pdf-icon icon-processed');
				}*/
      });
		}		
		
    // Add Events Cross-browser
    var event = {
	    add: function (elem, type, fn) {
        if (elem.attachEvent) {
	        elem['e' + type + fn] = fn;
	        elem[type + fn] = function () {
	        	elem['e' + type + fn](window.event);
	        };
	        elem.attachEvent('on' + type, elem[type + fn]);
        } else {
        	elem.addEventListener(type, fn, false);
				}
	    }
    };

		
		// WAI level-1 compliancy - Bypass Blocks 2.4.1
		// Nic Zakas "skip to content" next focus fix
		// See http://www.nczonline.net/blog/2013/01/15/fixing-skip-to-content-links/
		// TEST Checkpoint: https://code.google.com/p/chromium/issues/detail?id=37721
		window.addEventListener("hashchange", function(event) {
	    var element = document.getElementById(location.hash.substring(1));
	    if (element) {
	      if (!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)) {
	      	element.tabIndex = -1;
	      }
	      element.focus();
	    }
		}, false);
   

    // Check CSS value in active media query and sync Javascript functionality
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
		
		var bend = function () {
			
			if(($('#footer #vcard').length !== 0) && !vcardiced) {
				$('#footer #vcard').insertBefore($('#footer #copyright'));
				vcardiced = true;
			}
			
			// On T8 templates, move the left nested column to the right sidebar
			if($('body.students #nested-left').length !== 0) {
				if(activeMQ !== 'S') {
					$('#nested-left').removeClass("col-xs-12 col-sm-12 col-md-4 col-lg-4"); // Note: Update if col defs change
				
					$('#nested-right').removeClass("col-md-8");
					$('#nested-right').addClass("col-md-12 bent");
				
					$('.sidebar-right').append($('#nested-left'));
				} else {
					$('#nested-left').insertAfter($('#nested-right'));
				}
			}
			
			// On T10 move #nested-left after #cm-section
			if(activeMQ === 'S') {
				if(($('#cm-section #nested-right').length !== 0) && ($('#nested-left').length !== 0)) {
					$('#nested-left').insertAfter($('#cm-section'));
				}
			}
			
		};
		var bendM = function () {
			
			
			// On T8 templates, move the left nested column to the right sidebar
			if($('body.students #nested-left').length !== 0) {
				$('#nested-left').removeClass("col-xs-12 col-sm-12 col-md-4 col-lg-4"); // Note: Update if col defs chnage
				
				$('#nested-right').removeClass("col-md-8");
				$('#nested-right').addClass("col-md-12 bent");
				
				$('.sidebar-right').append($('#nested-left'));
			}
		};
		
		var bendbio = function () {
			if((activeMQ !== 'L') && (activeMQ !== 'M') && !biocardiced) {
				// 2015-01-26 RAK: moving bio-card element into content will cause it to collapse when an accordiion heading is clicked on mobile. Add class .dont-close and catch in collapseAll function
				$('#content').prepend($('.bio-card'));
				//$('.collapsible').addClass('in'); // Expand panel since it's closed in mobile ... no, expands on mobile
				$('.bio-card .collapsible').addClass('in dont-close');
				// breadcrumb
				$('.breadcrumb').insertBefore($('#content .bio-card h4.fn'));
				biocardiced = true;
			}
		};
		
		var unbend = function () {
			if(vcardiced) {
				$('#footer #vcard').insertAfter($('#footer #foot-social'));
				vcardiced = false;
			}
			
			// On T8 templates, move the left nested column to the right sidebar
			if($('.sidebar-right #nested-left').length !== 0) {
				$('#nested-left').addClass("col-xs-12 col-sm-12 col-md-4 col-lg-4");
				$('#nested-right').removeClass("col-md-12 bent");
				$('#nested-right').addClass("col-md-8");
				$('#content-core > .row').append($('#nested-left'));
			}
			
			// On T10 move #nested-left after #cm-section
			if(($('#cm-section #nested-right').length !== 0) && ($('#nested-left').length !== 0)) {
				$('#content-core > .row').prepend($('#nested-left'));
			}
			
		};

		var unbendbio = function () {
			if(biocardiced) {
				$('.sidebar-right .panel-group').prepend($('#content .bio-card'));
				// breadcrumb
				$('#content').prepend($('.breadcrumb'));
				
				biocardiced = false;
			}
		};
		
		var expand = function () {
			var tabletBannerHeight = 160;
			var happyboxBlockHeight = 45;
			
			// Auto-size happy box top-panel-row element based on css height of .wall element minus top menu bars
			// TODO: Feature - add recalculation of box attributes on resize
			//alert(calc_hb_viewport());
			$('body.happy-box #top-panel-row').height(calc_hb_viewport());	

			
			//var plugin = $('body.home #top-panel-row').happybox();
			//plugin.rebuild();
			
      // Conditions for each breakpoint
      if (activeMQ !== currentMQ) {

					// If the detected screen size is Mobile Extra Small 0px-449px
          if (activeMQ === 'XS') {
              currentMQ = activeMQ;
							utilStack();
              collapsedView();
							
							bend();
							bendbio();

          }
					// If the detected screen size is Mobile 450px-599px
          if (activeMQ === 'S') {
              currentMQ = activeMQ;
							
							// Note: Rework to accommodate sizing in tablet and mobile
							//$('body.home #top-panel-row').height("auto");
							
							// TODO: 2014-10-14 RAK: Change to rely on calc_hb_viewport() and css
							// If NOT on home page ...
							/*if($("body.home").length === 0) {
								$('.wallpaper-image').width($(window).width());
								$('.wallpaper-image').height(tabletBannerHeight);
								$('.wallpaper-image').css('left',0);
								// $('#content').css('margin-top',(tabletBannerHeight-happyboxBlockHeight)+'px');
							}*/
							
							/*// Adjust width of embedded video
							if($('iframe').length !== 0) {
								$('iframe').width("100%");
							}*/
							
							popupSM(); // make T5 Did you know popup
								
							utilStack();
						 
							collapsedView();					
							
							bend();
							bendbio();
							
          }
					// If the detected screen size is Tablet 600px-959px (768px-992px?)
          if (activeMQ === 'M') {
              currentMQ = activeMQ;
							if  ( ($("body.ourpeople").length !== 0) || ($("body.home").length !== 0) ) {
								// TODO: Hold $('body.home #top-panel-row').height(front_banner_height);
							}
							expandedView(); // was previously in conditional above
							
							/*
							else if($("body.ourpeople").length !== 0){
							collapsedView();	
							rmvStack();
							
							}
							*/
							bendM(); // If we can't change position of elements using Bootstrap push / pull, then bend it
							unbendbio();
							
							// Make research tabs collapse on tablet / desktop
							if($('#thumb-section').length !== 0) {
								collapseThumbView();
							}
          }
					// If the detected screen size is Desktop 960px (991px?) and up
          if (activeMQ === 'L') {
              currentMQ = activeMQ;
							rmvStack();
							// happy box component
							// TODO: Hold $('body.home #top-panel-row').height(front_banner_height);
              expandedView();
							
							unbend(); // Set positioning back
							unbendbio();
							
							// Make research tabs collapse on tablet / desktop
							if($('#thumb-section').length !== 0) {
								collapseThumbView();
							}
          }
      }
			
		};

		/*
		 * Create popup on mobile devices. See t5 for required HMTL markup
		 */
		function popupSM() {
			if($('.popup-sm').length !== 0) {
				$('.popup-sm-title').insertBefore($('#corner-box-target figure figcaption'));
				$('.popup-sm').insertAfter($('#corner-box-target'));
				
				var minusfc = ($('#corner-box-target figcaption').css('display') !== 'none') ? $('#corner-box-target figcaption').outerHeight() : 0;
				var cbth = $('#corner-box-target').height() - minusfc;
				
				
				$('.popup-sm').css('top',cbth);
				$('.popup-sm-title').css('top',(cbth - $('.popup-sm-title').outerHeight()));
				
        $(".popup-sm-title a").click(function (e) {
            e.preventDefault();

						// Toggle collapsed
						if($(this).attr('class') === 'collapsed') {
							$(this).removeClass('collapsed');
							if($('.popup-sm').length !== 0) {
	            	$('.popup-sm').removeClass('collapse');
							}
						} else {
							$(this).addClass('collapsed');
							if($('.popup-sm').length !== 0) {
	            	$('.popup-sm').addClass('collapse');
							}
						}
						return false;
				});	
				
			}
		}
		
    function expandedView() {
       	// Index page
			  //$(".ls-content").removeClass("tab-content");
       // $(".landscape div").removeClass("tab-pane");
        //$(".nav-tabs").hide();

        /* If Bio Page */
				if ($("body.bio").length !== 0) {
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
				
				// De-activate accordion effects in all panel-groups
				//$(".sidebar .panel").removeClass("panel-collapse collapse in"); // NOTE: Changed from .sidebar-panel					
				$(".panel-group").children().removeClass("panel panel-default"); // TODO: Was previously more specific to .sidebar but we need all

				// Fix for panel-collapse height not being reset to auto
				$(".collapsible").css("height", "auto");
				
				// TODO: Hmm, is the selector correct? 
				$("#content div").children().removeClass("panel-collapse collapse active");
				//$("#content .panel-heading").hide(); // TODO: remove ...  hidden-lg hidden-md placed directly on panel-heading
				
				if ($("body.happy-box").length !== 0) {
					// TODO: Testing ourpeople happybox
					$("#content-row div").children().removeClass("panel-collapse collapse active");
					//$("#content-row .panel-heading").hide(); // TODO: remove ...  hidden-lg hidden-md placed directly on panel-heading
				}
				
				$(".panel-group .collapsible").addClass("in"); // New: Open panels 
				
        $(".more_text").hide();
				
				// Remove the open class from an open dropdown list to prevent an open dropdown list on desktop view
				$(".nav li").removeClass("open");
	   }

		 /* CollapsedView - On XS and S breakpoints, process for collapsed panel view
		 	*	
		 */
    function collapsedView() {
				// Index page
        //$(".ls-content").addClass("tab-content");
        //$(".landscape div").addClass("tab-pane");
        //$(".landscape").removeClass("tab-content");
			
        $("#contA", ".panel .panel-collapse").addClass("active"); // TODO: Are we using this? Should apply to all panel IDs
       // $(".nav-tabs").show();
							  			     
			 // TODO: Update the bio conditional; we really don't want a conditional for only a page type
				if ($("body.bio").length !== 0) {
						// Add accordion effects to sidebar. TODO: Do we still need this?	  
            $(".content-bio-container").addClass("panel-group");
						$("#about-bio > div").addClass("panel panel-default");
						$("#sidebar-bio-right > div").addClass("panel panel-default");
						$(".btn-bio").hide();
						$("#about-bio h3").hide();
        } else {
					// Activate accordion effects to all panel-groups
					// Works in conjunction with removal of same classes in expandedView()	  
					$(".panel-group").children().addClass("panel panel-default"); // was more specific prior with .sidebar but we need all
          //$(".sidebar .panel").addClass("panel-collapse collapse"); // Note: Changed from .sidebar-panel
          //$(".collapse div").addClass("panel-body"); // TODO: Do we need this?
        }
				
				// NOTE: Following changes are global
				
				// Add the collapse on toggle attribute to the panel headers
				//$(".panel-title a").attr("data-toggle","collapse");
				$(".panel-group .collapsible").addClass("panel-collapse collapse"); // Note: global
				$(".panel-group .collapsible").removeClass('in'); // New: Close panels
        $(".collapse > div").addClass("panel-body");
				
				// Remove the dropdown on hover effect from the navbar parent items
				$(".nav > li").removeClass("drop-on");
				//$(".panel-heading").show();
        $(".more_text").hide();			
				// Add the dropdown on toggle attribute to the panel headers	
				$(".par > a").attr("data-toggle","dropdown");
   			
				// Blanket assign class="collapsed" to all collapsed panel links for display of correct status
				$(".panel-title a").addClass('collapsed');
				
				// Prevent the panel-title headers from redirecting the page and shows .panel-body content
        $(".panel-title a").click(function (e) {
            e.preventDefault();
						
						collapseAllPanels('.panel-group');
						
						// Toggle collapsed
						if($(this).attr('class') === 'collapsed') {
							//$(this).removeClass('collapsed'); // this is handled in collapseAllPanels
						} else {
							$(this).addClass('collapsed');
						}
						
						if($('body.calendar').length === 0) {
            	$($(this).data("target")).show(); // 2014-10-14 RAK: This trips up "Filter By" on calendar page
						}
						var sel = '.in'+$(this).attr('data-target');
						
						/* Just jump to anchor ...
						if($(sel).length === 0) {
							location.href = $(this).attr('data-target');		
						}*/
						
						// Smooth scroll to offset of anchor ...
						var anchor = $(this).attr('data-target');
						if(hashTagActive !== anchor) { // panel is open and no active hash
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
		          hashTagActive = anchor;
		        }
						
				});	
       
			 // Work around to allow the menu dropdown links to work
			 // TODO: This is a temporary workaround
			 //$('ul.nav li').find('a').on('click', function() {
				//		window.location = $(this).attr('href');
				//});
				
    }
		
		function collapseThumbView() {
			// NOTE: Following changes are global
			
			// Add the collapse on toggle attribute to the panel headers
			$("#thumb-section .panel-group .collapsible").addClass("panel-collapse collapse"); // Note: global
			$("#thumb-section .panel-group .collapsible").removeClass('in'); // New: Close panels
      $("#thumb-section .collapse > div").addClass("panel-body");
 			
			// Blanket assign class="collapsed" to all collapsed panel links for display of correct status
			$("#thumb-section .panel-title a").addClass('collapsed');
			
			// Prevent the panel-title headers from redirecting the page and shows .panel-body content
      $("#thumb-section .panel-title a").click(function (e) {
          e.preventDefault();
					
					collapseAllPanels('#thumb-section .panel-group');
					
					// Toggle collapsed
					if($(this).attr('class') === 'collapsed') {
						//$(this).removeClass('collapsed'); // this is handled in collapseAllPanels
					} else {
						$(this).addClass('collapsed');
					}
					
			});	
     
		}
		
		/* smooth_scroll - to make link scroll smoothly to anchor 
		 * @param linkId the element AND the a-tag, e.g., '#button a'
		*/
		function smooth_scroll(linkId) {
			
      $(linkId).click(function (e) {
        e.preventDefault();
					
				var anchor = $(this).attr('href');
				
	      //calculate destination place
	      var dest = 0;
	      if ($(anchor).offset().top > $(document).height() - $(window).height()) {
	          dest = $(document).height() - $(window).height();
	      } else {
	          dest = $(anchor).offset().top;
	      }
				//dest -= 35; // offset (if needed) to scroll to panel-heading
	      //go to destination
	      $('html,body').animate({
	          scrollTop: dest
	      }, 500, 'swing');
			});
			
		}
			
		
		function collapseAllPanels(parentTag) {
			//$(".panel-group .collapsible").removeClass("in"); // close panels
			$(parentTag+' .in').not(".dont-close").parent().find('.panel-heading a').addClass('collapsed'); 
			$(parentTag+' .in').not(".dont-close").collapse('hide');
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
		
		/******************************************** MAIN ************************************** */
		
		/* 
		 * calc and return happy box view port based on height of css-determined 
		 * (wallpaper height - combined height of navigation elements)
		 * return h the viewport height
		*/
		function calc_hb_viewport() {
			var h = 0;
			var nav_h = ($('#top-bar-wrap').height() + $('#util-bar-wrap').height());
			if($('.wall').length !== 0) {
				if(($('body.has-shadow-am').length !== 0) && (activeMQ === "S")) {
					h = $('.shadow-am-graphic').height(); // don't use .wallpaper-image height since not always set at this point
				} else {
					h = $('.wall').height() - nav_h;
				}
			}
			return h;
		}
		
		function get_menu_icon() {
			var menu_icon = $('<span class="menu-icon"><span>&nbsp;</span></span><div class="glyphicon glyphicon-align-justify visible-xs" id="dropdown-icon"></div>');
			return menu_icon;
		}
		
		/*
		 * refresh_right_panel to adjust position of collapse right panel on mobile ("S")
		*/
		function refresh_right_panel() {
			// Note: Adjsut the body.<class> filter as needed for other "has-<type>.happy-box" pages
			if(($('body.has-shadow-am.happy-box #top-panel-row').length !== 0) && (activeMQ === "S")) {
				var hb_element_height = calc_hb_viewport();
				if(!hb_element_height) { // 0 height ?
					hb_element_height = shadow_am_viewport_height;
				}
				// Height to subtract from position calculation. Assuming only ONE panel on the right (by design)
				// TODO: Offset is not from inner- or outer height ... so from whence?
				// T8 Students (students) = 5, T2 Our people (ourpeople) = 16
				var offset = ($('body.students').length !== 0) ? 16 : 5; // mobile on desktop needs 5 if we're setting top-panel-row and wallpaper-image to same height. Note: top-bar height also impacts this
				var h = ($('#top-panel-row .right-panel .panel-heading').height() + offset);
				
				$('#top-panel-row .right-panel').css('padding-top', (hb_element_height-h));
			}
			
			// Set height of the top-panel-row to fill area
			$('#top-panel-row').height(hb_element_height);
			
			/* Set height of wallpaper image to same height ... TODO: Investigate why this became an issue (mobile on desktop browser now has 16 offset too much)
			if($('.wallpaper-image').length !== 0) {
				$('.wallpaper-image').height(hb_element_height);
			}*/
		}
		
		/* 
		 * myResize to provide rudimentary support of browser width resizing
		*/
		function myResize() {
			
      mqSync();
			if(!processed) {
				// Note: This only support one round of bs processing so resizing does not undo bootstrap / collapse
				// TODO: Build undo that is applied only when going from mobile to M or L
				bootstrapify(activeMQ);
			}
			expand(); // process collapse
			if(!processed) {
				if($('#thumb-section').length !== 0) {
					thumbify(activeMQ,'#thumb-section','section','.panel-heading',false);
				}
			}
			
			refresh_right_panel(); // Affects page types with body.has-shadow-am
			
			processed = true;
		} // /myResize()
		

				
    if (toggleActive) {
				myResize();
        // Run on resize
        event.add(window, "resize", myResize);
    }
		
		
		/* ============================  RUN ONCE ON PAGE LOAD ============================ */
		
		// Upholding markup rule to place all page elements within .container but we want to have edge to edge footer so pull it out
		if($('.container #footer').length !== 0) {
			$('#footer').insertAfter($('.container'));
			$('#footer').addClass('footer-processed');
			$('#footer .foot-wrap').addClass('container clearfix');
		}
		
		// Note: The height of the happy box block needs to change with the height of the .wall * banner_hb_ratio
		var hb_element_height = calc_hb_viewport();
		
		
		// Set sidebar position and activate home page happy boxes
		if ((activeMQ === 'L') || (activeMQ === 'M')) {
			
			// Home page target: L / M
			if($('body.home').length !== 0) {
				
				// Activate smooth scroll on the more content button located in the banenr
				smooth_scroll('#more-content-button a');
				// Convenience tab buttons for home
				// This makes the whole tab clickable and not just the text
	      $('.tab').each(function () {
					if($(this).find('a')) {
						var url = $(this).find('a').attr('href');
						$(this).click(function() {
							window.open(url);
						});
					}
	      });
				
				// Unhide bottom row ...
				if($('#bottom-panel-row').css('display') === "none") {
					$('#bottom-panel-row').show();
				}
				
			} 
			
			// Set vert position of right sidebar. Disable on bio pages
			if(($('.content-title').length !== 0) && ($('.sidebar-right').length !== 0) && ($('body.bio').length === 0)) {
				var ctpos = $('.content-title').position();
				var cth = $('.content-title').height();
				var offset = 0;
				// Use offset conditions to position the top of the right sidebar
				if($('body.search-result').length !== 0) {
					offset = 68;
				} else if($('body.contact-type').length !== 0) {
					offset = -18;
				} else {
					offset = 15;
				}
				var ctb = ctpos.top + cth + offset; // 15 additional vert offset needed (was 5)
				if($('.breadcrumb').length !== 0) {
					ctb += $('.breadcrumb').height();
				}
				
				// need to apply margin on contact page manually since the second sidebar should 
				// not get top margin on tablet
				if($('body.contact-type').length === 0) {
					$('.sidebar-right').css('margin-top',ctb);
				}
			}
			
			/* ============================  HAPPY BOX SETTINGS ============================ */
			
			// HOME PAGE 
			if($('body.has-front-am.happy-box #top-panel-row').length !== 0) {
				if(!hb_element_height) hb_element_height = front_banner_height;
				$('#top-panel-row').happybox(
					{
						'type': '.panel', // element type to make happy
						'action_element_class': '.action-element',
						'canvas_element_class': '.narrow-col',
						'button_class': ".btn-primary",
						'height': hb_element_height, // was var front_banner_height, total height of the happy viewport
						'callback':happyDone
					}
				);
				front = true;
				
				// Capture callback in happyDone(), the default callback that also exposes the plugin scope
				
			}
			
			
			
			// PAGES WITH HAS-SHADOW-AM ...
			
			if($('body.has-shadow-am').length !== 0) {
				
				// Applies to multiple pages using T2 (tile) or T8 (landing) templates
				if($('body.has-shadow-am.happy-box #top-panel-row').length !== 0) {
					if(!hb_element_height) {
						hb_element_height = shadow_am_viewport_height;
					}
					$('#top-panel-row').happybox(
						{
							'type': '.panel', // element type to make happy
							'action_element_class': '.action-element',
							'canvas_element_class': '.narrow-col',
							'button_class': ".btn-primary",
							'height': hb_element_height, // was var shadow_am_viewport_height, total height of the happy viewport
							'frozen': true,
							'callback':happyDone
						}
					);
				}
				
			}
			
			// Adjust content for banner viewport height if no happy-box top-panel-row is present
			if(($('body.has-shadow-am').length !== 0) && ($('#top-panel-row').length === 0) && ($('#content-row').length !== 0)) {
				//$('#content-row').css('margin-top', shadow_am_viewport_height + 45);
			}
		} else if ((activeMQ === 'S')) {
			
			/* ============================  HAPPY BOX SETTINGS [not interactive on mobile ("S")] ============================ */
			// Note: Prepare non-interactive elements
			
			// Home page target: S
			if($('body.home').length !== 0) {
				// Remove height of the tob-panel-row
				if($('#top-panel-row').length !== 0) {
					$('#top-panel-row').height('auto');
				}
				
				// Hide bottom panel (we'll open it with the "Discover" button)
				$('#bottom-panel-row').hide();
				
				// Wire up "Discover" button to reveal bottom content tabs
				$('.homepage-title').css('cursor','pointer');
				$('.homepage-title').click(function() {
					if($('#bottom-panel-row').css('display') === "none") {
						$('#bottom-panel-row').show();
					} else {
						$('#bottom-panel-row').hide();
					}
				});
			} else {
				refresh_right_panel();
			}
			
			// process mobile calendar ... TODO: Replace with plugin eventually
			if($('body.calendar').length !== 0) {
				
				// Inject menu-icon into "filter by" link
				$('#left-area h3.menu-icon a').html(get_menu_icon());
				$('#left-area h3').removeClass('menu-icon');	
				
				// Process calendar
				var eventId = ".fc-event";
	      $(eventId).each(function () {
					
					$(this).parent().parent().addClass("eventful");
					
	      });
			}
			
		}
		
    if (debug) {
        $(window).resize(function () {
					if(typeof window.console !== "undefined") {
            window.console.log($(this).width());
						window.console.log('Screen size: ' + currentMQ);
					}
        });
    }
		
		
		/******************************************** END MAIN ************************************** */
		
	});
})(jQuery);