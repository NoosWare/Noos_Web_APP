'use strict'

var displayer = {};
$(function() {

  function writeMessage(canvas, message) {
    var context = canvas.getContext('2d');
    // context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '18pt Calibri';
    context.fillStyle = 'black';
    context.fillText(message, 10, 25);
  }

  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  function draw_rect(face)
  {
    // console.log('picture:', canvas_picture.width, canvas_picture.height);
    // console.log('drawing:', canvas_drawing.width, canvas_drawing.height);
    var x_ratio = canvas_drawing.width / canvas_picture.width;
    var y_ratio = canvas_drawing.height / canvas_picture.height;
    var x_begin = Math.floor(face.up_left_point.x * x_ratio);
    var y_begin = Math.floor(face.up_left_point.y * y_ratio);
    var x_end = Math.floor(face.down_right_point.x * x_ratio);
    var y_end = Math.floor(face.down_right_point.y * y_ratio);
    ctx.lineWidth = 5;
    ctx.strokeRect(x_begin, y_begin, x_end - x_begin, y_end - y_begin);

    console.log('ratios', x_ratio, y_ratio);
    console.log('width test: ', $(window).width(), canvas_drawing.width);
    console.log('height test: ', $(window).height(), canvas_drawing.height);
    console.log('begin: ', face.up_left_point.x, face.up_left_point.y,
                           face.down_right_point.x, face.down_right_point.y);
    console.log('end: ', x_begin, y_begin, x_end, y_end);
  }

  displayer.draw_video = function()
  {
    if(video.paused || video.ended) return false;
    ctx.drawImage(video, 0, 0, canvas_drawing.width, canvas_drawing.height);
    displayer.draw_results();
    var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
    writeMessage(canvas_drawing, message);
    setTimeout(displayer.draw_video, 20);
  }

  displayer.draw_results = function()
  {
    if (json == undefined) return;
    var faces = json.face_detection.faces;
    // var human = json.face_recognition.humans; 
    if (faces && faces.length) {
      for (var i = 0; i < faces.length; i++) {
        draw_rect(faces[i]);
      }
    }

  }

  displayer.update_json = function(new_json)
  {
    json = new_json;
    var html = JSON.stringify(json, null, '\t').replace(/\n/g, '<br>');
    html = html.replace(/\t/g, '<span style="margin-left: 20px">');
    $('#json-result').html('<div class="alert alert-primary" ' +
         'role="alert">' + html + '</div>');
  }

  displayer.show_json = function()
  {
    $('#json-modal').modal();
  }

  var video = document.querySelector('video');
  var canvas_picture = document.getElementById('picture');
  var canvas_drawing = document.getElementById('drawing');
  canvas_drawing.width = $(window).width();
  canvas_drawing.height = $(window).height();
  var ctx = canvas_drawing.getContext('2d');

  var json = undefined;

  var mousePos;
  $('canvas#drawing').click(displayer.show_json);
  video.addEventListener('play', displayer.draw_video);
  canvas_drawing.addEventListener('mousemove', function(evt) {
    mousePos = getMousePos(canvas_drawing, evt);
  }, false);
});
