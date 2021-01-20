let pg = require('pg');
function connectPg(){
  return new Promise((resolve,reject)=>{
    const pgConfig = {
      user:'postgres',
      password:'fofiacard',
      host: '192.168.1.26',      // 数据库所在IP
      port: '5432',
      database:'position_v2_2'
    }
    const pool = new pg.Pool(pgConfig);
    pool.connect(function(error,client,done){
      if(error){
        reject(error)
      }else{
        done();
        resolve(client)
      }
    })
  })
}
module.exports = connectPg
