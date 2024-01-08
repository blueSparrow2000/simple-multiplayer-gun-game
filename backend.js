// backend 
// constants
const TICKRATE = 15 // ms
const SCREENWIDTH = 1024//1920//
const SCREENHEIGHT = 576//1080//

// player attributes
const INVENTORYSIZE = 4
const PLAYERRADIUS = 10 //16
const PLAYERSPEED = TICKRATE/5 // pixel
const PLAYERHEALTH = 8
const PLAYERHEALTHMAX = 8
const GUNHEARRANGE = 700
const PLAYER_JOIN_DELAY = 3000

//to check if there exists any player left
let USERCOUNT = [0]

// for bullets
const FRICTION = 0.992//0.992

// for guns
const LASERDURATION = 40
const LASERWIDTH = 5

// enemy setting (manual)
const SPAWNENEMYFLAG = true
let ENEMYSPAWNRATE = 10000
let ENEMYNUM = 3
let ENEMYCOUNT = 0

const GROUNDITEMFLAG = true 
let GHOSTENEMY = false


const Mapconfig = 1
/* Map configs 
1: Gun testing
2: 4 player deathmatch (random position) + zombies
3: Zombie survival
*/

const itemTypes = ['gun','consumable','ammo', 'melee']

/*Adding a new gun: add to list gunInfo and add sound of a gun to sound/ and reloadSound/ folders!*/
// const PROJECTILESPEED = 20 
// proj speed limit for rad 3.5 (.45ACP): ~ 30? 
// proj speed limit for rad 5 (5mm): 20 ~ 42
// proj speed limit for rad 7 (7mm): ~ 52
const gunInfo = {
'railgun':{travelDistance:0, damage: 3, shake:0, num: 1, fireRate: 1000, projectileSpeed:0, magSize:2, reloadTime: 1800, ammotype:'battery', size: {length:50, width:5}}, // pierce walls and entities
'CrossBow':{travelDistance:650, damage: 8, shake:0, num: 1, fireRate: 100, projectileSpeed:8, magSize: 1, reloadTime: 1400, ammotype:'bolt', size: {length:21, width:2}}, 
'GuideGun':{travelDistance:900, damage: 3, shake:0, num: 1, fireRate: 2100, projectileSpeed:6, magSize: 10, reloadTime: 1800, ammotype:'superconductor', size: {length:35, width:8}}, 


'M1':{travelDistance:2000, damage: 6, shake:0, num: 1, fireRate: 1600, projectileSpeed:42, magSize: 5, reloadTime: 4000, ammotype:'7mm', size: {length:42, width:3}}, 
'mk14':{travelDistance:1000, damage: 3, shake:1, num: 1, fireRate: 600, projectileSpeed:32, magSize:14, reloadTime: 3300, ammotype:'7mm', size: {length:34, width:2} }, 
'SLR':{travelDistance:1200, damage: 4, shake:1, num: 1, fireRate: 350, projectileSpeed:36, magSize: 10, reloadTime: 2700, ammotype:'7mm', size: {length:38, width:2}}, 
'AWM':{travelDistance:2400, damage: 8, shake:0, num: 1, fireRate: 2000, projectileSpeed:30, magSize:  7, reloadTime: 4000, ammotype:'7mm', size: {length:50, width:3}}, 

'pistol':{travelDistance:500, damage: 1, shake:3, num: 1, fireRate: 300, projectileSpeed:15, magSize:15, reloadTime: 1100, ammotype:'5mm', size: {length:17, width:2}}, 
'M249':{travelDistance:800, damage: 1, shake:1, num: 1, fireRate: 75, projectileSpeed:23, magSize:150, reloadTime: 7400, ammotype:'5mm', size: {length:28, width:6}},
'VSS':{travelDistance:1000, damage: 1, shake:1, num: 1, fireRate: 100, projectileSpeed:19, magSize:10, reloadTime: 2300, ammotype:'5mm' , size: {length:27, width:2}}, 
'ak47':{travelDistance:700, damage: 1, shake:1, num: 1, fireRate: 100, projectileSpeed:21, magSize:30, reloadTime: 1000, ammotype:'5mm', size: {length:28, width:3}}, 
'FAMAS':{travelDistance:650, damage: 1, shake:2, num: 1, fireRate: 80, projectileSpeed:17, magSize: 30, reloadTime: 3200, ammotype:'5mm', size: {length:22, width:3}}, 

's686':{travelDistance:260, damage: 1, shake:5, num: 6, fireRate: 180, projectileSpeed:10, magSize:2, reloadTime: 1200, ammotype:'12G', size: {length:13, width:5}},
'DBS':{travelDistance:300, damage: 1, shake:3, num: 3, fireRate: 400, projectileSpeed:13, magSize:14, reloadTime: 6000, ammotype:'12G', size: {length:16, width:5}},
'usas12':{travelDistance:400, damage: 1, shake:3, num: 2, fireRate: 180, projectileSpeed:14, magSize:5, reloadTime: 2300, ammotype:'12G', size: {length:18, width:4}},

'ump45':{travelDistance:680, damage: 0.5, shake:2, num: 1, fireRate: 90, projectileSpeed:15, magSize:25, reloadTime: 2800, ammotype:'45ACP', size: {length:19, width:4}},
'vector':{travelDistance:600, damage: 0.5, shake:1, num: 1, fireRate: 50, projectileSpeed:17, magSize:19, reloadTime: 2600, ammotype:'45ACP', size: {length:18, width:3}},
'mp5':{travelDistance:650, damage: 0.5, shake:1, num: 1, fireRate: 70, projectileSpeed:19, magSize:30, reloadTime: 2100, ammotype:'45ACP', size: {length:20, width:3}},


'fist':{travelDistance:12, damage: 0.2, shake:0, num: 1, fireRate: 300, projectileSpeed:3, magSize:0, reloadTime: 0, ammotype:'bio', size: {length:12, width:2}},
'knife':{travelDistance:15, damage: 0.4, shake:0, num: 1, fireRate: 200, projectileSpeed:3, magSize:0, reloadTime: 0, ammotype:'sharp', size: {length:14, width:1}},
'bat':{travelDistance:18, damage: 1, shake:0, num: 1, fireRate: 500, projectileSpeed:3, magSize:0, reloadTime: 0, ammotype:'hard', size: {length:18, width:1.5}},
}

const meleeTypes = ['fist','knife', 'bat']

// player will hold these
const defaultGuns = []//['pistol','usas12','ak47','SLR'] 

// these guns are dropped by enemy only



const ammoTypes = ['45ACP','5mm','7mm','12G','battery', 'bolt', 'superconductor', 'bio', 'sharp', 'hard'] // ammo type === ammo name // fist sharp hard are place holders
const groundAmmoList = ['45ACP','5mm','7mm','12G','battery','bolt', 'superconductor']

