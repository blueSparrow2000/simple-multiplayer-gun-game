class Player {
  constructor({x, y, radius, color,username, health, currentSlot = 1,inventory, cursorPos = {y:SCREENHEIGHT/2,x:SCREENWIDTH/2}}) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.username = username
    this.health = health
    this.currentSlot = currentSlot
    this.inventory = inventory
    this.cursorPos = cursorPos
    this.ammoList = {'45':50,'5':50,'7':20,'12':14,'battery':4} //default amount of ammos
    this.reloading = false
  }
  checkAmmoExist(ammotype){
    return (this.ammoList[ammotype] > 0)
  }
  consumeAmmo(ammotype,amount){
    this.ammoList[ammotype] -= amount
    //console.log( `Remaining ammo: ${this.ammoList[ammotype]}`)
    //console.log(this.ammoList)
  }
  getAmmo(ammotype,amount){
    this.ammoList[ammotype] += amount
    //console.log(this.ammoList)
  }
  fetchAmmoList(){
    return this.ammoList
  }
  draw() {
    // draw a gun
    const inventoryPointer = this.currentSlot - 1 // current slot is value between 1 to 4
    const currentHoldingItem = frontEndItems[this.inventory[inventoryPointer]]
    if (currentHoldingItem.itemtype==='gun'){
      const itemSize = currentHoldingItem.size
      const itemlength = itemSize.length
      const angle = Math.atan2(
        (this.cursorPos.y) - this.y,
        (this.cursorPos.x) - this.x
      )
      const direction = { 
        x: Math.cos(angle) ,
        y: Math.sin(angle) 
      }
      //c.linewidth = 100
      c.save() // use global canvas effect
      c.beginPath()
      c.strokeStyle = this.color
      //c.setLineDash([])
      c.moveTo(this.x,this.y)
      c.lineTo(this.x + direction.x * itemlength, this.y + direction.y * itemlength)
      c.lineWidth = itemSize.width
      c.stroke()
      c.restore() // use global canvas effect

      if (gunInfoFrontEnd){
        const thisguninfo = gunInfoFrontEnd[currentHoldingItem.name]
        if (thisguninfo.ammotype === '12'){ // 12 gauge shotgun - draw one more rect
          const bodysize = itemlength - 2
          const bodywidth = itemSize.width + thisguninfo.num
          c.beginPath()
          c.strokeStyle = this.color
          c.moveTo(this.x,this.y)
          c.lineTo(this.x + direction.x * bodysize, this.y + direction.y * bodysize)
          c.lineWidth = bodywidth
          c.stroke()

        } else if(thisguninfo.travelDistance >= 1000){ // snipters except VSS
          const tipsize = 3
          const tipstart = itemlength- tipsize
          const tipwidth = itemSize.width + thisguninfo.damage

          c.beginPath()
          c.strokeStyle = this.color
          c.moveTo(this.x + direction.x * tipstart, this.y + direction.y * tipstart)
          c.lineTo(this.x + direction.x * itemlength, this.y + direction.y * itemlength)

          c.lineWidth = tipwidth
          c.stroke()

        } 

      }
    }

    // nametag and hp
    c.font ='12px sans-serif'
    c.fillStyle = 'white'
    c.fillText(this.username,this.x - 3*this.username.length ,this.y - this.radius*3)
    c.font ='10px sans-serif'
    c.fillText(`HP: ${Math.round(this.health * 100) / 100}`,this.x - 12 ,this.y - this.radius*2)
    const itemName = currentHoldingItem.name
    c.fillText(`[${this.currentSlot}] ${itemName}`,this.x - 14 ,this.y + this.radius*3)

    // circle
    c.save() // use global canvas effect
    c.shadowColor = this.color
    c.shadowBlur = 10
    if (this.health > 3) {// armored
      c.shadowBlur = 30
    }
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.restore() // use global canvas effect

  }
  showAmount(){
    const inventoryPointer = this.currentSlot - 1 // current slot is value between 1 to 4
    const currentHoldingItem = frontEndItems[this.inventory[inventoryPointer]]

    if (currentHoldingItem){
      if (currentHoldingItem.itemtype === 'gun'){
        c.font ='10px sans-serif'
        if (this.reloading){
          c.fillText('reloading...',this.x - 10 ,this.y + this.radius*4)
        } else{
          c.fillText(`${currentHoldingItem.ammo}/${currentHoldingItem.magSize}`,this.x - 10 ,this.y + this.radius*4)
        }

        const ammoinfos = ammoInfoFrontEnd[currentHoldingItem.ammotype]
        c.font ='12px sans-serif'
        c.fillStyle = ammoinfos.color
        //c.fillText(`${ammoinfos.color} remaining: {${this.ammoList[currentHoldingItem.ammotype]}}`,this.x - 10 ,this.y + this.radius*5)
        c.fillText(`${ammoinfos.color}: {${this.ammoList[currentHoldingItem.ammotype]}}`,this.x - 10 ,this.y + this.radius*5)


      } else if(currentHoldingItem.itemtype === 'consumable'){
        c.font ='10px sans-serif'
        c.fillText(`${currentHoldingItem.amount}`,this.x - 5 ,this.y + this.radius*4)

      }

    }
  }

}
