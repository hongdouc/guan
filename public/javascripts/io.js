var io = require('socket.io')({
  cors: {
    origin: '*'
  }
});
// io.attach(server)
let rooms = {};
let _rooms = {}
let turning = {};
let orders = {};
let finished = {};
let goals ={}
let singleCardsPool=[]
for (let index = 1; index <= 13; index++) {
  singleCardsPool.push({value:index,type:'0'}); 
  singleCardsPool.push({value:index,type:'1'}); 
  singleCardsPool.push({value:index,type:'2'}); 
  singleCardsPool.push({value:index,type:'3'}); 
}
singleCardsPool.push({value:14,type:'4'});
singleCardsPool.push({value:15,type:'5'});
let doubleCardsPool=[]
for (let index = 1; index <= 13; index++) {
  let _index=index;
  if(index == 11) _index='J';
  if(index == 12) _index='Q';
  if(index == 13) _index='K';
  doubleCardsPool.push({value:index,type:'0',face:_index}); 
  doubleCardsPool.push({value:index,type:'0',face:_index}); 
  doubleCardsPool.push({value:index,type:'1',face:_index}); 
  doubleCardsPool.push({value:index,type:'1',face:_index}); 
  doubleCardsPool.push({value:index,type:'2',face:_index}); 
  doubleCardsPool.push({value:index,type:'2',face:_index}); 
  doubleCardsPool.push({value:index,type:'3',face:_index}); 
  doubleCardsPool.push({value:index,type:'3',face:_index}); 
}
doubleCardsPool.push({value:14,type:'4',face:'g'});
doubleCardsPool.push({value:15,type:'5',face:'G'});
doubleCardsPool.push({value:14,type:'4',face:'g'}); 
doubleCardsPool.push({value:15,type:'5',face:'G'});
shuffleCards(singleCardsPool);
shuffleCards(doubleCardsPool);
function shuffleCards(array){
  var m = array.length,
      t, i;
  while (m) {
      i = Math.floor(Math.random() * m--);
      t = array[m];
      array[m] = array[i];
      array[i] = t;
  }
  return array;
}
function dealCards(array){
  let arrays=[[],[],[],[]]
  array.forEach((ele,index)=>{
    arrays[index%4].push(ele);
  })
  return arrays;
}

