var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res) {
  /* session을 사용하여 로그인 성공시 req.session.is_loginded에 true를 저장하는데
     만약에 사용자가 url을 통해 메인페이지를 접속할 경우 다시 로그인 페이지로 이동한다. */
     
  if (req.session.is_logined !== true) {
    return res.redirect('/');
  }

  
  return res.render('main', { title: "메인페이지" });
});



module.exports = router;
