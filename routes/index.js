var express = require('express');
var router = express.Router();
const searchBiQuGe = require('../public/javascripts/database/superagentmod');
// let expressWs = require('express-ws');
// expressWs(router);

// router.ws('/sockettest',(ws,req)=>{
//   ws.send('success');
//   ws.on('message',(msg)=>{
//     console.log(':::msg',Object.values(msg))
//   })
// })

// let io =require('socket.io')(router);
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});
router.get('/searchBiQuGe', async function (req, res, next) {
  let result1,result2;
  result1 = await searchBiQuGe.searchKey(req.query.searchText);
  result2 = await searchBiQuGe.searchDingKey(req.query.searchText);
  let _result1=[];
  if(result1){
    result1.forEach(ele=>{
      _result1.push(ele.title)
    })
  }else{
    result1=[];
  }
  if(result2){
    result2.forEach(ele=>{
      if(_result1.indexOf(ele.title)<0){
        result1.push(ele)
      }
    })
  }
  res.json(result1);
})
router.get('/moreDetail', async function (req, res, next) {
  let result1,result2;
  result1 = await searchBiQuGe.searchMoreDetail(req.query.detailUrl);
  result2 = await searchBiQuGe.searchDingDetail(req.query.detailUrl);
  let _result1=[];
  if(result1){
    result1.forEach(ele=>{
      _result1.push(ele.title)
    })
  }else{
    result1=[];
  }
  if(result2){
    result2.forEach(ele=>{
      if(_result1.indexOf(ele.title)<0){
        result1.push(ele)
      }
    })
  }
  res.json(result1);
})

router.get('/readContent', async function (req, res, next) {
  let result
  result = await searchBiQuGe.searchContent(req.query.contentUrl);
  res.send(result)
})

module.exports = router;