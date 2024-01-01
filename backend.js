// backend 
// constants
const TICKRATE = 15 // ms
const PROJECTILERADIUS = 5 
const SCREENWIDTH = 1024
const SCREENHEIGHT = 576

const INVENTORYSIZE = 4
const PLAYERRADIUS = 10 //16
const PLAYERSPEED = 3 // pixel
const PLAYERHEALTH = 3
const PLAYERHEALTHMAX = 6
const GUNHEARRANGE = 500
const LASERDURATION = 40
const LASERWIDTH = 5

/*Adding a new gun: add to list gunInfo and add sound of a gun to sound/ and reloadSound/ folders!*/
// const PROJECTILESPEED = 20 // 20 ~ 42
const gunInfo = {'rifle':{travelDistance:1200, damage: 5, shake:0, num: 1, fireRate: 1800, projectileSpeed:42, magSize:5, reloadTime: 4600, ammotype:'7', size: {length:45, width:2}}, 
'mk14':{travelDistance:1000, damage: 2, shake:2, num: 1, fireRate: 700, projectileSpeed:32, magSize:14, reloadTime: 3600, ammotype:'7', size: {length:35, width:3} }, 
'VSS':{travelDistance:1000, damage: 0.5, shake:1, num: 1, fireRate: 100, projectileSpeed:26, magSize:10, reloadTime: 3500, ammotype:'7' , size: {length:35, width:2}}, 

'railgun':{travelDistance:0, damage: 1, shake:0, num: 1, fireRate: 1000, projectileSpeed:0, magSize:2, reloadTime: 2000, ammotype:'battery', size: {length:50, width:5}},

'pistol':{travelDistance:400, damage: 0.5, shake:3, num: 1, fireRate: 300, projectileSpeed:20, magSize:15, reloadTime: 2100, ammotype:'5', size: {length:15, width:3}}, 

'shotgun':{travelDistance:260, damage: 1, shake:5, num: 7, fireRate: 1200, projectileSpeed:15, magSize:7, reloadTime: 3000, ammotype:'12', size: {length:12, width:6}},
'DBS':{travelDistance:300, damage: 1, shake:3, num: 3, fireRate: 400, projectileSpeed:18, magSize:14, reloadTime: 6200, ammotype:'12', size: {length:16, width:5}},

'M249':{travelDistance:700, damage: 0.2, shake:4, num: 1, fireRate: 75, projectileSpeed:28, magSize:75, reloadTime: 8000, ammotype:'45', size: {length:30, width:3}},
'ump45':{travelDistance:600, damage: 0.1, shake:2, num: 1, fireRate: 90, projectileSpeed:18, magSize:25, reloadTime: 3100, ammotype:'45', size: {length:22, width:4}},
'vector':{travelDistance:400, damage: 0.25, shake:1, num: 1, fireRate: 60, projectileSpeed:20, magSize:19, reloadTime: 2200, ammotype:'45', size: {length:17, width:3}},
}
const defaultGuns = ['DBS','VSS','rifle','ump45']

const collide = require('line-circle-collision')

const express = require('express')
const app = express()

// socket.io setup
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io');
const io = new Server(server,{pingInterval:2000, pingTimeout:5000}); // timeout 5 seconds

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})



// player data saved here
const backEndPlayers = {}
const deadPlayerPos = {}
const backEndProjectiles = {}
const backendDrawables = {}
const backEndItems = {}
let itemsId = 0
let projectileId = 0
let drawableId = 0
// hand is item id 0 fixed globally
backEndItems[0] = {
  itemtype: 'melee', groundx:0, groundy:0, size:{length:5, width:5}, name:'hand', color:'black', onground:false, myID: 0, deleteRequest:false
}


const itemTypes = ['gun','consumable','ammo']
const ammoTypes = ['45','5','7','12','battery'] // ammo type === ammo name
const ammoInfo = {
'45':{color:'blue',size:{length:12, width:12}, amount:25},
'5':{color:'green',size:{length:12, width:12}, amount:15},
'7':{color:'yellow',size:{length:12, width:12}, amount:10},
'12':{color: 'red',size:{length:12, width:12}, amount:7},
'battery':{color: 'gray',size:{length:12, width:12}, amount:2} }

const consumableTypes = ['bandage','medkit']
const consumableInfo = {
'bandage': {size:{length:10, width:10}, color: 'gray', healamount: 1 },
'medkit': {size:{length:16, width:16}, color: 'gray', healamount: PLAYERHEALTHMAX},
}

