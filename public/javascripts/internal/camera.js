$(function() {

  Webcam.set({
    width: 320,
    height: 240,
    dest_width: 640,
    dest_height: 320,
    image_format: 'jpeg',
    jpeg_quality: 100,
    upload_name: 'file'
  });

  Webcam.attach('#camera');
        
  function upload_click(event) {
    Webcam.snap( function(data_uri) {
      document.getElementById('result').innerHTML = '<img src="' + data_uri + '"/>';
    });
  }
  
  $('#upload-image').click(upload_click);
});
