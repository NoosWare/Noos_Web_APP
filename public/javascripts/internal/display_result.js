'use strict'

var displayer = {};
$(function() {

  var canvas = document.querySelector("canvas");
  var ctx = canvas.getContext("2d");

  function draw_line(begin, end)
  {
    console.log('draw_line', begin, end, canvas.height);

    ctx.moveTo(begin.x, begin.y);
    ctx.lineTo(end.x, end.y);

    ctx.stroke(); 
  }

  function draw_square(top_left, bottom_right)
  {
    console.log('draw_square', top_left, bottom_right);
    // top
    draw_line(top_left, {"x": bottom_right.x, "y": top_left.y});
    // right
    draw_line({"x": bottom_right.x, "y": top_left.y}, bottom_right);
    // bottom
    draw_line(bottom_right, {"x": top_left.x, "y": bottom_right.y});
    // left
    draw_line({"x": top_left.x, "y": bottom_right.y}, top_left);
  }

  displayer.show_result = function(data, json)
  {
    $('video').hide();
    $('canvas').show();

    if (json.face_recognition.faces) {
      var faces = json.face_recognition.faces;
      for (var i = 0; i < faces.length; i++) {
        var face = faces[i];
        draw_square(face.rect.up_left_point, face.rect.down_right_point);
      }
    }
  }

  displayer.show_json = function(json)
  {
    var transform = {};
    $('#json-result').html('<div class="alert alert-primary" ' +
         'role="alert">' + json2html.transform(json, transform) + '</div>');
  }

  displayer.show_stream = function()
  {
      $('canvas').hide();
      $('video').show();
  }

  $('canvas').click(displayer.show_stream);
});
