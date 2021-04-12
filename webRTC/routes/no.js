var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res) {
  return res.render('no', { title: '없음' });
});
module.exports = router;