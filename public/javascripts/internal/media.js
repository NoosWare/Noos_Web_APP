'use strict'
var media = {};

media.get_stream = function(success, error) {
  // Older browsers might not implement mediaDevices at all, so we set an empty object first
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }

  // Some browsers partially implement mediaDevices. We can't just assign an object
  // with getUserMedia as it would overwrite existing properties.
  // Here, we will just add the getUserMedia property if it's missing.
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {

      // First get ahold of the legacy getUserMedia, if present
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      // Some browsers just don't implement it - return a rejected promise with an error
      // to keep a consistent interface
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }

      // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }

  navigator.mediaDevices.getUserMedia({ audio: true, video: true })
  .then(success)
  .catch(error);
}

  



























  /* Webcam.set({
     image_format: 'jpeg',
     jpeg_quality: 100,
     upload_name: 'file'
     });

     Webcam.attach('#camera'); */
  /* var Webcam = new JpegCamera("#camera");

     function readable_json(json) {
     return JSON.stringify(json, function(key, val) {
     return val.toFixed ? Number(val.toFixed(3)) : val;
     }, 2);
     }

     function new_snap(data_uri) {
     $('#result').html('<img src="' + data_uri + '"/>');

     Webcam.on('uploadProgress', function(progress) {
     console.log('progress: ' + progress);
     var percentage = progress * 100;
     $('.progress-bar').attr('aria-valuenow', percentage);
     $('.progress-bar').attr('style', 'width: ' + percentage + '%');
     });

     Webcam.on('uploadComplete', function(code, text) {
     json = JSON.parse(text);
     console.log('upload completed: ', json);
     if (code != 200) {
     $('#json-result').html('<div class="alert alert-danger" role="alert">' + text + '</div>');
     }
  // $('.progress-bar').attr('aria-valuenow', 0);
  $('#json-result').html('<div class="alert alert-primary" role="alert">' + readable_json(json) + '</div>');
  });

  Webcam.upload(data_uri, '/upload-image');
  }

  function upload_click(event) {
  event.preventDefault();
  console.log('upload_clicked');
  // Webcam.snap(new_snap);

  var snapshot = Webcam.capture();
  snapshot.show(); // Display the snapshot
  }

  $('#upload-image').click(upload_click); */
// });
