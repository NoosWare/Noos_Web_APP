'use strict'

$(function() {

  function success_media(stream)
  {
    console.log('success_media', stream);
    media.play_stream(video, stream);
  }

  function error_media(error)
  {
    console.error(err.name + ": " + err.message, error);
    $('#error-content').html(err.name + ": " + err.message);
    $('#error-modal').modal();
  }

  function take_picture()
  {
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      var data = canvas.toDataURL('image/jpg', 1.0);
      upload(data);
    } else {
      clear_photo();
    }
  }

  function clear_photo()
  {
    console.error('clear_photo');
    $('#error-content').html('Error: clear_photo called');
    $('#error-modal').modal();
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  function setup_video_and_canvas(event)
  {
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth / width);

      // Firefox currently has a bug where the height can't be read from
      // the video, so we will make assumptions if this happens.

      if (isNaN(height)) {
        height = width / (4/3);
      }

      video.muted = true;
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
      take_picture();
    }
  }

  function upload(data)
  {
    $.post({
      url: "/upload-image",
      data: { 
        file: data
      }
    })
    .done(function(json) {
      displayer.update_json(json);
      take_picture();
    })
    .fail(function(xhr, textStatus, errorThrown) {
      $('#error-content').html('<div class="alert alert-danger" ' +
           'role="alert">Could not get the platform result.</div>');
      $('#error-modal').modal();
      console.log('upload error', xhr, textStatus, errorThrown);
      $('#json-result').html('');
    });
  }

  var streaming = false;
  var video = document.querySelector('video');
  var canvas = document.getElementById('picture');
  var context = canvas.getContext('2d');
  var width = 640;   // We will scale the photo width to this
  var height = 0;    // This will be computed based on the input stream
  media.get_stream(success_media, error_media);
  video.addEventListener('canplay', setup_video_and_canvas, false);
});
