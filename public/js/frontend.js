// front end - player can manipulate
// constants
let PLAYERSPEEDFRONTEND = 0 // will get from server
const TICKRATE = 15
const gunInfoFrontEnd = {}
let gunInfoKeysFrontEnd = []

let frontEndGunSounds = {}
let frontEndGunReloadSounds = {}

const ammoInfoFrontEnd = {}
let ammoInfoKeysFrontEnd = []
const interactSound = new Audio("/sound/interact.mp3")

let frontEndConsumableSounds = {}
let consumableInfoKeysFrontEnd = []

const LobbyBGM = new Audio("/sound/Lobby.mp3")

const shothitsound = new Audio("/sound/shothit.mp3")

const playerdeathsound = new Audio("/sound/playerdeath.mp3")


const SCREENWIDTH = 1024//1920//
const SCREENHEIGHT = 576//1080//
// constants


const canvas = document.querySelector('canvas')
// const c = canvas.getContext('2d',{alpha:false}) // no alpha -> railgun effect line width change
const c = canvas.getContext('2d') 
const pointEl = document.querySelector('#pointEl')


let socket = io(); // backend connection with player id
let frontEndPlayer
let listen = true // very important for event listener 



// initialize server variables
socket.on('serverVars',( {gunInfo, ammoInfo, consumableInfo, PLAYERSPEED})=>{
  PLAYERSPEEDFRONTEND = PLAYERSPEED
  // ammo infos
  ammoInfoKeysFrontEnd = Object.keys(ammoInfo)
  for (let i=0;i<ammoInfoKeysFrontEnd.length;i++){
    const ammokey = ammoInfoKeysFrontEnd[i]
    ammoInfoFrontEnd[ammokey] = ammoInfo[ammokey]
  }
  //console.log(ammoInfoFrontEnd)

  // gun infos
  gunInfoKeysFrontEnd = Object.keys(gunInfo)
  //console.log(gunInfoKeysFrontEnd[0])
  for (let i=0;i<gunInfoKeysFrontEnd.length;i++){
    const gunkey = gunInfoKeysFrontEnd[i]
    gunInfoFrontEnd[gunkey] = gunInfo[gunkey]

    // load sounds
    frontEndGunSounds[gunkey] =  new Audio(`/sound/${gunkey}.mp3`)
    if (gunkey !== 'fist' && gunkey !== 'knife' && gunkey !== 'bat'){ // these three dont have reload sounds
      frontEndGunReloadSounds[gunkey] = new Audio(`/reloadSound/${gunkey}.mp3`)
    }
  }

  // consumable infos
  consumableInfoKeysFrontEnd = Object.keys(consumableInfo)
  for (let i=0;i<consumableInfoKeysFrontEnd.length;i++){
    const conskey = consumableInfoKeysFrontEnd[i]
    gunInfoFrontEnd[conskey] = consumableInfo[conskey]

    // load sounds
    frontEndConsumableSounds[conskey] =  new Audio(`/consumeSound/${conskey}.mp3`)
  }




  console.log("front end got the variables from the server")
})



// resolution upgrade - retina display gives value 2
const devicePixelRatio = window.devicePixelRatio || 1 //defaut 1

// canvas.width = innerWidth * devicePixelRatio
// canvas.height = innerHeight * devicePixelRatio
canvas.width = SCREENWIDTH * devicePixelRatio
canvas.height = SCREENHEIGHT * devicePixelRatio

c.scale(devicePixelRatio,devicePixelRatio) 

const x = canvas.width / 2
const y = canvas.height / 2

// cursor
let cursorX = SCREENWIDTH/2
let cursorY = SCREENHEIGHT/2

const frontEndPlayers = {} // frontend player list
const frontEndProjectiles = {} // frontend projectile list
const frontEndDrawables = {} 
const frontEndItems = {}
const frontEndEnemies = {}
const frontEndObjects = {}
let locationShowPendings = {}


