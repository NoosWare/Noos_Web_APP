'use strict'

$(function() {

  var streaming = false;
  var video = document.querySelector('video');
  var canvas = document.querySelector('canvas');
  var width = 640;   // We will scale the photo width to this
  var height = 0; // This will be computed based on the input stream
  $('video').click(take_picture);
  $('canvas').click(displayer.show_stream);
  media.get_stream(success_media, error_media);

  function success_media(stream) {
    console.log('success_media', stream);
    media.play_stream(video, stream);
  }

  function error_media(error) {
    $('body').html(err.name + ": " + err.message +
             '<br> Please use firefox, other browser' +
             ' will be maybe supported in a few commits');
    console.log(err.name + ": " + err.message);
  }

  function take_picture() {
    console.log('take_picture');
    var context = canvas.getContext('2d');
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      var data = canvas.toDataURL('image/png');
      upload(data);
    } else {
      clear_photo();
    }
  }

  function clear_photo() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/jpg', 1.0);
  }

  video.addEventListener('canplay', function(ev){
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth/width);

      // Firefox currently has a bug where the height can't be read from
      // the video, so we will make assumptions if this happens.

      if (isNaN(height)) {
        height = width / (4/3);
      }

      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
  }, false);

  function upload(data) {
    $.post({
      url: "/upload-image",
      data: { 
        file: data
      }
    }).done(function(json) {
      console.log('image_uploaded', json); 
      displayer.show_json(json);
      displayer.show_result(data, json);
    })
    .fail(function(xhr, textStatus, errorThrown) {
      console.log('upload error', xhr, textStatus, errorThrown);
      $('#json-result').html('<div class="alert alert-danger" ' +
           'role="alert">Could not get the result.</div>');
    });
  }
});
