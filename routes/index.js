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
var fs = require('fs');

function getOptions(file) {
  return {
    url: 'http://127.0.0.1:9001/face_detection',
    headers: headers,
    method: 'POST',
    formData: {
      filename: fs.createReadStream(file)
    }
  }
}

var headers = {
  'Accept-Token': 'YE6geenfzrFiT88O',
  'User-Token': 'ericsson_event',
};

router.post('/upload-image', function(req, res, next) {
  /* if (!req.files)
    return res.status(400).send('No files were uploaded.');
  var file = req.files.file;
  var path = __dirname + '/../uploads/photo.jpg';
  file.mv(path, function(err) {
    if (err)
      return res.status(500).send(err);

    request(getOptions(path), function(error, response, body) {
      res.json(body);
    });
  }); */
  var data_url = req.body.file;
  var matches = data_url.match(/^data:.+\/(.+);base64,(.*)$/);
  var ext = matches[1];
  var base64_data = matches[2];
  var buffer = new Buffer(base64_data, 'base64');

  var path = __dirname + '/../uploads/photo.' + ext;
  fs.writeFile(path, buffer, function (err) {
    request(getOptions(path), function(error, response, body) {
      res.json(body);
    });
  });
});

module.exports = router;