io.of('/test').on('connection', function (socket) {
  let roomId, username
  socket.emit('queryed', true)
  socket.on('disconnect', function (obj) {
    if (roomId) {
      let room = rooms[roomId];
      if (room) {
        delete room[username]
        if (Object.keys(room).length < 1) {
          delete rooms[roomId]
        }
      }
      io.of('test').to(roomId).emit('newMember',rooms[roomId]);
    }
    console.log('user disconnected', rooms);
  });
  socket.on('login', function (obj, fn) {
    if (rooms[obj.roomId]) {
      let room = rooms[obj.roomId];
      let _room = _rooms[obj.roomId];
      if (room[obj.username]) {
        fn(false);
      } else {
        if (Object.keys(rooms[obj.roomId]).length < 4) {
          rooms[obj.roomId][obj.username] = {
            cards:[]
          }
          _room[obj.username]=socket;
          roomId = obj.roomId;
          username = obj.username;
          fn(true);
          socket.join(obj.roomId, function () {
            console.log(':::::',obj.roomId)
          })
          io.of('test').to(obj.roomId).emit('newMember',rooms[obj.roomId]);
        } else {
          fn(false)
        }
      }
    } else {
      rooms[obj.roomId] = {};
      rooms[obj.roomId][obj.username] = {
        cards:[],
        owner:true
      };
      _rooms[obj.roomId] = {};
      _rooms[obj.roomId][obj.username] = socket
      fn(true);
      socket.join(obj.roomId)
      io.of('test').to(obj.roomId).emit('newMember',rooms[obj.roomId]);
      // io.emit('loginIn',{roomId:obj.roomId,username:obj.username})
      roomId = obj.roomId;
      username = obj.username;
    }

  })
  socket.on('start',function(obj){
    shuffleCards(doubleCardsPool);
    let arrays = dealCards(doubleCardsPool);
    turning[obj.roomId]={
      n:0,
      turning:'',
      lastTurning:''
    }
    finished[obj.roomId]=[];
    orders[obj.roomId]={};
    goals[obj.roomId]={}
    if(_rooms[obj.roomId]){
      let _room=_rooms[obj.roomId];
      let n=0
      turning[obj.roomId].turning = obj.orders[0]; 
      turning[obj.roomId].lastTurning = obj.orders[0]; 
      orders[obj.roomId].orders=obj.orders;
      goals[obj.roomId][0] = goals[obj.roomId][2] = 3;
      goals[obj.roomId][1] = goals[obj.roomId][3] = 3;
      for (let key of obj.orders) {
        console.log(key,_room)
        let _socket = _room[key];
        _socket.emit('dealCards',{num:n,cards:arrays[n],orders:obj.orders,turning:turning[obj.roomId].turning,lastTurning:turning[obj.roomId].lastTurning})
        _socket.cards = arrays[n];
        n++
      }
    }

  })
 // let _array=[1,2,3,4]
  socket.on('play',(obj)=>{
    console.log(turning[obj.roomId].n)
    if(obj.finished){
      finished[obj.roomId].push(turning[obj.roomId].n)
    }
    if(finished[obj.roomId].length == 2){
      console.log(Math.abs(finished[obj.roomId][0] - finished[obj.roomId][1]) == 2);
      if(Math.abs(finished[obj.roomId][0] - finished[obj.roomId][1]) == 2){
        goals[obj.roomId][finished[obj.roomId][0]] = goals[obj.roomId][finished[obj.roomId][2]]+=3;
        let _n = (finished[obj.roomId][0]+1)%4;
        let _n1 = (finished[obj.roomId][0]+3)%4;
        let needTogong1=orders[obj.roomId].order[_n]
        let needTogong2=orders[obj.roomId].order[_n1]
        io.of('test').to(obj.roomId).emit('end',{current:goals[obj.roomId][finished[obj.roomId][0]],gong:[needTogong1,needTogong2]});
        finished[obj.roomId]=[]
        return;
      }
    }
    if(finished[obj.roomId].length == 3){
      if(Math.abs(finished[obj.roomId][0] - finished[obj.roomId][1]) == 2){
        let needTogong = orders[obj.roomId].find(ele=>! finished[obj.roomId].includes(ele))
        goals[obj.roomId][finished[obj.roomId][0]]=goals[obj.roomId][finished[obj.roomId][2]]+=1;
        io.of('test').to(obj.roomId).emit('end',{current:goals[obj.roomId][finished[obj.roomId][0]],gong:[needTogong]});
        finished[obj.roomId]=[]
        return;
      }
    }
    if(finished[obj.roomId].length<3){    
    // let ind =_array.find(ele=>{
    //  return !(finished[obj.roomId].includes((turning[obj.roomId].n+ele)%4));
    // })
    let n = (turning[obj.roomId].n+1)%4
    turning[obj.roomId].n = n;
    let _room = _rooms[obj.roomId];
 //   console.log('::::::n',n,obj.username,orders[obj.roomId].orders[n])
    if(obj.cards){
      for (let key in _room) {
          let _socket = _room[key];
          _socket.emit('playedcards',{cards:obj.cards,lastTurning:obj.username,turning:orders[obj.roomId].orders[n]})
          turning[obj.roomId].lastTurning = obj.username;
          turning[obj.roomId].turning = orders[obj.roomId].orders[n];
      }
    }else{
      for (let key in _room) {
        let _socket = _room[key];
          _socket.emit('playedcards',{cards:{},lastTurning:turning[obj.roomId].lastTurning,turning:orders[obj.roomId].orders[n]})
      }
    }
  }
  })
  socket.on('jump',(obj)=>{
    let n = (obj.order+2)%4;
    turning[obj.roomId].n = n;
    turning[obj.roomId].lastTurning = orders[obj.roomId].orders[n];
    turning[obj.roomId].turning = orders[obj.roomId].orders[n];
    io.of('test').to(obj.roomId).emit('playedcards',{cards:{},lastTurning:orders[obj.roomId].orders[n],turning:orders[obj.roomId].orders[n]});
  //  _socket.emit('playedcards',{cards:{},lastTurning:orders[obj.roomId][n],turning:orders[obj.roomId][n]});
  })
  socket.on('next',(obj)=>{
    shuffleCards(doubleCardsPool);
    let arrays = dealCards(doubleCardsPool);
    if(_rooms[obj.roomId]){
      let _room=_rooms[obj.roomId];
      let n=0
      turning[obj.roomId].turning =undefined; 
      turning[obj.roomId].lastTurning = undefined; 
      for (let key in _room) {
        let _socket=_room[key];
        _socket.emit('dealCards',{num:n,cards:arrays[n],turning:undefined,lastTurning:undefined})
        _socket.cards = arrays[n];
        n++
      }
    }
  })
});

module.exports = io;