socket.on('updateFrontEnd',({backEndPlayers, backEndEnemies, backEndProjectiles, backEndDrawables, backEndObjects, backEndItems, GUNHEARRANGE})=>{
  /////////////////////////////////////////////////// 1.PLAYER //////////////////////////////////////////////////
  const myPlayerID = socket.id

  for (const id in backEndPlayers){
    const backEndPlayer = backEndPlayers[id]

    // add player from the server if new
    if (!frontEndPlayers[id]){
      // Item: inventory management
      const inventorySize = backEndPlayer.inventory.length
      let frontEndInventory = []
      for (let i=0;i<inventorySize;i++){
        const backEndItem = backEndPlayer.inventory[i]
        let isItem = instantiateItem(backEndItem,backEndItem.myID) // add item to frontenditem on index: backEndItem.myID
        frontEndInventory[i] = backEndItem.myID // put itemsId to frontenditem list - like a pointer
      }
      
      frontEndPlayers[id] = new Player({
        x: backEndPlayer.x, 
        y: backEndPlayer.y, 
        radius: backEndPlayer.radius, 
        color: backEndPlayer.color,
        username: backEndPlayer.username,
        health: backEndPlayer.health,
        currentSlot: 1,
        inventory: frontEndInventory,
        currentPos: {x:cursorX,y:cursorY}, // client side prediction mousepos
        score: backEndPlayer.score
      })

        // document.querySelector('#playerLabels').innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score} </div>`
        document.querySelector('#playerLabels').innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}"> > ${backEndPlayer.username} </div>`

    } else {      // player already exists


      let frontEndPlayerOthers = frontEndPlayers[id] 
      // enhanced interpolation
      frontEndPlayerOthers.target = {
        x: backEndPlayer.x,
        y: backEndPlayer.y
      }
        // update players attributes
        frontEndPlayerOthers.health = backEndPlayer.health
        frontEndPlayerOthers.score = backEndPlayer.score

        // inventory attributes
        frontEndPlayerOthers.currentSlot = backEndPlayer.currentSlot
        // Item: inventory management
        const inventorySize = backEndPlayer.inventory.length
        for (let i=0;i<inventorySize;i++){
          const backEndItem = backEndPlayer.inventory[i]
          frontEndPlayerOthers.inventory[i] = backEndItem.myID
        }

        if (id === myPlayerID){ // client side prediction - mouse pointer
          frontEndPlayerOthers.cursorPos = {x:cursorX,y:cursorY}

        }else{
          frontEndPlayerOthers.cursorPos = backEndPlayer.mousePos
        }

        // interpolation - smooth movement
        // gsap.to(frontEndPlayers[id], {
        //   x: backEndPlayer.x,
        //   y: backEndPlayer.y,
        //   duration: 0.015,
        //   ease: 'linear' 
        // })
      // }
    }
  }

  frontEndPlayer = frontEndPlayers[myPlayerID] // assign global variable

  // remove player from the server if current player does not exist in the backend
  for (const id in frontEndPlayers){
   if (!backEndPlayers[id]){
    const divToDelete = document.querySelector(`div[data-id="${id}"]`)
    divToDelete.parentNode.removeChild(divToDelete)

    // if I dont exist
    if (id === myPlayerID) {     // reshow the start button interface
      const mePlayer = frontEndPlayers[myPlayerID]

      pointEl.innerHTML = mePlayer.score
      console.log(mePlayer.score)
      playerdeathsound.play()
      document.querySelector('#usernameForm').style.display = 'block'
      const aL = mePlayer.fetchAmmoList()
      //console.log("I died!")
      socket.emit('playerdeath',{playerId: id, playerammoList:aL})
      LobbyBGM.play()
    }
    else{ // other player died
      shothitsound.play()
    }

    delete frontEndPlayers[id]
    return // pass below steps since I died
   }
  }
  /////////////////////////////////////////////////// 2.ENEMIES //////////////////////////////////////////////////
  for (const id in backEndEnemies) {
    const backEndEnemy = backEndEnemies[id]

    if (!frontEndEnemies[id]){ // new 
      frontEndEnemies[id] = new Enemy({
        x: backEndEnemy.x, 
        y: backEndEnemy.y, 
        radius: backEndEnemy.radius, 
        color: backEndEnemy.color, 
        velocity: backEndEnemy.velocity,
        damage: backEndEnemy.damage,
        health: backEndEnemy.health
      })
      //console.log(`backendEnemy: ${Enemy}`)

    } else { // already exist
      let frontEndEnemy = frontEndEnemies[id]
      frontEndEnemy.health = backEndEnemy.health
      frontEndEnemy.x = backEndEnemy.x
      frontEndEnemy.y = backEndEnemy.y
    }
  
  }
  // remove deleted enemies
  for (const frontEndEnemyId in frontEndEnemies){
    if (!backEndEnemies[frontEndEnemyId]){
     delete frontEndEnemies[frontEndEnemyId]
    }
  }

  /////////////////////////////////////////////////// 3.PROJECTILES //////////////////////////////////////////////////
  for (const id in backEndProjectiles) {
    const backEndProjectile = backEndProjectiles[id]
    const gunName = backEndProjectile.gunName

    if (!frontEndProjectiles[id]){ // new projectile
      frontEndProjectiles[id] = new Projectile({
        x: backEndProjectile.x, 
        y: backEndProjectile.y, 
        radius: backEndProjectile.radius, 
        color: frontEndPlayers[backEndProjectile.playerId]?.color, // only call when available
        velocity: backEndProjectile.velocity,
        gunName
      })

        // player close enough should hear the sound (when projectile created) - for me
        const me = frontEndPlayers[myPlayerID]
        if (me){

          const DISTANCE = Math.hypot(backEndProjectile.x - me.x, backEndProjectile.y - me.y)
          const thatGunSoundDistance = gunInfoFrontEnd[gunName].projectileSpeed * 20
          if (gunName && (DISTANCE-100 < thatGunSoundDistance) ){ 
            let gunSound = frontEndGunSounds[gunName].cloneNode(true) //new Audio(`/sound/${gunName}.mp3`)
            if (DISTANCE > 100){
              gunSound.volume = Math.round( 10*(thatGunSoundDistance - (DISTANCE-100))/thatGunSoundDistance ) / 10
            }
            gunSound.play()
            gunSound.remove()
          }
        }

    } else { // already exist
      // update loc

      let frontEndProj = frontEndProjectiles[id]
      frontEndProj.x = backEndProjectile.x
      frontEndProj.y = backEndProjectile.y

      // interpolation - smooth movement
      // gsap.to(frontEndProjectiles[id], {
      //   x: backEndProjectile.x + backEndProjectile.velocity.x,
      //   y: backEndProjectile.y + backEndProjectile.velocity.y,
      //   duration: 0.015, // tick
      //   ease: 'linear' 
      // })
    }
  
  }
  // remove deleted projectiles
  for (const frontEndProjectileId in frontEndProjectiles){
    if (!backEndProjectiles[frontEndProjectileId]){
     delete frontEndProjectiles[frontEndProjectileId]
    }
  }

  /////////////////////////////////////////////////// 4.DRAWABLES //////////////////////////////////////////////////
  for (const id in backEndDrawables) {
    const backendDrawable = backEndDrawables[id]

    if (!frontEndDrawables[id]){ // new projectile
      frontEndDrawables[id] = new Drawable({linewidth: backendDrawable.linewidth,start:backendDrawable.start ,end:backendDrawable.end})
        // player close enough should hear the sound (when projectile created) - for me
        const me = frontEndPlayers[myPlayerID]
        if (me){
          const DISTANCE = Math.hypot(backendDrawable.start.x - me.x, backendDrawable.start.y - me.y)
          if (DISTANCE < GUNHEARRANGE) {
            let gunSound = frontEndGunSounds['railgun']// new Audio('/sound/railgun.mp3')
            gunSound.play()
          }
        }

    } else { // already exist

    }
  
  }
  // remove deleted 
  for (const frontEndDrawableId in frontEndDrawables){
    if (!backEndDrawables[frontEndDrawableId]){
     delete frontEndDrawables[frontEndDrawableId]
    }
  }

  /////////////////////////////////////////////////// 5.OBJECTS //////////////////////////////////////////////////
  for (const id in backEndObjects) {
    const backEndObject = backEndObjects[id]

    if (!frontEndObjects[id]){ // new 
      if (backEndObject.objecttype === 'wall'){
        frontEndObjects[id] = new Wall({
          objecttype: backEndObject.objecttype, 
          health: backEndObject.health, 
          objectinfo: backEndObject.objectinfo,
        })
      } else if(backEndObject.objecttype === 'hut'){
        frontEndObjects[id] = new Hut({
          objecttype: backEndObject.objecttype, 
          health: backEndObject.health, 
          objectinfo: backEndObject.objectinfo,
        })
      }


    } else { // already exist
      // update health attributes if changed
      frontEndObjects[id].health = backEndObject.health

    }
  }
  // remove deleted 
  for (const Id in frontEndObjects){
    if (!backEndObjects[Id]){
     delete frontEndObjects[Id]
    }
  }

  /////////////////////////////////////////////////// 6.ITEMS //////////////////////////////////////////////////
  for (const id in backEndItems) {
    if (!frontEndItems[id]){ // new
      const backEndItem = backEndItems[id]
      instantiateItem(backEndItem,id)
    } else { // already exist
      // update items attributes
      const backEndItem = backEndItems[id]
      let frontEndItem = frontEndItems[id]
      frontEndItem.groundx = backEndItem.groundx
      frontEndItem.groundy = backEndItem.groundy
      frontEndItem.onground = backEndItem.onground
    }
  }
  // remove deleted 
  for (const frontEndItemId in frontEndItems){
    if (!backEndItems[frontEndItemId]){
     delete frontEndItems[frontEndItemId]
    }
  }

})



