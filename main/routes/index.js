var express = require('express');
var router = express.Router();
var db = require('../config/db');
let bcrypt = require('bcrypt-nodejs');
var i;
/* GET home page. */
router.get('/', function (req, res) {
  return res.render('index', { title: '로그인' });
});

/* 로그인 기능 */
router.post('/', (req, res) => {
  let { id, pw } = req.body;
  // db에서 사용자가 입력한 아이디를 조회한다.
  i=id;
  db.mysql.query('SELECT * FROM user_info WHERE id=:?', id, (err, userInfo) => {
    // 만약 사용자 정보가 입력한 아이디가 존재하지 않은 경우 에러페이지를 보여준다.
    if (err || !userInfo[0]) {
      return res.render('error', { message: "에러" });
    }
    /* bcrypt.comrare라는 함수를 사용해 사용자가 입력한 비밀번호와 db에 암호화 되어있는 비밀번호를 비교해서 참이면 로그인
       아니면 에러페이지에 message를 가지고 가서 띄어준다. */
    bcrypt.compare(pw, userInfo[0].pw, (err, tf) => {
      if (tf !== true) {
        return res.render('error', { message: "아이디 또는 비밀번호를 확인해주세요." });
      } else {
        /* 로그인 성공시 session에 is_logined라는 변수에 true값을 저장한다.
           true 값을 저장하는 이유는 만약 로그인 상태가 아닐경우 로그인 페이지로 이동되게하게끔 하기위해 만든 변수다. */
        req.session.is_logined = true;
        //
        db.mysql.query('UPDATE user_info SET online = 1 WHERE id=?',id);
      //var sql = 'UPDATE user_info SET online = 1 WHERE id=?';
        return res.redirect('/main');
      }
    });
  });
});

/* /logout으로 post요청이 오면 로그인 상태를 해제한다.  */
router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    db.mysql.query('UPDATE user_info SET online = 0 WHERE id=?',i);
    return res.redirect('/');
  });
});

module.exports = router;