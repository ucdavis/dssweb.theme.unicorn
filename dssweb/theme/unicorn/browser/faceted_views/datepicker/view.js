/* calendarPicker.js
*/
jQuery.fn.calendarPicker = function(options) {
  // --------------------------  start default option values --------------------------
  if (!options.date) {
    options.date = new Date();
  }

  if (typeof(options.years) == "undefined")
    options.years=1;

  if (typeof(options.months) == "undefined")
	  options.months=6;

  if (typeof(options.days) == "undefined")
    options.days=14;

  if (typeof(options.showDayArrows) == "undefined")
    options.showDayArrows=true;

  if (typeof(options.useWheel) == "undefined")
    options.useWheel=false;

  if (typeof(options.callbackDelay) == "undefined")
    options.callbackDelay=500;

  if (typeof(options.monthNames) == "undefined")
    options.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if (typeof(options.dayNames) == "undefined")
    options.dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // --------------------------  end default option values --------------------------
  
  var calendar = {currentDate: options.date};
  calendar.options = options;

  //build the calendar on the first element in the set of matched elements.
  var theDiv = this.eq(0);//$(this);
  theDiv.addClass("calBox");

  //empty the div
  theDiv.empty();


  var divYears = $("<div>").addClass("calYear");
  var divMonths = $("<div>").addClass("calMonth");
  var divDays = $("<div>").addClass("calDay");


  theDiv.append(divYears).append(divMonths).append(divDays);

  calendar.changeDate = function(date) {
    calendar.currentDate = date;

    var fillYears = function(date) {
      var year = date.getFullYear();
      var t = new Date();
      divYears.empty();
      var nc = options.years*2+1;
      var w = parseInt((theDiv.width()-4-(nc)*4)/nc)+"px";
      for (var i = year - options.years; i <= year + options.years; i++) {
        var d = new Date(date);
        d.setFullYear(i);
        var span = $("<span>").addClass("calElement").attr("millis", d.getTime()).html(i).css("width",w);
        if (d.getYear() == t.getYear())
          span.addClass("today");
        if (d.getYear() == calendar.currentDate.getYear())
          span.addClass("selected");
        divYears.append(span);
      }
    }

    var fillMonths = function(date) {
      var month = date.getMonth();
      var t = new Date();
      divMonths.empty();
      var oldday = date.getDay();
      var nc = options.months*2+1;
      var w = parseInt((theDiv.width()-4-(nc)*4)/nc)+"px";
      for (var i = -options.months; i <= options.months; i++) {
        var d = new Date(date);
        var oldday = d.getDate();
        d.setMonth(month + i);

        if (d.getDate() != oldday) {
          d.setMonth(d.getMonth() - 1);
          d.setDate(28);
        }
        var span = $("<span>").addClass("calElement").attr("millis", d.getTime()).html(options.monthNames[d.getMonth()]).css("width",w);
        if (d.getYear() == t.getYear() && d.getMonth() == t.getMonth())
          span.addClass("today");
        if (d.getYear() == calendar.currentDate.getYear() && d.getMonth() == calendar.currentDate.getMonth())
          span.addClass("selected");
        divMonths.append(span);

      }
    }

    var fillDays = function(date) {
      var day = date.getDate();
      var t = new Date();
      divDays.empty();
      var nc = options.days*2+1;
      var w = parseInt((theDiv.width()-4-(options.showDayArrows?32:0)-(nc)*4)/(nc-(options.showDayArrows?2:0)))+"px";
      for (var i = -options.days; i <= options.days; i++) {
        var d = new Date(date);
        d.setDate(day + i)
        var span = $("<span>").addClass("calElement").attr("millis", d.getTime())
        if (i == -options.days && options.showDayArrows) {
          span.addClass("prev");
        } else if (i == options.days && options.showDayArrows) {
          span.addClass("next");
        } else {
          span.html("<span class=dayNumber>" + d.getDate() + "</span><br>" + options.dayNames[d.getDay()]).css("width",w);
          if (d.getYear() == t.getYear() && d.getMonth() == t.getMonth() && d.getDate() == t.getDate())
            span.addClass("today");
          if (d.getYear() == calendar.currentDate.getYear() && d.getMonth() == calendar.currentDate.getMonth() && d.getDate() == calendar.currentDate.getDate())
            span.addClass("selected");
        }
        divDays.append(span);

      }
    }

    var deferredCallBack = function() {
      if (typeof(options.callback) == "function") {
        if (calendar.timer)
          clearTimeout(calendar.timer);

        calendar.timer = setTimeout(function() {
          options.callback(calendar);
        }, options.callbackDelay);
      }
    }

    fillYears(date);
    fillMonths(date);
    fillDays(date);

    deferredCallBack();

  }

  theDiv.click(function(ev) {
    var el = $(ev.target).closest(".calElement");
    if (el.hasClass("calElement")) {
      calendar.changeDate(new Date(parseInt(el.attr("millis"))));
    }
  });

  calendar.changeDate(options.date);

  return calendar;
};