function instantiateItem(backendItem,id){ // switch case
  if (backendItem.itemtype==='gun'){
    //console.log('gun dropped!')
    frontEndItems[id] = new Gun({groundx:backendItem.groundx, 
      groundy:backendItem.groundy, 
      size:backendItem.size, 
      name:backendItem.name, 
      onground: backendItem.onground, 
      color: backendItem.color,
      iteminfo:{ammo:backendItem.iteminfo.ammo ,ammotype: backendItem.iteminfo.ammotype }
    })
    return true
  } else if (backendItem.itemtype==='ammo'){ 
    frontEndItems[id] = new Ammo({groundx:backendItem.groundx, 
      groundy:backendItem.groundy, 
      size:backendItem.size, 
      name:backendItem.name, 
      onground: backendItem.onground, 
      color: backendItem.color,
      iteminfo:{amount:backendItem.iteminfo.amount ,ammotype: backendItem.iteminfo.ammotype }
    })
    return true
  } else if (backendItem.itemtype==='consumable') {
    frontEndItems[id] = new Consumable({groundx:backendItem.groundx, 
      groundy:backendItem.groundy, 
      size:backendItem.size, 
      name:backendItem.name, 
      onground: backendItem.onground, 
      color: backendItem.color,
      iteminfo:{amount:backendItem.iteminfo.amount , healamount:backendItem.iteminfo.healamount }
    })
    return true
  } else if (backendItem.itemtype==='melee') { // same with guns?
    frontEndItems[id] = new Melee({groundx:backendItem.groundx, 
      groundy:backendItem.groundy, 
      size:backendItem.size, 
      name:backendItem.name, 
      onground: backendItem.onground, 
      color: backendItem.color,
      iteminfo: {ammo:backendItem.iteminfo.ammo ,ammotype: backendItem.iteminfo.ammotype}
    })
    return true
  } else{
    console.log("not implemented item or invalid name")
    // undefined or etc.
    return false
  }
}


