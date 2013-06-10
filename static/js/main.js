var clips = [];

function millisToTime(s) { 
// http://stackoverflow.com/questions/9763441/milliseconds-to-time-in-javascript
  function addZ(n) {
    return (n<10? '0':'') + n;
  }
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  var parts = [], hms = 0;
  if (secs) { parts.push(secs) } else { parts.push(0) };
  if (mins) { parts.push(mins) } else { parts.push(0) };
  if (hrs) parts.push(hrs);
  hms = _(parts).map(addZ).reverse().join(':');
  if (ms) return hms + '.' + ms;
  return hms; // no decimal for zero
}

function timeToMillis(s) {
    var hrs = 0, mins = 0, secs = 0;
    if (s.indexOf(':') == 0) s = "0" + s;
    parts = s.split(':');
    parts.reverse();
    secs = parseFloat(parts[0]);
    if (parts.length > 1) {
        mins = parseInt(parts[1]);
        if (parts.length > 2) {
            hrs = parts[2];
        }
    }
    
    return (secs * 1000) + (mins * 60 * 1000) + (hrs * 60 * 60 * 1000);
}


SC.initialize({
    client_id: "5ba7fd66044a60db41a97cb9d924996a",
    redirect_uri: "http://www.soundcite.com"
});

function sc_resolve(url,callback) {
    SC.get('http://api.soundcloud.com/resolve.json', {url: url}, callback);
}

// Get the song
function load_sc_player() {
    $("#url").removeClass("error");
    var baseURL = $('#url').val();
    SC.oEmbed(baseURL,
    function(data) {
        if (data) {
            window.data = data;
            $('#player_container').empty();
            $("#times")[0].reset();
            $('#player_container').html(data.html);
            $('#explainer').css('display', 'none');
            $('#creation_box').css('display', 'block');
            setTime("#start_field",millisToTime(0));
            var new_iframe = $('#player_container iframe')[0];
            $(new_iframe).attr('id','player_iframe');
            var widget = SC.Widget('player_iframe');
            widget.bind(SC.Widget.Events.READY,set_end_from_widget);
        } else {
            $("#url").addClass('error');
        }
    });
}
$('.connector').click(load_sc_player);
$("#url").keyup(function(event) { 
    $("#url").removeClass("error");
    if(event.keyCode == 13) { load_sc_player();}
});

// Player functionality

function setTime(field_id, position) { 
    position = String(position);
    
    if (position.match(/^\d+$/)) { // all digits is good
        $(field_id).val(millisToTime(position));
    } else { // for now, trust everything
        $(field_id).val(position);
    }
    validate_form();
}

function getTimeAsMillis(field_id) {
    // get the time from the given field, converting from h:m:s.s to millis if need be
    var value = $(field_id).val();
    if (value.indexOf('.') == -1 && value.indexOf(':') == -1) return value;
    return timeToMillis(value);
}

$("#start_btn").click(function() {
    var widget = SC.Widget("player_iframe");
    widget.getPosition(function(position) {
        setTime("#start_field", millisToTime(position))
    });
});

$("#end_btn").click(function() {
    var widget = SC.Widget("player_iframe");
    var clicked = $(this);
    widget.getPosition(function(position) {
        setTime("#end_field", millisToTime(position))
    });
});

var clip_base_template = _.template($("#clip-base").html().trim());
var clip_preview_template = _.template($("#clip-preview").html().trim());

$('#audition_area').on("click",".delete-clip", function() {
    var the_sound = $(this).prev('.soundcite');
    for (i=0; i<clips.length; i++) {
        if(the_sound[0] === clips[i].el) {
            clips.splice(i, 1);
        }
    }
    $(this).parents(".clip").remove();
});

$('#button_wrapper').on("click", $('#create_clip'), function() {
    if (validate_form()) {
        var widget = SC.Widget("player_iframe");
        widget.pause();
        widget.getCurrentSound(function(sound_metadata) {
            var clip_html = clip_base_template({
                id: sound_metadata.id,
                start: getTimeAsMillis('#start_field'),
                end: getTimeAsMillis('#end_field'),
                text: $('#linktext').val()
            });
            $('#audition_area').css('display', 'block');
            $('#audition_area_status').css('display', 'none');
            $('#audition_area').prepend(clip_preview_template({clip_html: clip_html}))
            $('#audition_area .clip:first').find('.soundcite').each(function() {
                clips.push(new soundcite.Clip(this));
            });
        });
    }
})

$("#example").click(function() {
  $("#url").val($(this).text());
  load_sc_player();
});

function validate_form() {
    $("#create_clip").removeAttr("disabled");
    var valid = true;
    valid = validate_time_field($("#start_field")) && valid;
    valid = validate_time_field($("#end_field")) && valid;
    valid = validate_required($("#linktext")) && valid;
    if (!valid) $("#create_clip").attr("disabled","disabled");
    return valid;
}
function validate_time_field($el) {
    $el.removeClass("error");
    var value = $el.val();
    if (value && value.match(/^\d+$/)) {
        $el.val(millisToTime(value));
    } else if (isNaN(timeToMillis(value))) {
        $el.addClass("error");
        return false;
    }
    return true;
}
function validate_required($el) {
    $el.removeClass("error");
    
    if ($el.val().match(/.+/)) {
        return true;
    }
    $el.addClass("error");
    return false
}

function set_end_from_widget() {
    console.log('set_end_from_widget');
    var widget = SC.Widget("player_iframe");
    widget.getDuration(function(duration) { setTime("#end_field",millisToTime(duration)); validate_time_field($("#end_field")); })
}
$("#start_field,#end_field,#linktext").blur(validate_form);

$("#linktext").keyup(function() {
    validate_form();
});

$('#header').click(function() {
    $('#header').select();
});

$('#audition_area').on('click', 'textarea.code', function() {
    $(this).select();
});

