var clips = [];

// Invoke SoundCloud player methods

SC.initialize({
    client_id: "5ba7fd66044a60db41a97cb9d924996a",
    redirect_uri: "http://www.soundcite.com"
});

// Get the song

function load_sc_player() {
    var baseURL = $('#url').val();
    $.getJSON('https://soundcloud.com/oembed?callback=?', {
        format: 'js',
        url: baseURL,
        show_comments: 'false'
    },
    function(data) {
        $('#player_container').empty();
        $('#player_container').html(data.html);
        var sc_url = $('#player_container').find('iframe').attr('src')
        $('#player_container').find('iframe').attr('src', sc_url)
        var new_iframe = $('#player_container').find('iframe');
        $('#player_container').empty();
        $('#player_container').html(new_iframe);
        $('#explainer').css('display', 'none');
        $('#creation_box').css('display', 'block');
    });
}
$('.connector').click(load_sc_player);
$("#url").keyup(function(event) { if(event.keyCode == 13) { load_sc_player();}});

// Player functionality

$(".start_btn").click(function() {
    var widget_iframe = $('#player_container').find('iframe');
    var widget = SC.Widget(widget_iframe[0]);
    var clicked = $(this);
    widget.getPosition(function(position) {
        clicked.prev('.start').attr('value', Math.round(position));
    });
});

$(".end_btn").click(function() {
    var widget_iframe = $('#player_container').find('iframe');
    var widget = SC.Widget(widget_iframe[0]);
    var clicked = $(this);
    widget.getPosition(function(position) {
        clicked.prev('.end').attr('value', Math.round(position));
    });
});

$('#button_wrapper').on("click", $('.test_btn'), function() {
    var widget_iframe = $('#player_container').find('iframe');
    var widget = SC.Widget(widget_iframe[0]);
    start_time = $('input').prev('.start').val();
    end_time = $('input').prev('.end').val();
    var text = $('#linktext').val();
    widget.getCurrentSound(function(currentSound) {
        var elem = $('<span>').attr('data-id', currentSound.id).attr('data-start', start_time).attr('data-end', end_time).attr('class', 'soundcite').text(text);
        var clip = new soundcite.Clip(elem[0]);
        clips.push(clip)
        SC.stream(clip.id, function(sound) {
            sound.load({
                onload: function() {
                    console.log('hi');
                    $('#audition_area').append("<div class='clip'>")
                    $('.clip:last').append(clip.el);
                    $('.clip:last').append("<input type='button' value='delete' class='btn delete'>");
                    $('.clip:last').append('<textarea readonly="readonly" class="code">&lt;span class="soundcite" data-id="' + clip.id + '" data-start="' + clip.start + '" data-end="' + clip.end + '"&gt;' + $(clip.el).text() + '&lt;/span&gt;</textarea>');
                    $('#audition_area').append("</div>");

                    $('.btn.delete').click(function() {
                        var the_sound = $(this).prev('.soundcite');
                        for (i=0; i<clips.length; i++) {
                            if(the_sound[0] === clips[i].el) {
                                clips.splice(i, 1);
                            }
                        }
                        $(this).parents(".clip").remove();
                    });
                }
            });
        });
    });
})

$('#embed_clips').click(function() {
    $('#header').html(
        "&lt;link href='//cdn.knightlab.com/libs/soundcite/latest/css/player.css' rel='stylesheet' type='text/css'&gt;\n"
        + "&lt;script type='text/javascript' src='//connect.soundcloud.com/sdk.js'&gt;&lt;/script&gt;\n"
        + "&lt;script type='text/javascript' src='//cdn.knightlab.com/libs/soundcite/latest/js/soundcite.min.js'&gt;&lt;/script&gt;"
    );
    for (i=0; i<clips.length; i++) {
    }
    $('#code').css('display', 'block');
});

// Presenting the code


$('#header').click(function() {
    $('#header').select();
});

$('#audition_area').on('click', 'textarea.code', function() {
    $(this).select();
});