// default font 
// c.font ='italic bold 8px sans-serif'
c.font ='italic bold 12px sans-serif'

const LINEARINTERPOLATIONCOEF = 0.5
let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.clearRect(0, 0, canvas.width, canvas.height)
   



  for (const id in frontEndItems){
    const item = frontEndItems[id]
    item.draw()
  }

  for (const id in frontEndEnemies){
    const frontEndEnemy = frontEndEnemies[id]
    frontEndEnemy.draw()
  }



  for (const id in frontEndProjectiles){
    const frontEndProjectile = frontEndProjectiles[id]
    frontEndProjectile.draw()
  }

  for (const id in frontEndObjects){
    const obj = frontEndObjects[id]
    obj.draw()
  }


  for (const id in frontEndPlayers){
    const frontEndPlayer = frontEndPlayers[id]

    // enhanced interpolation
    if (frontEndPlayer.target){
      frontEndPlayer.x += (frontEndPlayer.target.x - frontEndPlayer.x)*LINEARINTERPOLATIONCOEF
      frontEndPlayer.y += (frontEndPlayer.target.y - frontEndPlayer.y)*LINEARINTERPOLATIONCOEF
    }

    frontEndPlayer.draw()
    if (id === socket.id){ // your ammo is shown to you only
      frontEndPlayer.showAmount()
    }
  }


  for (const id in frontEndDrawables){
    const drawable = frontEndDrawables[id]
    drawable.draw()
  }


  for (const idx in locationShowPendings){
    let locShower = locationShowPendings[idx]
    locShower.draw()
    if (locShower.deleteRequest()){
      delete locationShowPendings[idx]
    }
  }

}

animate()



addEventListener('mousemove', (event) => {
  // const canvas = document.querySelector('canvas')
  const {top, left} = canvas.getBoundingClientRect()
  // update mousepos if changed
  cursorX = (event.clientX-left)
  cursorY = (event.clientY-top)
})



