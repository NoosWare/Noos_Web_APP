'use strict'
var media = {};

$(function() {
  media.get_stream = function(success, error) {
    console.log('get_stream');
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
          console.error('getUserMedia is not implemented in this browser');
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
    } else {
      console.log('getUserMedia is implemented by the browser');
    }
    console.log('calling getUserMedia');
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then(function(stream) { console.log('success getUserMedia'); success(stream); })
      .catch(function(err) { console.error('error getUserMedia', err); error(err); });
    console.log('getUserMedia passed');
  };

  media.play_stream = function(video, stream) {
    console.log('play_stream');
    // Older browsers may not have srcObject
    if ('srcObject' in video) {
      video.srcObject = stream;
    } else {
      // Avoid using this in new browsers, as it is going away.
      video.src = window.URL.createObjectURL(stream);
    }
    video.onloadedmetadata = function(e) {
      video.play();
    };
  };
});