const ammoInfo = {
'45ACP':{color:'SteelBlue',size:{length:12, width:12}, amount:50, radius:3.5},
'5mm':{color:'DarkOliveGreen',size:{length:12, width:12}, amount:30, radius:5},
'7mm':{color:'DarkGoldenRod',size:{length:12, width:12}, amount:10, radius:7},
'12G':{color: 'DarkRed',size:{length:12, width:12}, amount:14, radius:4},
'battery':{color: 'WhiteSmoke',size:{length:12, width:12}, amount:4, radius:0},

'bolt':{color: 'SlateBlue',size:{length:12, width:12}, amount:8, radius:1.5},
'superconductor':{color: 'BlanchedAlmond',size:{length:12, width:12}, amount:10, radius:6},

'bio':{color: 'black',size:{length:5, width:5}, amount:'inf', radius:10},
'sharp':{color: 'black',size:{length:10, width:10}, amount:'inf', radius:15},
'hard':{color: 'black',size:{length:15, width:15}, amount:'inf', radius:20},
}


const consumableTypes = ['bandage','medkit']
const consumableInfo = {
'bandage': {size:{length:8, width:8}, color: 'gray', healamount: 3 },
'medkit': {size:{length:12, width:12}, color: 'gray', healamount: PLAYERHEALTHMAX},
}




// library
const collide = require('line-circle-collision')

const express = require('express')
const app = express()

// socket.io setup
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')

//const io = new Server(server,{pingInterval:2000, pingTimeout:5000, wsEngine: 'ws' }); // timeout 5 seconds
const io = new Server(server,{pingInterval:2000, pingTimeout:5000}); // timeout 5 seconds

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})



// player data saved here
const backEndEnemies = {}
const backEndPlayers = {}
const deadPlayerPos = {}
const backEndProjectiles = {}
const backEndDrawables = {}
const backEndItems = {}
const backEndObjects = {}
let objectId = 0
let enemyId = 0
let itemsId = 0
let projectileId = 0
let drawableId = 0


const objectTypes = ['wall', 'hut']
// object format
// const objectInfos = {
// 'wall': {start:{x:,y:}, end:{x:,y:}, width:, color: , health: },
// 'hut': {center:{x:,y:}, radius: 20, color:, health:}
// }


// safely create object
function makeObjects(objecttype, health, objectinfo){
  objectId++

  let objectsideforbackend = {}

  if (objecttype === 'wall'){
    if (objectinfo.orientation==='vertical'){
      objectsideforbackend = {
        left: objectinfo.start.x - objectinfo.width/2,
        right: objectinfo.start.x + objectinfo.width/2,
        top: objectinfo.start.y,
        bottom: objectinfo.end.y,
        centerx: objectinfo.start.x, // same with end.x
        centery: ( objectinfo.start.y + objectinfo.end.y )/2
      }
    }else if(objectinfo.orientation==='horizontal'){
      objectsideforbackend = {
        left: objectinfo.start.x,
        right: objectinfo.end.x,
        top: objectinfo.start.y - objectinfo.width/2,
        bottom: objectinfo.start.y + objectinfo.width/2,
        centerx: ( objectinfo.start.x + objectinfo.end.x )/2,
        centery: objectinfo.start.y // same with end.y
      }
    }

  }
  //console.log(`new obj ID: ${objectId}`)

  backEndObjects[objectId] = {
    objecttype , myID:objectId, deleteRequest:false, health, objectinfo, objectsideforbackend
  }
}

function safeDeleteObject(id){
  //console.log(`obj removed ID: ${id}`)
  delete backEndObjects[id]
}

function borderCheckWithObjects(entity){
  if (!entity) {return} // no need to check

  for (const id in backEndObjects){
    const obj = backEndObjects[id]

    if (obj.objecttype === 'wall'){
      const objSides = obj.objectsideforbackend
      const entitySides = {
        left: entity.x - entity.radius,
        right: entity.x + entity.radius,
        top: entity.y - entity.radius,
        bottom: entity.y + entity.radius
      }
      if (entity){// only when entity exists
        // LR check (hori)
        if (objSides.top < entity.y && entity.y < objSides.bottom){
          if (objSides.centerx < entity.x && entitySides.left < objSides.right){ // restore position for backend
            entity.x = entity.radius + objSides.right
          }
          if (objSides.centerx >= entity.x && entitySides.right > objSides.left){ // restore position for backend
            entity.x = objSides.left - entity.radius
          }
        } 

        //TB check (verti)
        if (objSides.left < entity.x && entity.x < objSides.right){
          if (objSides.centery < entity.y && entitySides.top < objSides.bottom){ // restore position for backend
            entity.y = objSides.bottom + entity.radius
          }
          if (objSides.centery >= entity.y && entitySides.bottom > objSides.top){ // restore position for backend
            entity.y = objSides.top - entity.radius
          }
        }
      }
    } 
    

    if(obj.objecttype === 'hut'){
      const objinfoGET = obj.objectinfo
      // 'hut': {center:{x:,y:}, radius: 20, color:, health:}
      const radiusSum = objinfoGET.radius + entity.radius
      const xDist = entity.x - objinfoGET.center.x
      const yDist = entity.y - objinfoGET.center.y 
      const Dist = Math.hypot(xDist,yDist)

      if (Dist < radiusSum){
        const angle = Math.atan2(
          yDist,
          xDist
        )
        entity.x = objinfoGET.center.x + Math.cos(angle) * radiusSum
        entity.y = objinfoGET.center.y + Math.sin(angle) * radiusSum
      }
    }


  }

}


// fist is item id 0 fixed globally
backEndItems[0] = {
  itemtype: 'melee', groundx:0, groundy:0, size:{length:5, width:5}, name:'fist', color:'black', iteminfo:{ammo:'inf', ammotype:'bio'} ,onground:false, myID: 0, deleteRequest:false
}


function makeNdropItem(itemtype, name, groundx, groundy,onground=true){
  itemsId++
  let size
  let color
  let iteminfo 

  //different value
  if (itemtype === 'gun' || itemtype === 'melee'){
    const guninfoGET = gunInfo[name]
    size = guninfoGET.size
    color = 'white'
    let ammo = 0
    if (itemtype === 'melee'){
      color = 'black'
      ammo = 'inf'
    }
    const ammotype = guninfoGET.ammotype 
    iteminfo = {ammo,ammotype}

  } else if(itemtype === 'ammo'){
    //console.log(`why error: ${name}`)
    const ammoinfoGET = ammoInfo[name]
    size = ammoinfoGET.size
    color = ammoinfoGET.color
    const amount = ammoinfoGET.amount
    const ammotype = name // 7mm
    iteminfo = {amount,ammotype}
  } else if(itemtype === 'consumable'){
    const consumableinfoGET = consumableInfo[name]
    size = consumableinfoGET.size
    color = consumableinfoGET.color
    const amount = 1
    const healamount = consumableinfoGET.healamount
    iteminfo =  {amount,healamount}

  } else{
    console.log("invalid itemtype requested in makeNdropItem")
    return 
  }

  backEndItems[itemsId] = {
    itemtype, name, groundx, groundy, size, color, iteminfo, onground, myID: itemsId, deleteRequest:false
  }
}



