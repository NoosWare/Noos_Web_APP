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

function biggest_face(faces)
{
  if (faces === null) return undefined;

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

function select(json, info)
{
  var good_one;
  var best = 0;
  var results = json.result;
  for (var i = 0; i < results.length; i++) {
    var item = results[i];
    if (item.probability > best) {
      best = item.probability;
      good_one = item;
    }
  }
  return {info: good_one[info], "probability": good_one.probability};
}

router.post('/upload-image', function(req, res, next) {
  var data_url = req.body.file;
  var buffer = dataUriToBuffer(data_url);

  var res_json = {};
  request(getOptions(buffer, 'face_detection'), function(error, response, body) {
    var face_detection = JSON.parse(body);
    res_json.faces = [];
    var face = biggest_face(face_detection.faces);

    if (face === undefined) return res.json(res_json);


    jimp.read(buffer)
    .then(function(image) {
      
      image.crop(face.x, face.y, face.width, face.height);
      image.getBuffer(jimp.MIME_JPEG, function (error, cropped_buffer) {

        request(getOptions(cropped_buffer, 'age_detection'), function(error, response, body) {

          var age = JSON.parse(body);
          face.age = select(age, 'age_range');
          request(getOptions(cropped_buffer, 'gender_detection'), function(error, response, body) {

            var gender = JSON.parse(body);
            face.gender = select(gender, 'gender');
            request(getOptions(cropped_buffer, 'face_expression'), function(error, response, body) {

              var emotion = JSON.parse(body);
              face.emotion = select(emotion, 'emotion');
              res_json.faces.push(face);
              res.json(res_json);
            });
          });
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