// item spawn
const groundGunAmount = 1
for (let i=0;i<groundGunAmount; i++){
  itemsId++
  const itemtype = 'gun' //  gun ammo consumable
  const groundx = SCREENWIDTH/2 
  const groundy = SCREENHEIGHT/2 + Math.round(100*(i - groundGunAmount/2))
  const name = 'railgun'
  const size = gunInfo[name].size
  const color = 'white'

  const ammo = 0// gunInfo[name].magSize // preloaded
  const ammotype = gunInfo[name].ammotype // 7mm
  backEndItems[itemsId] = {
    itemtype, groundx, groundy, size, name, color,iteminfo:{ammo,ammotype}, onground:true,myID: itemsId, deleteRequest:false
  }
}

const groundAmmoList = ['45','5','7','12','battery']
const groundAmmoAmount = groundAmmoList.length
for (let i=0;i<groundAmmoAmount; i++){
  itemsId++
  const itemtype = 'ammo' //  gun ammo consumable
  const groundx = SCREENWIDTH/2 + 100
  const groundy = SCREENHEIGHT/2 + Math.round(100*(i - groundAmmoAmount/2))
  const name = groundAmmoList[i]
  const size = ammoInfo[name].size
  const color = ammoInfo[name].color

  const amount = ammoInfo[name].amount
  const ammotype = name // 7mm
  backEndItems[itemsId] = {
    itemtype, groundx, groundy, size, name, color,iteminfo:{amount,ammotype}, onground:true,myID: itemsId, deleteRequest:false
  }
}

const groundConsList = ['bandage','bandage','bandage','bandage','bandage','medkit']
const groundConsAmount = groundConsList.length
for (let i=0;i<groundConsAmount; i++){
  itemsId++
  const itemtype = 'consumable' //  gun ammo consumable
  const groundx = SCREENWIDTH/2 - 100
  const groundy = SCREENHEIGHT/2 + Math.round(50*(i - groundConsAmount/2))
  const name = groundConsList[i]
  const size = consumableInfo[name].size
  const color = consumableInfo[name].color
  const healamount = consumableInfo[name].healamount

  const amount = 1
  backEndItems[itemsId] = {
    itemtype, groundx, groundy, size, name, color,iteminfo:{amount,healamount}, onground:true,myID: itemsId,deleteRequest:false
  }
}



function safeDeletePlayer(playerId){
  // drop all item before removing
  const inventoryItems = backEndPlayers[playerId].inventory
   
  for (let i=0;i<inventoryItems.length;i++){
    const curitemID = inventoryItems[i].myID
    if (curitemID===0){ // no hand
      continue
    }
    backEndItems[curitemID].onground = true
    backEndItems[curitemID].groundx = backEndPlayers[playerId].x + (Math.random() - 0.5)*100
    backEndItems[curitemID].groundy = backEndPlayers[playerId].y + (Math.random() - 0.5)*100
  }

  deadPlayerPos[playerId] = {x:backEndPlayers[playerId].x,y:backEndPlayers[playerId].y}

  delete backEndPlayers[playerId]
}



