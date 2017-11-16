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

function get_options(form_data, service)
{
  return {
    url: 'http://127.0.0.1:9500/' + service,
    headers: headers,
    method: 'POST',
    // forever: true,
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
      res = {"x" : face.up_left_point.x,
             "y": face.up_left_point.y,
             "width": width,
             "height": height};
      biggest_width = width;
    }
  }
  // var margin = (res.width * 0.5);
  var margin = 0;
  res = {"x" : res.x - margin,
         "y": res.y - margin,
         "width": res.width + margin * 2,
         "height": res.height + margin * 2}
  return res;
}

function resize_detection(img_width, img_height, face)
{
    if (face === undefined) return undefined;
    var res = {};
    res.x = (face.x < 0) ? 0 : face.x;
    res.y = (face.y < 0) ? 0 : face.y;
    res.width = (face.x + face.width > img_width) ? img_width - 1 : face.width;
    res.height = (face.y + face.height > img_height) ? img_height - 1 : face.height;
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
  var res_json = {"faces": []};

  var form_data = {
      filename: buffer,
      face_detection: 'test'
  };

  var before = Date.now();
  request(get_options(form_data, 'face_detection'), function(error, response, body) {
    res_json.first_request = Date.now() - before;
    if (error) {
      console.error('request error on first request:', error);
      return res.status(500).send({
        error: 'Error in requesting the platform face_recognition'
      });
    }

    var json = JSON.parse(body);
    if (json.faces === undefined)
      return res.status(500).send({
        error: 'Error during the face_detection'
      });
    var face = biggest_face(json.faces);
    if (face === undefined) return res.json(res_json);

    jimp.read(buffer)
    .then(function(image) {
      face = resize_detection(image.bitmap.width, image.bitmap.height, face);
      image.crop(face.x, face.y, face.width, face.height);
      image.getBuffer(jimp.MIME_JPEG, function (error, cropped_buffer) {
        if (error) {
          console.error('image.getBuffer error', error);
          return res.status(500).send({
            error: 'error in getting the buffer of the cropped image'
          });
        }
    
        form_data = {
          filename: cropped_buffer,
          age_detection: '',
          gender_detection: '',
          face_expression: ''
        };

        before = Date.now();
        request(get_options(form_data, 'vision_batch'), function(error, response, body) {
          res_json.second_request = Date.now() - before;
          if (error) {
            console.error('request error on second request:', error);
            return res.status(500).send({
              error: 'error in requesting the platform face_expression...'
            });
          }

          var json = JSON.parse(body);
          if (!json[0])
            return res.status(500).send({
              error: 'cropped image does not get a good result'
            });
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