const keys = {
  w:{
    pressed: false
  },
  a:{
    pressed: false
  },
  s:{
    pressed: false
  },
  d:{
    pressed: false
  },
  digit1:{ // weapon slot 1
    pressed: false
  },
  digit2:{ // weapon slot 1
    pressed: false
  },
  digit3:{ // fist slot
    pressed: false
  },
  digit4:{ // medkit slot
    pressed: false
  },
  f:{ // interact - grab/change items of current slot etc
    pressed: false
  },
  space:{ // hold fire
    pressed: false
  },
  g:{ // minimap
    pressed: false
  },
  r:{ // reload
    pressed: false
  },
}

function resetKeys(){
  let keysKey = Object.keys(keys)
  for (let i=0;i<keysKey.length;i++){
    const keykey = keysKey[i]
    keys[keykey].pressed = false
  }
}

const CLIENTSIDEPREDICTION = false
const playerInputs = []
// client side periodic update
setInterval(()=>{
  if (keys.digit1.pressed){
    socket.emit('keydown',{keycode:'Digit1'})
  }
  if (keys.digit2.pressed){
    socket.emit('keydown',{keycode:'Digit2'})
  }
  if (keys.digit3.pressed){
    socket.emit('keydown',{keycode:'Digit3'})
  }
  if (keys.digit4.pressed){
    socket.emit('keydown',{keycode:'Digit4'})
  }
  if (keys.f.pressed){
    socket.emit('keydown',{keycode:'KeyF'})
  }
  // dont have to emit since they are seen by me(a client, not others)
  if (keys.g.pressed){
    socket.emit('keydown',{keycode:'KeyG'})
  }
  if (keys.r.pressed){ // reload lock? click once please... dont spam click. It will slow your PC
    socket.emit('keydown',{keycode:'KeyR'})
  }

  ////// frequently pressed keys
  
  // if moved, then update all informations to the server

  // socket.emit('playermousechange', {x:cursorX,y:cursorY}) // report mouseposition every TICK, not immediately

  // if (keys.space.pressed){
  //   socket.emit('keydown',{keycode:'Space'})
  // }


  // if (keys.w.pressed) {
  //   socket.emit('keydown',{keycode:'KeyW'})
  // }
  // if (keys.a.pressed){
  //   socket.emit('keydown',{keycode:'KeyA'})
  // }
  // if (keys.s.pressed){
  //   socket.emit('keydown',{keycode:'KeyS'})
  // }
  // if (keys.d.pressed){
  //   socket.emit('keydown',{keycode:'KeyD'})
  // }

  const Movement = keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed

  if (Movement && keys.space.pressed){ // always fire hold = true since space was pressed
  // update frequent keys at once (Movement & hold shoot)
    socket.emit('moveNshootUpdate', {WW: keys.w.pressed, AA: keys.a.pressed,SS: keys.s.pressed,DD: keys.d.pressed, x:cursorX, y:cursorY})

  } else if (Movement){
  // update frequent keys at once (Movement only)
    socket.emit('movingUpdate', {WW: keys.w.pressed, AA: keys.a.pressed, SS: keys.s.pressed, DD: keys.d.pressed, x:cursorX, y:cursorY})

  } else if(keys.space.pressed){ // always fire hold = true since space was pressed
    socket.emit('holdUpdate',{x:cursorX, y:cursorY})

  } else{ // builtin
    socket.emit('playermousechange', {x:cursorX,y:cursorY}) // report mouseposition every TICK, not immediately
  }


},TICKRATE)


window.addEventListener('keydown', (event) => {
  if (!frontEndPlayers[socket.id]) return // if player does not exist

  switch(event.code) {
    case 'KeyW':
    case 'ArrowUp':
      keys.w.pressed = true
      break
    case 'KeyA':
    case 'ArrowLeft':
      keys.a.pressed = true
      break
    case 'KeyS':
    case 'ArrowDown':
      keys.s.pressed = true
      break
    case 'KeyD':
    case 'ArrowRight':
      keys.d.pressed = true
      break
    case 'Digit1':
      keys.digit1.pressed = true
      break
    case 'Digit2':
      keys.digit2.pressed = true
      break
    case 'Digit3':
      keys.digit3.pressed = true
      break
    case 'Digit4':
      keys.digit4.pressed = true
      break
    case 'KeyF':
      keys.f.pressed = true
      break
    case 'Space':
      keys.space.pressed = true
      break
    case 'KeyG':
      keys.g.pressed = true
      break
    case 'KeyR':
      keys.r.pressed = true
      break
  }
})

