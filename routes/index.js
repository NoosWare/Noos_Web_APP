var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/upload-image', function(req, res, next) {
  res.render('result');
});

var request = require('request');
var FormData = require('form-data');
var dataUriToBuffer = require('data-uri-to-buffer');
var fs = require('fs');

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

router.post('/upload-image', function(req, res, next) {
  var data_url = req.body.file;
  var buffer = dataUriToBuffer(data_url);

  var res_json = {};
  request(getOptions(buffer, 'face_detection'), function(error, response, body) {

    res_json.face_detection = JSON.parse(body);
    // request(getOptions(buffer, 'human_detection'), function(error, response, body) {

      // res_json.human_detection = JSON.parse(body);
      // request(getOptions(buffer, 'qr_recognition'), function(error, response, body) {

        // res_json.orb_find_objects = JSON.parse(body);
        res.json(res_json);
      // });
    // });
  });
});

module.exports = router;
