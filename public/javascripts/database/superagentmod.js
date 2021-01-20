const superagent = require('superagent');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const urlencode = require('urlencode');

var charset = require('superagent-charset');

charset(superagent); //设置字符
function getInfo(text, target) {
  let info = [];
  let $ = cheerio.load(text);
  switch (target) {
    case 'Ding':
      $('td,.odd >a').each((idx, ele) => {
        if ($(ele).attr('href')) {
          info.push({
            title: $(ele).text(),
            href: $(ele).attr('href'),
          });
        }
      });
      break;
    default:
      $('td,.even >a').each((idx, ele) => {
        if ($(ele).attr('href')) {
          info.push({
            title: $(ele).text(),
            href: $(ele).attr('href'),
           
          });
        }
      });
      break;
  }
  return info;
}
function getding(text){
  let info=[]
  return new Promise((resolve, reject) => {
    superagent.get(info).end((err, res) => {
      if (err) {
        reject(err);
      } else {
        let $ = cheerio.load(res.text);
      $('#readerlist li a').each((idx, ele) => {
        if ($(ele).attr('href')) {
          info.push({
            title: $(ele).text(),
            href: $(ele).attr('href'),
          });
        }
      });
      resolve(info)
      }
    });
  });
  
     

}
 function  getDetail(text,target) {
  let info = [];
  let $ = cheerio.load(text);
  switch (target) {
    case 'Ding':
   $('#readerlist li a').each((idx, ele) => {
    if ($(ele).attr('href')) {
      info.push({
        title: $(ele).text(),
        href: $(ele).attr('href'),
        baseurl:'https://www.cn3k5.com/'
      });
    }
      });
      break;
    default:
      $('#list dd >a').each((idx, ele) => {
        if ($(ele).attr('href')) {
          info.push({
            title: $(ele).text(),
            href: $(ele).attr('href'),
            baseurl:'http://www.xbiquge.la/'
          });
        }
      });
      break;
    }
    return info;
}

function getContent(text) {
  let info = [];
  let $ = cheerio.load(text);
  console.log()
  $('#content').each((idx, ele) => {
    info.push($(ele).text());
  });
  $('.jump a').each((idx, ele) => {
    info.push($(ele).attr('href'));
  });
  return info;
}

function searchKey(text) {
  return new Promise((resolve, reject) => {
    superagent
      .post('http://www.xbiquge.la/modules/article/waps.php')
      .set(
        'Accept',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
      )
      .type('form')
      .send({
        searchkey: text,
      })
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(getInfo(res.text));
        }
      });
  });
}

function searchDingKey(text) {
  return new Promise((resolve, reject) => {
    superagent
      .post('https://www.cn3k5.com/modules/article/search.php')
      .charset('gbk')
      .set(
        'Accept',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
      )
      .type('form')
      .send({
        searchkey: urlencode.encode(text, 'GBK').toLocaleUpperCase(),
        searchtype: 'articlename',
      }).serialize((data)=> {
        // Do whatever you want to transform the data
        let ret = ''
        for (let it in data) {
          ret += it + '=' + data[it] + '&'
        }
        return ret
      })
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(getInfo(res.text,'Ding'));
        }
      });
  });
}

function searchMoreDetail(url) {

  return new Promise((resolve, reject) => {
    superagent.get(url).end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(getDetail(res.text));
      }
    });
  });
}
function searchDingDetail(url) {
  return new Promise((resolve, reject) => {
    superagent.get(url).charset('gbk').end(async (err, res) => {
      if (err) {
        reject(err);
      } else {
        let $ = cheerio.load(res.text);
        if($($('#newlist >div a')[0]).attr('href')){
      resolve(await  new Promise((_resolve, _reject) => {
        superagent.get( $($('#newlist >div a')[0]).attr('href')).charset('gbk').end((err, res) => {
          if (err) {
            _reject(err);
          } else {
            _resolve(getDetail(res.text,'Ding'));
          }
        });
      }));
    }else{
      resolve([]);
    }
      }
    });
  });
}
function searchContent(url) {
  if(url.indexOf('cn3k5')>-1){
    return new Promise((resolve, reject) => {
      superagent.get( url).charset('gbk').end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(getContent(res.text));
        }
      });
    });
  }else{
    return new Promise((resolve, reject) => {
      superagent.get( url).end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(getContent(res.text));
        }
      });
    });
  }
}

let searchBiQuGe = {};
searchBiQuGe.searchKey = searchKey;
searchBiQuGe.searchMoreDetail = searchMoreDetail;
searchBiQuGe.searchContent = searchContent;
searchBiQuGe.searchDingKey = searchDingKey;
searchBiQuGe.searchDingDetail = searchDingDetail;
searchBiQuGe.getding = getding;
module.exports = searchBiQuGe;