window.addEventListener('keyup',(event)=>{
  if (!frontEndPlayers[socket.id]) return // if player does not exist
  switch(event.code) {
    case 'KeyW':
    case 'ArrowUp':
      keys.w.pressed = false
      break
    case 'KeyA':
    case 'ArrowLeft':
      keys.a.pressed = false
      break
    case 'KeyS':
    case 'ArrowDown':
      keys.s.pressed = false
      break
    case 'KeyD':
    case 'ArrowRight':
      keys.d.pressed = false
      break
    case 'Digit1':
      keys.digit1.pressed = false
      break
    case 'Digit2':
      keys.digit2.pressed = false
      break
    case 'Digit3':
      keys.digit3.pressed = false
      break
    case 'Digit4':
      keys.digit4.pressed = false
      break
    case 'KeyF':
      keys.f.pressed = false
      break
    case 'Space':
      keys.space.pressed = false
      break
    case 'KeyG':
      keys.g.pressed = false
      break
    case 'KeyR':
      keys.r.pressed = false
      break
  }
})


// start button clicked
document.querySelector('#usernameForm').addEventListener('submit', (event) => {
  event.preventDefault()

  // sound
  LobbyBGM.pause()
  LobbyBGM.currentTime = 0

  pointEl.innerHTML = 0 // init score
  // hide the form (button)
  document.querySelector('#usernameForm').style.display = 'none'
  // hide key info
  //document.querySelector(`div[data-id="keyinfos"]`).style.display = 'none'
  resetKeys()
  listen = true // initialize the semaphore
  
  const playerX = SCREENWIDTH * Math.random()
  const playerY = SCREENHEIGHT * Math.random()
  const playerColor =  `hsl(${Math.random()*360},100%,70%)`
  
  let locShower = new LocationShower({x:playerX,y:playerY, color:playerColor})
  locationShowPendings[0] = locShower
  


  socket.emit('initGame', {username: document.querySelector('#usernameInput').value, width: canvas.width, height: canvas.height,playerX, playerY, playerColor})
})



// // socket hears 'updateItems' from backend
// socket.on('updateItems',(backEndItems) => {
//   for (const id in backEndItems) {
//     if (!frontEndItems[id]){ // new
//       const backEndItem = backEndItems[id]
//       instantiateItem(backEndItem,id)
//     } else { // already exist
//       // update items attributes
//       const backEndItem = backEndItems[id]
//       let frontEndItem = frontEndItems[id]
//       frontEndItem.groundx = backEndItem.groundx
//       frontEndItem.groundy = backEndItem.groundy
//       frontEndItem.onground = backEndItem.onground
//     }
//   }
//   // remove deleted 
//   for (const frontEndItemId in frontEndItems){
//     if (!backEndItems[frontEndItemId]){
//      delete frontEndItems[frontEndItemId]
//     }
//    }
// })



// // socket hears 'updateDrawables' from backend
// socket.on('updateDrawables',({backEndDrawables,GUNHEARRANGE}) => {
//   for (const id in backEndDrawables) {
//     const backendDrawable = backEndDrawables[id]

//     if (!frontEndDrawables[id]){ // new projectile
//       frontEndDrawables[id] = new Drawable({linewidth: backendDrawable.linewidth,start:backendDrawable.start ,end:backendDrawable.end})
//         // player close enough should hear the sound (when projectile created) - for me
//         const me = frontEndPlayers[socket.id]
//         if (me){
//           const DISTANCE = Math.hypot(backendDrawable.start.x - me.x, backendDrawable.start.y - me.y)
//           if (DISTANCE < GUNHEARRANGE) {
//             const gunName = 'railgun'
//             if (gunName){ 
//               let gunSound = new Audio(`/sound/${gunName}.mp3`)
//               gunSound.volume = 0.1
//               gunSound.play()
//             }
//           }
//         }

//     } else { // already exist

//     }
  
//   }
//   // remove deleted 
//   for (const frontEndDrawableId in frontEndDrawables){
//     if (!backEndDrawables[frontEndDrawableId]){
//      delete frontEndDrawables[frontEndDrawableId]
//     }
//    }
// })




// // socket hears 'updateProjectiles' from backend
// socket.on('updateProjectiles',({backEndProjectiles,GUNHEARRANGE}) => {
//   for (const id in backEndProjectiles) {
//     const backEndProjectile = backEndProjectiles[id]