// player spawn
io.on('connection', (socket) => {
  console.log('a user connected');

  // broadcast
  io.emit('updatePlayers',backEndPlayers) // socket.emit speaks to that player only

  // give server info to a frontend
  socket.emit('serverVars', {gunInfo, PLAYERSPEED})

  // projectile spawn
  socket.on('shoot',({x,y,angle, mousePos, currentGun,playerIdEXACT}) => {
    const gunName = currentGun
    
    if (gunName==='railgun'){
      drawableId++
      // collision detection with a line (hitscan)
      for (const playerId in backEndPlayers) {
        const backEndPlayer = backEndPlayers[playerId]
        // collide line
        let collisionDetected = collide([x,y], [mousePos.x,mousePos.y], [backEndPlayer.x, backEndPlayer.y], backEndPlayer.radius+LASERWIDTH)

        if ((playerIdEXACT !== playerId) && collisionDetected) {
          //console.log(`${backEndPlayers[playerIdEXACT].username} shot ${backEndPlayer.username} a railgun!`)
          // who got hit
          if (backEndPlayers[playerId]){ // safe
            if (backEndPlayers[playerId].health <= 0){ // who got shot
              // who shot projectile
              if (backEndPlayers[playerIdEXACT]){ // safe
                backEndPlayers[playerIdEXACT].score ++
              }
              safeDeletePlayer(playerId)
            } else {
              backEndPlayers[playerId].health -= gunInfo['railgun'].damage;
              if (backEndPlayers[playerId].health <= 0){               // who shot projectile
                if (backEndPlayers[playerIdEXACT]){ // safe
                  backEndPlayers[playerIdEXACT].score ++
                }; safeDeletePlayer(playerId)} //check again
            }
          }
          // projectile is not added! so dont delete
          //delete backEndProjectiles[id] 
          //break // multiple enemy can be hit by railgun!
        }
      }
      backendDrawables[drawableId] = {
        start:{x,y},end: mousePos, playerIdEXACT, linewidth: LASERWIDTH, duration: LASERDURATION
      }

      io.emit('updateDrawables',{backendDrawables,GUNHEARRANGE})//,drawinfo:{linewidth:LASERWIDTH,start:[x,y],end:mousePos}
      io.emit('updatePlayers',backEndPlayers)
      // only railgun hitscan finished
    } else {
      function addProjectile(){
        projectileId++
        // calculate vel with angle
        const shakeProj = gunInfo[currentGun].shake
        const bulletSpeed = gunInfo[currentGun].projectileSpeed
        const velocity = { // with shake!
          x: Math.cos(angle) * bulletSpeed + (Math.random()-0.5) * shakeProj,
          y: Math.sin(angle) * bulletSpeed + (Math.random()-0.5) * shakeProj
        }
        const speed = Math.hypot(velocity.x,velocity.y)
        const radius = PROJECTILERADIUS
    
        const travelDistance = gunInfo[currentGun].travelDistance
        const projDamage =  gunInfo[currentGun].damage
    
        backEndProjectiles[projectileId] = {
          x,y,radius,velocity, speed, playerId: socket.id, gunName, travelDistance, projDamage
        }
        //console.log(backEndProjectiles) // finished adding a projectile
      }
      
      for (let i=0;i< gunInfo[gunName].num;i++){
        addProjectile()
      }

    }
  })

  // initialize game when clicking button (submit name)
  socket.on('initGame',({username,width,height})=>{
    // initialize inventory with hand
    let inventory =  new Array(INVENTORYSIZE).fill().map(() => (backEndItems[0])) // array points to references - hand can be shared for all players

    // default item for a player if exists
    for (let i=0;i<defaultGuns.length; i++){
      itemsId++
      const itemtype = 'gun' //  gun ammo consumable
      const groundx = SCREENWIDTH/2 
      const groundy = SCREENHEIGHT/2 + Math.round(100*(i - defaultGuns.length/2))
      const name = defaultGuns[i]
      const size = gunInfo[name].size
      const color = 'white'

      const ammo = 0//gunInfo[name].magSize // preloaded
      const ammotype = gunInfo[name].ammotype // 7mm
      backEndItems[itemsId] = {
        itemtype, groundx, groundy, size, name, color,iteminfo:{ammo,ammotype}, onground:false, myID: itemsId,deleteRequest:false
      }
      inventory[i] = backEndItems[itemsId]
    }

    // makes a player here!
    backEndPlayers[socket.id] = {
      x:SCREENWIDTH * Math.random(),
      y:SCREENHEIGHT * Math.random(),
      color: `hsl(${Math.random()*360},100%,70%)`,
      radius: PLAYERRADIUS,
      sequenceNumber: 0, // canvas attribute is initialized when initCanvas
      score: 0,
      health: PLAYERHEALTH,
      username,
      inventory, // size 4
      currentSlot: 1, // 1~4
      mousePos: {x:SCREENWIDTH/2,y:SCREENHEIGHT/2}
    }

   
    // where we init our canvas
    backEndPlayers[socket.id].canvas = {
      width,
      height
    }
    // initailize player radius
    backEndPlayers[socket.id].radius = PLAYERRADIUS

  })


  // player death => put ammos to the ground!
  socket.on('playerdeath',({playerId, playerammoList})=>{
    if (!deadPlayerPos[playerId]){return}
    //console.log(playerammoList)
    for (const ammoT in ammoTypes){
      // make item
      itemsId++
      const itemtype = 'ammo' //  gun ammo consumable
      const groundx = deadPlayerPos[playerId].x + (Math.random() - 0.5)*200
      const groundy = deadPlayerPos[playerId].y + (Math.random() - 0.5)*200
      const name = ammoTypes[ammoT]
      const size = ammoInfo[name].size
      const color = ammoInfo[name].color
      const amount = playerammoList[name]
    
      const ammotype = name // 7mm
      backEndItems[itemsId] = {
        itemtype, groundx, groundy, size, name, color,iteminfo:{amount,ammotype}, onground:true,myID: itemsId, deleteRequest:false
      }
    }
    delete deadPlayerPos[playerId]

  })



  // eat
  socket.on('consume',({itemName,playerId,healamount,deleteflag, itemid,currentSlot}) => {
    function APIdeleteItem(){
      // change player current holding item to hand
      backEndPlayers[playerId].inventory[currentSlot-1] = backEndItems[0]
      // delete safely
      backEndItems[itemid].deleteflag = deleteflag
      //delete backEndItems[itemid]
    }

    if (itemName === 'medkit'){
      backEndPlayers[playerId].health = PLAYERHEALTHMAX
      APIdeleteItem()
    } else if (backEndPlayers[playerId].health + healamount <= PLAYERHEALTHMAX){
      backEndPlayers[playerId].health += healamount
      APIdeleteItem()
    }
    

  })



  // change gound item info from client side
  socket.on('updateitemrequest', ({itemid, requesttype,currentSlot=1, groundx=0, groundy=0, playerId=0})=>{
    let itemToUpdate = backEndItems[itemid]
    if (requesttype==='deleteammo'){
      itemToUpdate.onground = false
      itemToUpdate.deleteRequest = true
    } else if (requesttype === 'pickupinventory'){
      itemToUpdate.onground = false
      backEndPlayers[playerId].inventory[currentSlot-1] = backEndItems[itemid]// reassign item (only me)
      //console.log(backEndPlayers[playerId].inventory[currentSlot-1].myID)
    } 
  })

  socket.on('updateitemrequestDROP', ({itemid, requesttype,currentSlot=1, groundx=0, groundy=0, playerId=0})=>{
    let itemToUpdate = backEndItems[itemid]
    if(requesttype==='dropitem'){
      itemToUpdate.onground = true
      itemToUpdate.groundx = groundx
      itemToUpdate.groundy = groundy
      //console.log(`dropped: ${itemToUpdate.name}`)
    }

  })


  // hear player's mouse pos changes
  socket.on('playermousechange', ({x,y})=>{
    if (!backEndPlayers[socket.id]) {return}
    backEndPlayers[socket.id].mousePos = {x,y}
  })


  // remove player when disconnected (F5 etc.)
  socket.on('disconnect',(reason) => {
    console.log(reason)
    delete backEndPlayers[socket.id]
    io.emit('updatePlayers',backEndPlayers) // remove from index.html also
  })

  socket.on('keydown',({keycode, sequenceNumber}) => {
    const backEndPlayer = backEndPlayers[socket.id]
    if (!backEndPlayer){ // if player was removed, do nothing
      return
    }

    backEndPlayer.sequenceNumber = sequenceNumber
    let isMovement = true
    switch(keycode) {
      case 'KeyW':
        backEndPlayer.y -= PLAYERSPEED
        break
      case 'KeyA':
        backEndPlayer.x -= PLAYERSPEED
        break
      case 'KeyS':
        backEndPlayer.y += PLAYERSPEED
        break
      case 'KeyD':
        backEndPlayer.x += PLAYERSPEED
        break
      default:
        isMovement = false
        break
    }
    if (isMovement){
      // after movement, check border for player
      const playerSides = {
        left: backEndPlayer.x - backEndPlayer.radius,
        right: backEndPlayer.x + backEndPlayer.radius,
        top: backEndPlayer.y - backEndPlayer.radius,
        bottom: backEndPlayer.y + backEndPlayer.radius
      }

      if (playerSides.left<0){ // restore position for backend
        backEndPlayers[socket.id].x = backEndPlayer.radius
      }
      if (playerSides.right>SCREENWIDTH){ // restore position for backend
        backEndPlayers[socket.id].x = SCREENWIDTH - backEndPlayer.radius
      }
      if (playerSides.top<0){ // restore position for backend
        backEndPlayers[socket.id].y = backEndPlayer.radius
      }
      if (playerSides.bottom>SCREENHEIGHT){ // restore position for backend
        backEndPlayers[socket.id].y = SCREENHEIGHT - backEndPlayer.radius
      }
    }
    
    // NOT A MOVEMENT
    switch(keycode) {
      case 'Digit1':
        //console.log('Digit1 presssed')
        backEndPlayer.currentSlot = 1
        break
      case 'Digit2':
        //console.log('Digit2 presssed')
        backEndPlayer.currentSlot = 2
        break
      case 'Digit3':
        //console.log('Digit3 presssed')
        backEndPlayer.currentSlot = 3
        break
      case 'Digit4':
        //console.log('Digit4 presssed')
        backEndPlayer.currentSlot = 4
        break
      case 'KeyF':
        //console.log('f presssed')
        socket.emit('interact',backEndItems)
        break
      case 'Space':
        //console.log('Space presssed')
        socket.emit('holdSpace')
        break
      case 'KeyG':
        //console.log('g presssed')
        break
      case 'KeyR':
        //console.log('r presssed')
        socket.emit('reload')
        break
      default:
        break
    }

  })

});

