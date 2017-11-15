'use strict'

var displayer = {};
$(function() {

  function construct_line(json, title) {
    return title + ': ' + json.info +
           ' (' + Math.floor(json.probability * 100) + '%)';
  }

  function draw_text(ctx, txt, x, y, padding) {
    var padding = padding || 5;
    ctx.save();
    var font = '20px Arial';
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'white';

    var width = ctx.measureText(txt).width;
    ctx.fillRect(x - padding, 
                 y - padding,
                 width + (padding * 2),
                 parseInt(font, 10) + (padding * 2));

    ctx.fillStyle = 'black';
    ctx.fillText(txt, x, y);

    ctx.restore();
  }

  function draw_face(face)
  {
    var x_ratio = canvas_drawing.width / canvas_picture.width;
    var y_ratio = canvas_drawing.height / canvas_picture.height;
    ctx.lineWidth = 10;
    ctx.strokeRect(face.x * x_ratio,
                   face.y * y_ratio,
                   face.width * x_ratio,
                   face.height * y_ratio);
    var gender  = construct_line(face.gender,  'gender');
    var age     = construct_line(face.age,     'age');
    var emotion = construct_line(face.emotion, 'emotion');
    draw_text(ctx,  gender, face.x * x_ratio, face.y * y_ratio +  0);
    draw_text(ctx,     age, face.x * x_ratio, face.y * y_ratio + 29);
    draw_text(ctx, emotion, face.x * x_ratio, face.y * y_ratio + 58);
  }

  displayer.draw_video = function()
  {
    if(video.paused || video.ended) return false;
    ctx.drawImage(video, 0, 0, canvas_drawing.width, canvas_drawing.height);
    displayer.draw_results();
    setTimeout(displayer.draw_video, 20);
  }

  displayer.draw_results = function()
  {
    if (json == undefined) return;
    var faces = json.faces;
    // var human = json.face_recognition.humans; 
    if (faces && faces.length) {
      for (var i = 0; i < faces.length; i++) {
        draw_face(faces[i]);
      }
    }
    draw_text(ctx,            'Face detection: ' + json.first_request  + 'ms', 0, 5);
    draw_text(ctx, 'Gender + Age + Expression: ' + json.second_request + 'ms', 0, 34);
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

  $('canvas#drawing').click(displayer.show_json);
  video.addEventListener('play', displayer.draw_video);
});
