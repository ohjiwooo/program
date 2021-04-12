var express = require('express');
var router = express.Router();
var db = require('../server');
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: false}));


router.post('/', (req, res) => {
   let{id} = req.body;
    db.mysql.query('SELECT * FROM user_info WHERE id=? AND online=1', id, (err, data) => {
       if (err||!data[0]) {
       res.render('no', { title: '존재안함' });
         }      
       else{
        res.render('exist', { title: '존재' });
       }   
    });  
  });
module.exports = router;