//     if (!frontEndProjectiles[id]){ // new projectile
//       frontEndProjectiles[id] = new Projectile({
//         x: backEndProjectile.x, 
//         y: backEndProjectile.y, 
//         radius: backEndProjectile.radius, 
//         color: frontEndPlayers[backEndProjectile.playerId]?.color, // only call when available
//         velocity: backEndProjectile.velocity})

//         // player close enough should hear the sound (when projectile created) - for me
//         const me = frontEndPlayers[socket.id]
//         if (me){
//           const gunName = backEndProjectile.gunName
//           let gunSound = new Audio(`/sound/${gunName}.mp3`)
//           const DISTANCE = Math.hypot(backEndProjectile.x - me.x, backEndProjectile.y - me.y)
//           let soundhearrange = (gunInfoFrontEnd[backEndProjectile.gunName].travelDistance/4) * 3 + 100
//           //console.log(soundhearrange)
//           if (gunName==='VSS'){ // surpressed
//             soundhearrange = 400
//           }
//           if (DISTANCE < soundhearrange) {
//             if (gunName){ 
//               gunSound.volume = 0.1
//               if (gunName==='s686'){
//                 gunSound.volume = 0.01
//               }
//               else if (gunName==='mk14'){
//                 gunSound.volume = 0.5
//               }
//               else if (gunName==='vector'){
//                 gunSound.volume = 0.05
//               }
//               else if (gunName==='VSS'){
//                 gunSound.volume = 1
//               }
//               else if (gunName==='DBS'){
//                 gunSound.volume = 0.03
//               }
//               else if (gunName==='AWM'){
//                 gunSound.volume = 0.5
//               }
//               gunSound.play()
//             }
//           }
//         }

//     } else { // already exist
//       // interpolation - smooth movement
//       gsap.to(frontEndProjectiles[id], {
//         x: backEndProjectile.x + backEndProjectile.velocity.x,
//         y: backEndProjectile.y + backEndProjectile.velocity.y,
//         duration: 0.015,
//         ease: 'linear' 
//       })
//     }
  
//   }
//   // remove deleted projectiles
//   for (const frontEndProjectileId in frontEndProjectiles){
//     if (!backEndProjectiles[frontEndProjectileId]){
//      delete frontEndProjectiles[frontEndProjectileId]
//     }
//    }
// })

// // socket hears 'updatePlayers' from backend
// socket.on('updatePlayers',(backEndPlayers) => {
//   for (const id in backEndPlayers){
//     const backEndPlayer = backEndPlayers[id]

//     // add player from the server if new
//     if (!frontEndPlayers[id]){
//       // Item: inventory management
//       const inventorySize = backEndPlayer.inventory.length
//       let frontEndInventory = []
//       for (let i=0;i<inventorySize;i++){
//         const backEndItem = backEndPlayer.inventory[i]
//         let isItem = instantiateItem(backEndItem,backEndItem.myID) // add item to frontenditem on index: backEndItem.myID
//         frontEndInventory[i] = backEndItem.myID // put itemsId to frontenditem list - like a pointer
//       }
      
//       frontEndPlayers[id] = new Player({
//         x: backEndPlayer.x, 
//         y: backEndPlayer.y, 
//         radius: backEndPlayer.radius, 
//         color: backEndPlayer.color,
//         username: backEndPlayer.username,
//         health: backEndPlayer.health,
//         currentSlot: 1,
//         inventory: frontEndInventory,
//         currentPos: {x:cursorX,y:cursorY} // client side prediction mousepos
//       })
//       frontEndPlayer = frontEndPlayers[socket.id]

//         //document.querySelector('#playerLabels').innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score} | HP: ${backEndPlayer.health}</div>`
//         document.querySelector('#playerLabels').innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score} </div>`

//     } else {      // player already exists
//       // update display
//       //document.querySelector(`div[data-id="${id}"]`).innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score} | HP: ${backEndPlayer.health}</div>`
//       document.querySelector(`div[data-id="${id}"]`).innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score} </div>`
//       document.querySelector(`div[data-id="${id}"]`).setAttribute('data-score',backEndPlayer.score)
      
//       // sort player list by score
//       const parentDiv = document.querySelector('#playerLabels')
//       const childDivs = Array.from(parentDiv.querySelectorAll('div'))
//       childDivs.sort((a,b)=> {
//         const scoreA = Number(a.getAttribute('data-score'))
//         const scoreB = Number(b.getAttribute('data-score'))
//         return scoreB - scoreA
//       })