/*
MAP config 1
Basic weapon test
*/
if (Mapconfig === 1){
  // build objects - orientation is not used in frontend. just for collision detection
  makeObjects("wall", 30, {orientation: 'vertical',start:{x:SCREENWIDTH/2,y:SCREENHEIGHT/2 + 150}, end:{x:SCREENWIDTH/2,y:SCREENHEIGHT - 21}, width:20, color: 'gray'})
  makeObjects("wall", 30, {orientation: 'horizontal',start:{x:SCREENWIDTH/2+150,y:SCREENHEIGHT-100}, end:{x:SCREENWIDTH - 21,y:SCREENHEIGHT-100}, width:20, color: 'gray'})
  // makeObjects("hut", 60, {center:{x:100,y:400}, radius: 30, color:'gray'})
  // item spawn
  if (GROUNDITEMFLAG){
    const groundgunList = [ 'M1', 'mk14', 'SLR','AWM',    'VSS', 'M249', 'ak47', 'FAMAS',    's686','DBS', 'usas12',     'ump45','vector','mp5']
    const groundGunAmount = groundgunList.length
    for (let i=0;i<groundGunAmount; i++){
      makeNdropItem('gun', groundgunList[i], SCREENWIDTH/2 + Math.round(60*(i - groundGunAmount/2)), SCREENHEIGHT/2 )
    }

    const specialGuns = ['GuideGun', 'railgun','CrossBow']
    const specialGunAmount = specialGuns.length
    for (let i=0;i<specialGunAmount; i++){
      makeNdropItem('gun', specialGuns[i], SCREENWIDTH/2 + Math.round(60*(i - specialGunAmount/2)), SCREENHEIGHT/2 + 50)
    }

    const groundAmmoAmount = groundAmmoList.length
    for (let i=0;i<groundAmmoAmount; i++){
      makeNdropItem( 'ammo', groundAmmoList[i], SCREENWIDTH/2 + Math.round(50*(i - groundAmmoAmount/2)), SCREENHEIGHT/2 - 50)
    }
    const groundConsList = ['bandage','bandage','bandage','bandage','bandage','medkit']
    const groundConsAmount = groundConsList.length
    for (let i=0;i<groundConsAmount; i++){
      makeNdropItem('consumable', groundConsList[i], SCREENWIDTH/2 + Math.round(50*(i - groundConsAmount/2)), SCREENHEIGHT/2 - 100)
    }
    const groundMeleeList = ['knife','bat']
    const groundMeleeAmount = groundMeleeList.length
    for (let i=0;i<groundMeleeAmount; i++){
      makeNdropItem('melee', groundMeleeList[i], SCREENWIDTH/2 + Math.round(50*(i - groundMeleeAmount/2)), SCREENHEIGHT/2 - 200)
    }
  }
}


/*
MAP config 2
4 players death match
*/
if (Mapconfig===2){
  const hutRadius = 50
  const wallThickness = 30
  const walkwayWidth = 20
  const quadrantCenters = {'1':{x:SCREENWIDTH/4*3,y:SCREENHEIGHT/4}, '2':{x:SCREENWIDTH/4,y:SCREENHEIGHT/4},'3':{x:SCREENWIDTH/4,y:SCREENHEIGHT/4*3},'4':{x:SCREENWIDTH/4*3,y:SCREENHEIGHT/4*3}}

  const wallHP = 30
  // makeObjects("hut", 1000, {center:{x:SCREENWIDTH/2,y:SCREENHEIGHT/2}, radius: hutRadius, color:'gray'})
  makeNdropItem('gun', 'railgun', SCREENWIDTH/2 , SCREENHEIGHT/2 )
  makeNdropItem('gun', 'CrossBow', SCREENWIDTH/2 , SCREENHEIGHT/2 )

  makeObjects("wall", wallHP, {orientation: 'vertical',start:{x:SCREENWIDTH/2,y:0}, end:{x:SCREENWIDTH/2,y:SCREENHEIGHT/2 - hutRadius}, width: wallThickness, color: 'gray'})
  makeObjects("wall", wallHP, {orientation: 'vertical',start:{x:SCREENWIDTH/2,y:SCREENHEIGHT/2 + hutRadius}, end:{x:SCREENWIDTH/2,y:SCREENHEIGHT}, width: wallThickness, color: 'gray'})

  makeObjects("wall", wallHP, {orientation: 'horizontal',start:{x:0,y:SCREENHEIGHT/2}, end:{x:SCREENWIDTH/2 - hutRadius,y:SCREENHEIGHT/2}, width: wallThickness, color: 'gray'})
  makeObjects("wall", wallHP, {orientation: 'horizontal',start:{x:SCREENWIDTH/2 + hutRadius,y:SCREENHEIGHT/2}, end:{x:SCREENWIDTH,y:SCREENHEIGHT/2}, width: wallThickness, color: 'gray'})


  //makeObjects("wall", 10, {orientation: 'vertical',start:{x:SCREENWIDTH/4,y:0}, end:{x:SCREENWIDTH/4,y:SCREENHEIGHT/2 - hutRadius}, width: wallThickness, color: 'gray'})

  // ['railgun',   'M1', 'mk14', 'SLR',   'pistol', 'VSS', 'M249', 'ak47', 'FAMAS',    's686','DBS', 'usas12',     'ump45','vector','mp5']
  const quadrantguns = {'1':['M1','s686','mp5'], '2':['mk14','DBS','vector'],'3':['SLR','usas12','ump45'],'4':['AWM','usas12','vector']}

  let centers = Object.keys(quadrantCenters)
  for (let i=0;i<centers.length;i++){
    const center = quadrantCenters[centers[i]]
    const gunList = quadrantguns[centers[i]]
    for (let j=0;j<gunList.length;j++){
      makeNdropItem('gun', gunList[j],  center.x + Math.round(60*(j - gunList.length/2)), center.y )
    }
    makeNdropItem('consumable', 'bandage', center.x , center.y - 50 )
    makeNdropItem('melee', 'knife', center.x , center.y + 50 )
    //makeNdropItem( 'ammo', '7', center.x + 50 , center.y + 50)
  }
  
}


