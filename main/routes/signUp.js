var express = require('express');
var router = express.Router();
// db를 사용
var db = require('../config/db')
let bcrypt = require('bcrypt-nodejs');

// get요청시 페이지를 렌더하는데 title에 '회원가입'이라는 변수를 가지고 간다.
router.get('/', function (req, res) {
    return res.render('signUp', { title: '회원가입' });
});

// post요청시 회원가입을 하는 기능을 수행한다.
router.post('/', (req, res, next) => {
    // 사용자가 웹 페이지에서 입력한 id, pw를 id, pw 라는 변수로 저장한다.
    let { id, pw } = req.body;
    // 비밀번호를 암호화 한다.(bcrypt에서 지원하는 hashSync라는 함수로 암호화)
    pw = bcrypt.hashSync(pw);
    // db에 저장하는 기능
    let sql = { id, pw }
    db.mysql.query('INSERT INTO user_info set ?', sql, (err) => {
        // err에서는 입력한 아이디가 이미 db상에서 존재하는 경우에 발생한다.
        if (err) {
            console.log(err);
            return res.render('error', { message: "이미 존재하는 이이디 입니다" });
        }
        else {
        // 아이디가 db에 저장되어 있지 않는 경우라면 회원가입을 완료한뒤에 로그인페이지로 이동한다.
            return res.redirect('/');
        }
    });
});

module.exports = router;