//       // removes old elem
//       childDivs.forEach(div => {
//         parentDiv.removeChild(div)
//       })
//       // adds sorted elem
//       childDivs.forEach(div => {
//         parentDiv.appendChild(div)
//       })

//       let frontEndPlayerOthers = frontEndPlayers[id] 
//       // enhanced interpolation
//       frontEndPlayerOthers.target = {
//         x: backEndPlayer.x,
//         y: backEndPlayer.y
//       }

//         // update players attributes
//         frontEndPlayerOthers.health = backEndPlayer.health
//         frontEndPlayerOthers.cursorPos = backEndPlayer.mousePos

//         // inventory attributes
//         frontEndPlayerOthers.currentSlot = backEndPlayer.currentSlot

//         // Item: inventory management
//         const inventorySize = backEndPlayer.inventory.length
//         for (let i=0;i<inventorySize;i++){
//           const backEndItem = backEndPlayer.inventory[i]
//           frontEndPlayerOthers.inventory[i] = backEndItem.myID
//         }

//         // // interpolation - smooth movement
//         // gsap.to(frontEndPlayers[id], {
//         //   x: backEndPlayer.x,
//         //   y: backEndPlayer.y,
//         //   duration: 0.015,
//         //   ease: 'linear' 
//         // })
//       // }

//     }
//   }

//   // remove player from the server if current player does not exist in the backend
//   for (const id in frontEndPlayers){
//    if (!backEndPlayers[id]){
//     const divToDelete = document.querySelector(`div[data-id="${id}"]`)
//     divToDelete.parentNode.removeChild(divToDelete)

//     // if I dont exist
//     if (id === socket.id) {     // reshow the start button interface
//       document.querySelector('#usernameForm').style.display = 'block'

//       //console.log(!frontEndPlayers[id])
//       const aL = frontEndPlayers[id].fetchAmmoList()
//       //console.log(aL)
//       socket.emit('playerdeath',{playerId: id, playerammoList:aL})
      
//     }

//     delete frontEndPlayers[id]
//    }
//   }

// })


// //socket hears 'updateObjects' from backend
// socket.on('updateObjects',(backEndObjects) => {
//   for (const id in backEndObjects) {
//     const backEndObject = backEndObjects[id]

//     if (!frontEndObjects[id]){ // new 
//       if (backEndObject.objecttype === 'wall'){
//         frontEndObjects[id] = new Wall({
//           objecttype: backEndObject.objecttype, 
//           health: backEndObject.health, 
//           objectinfo: backEndObject.objectinfo,
//         })
//       } else if(backEndObject.objecttype === 'hut'){
//         frontEndObjects[id] = new Hut({
//           objecttype: backEndObject.objecttype, 
//           health: backEndObject.health, 
//           objectinfo: backEndObject.objectinfo,
//         })
//       }


//     } else { // already exist
//       // update health attributes if changed
//       frontEndObjects[id].health = backEndObject.health

//     }
//   }
//   // remove deleted 
//   for (const Id in frontEndObjects){
//     if (!backEndObjects[Id]){
//      delete frontEndObjects[Id]
//     }
//    }
// })



// // socket hears 'updateEnemies' from backend
// socket.on('updateEnemies',(backEndEnemies) => {

//   for (const id in backEndEnemies) {
//     const backEndEnemy = backEndEnemies[id]

//     if (!frontEndEnemies[id]){ // new 
//       frontEndEnemies[id] = new Enemy({
//         x: backEndEnemy.x, 
//         y: backEndEnemy.y, 
//         radius: backEndEnemy.radius, 
//         color: backEndEnemy.color, 
//         velocity: backEndEnemy.velocity,
//         damage: backEndEnemy.damage,
//         health: backEndEnemy.health
//       })
//       //console.log(`backendEnemy: ${Enemy}`)

//     } else { // already exist
//       let frontEndEnemy = frontEndEnemies[id]
//       frontEndEnemy.health = backEndEnemy.health
//       frontEndEnemy.x = backEndEnemy.x
//       frontEndEnemy.y = backEndEnemy.y
//     }
  
//   }
//   // remove deleted enemies
//   for (const frontEndEnemyId in frontEndEnemies){
//     if (!backEndEnemies[frontEndEnemyId]){
//      delete frontEndEnemies[frontEndEnemyId]
//     }
//    }
// })