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
          this.$hours = $('<div/>');
          this.$halls = $('<div/>');
          this.$hours.addClass('timetable-hours');
          this.$halls.addClass('timetable-halls');
          this.$root
            .append(this.$hours)
            .append(this.$halls);

          this.data = data;

          this.updateHoursScope();
          this.renderHours();
          this.showEvents();
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

        Timetable.prototype.showEvents = function(){
          for(var i = 0, l = this.data.length; i < l; i++){
            var hall = new Hall(this.data[i]);
            this.$halls.append(hall.getNode());
          }
        };


        return Timetable;
      }());

      new Timetable($(this), timetableData);
    });
  };
}());