const FRICTION = 0.988
// backend ticker - update periodically server info to clients
setInterval(() => {
  // update projectiles
  for (const id in backEndProjectiles){
    const gunNameOfProjectile = backEndProjectiles[id].gunName

    // friction
    backEndProjectiles[id].velocity.x *= FRICTION
    backEndProjectiles[id].velocity.y *= FRICTION
    backEndProjectiles[id].speed *= FRICTION

    backEndProjectiles[id].x += backEndProjectiles[id].velocity.x
    backEndProjectiles[id].y += backEndProjectiles[id].velocity.y

    backEndProjectiles[id].travelDistance -= backEndProjectiles[id].speed
    // travel distance check for projectiles
    if (backEndProjectiles[id].travelDistance <= 0){
      delete backEndProjectiles[id]
      continue // dont reference projectile that does not exist
    }

    // boundary check for projectiles
    if (backEndProjectiles[id].x - PROJECTILERADIUS >= backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.width ||
        backEndProjectiles[id].x + PROJECTILERADIUS <= 0 ||
        backEndProjectiles[id].y - PROJECTILERADIUS >= backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.height ||
        backEndProjectiles[id].y + PROJECTILERADIUS <= 0 
      ) {
      delete backEndProjectiles[id]
      continue // dont reference projectile that does not exist
    }

    let COLLISIONTOLERANCE = Math.floor(gunInfo[gunNameOfProjectile].projectileSpeed/6) -1 // px
    // if (gunInfo[gunNameOfProjectile].projectileSpeed > 40){
    //   COLLISIONTOLERANCE = gunInfo[gunNameOfProjectile].projectileSpeed/6
    // }
    //console.log(COLLISIONTOLERANCE)

    // collision detection
    for (const playerId in backEndPlayers) {
      const backEndPlayer = backEndPlayers[playerId]
      const DISTANCE = Math.hypot(backEndProjectiles[id].x - backEndPlayer.x, backEndProjectiles[id].y - backEndPlayer.y)
      if ((backEndProjectiles[id].playerId !== playerId) && (DISTANCE < PROJECTILERADIUS + backEndPlayer.radius + COLLISIONTOLERANCE)) {
        // who got hit
        if (backEndPlayers[playerId]){ // safe
          if (backEndPlayers[playerId].health <= 0){ // who got shot
            // who shot projectile
            if (backEndPlayers[backEndProjectiles[id].playerId]){ // safe
              backEndPlayers[backEndProjectiles[id].playerId].score ++
            }
            safeDeletePlayer(playerId)
          } else {
            if (DISTANCE < PROJECTILERADIUS + backEndPlayer.radius + COLLISIONTOLERANCE/2){ // accurate/nice timming shot 
              backEndPlayers[playerId].health -= backEndProjectiles[id].projDamage
            } else{ // not accurate shot
              backEndPlayers[playerId].health -= backEndProjectiles[id].projDamage/2
            }
            if (backEndPlayers[playerId].health <= 0){ //check again
              // who shot projectile
              if (backEndPlayers[backEndProjectiles[id].playerId]){ // safe
                backEndPlayers[backEndProjectiles[id].playerId].score ++
              }
              safeDeletePlayer(playerId)} 
          }
        }
        // delete projectile after inspecting who shot the projectile & calculating damage
        delete backEndProjectiles[id] 

        break // only one player can get hit by a projectile
      }

    }
  }

  // update drawables
  for (const id in backendDrawables){
    backendDrawables[id].duration -= 1
    if (backendDrawables[id].duration <= 0){
      delete backendDrawables[id]
    }
  }

  // update items - dont have to be done fast
  for (const id in backEndItems){
    if (backEndItems[id].deleteRequest){
      delete backEndItems[id]
    }
  }

  io.emit('updateItems', backEndItems)
  io.emit('updateProjectiles',{backEndProjectiles,GUNHEARRANGE})
  io.emit('updateDrawables',{backendDrawables,GUNHEARRANGE})
  io.emit('updatePlayers',backEndPlayers)
}, TICKRATE)


server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
