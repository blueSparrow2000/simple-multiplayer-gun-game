// front end - player can manipulate
// constants
let PLAYERSPEEDFRONTEND = 0 // will get from server
const TICKRATE = 15
const gunInfoFrontEnd = {}
let gunInfoKeysFrontEnd = []

const ammoInfoFrontEnd = {}
let ammoInfoKeysFrontEnd = []

const SCREENWIDTH = 1920//1024//
const SCREENHEIGHT = 1080//576//
// constants


const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io(); // backend connection with player id

// initialize server variables
socket.on('serverVars',( {gunInfo, ammoInfo, PLAYERSPEED})=>{
  PLAYERSPEEDFRONTEND = PLAYERSPEED

  ammoInfoKeysFrontEnd = Object.keys(ammoInfo)
  for (let i=0;i<ammoInfoKeysFrontEnd.length;i++){
    const ammokey = ammoInfoKeysFrontEnd[i]
    ammoInfoFrontEnd[ammokey] = ammoInfo[ammokey]
  }
  //console.log(ammoInfoFrontEnd)

  gunInfoKeysFrontEnd = Object.keys(gunInfo)
  //console.log(gunInfoKeysFrontEnd[0])
  for (let i=0;i<gunInfoKeysFrontEnd.length;i++){
    const gunkey = gunInfoKeysFrontEnd[i]
    gunInfoFrontEnd[gunkey] = gunInfo[gunkey]
    //console.log(gunInfoFrontEnd)
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



// socket hears 'updateEnemies' from backend
socket.on('updateEnemies',(backEndEnemies) => {

  for (const id in backEndEnemies) {
    const backEndEnemy = backEndEnemies[id]

    if (!frontEndEnemies[id]){ // new 
      frontEndEnemies[id] = new Enemy({
        ex: backEndEnemy.ex, 
        ey: backEndEnemy.ey, 
        eradius: backEndEnemy.eradius, 
        ecolor: backEndEnemy.ecolor, 
        evelocity: backEndEnemy.evelocity,
        edamage: backEndEnemy.edamage,
        ehealth: backEndEnemy.ehealth
      })
      //console.log(`backendEnemy: ${Enemy}`)

    } else { // already exist
      frontEndEnemies[id].ex += backEndEnemies[id].evelocity.x
      frontEndEnemies[id].ey += backEndEnemies[id].evelocity.y
      //console.log(frontEndEnemies[id].ex)

      // gsap.to(frontEndEnemies[id], {
      //   x: backEndEnemies[id].ex + backEndEnemies[id].evelocity.x,
      //   y: backEndEnemies[id].ey + backEndEnemies[id].evelocity.y,
      //   duration: 0.015,
      //   ease: 'linear' 
      // })
    }
  
  }
  // remove deleted enemies
  for (const frontEndEnemyId in frontEndEnemies){
    if (!backEndEnemies[frontEndEnemyId]){
     delete frontEndEnemies[frontEndEnemyId]
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



// socket hears 'updateItems' from backend
socket.on('updateItems',(backEndItems) => {
  for (const id in backEndItems) {
    if (!frontEndItems[id]){ // new
      const backEndItem = backEndItems[id]
      instantiateItem(backEndItem,id)
    } else { // already exist
      // update items attributes
      const backEndItem = backEndItems[id]
      frontEndItems[id].groundx = backEndItem.groundx
      frontEndItems[id].groundy = backEndItem.groundy
      frontEndItems[id].onground = backEndItem.onground
    }
  }
  // remove deleted 
  for (const frontEndItemId in frontEndItems){
    if (!backEndItems[frontEndItemId]){
     delete frontEndItems[frontEndItemId]
    }
   }
})



// socket hears 'updateDrawables' from backend
socket.on('updateDrawables',({backendDrawables,GUNHEARRANGE}) => {
  for (const id in backendDrawables) {
    const backendDrawable = backendDrawables[id]

    if (!frontEndDrawables[id]){ // new projectile
      frontEndDrawables[id] = new Drawable({linewidth: backendDrawable.linewidth,start:backendDrawable.start ,end:backendDrawable.end})
        // player close enough should hear the sound (when projectile created) - for me
        const me = frontEndPlayers[socket.id]
        if (me){
          const DISTANCE = Math.hypot(backendDrawable.start.x - me.x, backendDrawable.start.y - me.y)
          if (DISTANCE < GUNHEARRANGE) {
            const gunName = 'railgun'
            if (gunName){ 
              let gunSound = new Audio(`/sound/${gunName}.mp3`)
              gunSound.volume = 0.1
              gunSound.play()
            }
          }
        }

    } else { // already exist

    }
  
  }
  // remove deleted 
  for (const frontEndDrawableId in frontEndDrawables){
    if (!backendDrawables[frontEndDrawableId]){
     delete frontEndDrawables[frontEndDrawableId]
    }
   }
})




// socket hears 'updateProjectiles' from backend
socket.on('updateProjectiles',({backEndProjectiles,GUNHEARRANGE}) => {
  for (const id in backEndProjectiles) {
    const backEndProjectile = backEndProjectiles[id]

    if (!frontEndProjectiles[id]){ // new projectile
      frontEndProjectiles[id] = new Projectile({
        x: backEndProjectile.x, 
        y: backEndProjectile.y, 
        radius: backEndProjectile.radius, 
        color: frontEndPlayers[backEndProjectile.playerId]?.color, // only call when available
        velocity: backEndProjectile.velocity})

        // player close enough should hear the sound (when projectile created) - for me
        const me = frontEndPlayers[socket.id]
        if (me){
          const gunName = backEndProjectile.gunName
          let gunSound = new Audio(`/sound/${gunName}.mp3`)
          const DISTANCE = Math.hypot(backEndProjectile.x - me.x, backEndProjectile.y - me.y)
          let soundhearrange = (gunInfoFrontEnd[backEndProjectile.gunName].travelDistance/4) * 3 + 100
          //console.log(soundhearrange)
          if (gunName==='VSS'){ // surpressed
            soundhearrange = 400
          }
          if (DISTANCE < soundhearrange) {
            if (gunName){ 
              gunSound.volume = 0.1
              if (gunName==='s686'){
                gunSound.volume = 0.01
              }
              else if (gunName==='mk14'){
                gunSound.volume = 0.5
              }
              else if (gunName==='vector'){
                gunSound.volume = 0.05
              }
              else if (gunName==='VSS'){
                gunSound.volume = 1
              }
              else if (gunName==='DBS'){
                gunSound.volume = 0.03
              }
              gunSound.play()
            }
          }
        }

    } else { // already exist
      //frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x
      //frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y
      // interpolation - smooth movement
      gsap.to(frontEndProjectiles[id], {
        x: backEndProjectiles[id].x + backEndProjectiles[id].velocity.x,
        y: backEndProjectiles[id].y + backEndProjectiles[id].velocity.y,
        duration: 0.015,
        ease: 'linear' 
      })
    }
  
  }
  // remove deleted projectiles
  for (const frontEndProjectileId in frontEndProjectiles){
    if (!backEndProjectiles[frontEndProjectileId]){
     delete frontEndProjectiles[frontEndProjectileId]
    }
   }
})

// socket hears 'updatePlayers' from backend
socket.on('updatePlayers',(backEndPlayers) => {
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
        currentPos: {x:cursorX,y:cursorY} // client side prediction mousepos
      })

        //document.querySelector('#playerLabels').innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score} | HP: ${backEndPlayer.health}</div>`
        document.querySelector('#playerLabels').innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score} </div>`

    } else {      // player already exists
      // update display
      //document.querySelector(`div[data-id="${id}"]`).innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score} | HP: ${backEndPlayer.health}</div>`
      document.querySelector(`div[data-id="${id}"]`).innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score} </div>`
      document.querySelector(`div[data-id="${id}"]`).setAttribute('data-score',backEndPlayer.score)
      
      // sort player list by score
      const parentDiv = document.querySelector('#playerLabels')
      const childDivs = Array.from(parentDiv.querySelectorAll('div'))
      childDivs.sort((a,b)=> {
        const scoreA = Number(a.getAttribute('data-score'))
        const scoreB = Number(b.getAttribute('data-score'))
        return scoreB - scoreA
      })

      // removes old elem
      childDivs.forEach(div => {
        parentDiv.removeChild(div)
      })
      // adds sorted elem
      childDivs.forEach(div => {
        parentDiv.appendChild(div)
      })

      // enhanced interpolation
      frontEndPlayers[id].target = {
        x: backEndPlayer.x,
        y: backEndPlayer.y
      }

        // update players attributes
        frontEndPlayers[id].health = backEndPlayer.health
        frontEndPlayers[id].cursorPos = backEndPlayer.mousePos

        // inventory attributes
        frontEndPlayers[id].currentSlot = backEndPlayer.currentSlot

        // Item: inventory management
        const inventorySize = backEndPlayer.inventory.length
        for (let i=0;i<inventorySize;i++){
          const backEndItem = backEndPlayer.inventory[i]
          frontEndPlayers[id].inventory[i] = backEndItem.myID
        }


      if (id === socket.id){
        // server lag solving (server reconcilation)
        const lastBackEndInputIndex = playerInputs.findIndex(input => {
          return backEndPlayer.sequenceNumber === input.sequenceNumber
        })
        if (lastBackEndInputIndex > -1){
          playerInputs.splice(0, lastBackEndInputIndex + 1)
        }
        playerInputs.forEach(input => {
          frontEndPlayers[id].target.x += input.dx
          frontEndPlayers[id].target.y += input.dy
        })
      } //else { // all other players
        // // interpolation - smooth movement
        // gsap.to(frontEndPlayers[id], {
        //   x: backEndPlayer.x,
        //   y: backEndPlayer.y,
        //   duration: 0.015,
        //   ease: 'linear' 
        // })
      // }

    }
  }

  // remove player from the server if current player does not exist in the backend
  for (const id in frontEndPlayers){
   if (!backEndPlayers[id]){
    const divToDelete = document.querySelector(`div[data-id="${id}"]`)
    divToDelete.parentNode.removeChild(divToDelete)

    // if I dont exist
    if (id === socket.id) {     // reshow the start button interface
      document.querySelector('#usernameForm').style.display = 'block'

      //console.log(!frontEndPlayers[id])
      const aL = frontEndPlayers[id].fetchAmmoList()
      //console.log(aL)
      socket.emit('playerdeath',{playerId: id, playerammoList:aL})
      
    }

    delete frontEndPlayers[id]
   }
  }

})


const LINEARINTERPOLATIONCOEF = 0.5
let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  //c.fillStyle = 'rgba(0, 0, 0, 0.2)'
  //c.fillRect(0, 0, canvas.width, canvas.height)
  c.clearRect(0, 0, canvas.width, canvas.height)


  for (const id in frontEndItems){
    const item = frontEndItems[id]
    item.draw()
  }

  for (const id in frontEndPlayers){
    const frontEndPlayer = frontEndPlayers[id]

    // enhanced interpolation
    if (frontEndPlayer.target){
      frontEndPlayers[id].x += (frontEndPlayers[id].target.x - frontEndPlayers[id].x)*LINEARINTERPOLATIONCOEF
      frontEndPlayers[id].y += (frontEndPlayers[id].target.y - frontEndPlayers[id].y)*LINEARINTERPOLATIONCOEF
    }

    frontEndPlayer.draw()
    if (id === socket.id){ // your ammo is shown to you only
      frontEndPlayer.showAmount()
    }
  }

  for (const id in frontEndProjectiles){
    const frontEndProjectile = frontEndProjectiles[id]
    frontEndProjectile.draw()
  }

  for (const id in frontEndDrawables){
    const drawable = frontEndDrawables[id]
    drawable.draw()
  }

  for (const id in frontEndEnemies){
    const frontEndEnemy = frontEndEnemies[id]
    frontEndEnemy.draw()
  }

}

animate()


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
let sequenceNumber = 0
// client side periodic update
setInterval(()=>{
  if (keys.w.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber, dx: 0,dy: -PLAYERSPEEDFRONTEND })
    if (CLIENTSIDEPREDICTION){
      frontEndPlayers[socket.id].y -= PLAYERSPEEDFRONTEND // immediate move client side
    }

    socket.emit('keydown',{keycode:'KeyW',sequenceNumber})
  }
  if (keys.a.pressed){
    sequenceNumber++
    playerInputs.push({sequenceNumber, dx: -PLAYERSPEEDFRONTEND,dy: 0 })
    if (CLIENTSIDEPREDICTION){
      frontEndPlayers[socket.id].x -= PLAYERSPEEDFRONTEND
    }
    socket.emit('keydown',{keycode:'KeyA',sequenceNumber})
  }
  if (keys.s.pressed){
    sequenceNumber++
    playerInputs.push({sequenceNumber, dx: 0,dy: PLAYERSPEEDFRONTEND })
    if (CLIENTSIDEPREDICTION){
      frontEndPlayers[socket.id].y += PLAYERSPEEDFRONTEND
    }
    socket.emit('keydown',{keycode:'KeyS',sequenceNumber})
  }
  if (keys.d.pressed){
    sequenceNumber++
    playerInputs.push({sequenceNumber, dx: PLAYERSPEEDFRONTEND,dy: 0 })
    if (CLIENTSIDEPREDICTION){
      frontEndPlayers[socket.id].x += PLAYERSPEEDFRONTEND
    }
    socket.emit('keydown',{keycode:'KeyD',sequenceNumber})
  }

  if (keys.digit1.pressed){
    socket.emit('keydown',{keycode:'Digit1',sequenceNumber})
  }
  if (keys.digit2.pressed){
    socket.emit('keydown',{keycode:'Digit2',sequenceNumber})
  }
  if (keys.digit3.pressed){
    socket.emit('keydown',{keycode:'Digit3',sequenceNumber})
  }
  if (keys.digit4.pressed){
    socket.emit('keydown',{keycode:'Digit4',sequenceNumber})
  }
  if (keys.f.pressed){
    socket.emit('keydown',{keycode:'KeyF',sequenceNumber})
  }
  if (keys.space.pressed){
    socket.emit('keydown',{keycode:'Space',sequenceNumber})
  }
  // dont have to emit since they are seen by me(a client, not others)
  if (keys.g.pressed){
    socket.emit('keydown',{keycode:'KeyG',sequenceNumber})
  }
  if (keys.r.pressed){ // reload!
    socket.emit('keydown',{keycode:'KeyR',sequenceNumber})
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

  // hide the form (button)
  document.querySelector('#usernameForm').style.display = 'none'
  // hide key info
  //document.querySelector(`div[data-id="keyinfos"]`).style.display = 'none'
  resetKeys()
  socket.emit('initGame', {username: document.querySelector('#usernameInput').value, width: canvas.width, height: canvas.height})
})


