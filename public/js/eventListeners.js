// Index.html shows that frontend.js is linked prior to eventListeners.js

// semaphores
let listen = true
let fireTimeout
let reloadTimeout
let interactTimeout


function isMelee(itemtypeARG){  //check currentHolding is melee // no ammo update
  return itemtypeARG ==='melee'
}


function shootProj(event){
  if (!gunInfoFrontEnd){ // if gun info is undefined, do not fire bullet
    return
  }
  // shoot only when player is created
  if (!frontEndPlayers[socket.id]){return}

  // get currently holding item
  let inventoryPointer = frontEndPlayers[socket.id].currentSlot - 1 // current slot is value between 1 to 4
  if (!inventoryPointer) {inventoryPointer = 0} // default 0
  let currentHoldingItemId = frontEndPlayers[socket.id].inventory[inventoryPointer] // if it is 0, it is fist
  let currentHoldingItem = frontEndItems[currentHoldingItemId]


  if ((currentHoldingItem.itemtype==='consumable')){ // eat
    // dont need to check amount since we will delete item if eaten
    const currentItemName = currentHoldingItem.name
    const CONSUMERATE = 1000

    if (!listen) {return} // not ready to eat
    listen = false // block
  
    let consumeSound = new Audio(`/consumeSound/${currentItemName}.mp3`)
    consumeSound.volume = 0.1
    consumeSound.play()

    // decrease amount here (if needed in future)

    fireTimeout = window.setTimeout(function(){socket.emit('consume',{
      itemName: currentHoldingItem.name,
      playerId: socket.id,
      healamount: currentHoldingItem.healamount,
      deleteflag: true, // current version, delete right away
      itemid: currentHoldingItemId,
      currentSlot: frontEndPlayers[socket.id].currentSlot,
    });
      clearTimeout(fireTimeout);
      listen = true},CONSUMERATE)

    return
  }


  if (!(currentHoldingItem.itemtype==='gun' || currentHoldingItem.itemtype==='melee')){ // not a gun/melee, dont shoot
    console.log("this item is not a gun/consumable/melee. It is undefined or something else")
    return
  }


  if ((!isMelee(currentHoldingItem.itemtype)) && currentHoldingItem.ammo <= 0){ // no ammo - unable to shoot
    reloadGun() // auto reload when out of ammo
    return
  }

  const currentGunName = currentHoldingItem.name
  const GUNFIRERATE = gunInfoFrontEnd[currentGunName].fireRate

  const playerPosition = {
    x: frontEndPlayers[socket.id].x,
    y: frontEndPlayers[socket.id].y
  }

  let mouselocX = event.clientX
  let mouselocY = event.clientY

  if (!event.accurate){
    // recoil effect for hold space (mouse click uses immediate click event.clientX,Y so it is more accurate than holding)
    // this critically changes accuracy
    mouselocX += (Math.random()-0.5) * gunInfoFrontEnd[currentGunName].shake
    mouselocY += (Math.random()-0.5) * gunInfoFrontEnd[currentGunName].shake
    //console.log("shake!")
  }

  const angle = Math.atan2(
    (mouselocY) - playerPosition.y,
    (mouselocX) - playerPosition.x
  )
  const mousePos = {y:(mouselocY), x:(mouselocX)}
  const playerIdEXACT = socket.id
  
  if (!listen) {return} // not ready to fire
  listen = false // block

  socket.emit('shoot',{
    x: playerPosition.x,
    y: playerPosition.y,
    angle,
    mousePos,
    playerIdEXACT,
    currentGun: currentGunName
  })

  if (!isMelee(currentHoldingItem.itemtype)){ // not malee, i.e. gun!
    // decrease ammo here!!!!!
    currentHoldingItem.ammo -= 1 
    //console.log(`${currentGunName} ammo: ${currentHoldingItem.ammo}`)
  }

  

  //console.log("fired")
  fireTimeout = window.setTimeout(function(){clearTimeout(fireTimeout);listen = true},GUNFIRERATE)
  //console.log("ready to fire")

}


addEventListener('click', (event)=>{
  const canvas = document.querySelector('canvas')
  const {top, left} = canvas.getBoundingClientRect()

  // shoot immediate cursor position = more accurate
  shootProj({accurate:true,clientX: (event.clientX-left),clientY:(event.clientY-top)})
})

// hold space
socket.on('holdSpace',()=>{
  const canvas = document.querySelector('canvas')
  const {top, left} = canvas.getBoundingClientRect()
  const eventContainer = {accurate:false, clientX:cursorX, clientY:cursorY}
  shootProj(eventContainer)
})

addEventListener('mousemove', (event) => {
  // update mousepos if changed
  const canvas = document.querySelector('canvas')
  const {top, left} = canvas.getBoundingClientRect()
  cursorX = (event.clientX-left)
  cursorY = (event.clientY-top)
  socket.emit('playermousechange', {x:cursorX,y:cursorY})
})



