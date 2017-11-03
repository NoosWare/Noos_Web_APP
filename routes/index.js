var express = require('express');
var request = require('request');
var FormData = require('form-data');
var dataUriToBuffer = require('data-uri-to-buffer');
var fs = require('fs');
var jimp = require('jimp');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next)
{
  res.render('index');
});

function get_options(form_data)
{
  return {
    url: 'http://127.0.0.1:9001/vision_batch',
    headers: headers,
    method: 'POST',
    formData: form_data
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

router.post('/upload-image', function(req, res, next)
{
  var data_url = req.body.file;
  var buffer = dataUriToBuffer(data_url);
  var res_json = {"faces": [], "qr_codes": []};

  var form_data = {
      filename: buffer,
      face_detection: 'test',
      qr_recognition: 'test' 
  };

  var before = Date.now();
  request(get_options(form_data), function(error, response, body) {
    res_json.first_request = Date.now() - before;
    if (error) {
      console.error('request error:', error);
      return res.status(500).send({ error: 'error in requesting the platform face_recognition' });
    }

    var json = JSON.parse(body);
    console.log(body);
    var face = biggest_face(json[0].face_detection.faces);
    if (face === undefined) return res.json(res_json);

    jimp.read(buffer)
    .then(function(image) {
      
      image.crop(face.x, face.y, face.width, face.height);
      image.getBuffer(jimp.MIME_JPEG, function (error, cropped_buffer) {
        if (error) {
          return res.status(500).send({ error: 'error in getting the buffer of the cropped image' });
        }
    
        var formData = {
          filename: cropped_buffer,
          age_detection: '',
          gender_detection: '',
          face_expression: ''
        };

        before = Date.now();
        request(get_options(formData), function(error, response, body) {
          res_json.second_request = Date.now() - before;
          if (error) {
            console.error('request error:', error);
            return res.status(500).send({ error: 'error in requesting the platform face_expression...' });
          }

          var json = JSON.parse(body);
          console.log(body);
          face.age = select(json[0].age_detection, 'age_range');
          face.gender = select(json[1].gender_detection, 'gender');
          face.emotion = select(json[2].face_expression, 'emotion');

          res_json.faces.push(face);
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
