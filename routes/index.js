var express = require('express');
var request = require('request');
var FormData = require('form-data');
var dataUriToBuffer = require('data-uri-to-buffer');
var fs = require('fs');
var jimp = require('jimp');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

function getOptions(buffer, service) {
  return {
    url: 'http://127.0.0.1:9001/' + service,
    headers: headers,
    method: 'POST',
    formData: {
      filename: buffer
    }
  }
}

var headers = {
  'Accept-Token': 'YE6geenfzrFiT88O',
  'User-Token': 'ericsson_event',
};

function biggest_face(face_detection)
{
    if (face_detection.faces === null) return undefined;

    var faces = face_detection.faces;
    var biggest_width = 0;
    var res = undefined;
    for (var i = 0; i < faces.length; i++) {
        var face = faces[i];
        var width = face.down_right_point.x - face.up_left_point.x;
        var height = face.down_right_point.y - face.up_left_point.y;
        if (width > biggest_width) {
          res = {"x" : face.up_left_point.x, "y": face.up_left_point.y, "width": width, "height": height};
          biggest_width = width;
        }
    }
    return res;
}

router.post('/upload-image', function(req, res, next) {
  var data_url = req.body.file;
  var buffer = dataUriToBuffer(data_url);

  var res_json = {};
  request(getOptions(buffer, 'face_detection'), function(error, response, body) {

    res_json.face_detection = JSON.parse(body);
    var face = biggest_face(res_json.face_detection);

    if (face === undefined) return res.json(res_json);

    jimp.read(buffer)
    .then(function(image) {
      
      image.crop(face.x, face.y, face.width, face.height);

      request(getOptions(image.bitmap.data, 'age_detection'), function(error, response, body) {

        face.age_detection = JSON.parse(body);
        request(getOptions(image.bitmap.data, 'gender_detection'), function(error, response, body) {

          face.gender_detection = JSON.parse(body);
          res.json(res_json);
        });
      });
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).send({ error: 'jimp could not read the picture' });
    });
  });
});

module.exports = router;