/*
MAP config 3
ZOMBIE DEFENCE Mode
*/
if (Mapconfig===3){
  //GHOSTENEMY = false
  let ENEMYSPAWNRATE = 3000
  let ENEMYNUM = 3  

  const wallThickness = 20
  const walkwayWidth = 20
  const quadrantCenters = {'1':{x:SCREENWIDTH/4*3,y:SCREENHEIGHT/8}, '2':{x:SCREENWIDTH/4,y:SCREENHEIGHT/8},'3':{x:SCREENWIDTH/4,y:SCREENHEIGHT/8*7},'4':{x:SCREENWIDTH/4*3,y:SCREENHEIGHT/8*7}}

  
  makeNdropItem('gun', 'railgun', SCREENWIDTH/2 , SCREENHEIGHT/2 )

  //makeObjects("hut", 10, {center:{x:SCREENWIDTH/2,y:SCREENHEIGHT/2}, radius: 50, color:'gray'})
  const wallHP = 60
  makeObjects("wall", wallHP, {orientation: 'horizontal',start:{x:SCREENWIDTH/4,y:SCREENHEIGHT/4}, end:{x:SCREENWIDTH/8*3,y:SCREENHEIGHT/4 }, width: wallThickness, color: 'gray'})
  makeObjects("wall", wallHP, {orientation: 'horizontal',start:{x:SCREENWIDTH/4,y:SCREENHEIGHT/4*3}, end:{x:SCREENWIDTH/8*3,y:SCREENHEIGHT/4*3}, width: wallThickness, color: 'gray'})
  makeObjects("wall", wallHP, {orientation: 'horizontal',start:{x:SCREENWIDTH/4 + SCREENWIDTH/8*3,y:SCREENHEIGHT/4}, end:{x:SCREENWIDTH/8*3 + SCREENWIDTH/8*3,y:SCREENHEIGHT/4 }, width: wallThickness, color: 'gray'})
  makeObjects("wall", wallHP, {orientation: 'horizontal',start:{x:SCREENWIDTH/4 + SCREENWIDTH/8*3,y:SCREENHEIGHT/4*3}, end:{x:SCREENWIDTH/8*3 + SCREENWIDTH/8*3,y:SCREENHEIGHT/4*3}, width: wallThickness, color: 'gray'})


  makeObjects("wall", wallHP, {orientation: 'vertical',start:{x:SCREENWIDTH/4 ,y:SCREENHEIGHT/4-wallThickness/2}, end:{x:SCREENWIDTH/4,y:SCREENHEIGHT/8*3}, width: wallThickness, color: 'gray'})
  makeObjects("wall", wallHP, {orientation: 'vertical',start:{x:SCREENWIDTH/4*3 ,y:SCREENHEIGHT/4-wallThickness/2}, end:{x:SCREENWIDTH/4*3,y:SCREENHEIGHT/8*3}, width: wallThickness, color: 'gray'})
  makeObjects("wall", wallHP, {orientation: 'vertical',start:{x:SCREENWIDTH/4 ,y:SCREENHEIGHT/4+SCREENHEIGHT/8*3}, end:{x:SCREENWIDTH/4,y:SCREENHEIGHT/8*3+SCREENHEIGHT/8*3+wallThickness/2}, width: wallThickness, color: 'gray'})
  makeObjects("wall", wallHP, {orientation: 'vertical',start:{x:SCREENWIDTH/4*3 ,y:SCREENHEIGHT/4+SCREENHEIGHT/8*3}, end:{x:SCREENWIDTH/4*3,y:SCREENHEIGHT/8*3+SCREENHEIGHT/8*3+wallThickness/2}, width: wallThickness, color: 'gray'})


  // ['railgun',   'M1', 'mk14', 'SLR',   'pistol', 'VSS', 'M249', 'ak47', 'FAMAS',    's686','DBS', 'usas12',     'ump45','vector','mp5']
  const quadrantguns = {'1':['s686','mp5'], '2':['mk14','DBS'],'3':['AWM','vector'],'4':['CrossBow','ump45']} //M1 is buggy on walls

  let centers = Object.keys(quadrantCenters)
  for (let i=0;i<centers.length;i++){
    const center = quadrantCenters[centers[i]]
    const gunList = quadrantguns[centers[i]]
    for (let j=0;j<gunList.length;j++){
      makeNdropItem('gun', gunList[j],  center.x + Math.round(60*(j - gunList.length/2)), center.y )
    }
    makeNdropItem('consumable', 'medkit', SCREENWIDTH/2 + (Math.random() - 0.5)*100 , SCREENHEIGHT/2 - (Math.random() - 0.5)*100 )
    //makeNdropItem( 'ammo', '7', center.x + 50 , center.y + 50)
  }
  makeNdropItem('melee', 'knife', SCREENWIDTH/2 , SCREENHEIGHT/2 + 50 )
  makeNdropItem('consumable', 'bandage', SCREENWIDTH/2 + 100 , SCREENHEIGHT/2 +100)
}


function itemBorderCheck(xCoord, yCoord){
  let xInBorder = xCoord
  let yInBorder = yCoord

  if (xCoord < 0){
    xInBorder = 0
  }else if (xCoord > SCREENWIDTH){
    xInBorder = SCREENWIDTH
  }
  if ( yCoord < 0){
    yInBorder = 0
  } else if( yCoord > SCREENHEIGHT){
    yInBorder = SCREENHEIGHT
  }
  return [xInBorder, yInBorder]
}

function itemBorderUpdate(item){
  if (item.groundx < 0){
    item.groundx = 0
  }else if (item.groundx > SCREENWIDTH){
    item.groundx = SCREENWIDTH
  }
  if (item.groundy < 0){
    item.groundy = 0
  } else if(item.groundy > SCREENHEIGHT){
    item.groundy = SCREENHEIGHT
  }
}



function safeDeletePlayer(playerId){
  // drop all item before removing
  const backEndPlayer = backEndPlayers[playerId]
  const inventoryItems = backEndPlayer.inventory
   
  for (let i=0;i<inventoryItems.length;i++){
    const curitemID = inventoryItems[i].myID
    if (curitemID===0){ // no fist
      continue
    }
    let backEndItem = backEndItems[curitemID]
    backEndItem.onground = true
    backEndItem.groundx = backEndPlayer.x + (Math.random() - 0.5)*100
    backEndItem.groundy = backEndPlayer.y + (Math.random() - 0.5)*100
    itemBorderUpdate(backEndItem)
  }

  deadPlayerPos[playerId] = {x:backEndPlayer.x,y:backEndPlayer.y}

  delete backEndPlayers[playerId]
}


function Moveplayer(playerGIVEN, WW, AA, SS, DD){
  if (WW){
    playerGIVEN.y -= PLAYERSPEED
  }
  if (AA){
    playerGIVEN.x -= PLAYERSPEED
  }
  if (SS){
    playerGIVEN.y += PLAYERSPEED
  }
  if (DD){
    playerGIVEN.x += PLAYERSPEED
  }
  const playerSides = {
    left: playerGIVEN.x - playerGIVEN.radius,
    right: playerGIVEN.x + playerGIVEN.radius,
    top: playerGIVEN.y - playerGIVEN.radius,
    bottom: playerGIVEN.y + playerGIVEN.radius
  }

  if (playerSides.left<0){ // restore position for backend
    playerGIVEN.x = playerGIVEN.radius
  }
  if (playerSides.right>SCREENWIDTH){ // restore position for backend
    playerGIVEN.x = SCREENWIDTH - playerGIVEN.radius
  }
  if (playerSides.top<0){ // restore position for backend
    playerGIVEN.y = playerGIVEN.radius
  }
  if (playerSides.bottom>SCREENHEIGHT){ // restore position for backend
    playerGIVEN.y = SCREENHEIGHT - playerGIVEN.radius
  }

  // check boundary with objects also
  borderCheckWithObjects(playerGIVEN)
}



