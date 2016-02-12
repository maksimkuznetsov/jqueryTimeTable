(function(){
  var defaultOptions = {
    hourHeight: 50
  };

  $.fn.timetable = function(timetableData, options){
    this.each(function(){
      options = $.extend(true, {}, defaultOptions, options);

      var Event = (function(){
        var Event = function(data){
          this.title = data.title || '';
          this.start = new Date(data.start);
          this.end = new Date(data.end);

          this.init();
        };

        Event.prototype.init = function(){
          this.renderHtml();
        };

        Event.prototype.renderHtml = function(){
          this.$node = $('<div/>');
          this.$node.addClass('timetable-event');
          this.$node.append(this.title);
        };

        Event.prototype.getNode = function(){
          this.updatePosition();
          return this.$node;
        };

        Event.prototype.updatePosition = function(){
          var top = 0,
              height = 0;
          startHour = options.minHour || 0;
          top += (this.start.getHours() - startHour);
          top += this.start.getMinutes() / 60;
          top = top * options.hourHeight;
          height += this.end.getHours() - this.start.getHours();
          height += (this.end.getMinutes() - this.start.getMinutes()) / 60;
          height = height * options.hourHeight;
          

          this.$node.css({
            top: top,
            height: height - 1
          });
        };

        return Event;
      }());

      var Hall = (function(){
        var Hall = function(data){
          this.title = data.title || '';
          this.events = [];

          this.renderHtml();
          this.setEvents(data.events);
        };

        Hall.prototype.renderHtml = function(){
          this.$node = $('<div/>');
          this.$node.addClass('timetable-hall');
          this.$node.append('<div class="timetable-hall-header">' + this.title + '</div>');
          this.$events = $('<div/>');
          this.$events.addClass('timetable-hall-events');
          this.$node.append(this.$events);
        };

        Hall.prototype.setEvents = function (events){
          if(!events || events.length === 0)
            return;

          for(var i = 0, l = events.length; i < l; i++){
            this.setEvent(events[i]);
          }
        };

        Hall.prototype.setEvent = function(data){
          var event = new Event(data);
          this.events.push(event);
          this.$events.append(event.getNode());
        };

        Hall.prototype.getNode = function(){
          return this.$node;
        };

        return Hall;
      }());

      var Timetable = (function(){
        var Timetable = function($root, data){
          this.$root = $root;
          this.$content = $('<div/>');
          this.$hours = $('<div/>');
          this.$hallsWrap = $('<div/>');
          this.$hallsScrollWrap = $('<div/>');
          this.$halls = $('<div/>');
          this.$content.addClass('timetable-content');
          this.$hours.addClass('timetable-hours');
          this.$hallsWrap.addClass('timetable-halls-wrap');
          this.$hallsScrollWrap.addClass('timetable-halls-scroll-wrap');
          this.$halls.addClass('timetable-halls');
          this.$hallsScrollWrap.append(this.$halls);
          this.$hallsWrap.append(this.$hallsScrollWrap);
          this.$content
            .append(this.$hours)
            .append(this.$hallsWrap);
          this.$root.append(this.$content);

          this.data = data;

          this.updateHoursScope();
          this.renderHours();
          this.showEvents();
          this.setDragable();
        };

        Timetable.prototype.setDragable = function(){
          var curXPos = null,
              curDown = false,
              $wrap = this.$hallsWrap,
              $elem = this.$hallsScrollWrap,
              elem = $elem[0];

          window.addEventListener('mousemove', function(e){ 
            if(curDown === true){
              if(curXPos == null)
                curXPos = e.pageX;
              $elem.scrollLeft($elem.scrollLeft() + ((curXPos - e.pageX) / 16));
            }
          });

          elem.addEventListener('mousedown', function(e){ 
            curDown = true; 
            $wrap.addClass('grabbing');
          });
          elem.addEventListener('mouseup', function(e){ 
            curDown = false; 
            curXPos = null; 
            $wrap.removeClass('grabbing');
          });
          $elem.on('scroll', checkScrollable);
          $(window).on('resize', checkScrollable);
          checkScrollable()
          function checkScrollable(){
            if($elem.scrollLeft() > 0){
              $wrap.addClass('scrollable-left');
            } else {
              $wrap.removeClass('scrollable-left');
            }

            if($elem.scrollLeft() < $elem[0].scrollWidth - $elem.width()){
              $wrap.addClass('scrollable-right');
            } else {
              $wrap.removeClass('scrollable-right');
            }
          };
        };

        Timetable.prototype.updateHoursScope = function(){
          var minHour = 23,
              maxHour = 0;
          for(var i = 0, l = this.data.length; i < l; i++){
            for (var eI = 0; eI < this.data[i].events.length; eI++){
              var event = this.data[i].events[eI],
                  start = new Date(event.start),
                  end = new Date(event.end);
              if(start.getHours() < minHour)
                minHour = start.getHours();
              if(end.getHours() > maxHour)
                maxHour = end.getHours();

            }
          }
          options.minHour = minHour;
          options.maxHour = maxHour;
        };

        Timetable.prototype.renderHours = function(){
          for(var i = options.minHour; i <= options.maxHour; i++){
            var $hour = $('<div/>');
            $hour.addClass('timetable-hour');

            $hour.append('<span class=""timetable-hour-label>' + i + ':00</span>');
            this.$hours.append($hour);
            $hour.css({
              height: options.hourHeight
            });
          }

        };

        Timetable.prototype.countHallsWidth = function(){
          var hallWidth = this.$halls.children().eq(0).width();
          this.$halls.width(this.data.length * hallWidth);
        };

        Timetable.prototype.showEvents = function(){
          for(var i = 0, l = this.data.length; i < l; i++){
            var hall = new Hall(this.data[i]);
            this.$halls.append(hall.getNode());
          }
          this.countHallsWidth();
        };


        return Timetable;
      }());

      new Timetable($(this), timetableData);
    });
  };


}());