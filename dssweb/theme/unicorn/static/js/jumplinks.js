$(function () {
	
	var headingTag = "h2";
	var parentDiv = "#content";
	var excludeTitle = "Jumplinks";
	
    /* CREATES JUMPLINKS MENU   */
    if ($(parentDiv+' '+headingTag).length != 0) {
	    var cnt = $(parentDiv+' '+headingTag).length;
	    var idx = 1;
	    var anchorsTxt = [];
	    anchorsTxt += '<ul id="jumplinks-anchors">' + "\n";

	    $(parentDiv+' '+headingTag).each(function () {
				if($(this).text() !== excludeTitle) {
		      var anchorTxt = 'jumplinks-anchor-' + idx;
		      if ((idx > 1) && (idx < cnt)) {
						  // hidden-xs bootstrap attribute added to hide on mobile
		          anchorsTxt += '<li class="leaf first hidden-xs">';
		      } else if (idx == cnt) {
		          anchorsTxt += '<li class="leaf last hidden-xs">';
		      } else {
		          anchorsTxt += '<li class="leaf hidden-xs">';
		      }
		      anchorsTxt += '<a href="#' + anchorTxt + '">' + $(this).html() + '</a>';
		      anchorsTxt += '</li>' + "\n";

		      // Add id to heading
		      $(this).attr('id', anchorTxt);

		      ++idx;
				}
	    });

	    anchorsTxt += '</ul>' + "\n";
	    $('#jumplinks').append(anchorsTxt);
    }
	
});