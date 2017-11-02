'use strict'

var displayer = {};
$(function() {

  function json_to_jsonhtml(json) {
    return JSON.stringify(json, null, 4)
               .replace(/\n/g, '<br>')
               .replace(/' '/g, '&nbsp;');
  }

  displayer.show_result = function(data, json) {
      $('video').hide();
      $('canvas').show();
  }

  displayer.show_json = function(json) {
      $('#json-result').html('<div class="alert alert-primary" ' +
           'role="alert">' + json_to_jsonhtml(json) + '</div>');
  }

  displayer.show_stream = function() {
      $('canvas').hide();
      $('video').show();
  }

  $('canvas').click(displayer.show_stream);
});
