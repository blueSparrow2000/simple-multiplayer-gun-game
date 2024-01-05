// Index.html shows that frontend.js is linked prior to eventListeners.js

// semaphores
// listen is defined in frontend.js
let fireTimeout
let reloadTimeout
let interactTimeout


// one variable that tracks me <- is this ok?


function isMelee(itemtypeARG){  //check currentHolding is melee // no ammo update
  return itemtypeARG ==='melee'
}


function shootProj(event){
  if (!gunInfoFrontEnd){ // if gun info is undefined, do not fire bullet
    return
  }
  //let frontEndPlayer = frontEndPlayers[socket.id]
  // shoot only when player is created
  if (!frontEndPlayer){return}

  // get currently holding item
  let inventoryPointer = frontEndPlayer.currentSlot - 1 // current slot is value between 1 to 4
  if (!inventoryPointer) {inventoryPointer = 0} // default 0
  let currentHoldingItemId = frontEndPlayer.inventory[inventoryPointer] // if it is 0, it is fist
  let currentHoldingItem = frontEndItems[currentHoldingItemId]

  if (!currentHoldingItem) {return} // undefined case

  if ((currentHoldingItem.itemtype==='consumable')){ // eat
    // dont need to check amount since we will delete item if eaten
    const currentItemName = currentHoldingItem.name
    const CONSUMERATE = 1000

    if (!listen) {return} // not ready to eat
    listen = false // block
  
    const consumeSound = frontEndConsumableSounds[currentItemName]// new Audio(`/consumeSound/${currentItemName}.mp3`)
    consumeSound.play()

    // decrease amount here (if needed in future)

    fireTimeout = window.setTimeout(function(){ if (!frontEndPlayer) {clearTimeout(fireTimeout);return}; socket.emit('consume',{
      itemName: currentHoldingItem.name,
      playerId: socket.id,
      healamount: currentHoldingItem.healamount,
      deleteflag: true, // current version, delete right away
      itemid: currentHoldingItemId,
      currentSlot: frontEndPlayer.currentSlot,
    }) ;
      clearTimeout(fireTimeout);
      listen = true},CONSUMERATE)

    return
  }


  if (!(currentHoldingItem.itemtype==='gun' || currentHoldingItem.itemtype==='melee')){ // not a gun/melee, dont shoot
    //console.log("this item is not a gun/consumable/melee. It is undefined or something else")
    return
  }


  if ((!isMelee(currentHoldingItem.itemtype)) && currentHoldingItem.ammo <= 0){ // no ammo - unable to shoot
    reloadGun() // auto reload when out of ammo
    return
  }

  const currentGunName = currentHoldingItem.name
  const guninfGET = gunInfoFrontEnd[currentGunName]
  const GUNFIRERATE = guninfGET.fireRate

  const playerPosition = {
    x: frontEndPlayer.x,
    y: frontEndPlayer.y
  }

  let mouselocX = event.clientX
  let mouselocY = event.clientY

  if (!event.accurate){
    // recoil effect for hold space (mouse click uses immediate click event.clientX,Y so it is more accurate than holding)
    // this critically changes accuracy
    mouselocX += (Math.random()-0.5) * guninfGET.shake
    mouselocY += (Math.random()-0.5) * guninfGET.shake
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
  fireTimeout = window.setTimeout(function(){ if (!frontEndPlayer) {clearTimeout(fireTimeout);return};clearTimeout(fireTimeout);listen = true},GUNFIRERATE)
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




function reloadGun(){
  if (!gunInfoFrontEnd){ // if gun info is undefined, do not reload
    return
  }
  //let frontEndPlayer = frontEndPlayers[socket.id]
  // reload only when player is created
  if (!frontEndPlayer){return}

  let inventoryPointer = frontEndPlayer.currentSlot - 1 // current slot is value between 1 to 4
  if (!inventoryPointer) {inventoryPointer = 0} // default 0
  
  let currentHoldingItemId = frontEndPlayer.inventory[inventoryPointer] // if it is 0, it is fist
  let currentHoldingItem = frontEndItems[currentHoldingItemId]
  //check currentHolding is a gun or not
  if (!(currentHoldingItem.itemtype==='gun')){ // not a gun, dont reload
    return
  }

  if (currentHoldingItem.ammo === currentHoldingItem.magSize){ // full ammo - unable to reload
    //console.log("ammo full!")
    return
  }

  const CHECKammotype = currentHoldingItem.ammotype
  // if player do not have ammo
  if (!frontEndPlayer.checkAmmoExist(CHECKammotype)){
    //console.log(`I am out of ${CHECKammotype} ammos!`)
    return
  }

  const currentGunName = currentHoldingItem.name
  const GUNRELOADRATE = gunInfoFrontEnd[currentGunName].reloadTime

  //console.log("reload commit")
  if (!listen) {return} // not ready to reload
  listen = false // block
  //console.log("reloading!")

  let reloadSound = frontEndGunReloadSounds[currentGunName] //new Audio(`/reloadSound/${currentGunName}.mp3`)
  reloadSound.play()
  // reload ammo here!!!!!

  frontEndPlayer.reloading = true

  reloadTimeout = window.setTimeout(function(){
    //console.log(`${currentGunName} ammo: ${currentHoldingItem.ammo}`);
    clearTimeout(reloadTimeout); if (frontEndPlayer) {currentHoldingItem.restock(socket.id); frontEndPlayer.reloading = false; listen = true};
    }, GUNRELOADRATE)
  
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
  //let frontEndPlayer = frontEndPlayers[socket.id]
  let curItemGET = frontEndItems[currentHoldingItemId]
  if (droppingItem.itemtype === 'gun'){
    // empty out the gun (retrieve the ammo back)
    frontEndPlayer.getAmmo(curItemGET.ammotype,curItemGET.ammo)
    // reset ammo
    curItemGET.ammo = 0
  } else if(droppingItem.itemtype === 'consumable'){
    // nothing to do since consumables do not stack currently...
  } else if(droppingItem.itemtype === 'melee'){
    //console.log("NOT IMPLEMENTED!")
  }

  // change onground flag
  // update ground location
  socket.emit('updateitemrequestDROP',{itemid:currentHoldingItemId,
    requesttype:'dropitem',
    groundx:frontEndPlayer.x, 
    groundy:frontEndPlayer.y
  })

}


const INTERACTTIME = 300

function interactItem(itemId,backEndItems){
  //console.log(frontEndPlayers[socket.id].inventory)
  // current slot item 
  //let frontEndPlayer = frontEndPlayers[socket.id]
  let inventoryPointer = frontEndPlayer.currentSlot - 1 // current slot is value between 1 to 4
  if (!inventoryPointer) {inventoryPointer = 0} // default 0
  
  let currentHoldingItemId = frontEndPlayer.inventory[inventoryPointer] // if it is 0, it is fist
  let currentHoldingItem = frontEndItems[currentHoldingItemId]

  //console.log("interact commit")
  if (!listen) {return} // not ready to interact
  listen = false 
  //console.log("interacting!")


  interactSound.play()

  // interact here!
  // make the item unpickable for other players => backenditem onground switch to false
  const pickingItem = backEndItems[itemId]

  if (pickingItem.itemtype === 'ammo'){
    const teminfo = pickingItem.iteminfo
    frontEndPlayer.getAmmo(teminfo.ammotype, teminfo.amount)
    //delete backEndItems[itemId] // cannot do this on client side
    socket.emit('updateitemrequest',{itemid:itemId, requesttype:'deleteammo'})

  }else if(pickingItem.itemtype === 'gun' || pickingItem.itemtype === 'consumable' || pickingItem.itemtype === 'melee'){
    //console.log(`itemId: ${itemId} / inventorypointer: ${inventoryPointer}`)
    dropItem(currentHoldingItemId, backEndItems)
    socket.emit('updateitemrequest',{itemid:itemId, requesttype:'pickupinventory',currentSlot: frontEndPlayer.currentSlot,playerId:socket.id})
    frontEndPlayer.inventory[inventoryPointer] = itemId // front end should also be changed
  } 
  // else if(pickingItem.itemtype === 'melee'){
  //   // drop
  //   // pick like gun
  // }

  interactTimeout = window.setTimeout(function(){
    clearTimeout(interactTimeout);
    if (frontEndPlayer){listen = true;    // reload when pick up
    reloadGun()}}, INTERACTTIME)
}

// iteract
socket.on('interact',(backEndItems)=>{
    //let frontEndPlayer = frontEndPlayers[socket.id]
    // only when player is created
    if (!frontEndPlayer){return}

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
      const DISTANCE = Math.hypot(item.groundx - frontEndPlayer.x, item.groundy - frontEndPlayer.y)
      //console.log(`${item.name} DISTANCE: ${DISTANCE}`)
      if (item.onground && (DISTANCE < itemRadius + frontEndPlayer.radius)) {
        //console.log(`${item.name} is near the player!`)
        interactItem(id,backEndItems)
        break
      }


    }

})