function reloadGun(){
  if (!gunInfoFrontEnd){ // if gun info is undefined, do not reload
    return
  }
  // reload only when player is created
  if (!frontEndPlayers[socket.id]){return}

  let inventoryPointer = frontEndPlayers[socket.id].currentSlot - 1 // current slot is value between 1 to 4
  if (!inventoryPointer) {inventoryPointer = 0} // default 0
  
  let currentHoldingItemId = frontEndPlayers[socket.id].inventory[inventoryPointer] // if it is 0, it is fist
  let currentHoldingItem = frontEndItems[currentHoldingItemId]
  //check currentHolding is a gun or not
  if (!(currentHoldingItem.itemtype==='gun')){ // not a gun, dont reload
    return
  }

  if (currentHoldingItem.ammo === currentHoldingItem.magSize){ // full ammo - unable to reload
    console.log("ammo full!")
    return
  }

  const CHECKammotype = currentHoldingItem.ammotype
  // if player do not have ammo
  if (!frontEndPlayers[socket.id].checkAmmoExist(CHECKammotype)){
    console.log(`I am out of ${CHECKammotype} ammos!`)
    return
  }

  const currentGunName = currentHoldingItem.name
  const GUNRELOADRATE = gunInfoFrontEnd[currentGunName].reloadTime

  //console.log("reload commit")
  if (!listen) {return} // not ready to reload
  listen = false // block
  //console.log("reloading!")

  let gunSound = new Audio(`/reloadSound/${currentGunName}.mp3`)
  gunSound.volume = 0.1
  gunSound.play()
  // reload ammo here!!!!!
  reloadTimeout = window.setTimeout(function(){currentHoldingItem.restock(socket.id);
    //console.log(`${currentGunName} ammo: ${currentHoldingItem.ammo}`);
    clearTimeout(reloadTimeout);
    listen = true}, GUNRELOADRATE)
}

// reload
socket.on('reload',()=>{
  reloadGun()
})



function dropItem(currentHoldingItemId, backEndItems){
  if (currentHoldingItemId===0){// fist - nothing to do
    return
  }
  const droppingItem = backEndItems[currentHoldingItemId]

  if (droppingItem.itemtype === 'gun'){
    // empty out the gun (retrieve the ammo back)
    frontEndPlayers[socket.id].getAmmo(frontEndItems[currentHoldingItemId].ammotype,frontEndItems[currentHoldingItemId].ammo)
    // reset ammo
    frontEndItems[currentHoldingItemId].ammo = 0
  } else if(droppingItem.itemtype === 'consumable'){
    // nothing to do since consumables do not stack currently...
  } else if(droppingItem.itemtype === 'melee'){
    //console.log("NOT IMPLEMENTED!")
  }

  // change onground flag
  // update ground location
  const me = frontEndPlayers[socket.id]
  socket.emit('updateitemrequestDROP',{itemid:currentHoldingItemId,
    requesttype:'dropitem',
    groundx:me.x, 
    groundy:me.y
  })

}


const INTERACTTIME = 300

function interactItem(itemId,backEndItems){
  //console.log(frontEndPlayers[socket.id].inventory)
  // current slot item 
  let me = frontEndPlayers[socket.id]
  let inventoryPointer = me.currentSlot - 1 // current slot is value between 1 to 4
  if (!inventoryPointer) {inventoryPointer = 0} // default 0
  
  let currentHoldingItemId = me.inventory[inventoryPointer] // if it is 0, it is fist
  let currentHoldingItem = frontEndItems[currentHoldingItemId]

  //console.log("interact commit")
  if (!listen) {return} // not ready to interact
  listen = false 
  //console.log("interacting!")

  let interactSound = new Audio("/sound/interact.mp3")
  interactSound.volume = 0.1
  interactSound.play()

  // interact here!
  // make the item unpickable for other players => backenditem onground switch to false
  const pickingItem = backEndItems[itemId]

  if (pickingItem.itemtype === 'ammo'){
    const teminfo = pickingItem.iteminfo
    frontEndPlayers[socket.id].getAmmo(teminfo.ammotype, teminfo.amount)
    //delete backEndItems[itemId] // cannot do this on client side
    socket.emit('updateitemrequest',{itemid:itemId, requesttype:'deleteammo'})

  }else if(pickingItem.itemtype === 'gun' || pickingItem.itemtype === 'consumable' || pickingItem.itemtype === 'melee'){
    //console.log(`itemId: ${itemId} / inventorypointer: ${inventoryPointer}`)
    dropItem(currentHoldingItemId, backEndItems)
    socket.emit('updateitemrequest',{itemid:itemId, requesttype:'pickupinventory',currentSlot: me.currentSlot,playerId:socket.id})
    frontEndPlayers[socket.id].inventory[inventoryPointer] = itemId // front end should also be changed
    //console.log(frontEndPlayers[socket.id].inventory)
  } 
  // else if(pickingItem.itemtype === 'melee'){
  //   // drop
  //   // pick like gun
  // }

  interactTimeout = window.setTimeout(function(){
    clearTimeout(interactTimeout);
    listen = true}, INTERACTTIME)
}

// iteract
socket.on('interact',(backEndItems)=>{
    const me = frontEndPlayers[socket.id]
    // only when player is created
    if (!me){return}

    // client collision check - reduce server load
    for (const id in backEndItems){
      // Among frontEndItems: pick the first item that satisfies the below conditions
      // only when item is near - collision check with player and item!
      // only when item is onground
      const item = backEndItems[id]
      const itemSizeObj = item.size
      let itemRadius = Math.max(itemSizeObj.length, itemSizeObj.width)
      if (item.itemtype==='gun'){
        itemRadius = itemRadius/2
      }
      const DISTANCE = Math.hypot(item.groundx - me.x, item.groundy - me.y)
      //console.log(`${item.name} DISTANCE: ${DISTANCE}`)
      if (item.onground && (DISTANCE < itemRadius + me.radius)) {
        console.log(`${item.name} is near the player!`)
        interactItem(id,backEndItems)
        break
      }


    }

})