/* DSS Datepicker Widget
*/
Faceted.DSSDatepickerWidget = function(wid){
  this.wid = wid;
  this.widget = jQuery('#' + wid + '_widget');
  this.widget.show();
  this.title = jQuery('legend', this.widget).html();
  this.selected = [];
  this.button = jQuery('input[type=submit]', this.widget);
  this.datepicker = this.widget.find('div.datepicker');

  var js_widget = this;

  // Default value
  var input = jQuery('#' + this.wid);
  var value = this.datepicker.data('picked-date')
  if(value){
    this.selected = this.datepicker;
    Faceted.Query[this.wid] = [value];
  }
  //Values based on width
  var width = $(window).width();
  var oday = 10;
  if (width > 992) {
	  oday = 15;
  } else if (width < 768 && width > 451) {
  oday = 10; 
  }
  else {
	  oday = 2; }

  
  this.datepicker.calendarPicker({
    callback: function(cal) {
      js_widget.do_query(cal)
    },
    days: oday
  });

  /*this.datepicker.calendarPicker({callback: function(cal) {
    js_widget.do_query(cal)
  }}); */

  // Bind events
  jQuery(Faceted.Events).bind(Faceted.Events.QUERY_CHANGED, function(evt){
    js_widget.synchronize();
  });
  jQuery(Faceted.Events).bind(Faceted.Events.RESET, function(evt){
    js_widget.reset();
  });
};

Faceted.DSSDatepickerWidget.prototype = {
  text_change: function(element, evt){
    this.do_query(this.datepicker);
    jQuery(element).removeClass("submitting");
  },

  do_query: function(cal) {
    var input = jQuery('#' + this.wid);
    var date = cal.currentDate;
    var value = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

    if(!cal){
      this.selected = [];
      return Faceted.Form.do_query(this.wid, []);
    }
    this.selected = [cal];

    var current = Faceted.Query[this.wid];
    current = current ? current : [];
    if(value && !(value in current)){
      current = [value];
    }
    return Faceted.Form.do_query(this.wid, current);
  },

  reset: function(){
    this.selected = [];
    jQuery('#' + this.wid).val('');
    this.datepicker.data('data-picked-date', '');
  },

  synchronize: function(){
    var value = Faceted.Query[this.wid];
    if(!value){
      this.reset();
      return;
    }

    if (value === this.datepicker.data('picked-date')) {
      return;
    }

    // var input = jQuery('#' + this.wid);
    var date = new Date(value);
    // input.attr('value', value);
    var js_widget = this;
    this.datepicker.data('picked-date', value);
    this.selected = [this.datepicker];
  },

  criteria: function(){
    var html = [];
    var title = this.criteria_title();
    var body = this.criteria_body();
    if(title){
      html.push(title);
    }
    if(body){
      html.push(body);
    }
    return html;
  },

  criteria_title: function(){
    if(!this.selected.length){
      return '';
    }

    var link = jQuery('<a href="#">[X]</a>');
    link.attr('id', 'criteria_' + this.wid);
    link.attr('title', 'Remove ' + this.title + ' filters');
    var widget = this;
    link.click(function(evt){
      widget.criteria_remove();
      return false;
    });

    var html = jQuery('<dt>');
    html.attr('id', 'criteria_' + this.wid + '_label');
    html.append(link);
    html.append('<span>' + this.title + '</span>');
    return html;
  },

  criteria_body: function(){
    if(!this.selected.length){
      return '';
    }

    var widget = this;
    var html = jQuery('<dd>');
    var elements = Faceted.Query[this.wid];
    elements = elements ? elements: [];
    jQuery.each(elements, function(){
      var label = this.toString();
      if(label.length>0){
          var span = jQuery('<span class="faceted-text-criterion">');
          var link = jQuery('<a href="#">[X]</a>');
          link.attr('id', 'criteria_' + widget.wid + '_' + label);
          link.attr('title', 'Remove ' + label + ' filter');
          link.click(function(evt){
            widget.criteria_remove(label);
            return false;
          });
          span.append(link);
          jQuery('<span>').text(label).appendTo(span);
          html.append(span);
      }
    });
    return html;
  },

  criteria_remove: function(value){
    jQuery('#' + this.wid).val('');
    if(!value){
      this.selected = [];
      this.do_query();
      return;
    }
    jQuery('#' + this.wid + '_place_current', this.widget).attr('checked', true);
    var element = jQuery('input[type=text]', this.widget);
    var current = Faceted.Query[this.wid];
    var index = jQuery.inArray(value, current);
    if(index == -1){
      return;
    }
    current.splice(index, 1);
    Faceted.Query[this.wid] = current;
    this.do_query(element);
  }
};

Faceted.initializeDSSDatepickerWidget = function(evt){
  jQuery('div.faceted-datepicker-widget').each(function(){
    var wid = jQuery(this).attr('id');
    wid = wid.split('_')[0];
    Faceted.Widgets[wid] = new Faceted.DSSDatepickerWidget(wid);
  });
};

jQuery(document).ready(function(){
  jQuery(Faceted.Events).bind(
    Faceted.Events.INITIALIZE,
    Faceted.initializeDSSDatepickerWidget);
});