// player spawn
io.on('connection', (socket) => {
  let playerJoinTimeout
  
  console.log('a user connected');

  // give server info to a frontend
  socket.emit('serverVars', {gunInfo, ammoInfo, consumableInfo, PLAYERSPEED})

  // projectile spawn
  socket.on('shoot',({x,y,angle, mousePos, currentGun,playerIdEXACT}) => {
    const gunName = currentGun
    
    if (gunName==='railgun'){
      drawableId++

      // collision detection with a line (hitscan) - players
      for (const playerId in backEndPlayers) {
        let backEndPlayer = backEndPlayers[playerId]
        // collide line
        let collisionDetected = collide([x,y], [mousePos.x,mousePos.y], [backEndPlayer.x, backEndPlayer.y], backEndPlayer.radius+LASERWIDTH)

        if ((playerIdEXACT !== playerId) && collisionDetected) {
          //console.log(`${backEndPlayers[playerIdEXACT].username} shot ${backEndPlayer.username} a railgun!`)
          // who got hit
          if (backEndPlayer){ // safe
            if (backEndPlayer.health <= 0){ // who got shot
              // who shot projectile
              if (backEndPlayers[playerIdEXACT]){ // safe
                backEndPlayers[playerIdEXACT].score ++
              }
              safeDeletePlayer(playerId)
            } else {
              backEndPlayer.health -= gunInfo['railgun'].damage;
              if (backEndPlayer.health <= 0){               // who shot projectile
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

      // collision detection with a line (hitscan) - enemies
      for (const enemyId in backEndEnemies) {
        let backEndEnemy = backEndEnemies[enemyId]
        let collisionDetected = collide([x,y], [mousePos.x,mousePos.y], [backEndEnemy.x, backEndEnemy.y], backEndEnemy.radius+LASERWIDTH)

        if (collisionDetected) {
          // who got hit
          if (backEndEnemy){ // safe
            if (backEndEnemy.health <= 0){ // who got shot
              if (backEndPlayers[playerIdEXACT]){ // safe
                backEndPlayers[playerIdEXACT].score ++
              }
              safeDeleteEnemy(enemyId)
            } else {
              backEndEnemy.health -= gunInfo['railgun'].damage
              if (backEndEnemy.health <= 0){ //check again
                if (backEndPlayers[playerIdEXACT]){ // safe
                  backEndPlayers[playerIdEXACT].score ++
                }
                safeDeleteEnemy(enemyId)} 
            }
          }
        }
      }

      backEndDrawables[drawableId] = {
        start:{x,y},end: mousePos, playerIdEXACT, linewidth: LASERWIDTH, duration: LASERDURATION
      }
      // for railgun effect and particles
      // io.emit('updateDrawables',{backEndDrawables,GUNHEARRANGE})
      // io.emit('updatePlayers',backEndPlayers)
      // io.emit('updateEnemies',backEndEnemies)
      // only railgun hitscan finished
    } else {
      function addProjectile(){
        projectileId++
        // calculate vel with angle
        const guninfoGET = gunInfo[currentGun]
        const shakeProj = guninfoGET.shake
        const bulletSpeed = guninfoGET.projectileSpeed
        const velocity = { // with shake!
          x: Math.cos(angle) * bulletSpeed + (Math.random()-0.5) * shakeProj,
          y: Math.sin(angle) * bulletSpeed + (Math.random()-0.5) * shakeProj
        }
        // const speed = Math.hypot(velocity.x,velocity.y)
        const radius = ammoInfo[guninfoGET.ammotype].radius//PROJECTILERADIUS
    
        const travelDistance = guninfoGET.travelDistance
        const projDamage =  guninfoGET.damage
    
        backEndProjectiles[projectileId] = {
          x,y,radius,velocity, speed:bulletSpeed, playerId: socket.id, gunName, travelDistance, projDamage
        }
        //console.log(backEndProjectiles) // finished adding a projectile
      }
      
      for (let i=0;i< gunInfo[currentGun].num;i++){
        addProjectile()
      }

    }
  })

  // initialize game when clicking button (submit name)
  socket.on('initGame',({username,width,height,playerX, playerY, playerColor})=>{
    // initialize inventory with fist
    let inventory =  new Array(INVENTORYSIZE).fill().map(() => (backEndItems[0])) // array points to references - fist can be shared for all players

    // default item for a player if exists
    for (let i=0;i<defaultGuns.length; i++){
      makeNdropItem('gun', defaultGuns[i], SCREENWIDTH/2 , SCREENHEIGHT/2,onground=false)
      inventory[i] = backEndItems[itemsId]
    }

    playerJoinTimeout = setTimeout(function(){
      clearTimeout(playerJoinTimeout);
      backEndPlayers[socket.id] = {
        x:playerX,
        y:playerY,
        color: playerColor,
        radius: PLAYERRADIUS,
        score: 0,
        health: PLAYERHEALTH,
        username,
        inventory, // size 4
        currentSlot: 1, // 1~4
        mousePos: {x:SCREENWIDTH/2,y:SCREENHEIGHT/2},
        canvas:{width,height}
      };
      USERCOUNT[0]++;
    } ,PLAYER_JOIN_DELAY)


    // makes a player here!
    // backEndPlayers[socket.id] = {
    //   x:playerX,
    //   y:playerY,
    //   color: `hsl(${Math.random()*360},100%,70%)`,
    //   radius: PLAYERRADIUS,
    //   score: 0,
    //   health: PLAYERHEALTH,
    //   username,
    //   inventory, // size 4
    //   currentSlot: 1, // 1~4
    //   mousePos: {x:SCREENWIDTH/2,y:SCREENHEIGHT/2},
    //   canvas:{width,height}
    // }

    // where we init our canvas
    // backEndPlayers[socket.id].canvas = {
    //   width,
    //   height
    // }

    // request enemy
    // USERCOUNT[0]++
    // console.log(`User on the server: ${USERCOUNT[0]}`)


  })


  // player death => put ammos to the ground!
  socket.on('playerdeath',({playerId, playerammoList})=>{
    let deadplayerGET = deadPlayerPos[playerId]
    if (!deadplayerGET){return}
    //console.log(playerammoList)
    for (const ammoT in ammoTypes){
      // make item
      const name = ammoTypes[ammoT]
      let ammoInfoGET = ammoInfo[name]
      const ammoinfoamt = ammoInfoGET.amount
      if (ammoinfoamt==='inf'){ // melee weapon's ammo => dont show!
        continue
      }

      const itemtype = 'ammo' //  gun ammo consumable
      const groundxtemp = deadplayerGET.x + (Math.random() - 0.5)*150
      const groundytemp = deadplayerGET.y + (Math.random() - 0.5)*150

      const [xInBorder, yInBorder] = itemBorderCheck(groundxtemp,groundytemp)
      //console.log(xInBorder, yInBorder)

      const size =ammoInfoGET.size
      const color = ammoInfoGET.color
      const amount = playerammoList[name]
      if (amount <=0) { // no ammo than dont make it
        continue
      }
      const ammotype = name // 7mm

      itemsId++

      backEndItems[itemsId] = {
        itemtype, groundx:xInBorder , groundy:yInBorder , size, name, color,iteminfo:{amount,ammotype}, onground:true,myID: itemsId, deleteRequest:false
      }
    }
    //console.log(`${playerId} died`)
    delete deadPlayerPos[playerId]

  })



  // eat
  socket.on('consume',({itemName,playerId,healamount,deleteflag, itemid,currentSlot}) => {
    let curplayer = backEndPlayers[playerId]
    if (!curplayer) {return}
    function APIdeleteItem(){
      // change player current holding item to fist
      curplayer.inventory[currentSlot-1] = backEndItems[0]
      // delete safely
      backEndItems[itemid].deleteflag = deleteflag
      //delete backEndItems[itemid]
    }

    if (itemName === 'medkit'){
      curplayer.health = PLAYERHEALTHMAX
      APIdeleteItem()
    } else if (curplayer.health + healamount <= PLAYERHEALTHMAX){
      curplayer.health += healamount
      APIdeleteItem()
    }
    
  })



  // change gound item info from client side
  socket.on('updateitemrequest', ({itemid, requesttype,currentSlot=1, groundx=0, groundy=0, playerId=0})=>{
    let itemToUpdate = backEndItems[itemid]
    if (!itemToUpdate) {return}
    if (requesttype==='deleteammo'){
      itemToUpdate.onground = false
      itemToUpdate.deleteRequest = true
    } else if (requesttype === 'pickupinventory'){
      itemToUpdate.onground = false
      if (backEndPlayers[playerId]){
        backEndPlayers[playerId].inventory[currentSlot-1] = backEndItems[itemid]// reassign item (only me)
      }
      //console.log(backEndPlayers[playerId].inventory[currentSlot-1].myID)
    } 
  })

  socket.on('updateitemrequestDROP', ({itemid, requesttype,currentSlot=1, groundx=0, groundy=0, playerId=0})=>{
    let itemToUpdate = backEndItems[itemid]
    if (!itemToUpdate) {return}
    if(requesttype==='dropitem' || (!itemid)){ // not fist
      itemToUpdate.onground = true
      itemToUpdate.groundx = groundx
      itemToUpdate.groundy = groundy
      //console.log(`dropped: ${itemToUpdate.name}`)
    }

  })

  // remove player when disconnected (F5 etc.)
  socket.on('disconnect',(reason) => {
    //USERCOUNT[0]-- // decrease by one to check if there exists any player left
    //console.log(`User on the server: ${USERCOUNT[0]}`)

    console.log(reason)
    delete backEndPlayers[socket.id]
    io.emit('updatePlayers',backEndPlayers) // remove from index.html also
  })


  ///////////////////////////////// Frequent key-downs update ///////////////////////////////////////////////
  // update frequent keys at once (Movement & hold shoot)  //always fire hold = true since space was pressed
  socket.on('moveNshootUpdate', ({WW, AA, SS, DD, x, y})=>{
    let backEndPlayer = backEndPlayers[socket.id]
    if (!backEndPlayer){return}

    backEndPlayer.mousePos = {x,y}

    // Movement analysis
    Moveplayer(backEndPlayer, WW, AA, SS, DD)

    socket.emit('holdSpace')
  })

  // update frequent keys at once (Movement only)
  socket.on('movingUpdate', ({WW, AA, SS, DD, x, y})=>{
    let backEndPlayer = backEndPlayers[socket.id]
    if (!backEndPlayer){return}

    backEndPlayer.mousePos = {x,y}

    // Movement analysis
    Moveplayer(backEndPlayer, WW, AA, SS, DD)
  })

  // always fire hold = true since space was pressed
  socket.on('holdUpdate', ({x, y}) => {
    let backEndPlayer = backEndPlayers[socket.id]
    if (!backEndPlayer){return}
    backEndPlayer.mousePos = {x,y}

    socket.emit('holdSpace')
  })

  // hear player's mouse pos changes 
  socket.on('playermousechange', ({x,y})=>{
    let backEndPlayer = backEndPlayers[socket.id]
    if (!backEndPlayer){return}
    backEndPlayer.mousePos = {x,y}
  })

  ///////////////////////////////// Non-Frequent key-downs update ////////////////////////////////////////////

  socket.on('keydown',({keycode}) => {
    let backEndPlayer = backEndPlayers[socket.id]
    if (!backEndPlayer){ // if player was removed, do nothing
      return
    }



    // This will go to movement checking code
    // let isMovement = true
    // switch(keycode) {
    //   case 'KeyW':
    //     backEndPlayer.y -= PLAYERSPEED
    //     break
    //   case 'KeyA':
    //     backEndPlayer.x -= PLAYERSPEED
    //     break
    //   case 'KeyS':
    //     backEndPlayer.y += PLAYERSPEED
    //     break
    //   case 'KeyD':
    //     backEndPlayer.x += PLAYERSPEED
    //     break
    //   default:
    //     isMovement = false
    //     break
    // }
    // if (isMovement){

    //   // after movement, check border for player
    //   const playerSides = {
    //     left: backEndPlayer.x - backEndPlayer.radius,
    //     right: backEndPlayer.x + backEndPlayer.radius,
    //     top: backEndPlayer.y - backEndPlayer.radius,
    //     bottom: backEndPlayer.y + backEndPlayer.radius
    //   }

    //   if (playerSides.left<0){ // restore position for backend
    //     backEndPlayer.x = backEndPlayer.radius
    //   }
    //   if (playerSides.right>SCREENWIDTH){ // restore position for backend
    //     backEndPlayer.x = SCREENWIDTH - backEndPlayer.radius
    //   }
    //   if (playerSides.top<0){ // restore position for backend
    //     backEndPlayer.y = backEndPlayer.radius
    //   }
    //   if (playerSides.bottom>SCREENHEIGHT){ // restore position for backend
    //     backEndPlayer.y = SCREENHEIGHT - backEndPlayer.radius
    //   }

    //   // check boundary with objects also
    //   borderCheckWithObjects(backEndPlayer)

    // }
    
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
      // case 'Space': // frequent key checked on other socket event
      //   //console.log('Space presssed')
      //   socket.emit('holdSpace')
      //   break
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




function spawnEnemies(){
  enemyId++
  ENEMYCOUNT ++
  const factor = 1 +  Math.random()  // 1~2
  const radius = Math.round(factor*8) // 8~16
  const speed = 3 - factor // 1~2
  let x
  let y

  if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : SCREENWIDTH + radius
      y = Math.random() * SCREENHEIGHT
  }else{
      x = Math.random() * SCREENWIDTH
      y = Math.random() < 0.5 ? 0 - radius : SCREENHEIGHT + radius
  }

  let homing = false
  let homingTargetId = -1
  let colorfactor = 100 + Math.round(factor*40)

  if (Math.random() > 0.5){ // 50% chance of homing!
    homing = true
    colorfactor = Math.round(factor*40)
    //console.log('homing!')

    const backEndPlayersKey = Object.keys(backEndPlayers)
    const playerNum = backEndPlayersKey.length

    if (playerNum===0){
      //console.log('No players')
      idx = 0
      homing = false
    }else{
      //console.log(`${playerNum} Players playing`)
      idx = Math.round(Math.random()* (playerNum - 1) ) // 0 ~ #player - 1
    }

    homingTargetId = backEndPlayersKey[idx]



  }
  // back ticks: ~ type this without shift!

  const color = `hsl(${colorfactor},50%,50%)` // [0~360, saturation %, lightness %]
  const angle = Math.atan2(SCREENHEIGHT/2 - y, SCREENWIDTH/2 - x)
  const velocity = {
      x: Math.cos(angle)*speed,
      y: Math.sin(angle)*speed
  }

  const damage = 1
  const myID = enemyId
  const health = factor*2 -1


  // (new Enemy({ex, ey, eradius, ecolor, evelocity}))
  backEndEnemies[enemyId] = {
    x,y,radius,velocity, myID, color, damage, health, homing, homingTargetId, speed
  }
  //console.log(`spawned enemy ID: ${enemyId}`)
}


const enemyDropGuns = ['M249', 'VSS', 'ak47', 'FAMAS']
const GunAmmoLen = Object.keys(ammoInfo).length - 3 

function safeDeleteEnemy(enemyid, leaveDrop = true){
  const enemyInfoGET = backEndEnemies[enemyid]
  if (!backEndEnemies[enemyid]) {return} // already removed somehow
  if (leaveDrop){
    const idx = Math.floor(Math.random()*(GunAmmoLen))  // 7 kinds of ammo: 0 ~ 6
    const idxGUN = Math.round(Math.random()*(enemyDropGuns.length-1)) // 0 ~ 3
    //console.log(idx)
    const chance = Math.random()
    if (chance < 0.1){ // 10% chance to drop ammo
      makeNdropItem( 'ammo', ammoTypes[idx], enemyInfoGET.x,enemyInfoGET.y)
    } else if (chance>0.99){ // 1% to drop guns
      makeNdropItem( 'gun', enemyDropGuns[idxGUN], enemyInfoGET.x,enemyInfoGET.y)
    } 
  } 
  //else{
  //   //console.log("Enemy Death by leaving the screen")
  // }

  //console.log(`enemy removed ID: ${enemyid}`)
  ENEMYCOUNT--
  delete backEndEnemies[enemyid]
}



let GLOBALCLOCK = 0

// backend ticker - update periodically server info to clients
setInterval(() => {
  GLOBALCLOCK += TICKRATE
  // enemy spawn mechanism
  if ((GLOBALCLOCK > ENEMYSPAWNRATE) && (SPAWNENEMYFLAG) && (USERCOUNT[0]>0)){
    for (let i=0;i<ENEMYNUM;i++){
      spawnEnemies()
    }
    GLOBALCLOCK = 0 // init
  }


  // update projectiles
  for (const id in backEndProjectiles){
    let BULLETDELETED = false
    let projGET = backEndProjectiles[id]
    const gunNameOfProjectile = projGET.gunName
    const PROJECTILERADIUS = projGET.radius
    let myspeed = projGET.speed

    if (gunNameOfProjectile === 'GuideGun'){ // totally different mechanism - follow player's cursor
      const playerGET = backEndPlayers[projGET.playerId]

      if (!playerGET){ // the person who shot the missle died
        delete backEndProjectiles[id]
        continue // dont reference projectile that does not exist
      }

      const cursorloc = playerGET.mousePos
      const angling = Math.atan2(
        cursorloc.y - projGET.y,
        cursorloc.x - projGET.x
      )

      projGET.x += Math.cos(angling) * myspeed
      projGET.y += Math.sin(angling) * myspeed

    } else{
    // friction
    if (gunNameOfProjectile !== 'AWM'){
      projGET.velocity.x *= FRICTION
      projGET.velocity.y *= FRICTION
      myspeed *= FRICTION
    }

    projGET.x += projGET.velocity.x
    projGET.y += projGET.velocity.y
    }


    projGET.travelDistance -= myspeed
    // travel distance check for projectiles
    if (projGET.travelDistance <= 0){
      BULLETDELETED = true
      delete backEndProjectiles[id]
      continue // dont reference projectile that does not exist
    }

    // boundary check for projectiles
    if (projGET.x - PROJECTILERADIUS >= backEndPlayers[projGET.playerId]?.canvas?.width ||
        projGET.x + PROJECTILERADIUS <= 0 ||
        projGET.y - PROJECTILERADIUS >= backEndPlayers[projGET.playerId]?.canvas?.height ||
        projGET.y + PROJECTILERADIUS <= 0 
      ) {
      BULLETDELETED = true
      delete backEndProjectiles[id]
      continue // dont reference projectile that does not exist
    }

    let COLLISIONTOLERANCE = Math.floor(gunInfo[gunNameOfProjectile].projectileSpeed/6) -1 // px


    // collision with objects
    for (const objid in backEndObjects) {
      const backEndObject = backEndObjects[objid]
      const objInfo = backEndObject.objectinfo


      let collisionDetectedObject 
      if (backEndObject.objecttype==='wall'){
        collisionDetectedObject = collide([objInfo.start.x,objInfo.start.y], [objInfo.end.x,objInfo.end.y], [projGET.x, projGET.y], PROJECTILERADIUS + objInfo.width/2 + COLLISIONTOLERANCE)
      } else if(backEndObject.objecttype==='hut'){
        const DISTANCE = Math.hypot(projGET.x - objInfo.center.x, projGET.y - objInfo.center.y)
        collisionDetectedObject = (DISTANCE < PROJECTILERADIUS + objInfo.radius) // + COLLISIONTOLERANCE no tolerance
      } else{
        console.log("invalid object-projectile interaction: undefined or other name given to obj")
      }

      if (collisionDetectedObject) {
        // who got hit
        if (backEndObjects[objid]){ // safe
          backEndObjects[objid].health -= projGET.projDamage
          //console.log(`Object: ${objid} has health: ${backEndObjects[objid].health} remaining`)
          if (backEndObjects[objid].health <= 0){ //check
            safeDeleteObject(objid)
          } 
        }
        BULLETDELETED = true
        delete backEndProjectiles[id] 
        break // only one obj can get hit by a projectile
      }
    }

    if (BULLETDELETED){ // dont check below if collided
      continue
    }

    // collision detection with players
    for (const playerId in backEndPlayers) {
      let backEndPlayer = backEndPlayers[playerId]
      const DISTANCE = Math.hypot(projGET.x - backEndPlayer.x, projGET.y - backEndPlayer.y)
      if ((projGET.playerId !== playerId) && (DISTANCE < PROJECTILERADIUS + backEndPlayer.radius + COLLISIONTOLERANCE)) {
        // who got hit
        if (backEndPlayer){ // safe
          if (backEndPlayer.health <= 0){ // who got shot
            // who shot projectile
            if (backEndPlayers[projGET.playerId]){ // safe
              backEndPlayers[projGET.playerId].score ++
            }
            safeDeletePlayer(playerId)
          } else {
            if (DISTANCE < PROJECTILERADIUS + backEndPlayer.radius + COLLISIONTOLERANCE/2){ // accurate/nice timming shot 
              backEndPlayer.health -= projGET.projDamage
            } else{ // not accurate shot
              backEndPlayer.health -= projGET.projDamage/2
            }
            if (backEndPlayer.health <= 0){ //check again
              // who shot projectile
              if (backEndPlayers[projGET.playerId]){ // safe
                backEndPlayers[projGET.playerId].score ++
              }
              safeDeletePlayer(playerId)} 
          }
        }
        // delete projectile after inspecting who shot the projectile & calculating damage
        BULLETDELETED = true
        delete backEndProjectiles[id] 

        break // only one player can get hit by a projectile
      }
    }

    // collision detection with enemies
    if (BULLETDELETED){ // dont check for loop with enemy 
      continue
    }
    for (const enemyId in backEndEnemies) {
      let backEndEnemy = backEndEnemies[enemyId]
      const DISTANCE = Math.hypot(projGET.x - backEndEnemy.x, projGET.y - backEndEnemy.y)
      if ((DISTANCE < PROJECTILERADIUS + backEndEnemy.radius + COLLISIONTOLERANCE)) {
        // who got hit
        if (backEndEnemy){ // safe
          if (backEndEnemy.health <= 0){ // who got shot
            if (backEndPlayers[projGET.playerId]){ // safe
              backEndPlayers[projGET.playerId].score ++
            }
            safeDeleteEnemy(enemyId)
          } else {
            if (DISTANCE < PROJECTILERADIUS + backEndEnemy.radius + COLLISIONTOLERANCE/2){ // accurate/nice timming shot 
              backEndEnemy.health -= projGET.projDamage
            } else{ // not accurate shot
              backEndEnemy.health -= projGET.projDamage/2
            }
            if (backEndEnemy.health <= 0){ //check again
              if (backEndPlayers[projGET.playerId]){ // safe
                backEndPlayers[projGET.playerId].score ++
              }
              safeDeleteEnemy(enemyId)} 
          }
        }
        // delete projectile after inspecting who shot the projectile & calculating damage
        BULLETDELETED = true
        delete backEndProjectiles[id] 
        break // only one enemy can get hit by a projectile
      }
    }
    if (BULLETDELETED){ // dont check below
      continue
    }

    

  }

  // update objects
  for (const id in backEndObjects){
    const objinfo = backEndObjects[id].objectinfo
    if (objinfo.health <= 0){
      safeDeleteObject(id)
    }
  }

  // update drawables
  for (const id in backEndDrawables){
    backEndDrawables[id].duration -= 1
    if (backEndDrawables[id].duration <= 0){
      delete backEndDrawables[id]
    }
  }

  // update items - dont have to be done fast
  for (const id in backEndItems){
    if (backEndItems[id].deleteRequest){
      delete backEndItems[id]
    }
  }


  // update enemies
  for (const id in backEndEnemies){
    let enemy = backEndEnemies[id]
    const enemyRad = enemy.radius


    if (enemy.homing ){ 
      const targetplayer = backEndPlayers[enemy.homingTargetId]
      if (targetplayer){// initial target still exists
        const angle = Math.atan2(
          targetplayer.y - enemy.y,
          targetplayer.x - enemy.x
        )
        
        enemy.x += enemy.speed * Math.cos(angle)
        enemy.y += enemy.speed * Math.sin(angle)
      }
      else{  // initial target died => dont move for a moment and walk randomly
        enemy.homing = false 
      }
    } else{ // just walk random direction
      enemy.x += enemy.velocity.x
      enemy.y += enemy.velocity.y
    }




    if (enemy.x - enemyRad >= SCREENWIDTH ||
      enemy.x + enemyRad <= 0 ||
      enemy.y - enemyRad >= SCREENHEIGHT ||
      enemy.y + enemyRad <= 0 
      ) {
        safeDeleteEnemy(id,leaveDrop = false)
      continue // dont reference enemy that does not exist
    }

    // collision detection
    for (const playerId in backEndPlayers) {
      let backEndPlayer = backEndPlayers[playerId]
      const DISTANCE = Math.hypot(enemy.x - backEndPlayer.x, enemy.y - backEndPlayer.y)
      if ((DISTANCE < enemyRad + backEndPlayer.radius)) {
        // who got hit
        if (backEndPlayer){ // safe
          if (backEndPlayer.health <= 0){ // who got shot
            safeDeletePlayer(playerId)
          } else {
            backEndPlayer.health -= enemy.damage
            if (backEndPlayer.health <= 0){ //check again
              safeDeletePlayer(playerId)} 
          }
        }
        // delete enemy after calculating damage
        safeDeleteEnemy(id,leaveDrop = false)
        break // only one player can get hit by a enemy
      }
    }

    // boundary check with objects!
    if (!GHOSTENEMY){
      borderCheckWithObjects(enemy)
    }

  }

  // broadcast
  // io.emit('updatePlayers',backEndPlayers) // socket.emit speaks to that player only
  // io.emit('updateObjects', backEndObjects)
  // io.emit('updateEnemies', backEndEnemies)
  // io.emit('updateItems', backEndItems)
  // io.emit('updateProjectiles',{backEndProjectiles,GUNHEARRANGE})
  // io.emit('updateDrawables',{backEndDrawables,GUNHEARRANGE})

  // update in order of importance
  io.emit('updateFrontEnd',{backEndPlayers, backEndEnemies, backEndProjectiles, backEndDrawables, backEndObjects, backEndItems, GUNHEARRANGE})


}, TICKRATE)


server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

