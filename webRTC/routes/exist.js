var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res) {
  return res.render('exist', { title: '있음' });
});
module.exports = router;