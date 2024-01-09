class Player extends VisibleObject{
  constructor({x, y, radius, color,username, health, currentSlot = 1,inventory, cursorPos = {y:SCREENHEIGHT/2,x:SCREENWIDTH/2}, score, wearingarmorID=-1}) {
    super()
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.username = username
    this.health = health
    this.currentSlot = currentSlot
    this.inventory = inventory
    this.cursorPos = cursorPos
    this.ammoList = {'45ACP':50,'5mm':30,'7mm':10,'12G':14,'battery':2, 'bolt':8,'superconductor':10} //default amount of ammos
    this.reloading = false
    this.score = score
    this.wearingarmorID = wearingarmorID
  }
  checkAmmoExist(ammotype){
    return (this.ammoList[ammotype] > 0)
  }
  consumeAmmo(ammotype,amount){
    this.ammoList[ammotype] -= amount
  }
  getAmmo(ammotype,amount){
    this.ammoList[ammotype] += amount
  }
  fetchAmmoList(){
    return this.ammoList
  }
  resetVisibility(){
    this.visible = true
  }
  draw() {
    // draw a gun
    const inventoryPointer = this.currentSlot - 1 // current slot is value between 1 to 4
    const currentHoldingItem = frontEndItems[this.inventory[inventoryPointer]]
    if (currentHoldingItem.itemtype==='gun'){
      const itemSize = currentHoldingItem.size
      const itemlength = itemSize.length
      const gunmainwidth = itemSize.width
      const angle = Math.atan2(
        (this.cursorPos.y) - this.y,
        (this.cursorPos.x) - this.x
      )
      const direction = { 
        x: Math.cos(angle) ,
        y: Math.sin(angle) 
      }
      c.beginPath()
      c.strokeStyle = this.color
      c.moveTo(this.x,this.y)
      c.lineTo(this.x + direction.x * itemlength, this.y + direction.y * itemlength)
      c.lineWidth = gunmainwidth
      c.stroke()

      if (gunInfoFrontEnd){
        const thisguninfo = gunInfoFrontEnd[currentHoldingItem.name]
        if (currentHoldingItem.name === 'CrossBow'){
          const endx = this.x + direction.x * itemlength
          const endy = this.y + direction.y * itemlength
          const startangle = angle + Math.PI - Math.PI/3
          const endangle = angle + Math.PI + Math.PI/3
          const stringlength = 6
          
          c.strokeStyle = 'white'
          c.lineWidth = 1
          c.beginPath()
          c.arc(endx, endy, stringlength, startangle, endangle, false)
          c.stroke()

          c.beginPath()
          c.moveTo(endx, endy)
          c.lineTo(endx + Math.cos(startangle) * stringlength, endy + Math.sin(startangle) * stringlength)
          c.stroke()
          c.beginPath()
          c.moveTo(endx, endy)
          c.lineTo(endx + Math.cos(endangle) * stringlength, endy + Math.sin(endangle) * stringlength)
          c.stroke()

        } else if (thisguninfo.ammotype === '12G'){ // 12 gauge shotgun - draw one more rect
          const bodysize = itemlength - 2
          const bodywidth = itemSize.width + thisguninfo.num
          c.beginPath()
          // c.strokeStyle = this.color
          c.moveTo(this.x,this.y)
          c.lineTo(this.x + direction.x * bodysize, this.y + direction.y * bodysize)
          c.lineWidth = bodywidth
          c.stroke()

        } else if(thisguninfo.projectileSpeed >= 30){ // snipters except VSS (can shoot all across the screen)
          const tipsize = 2
          const tipstart = itemlength- tipsize
          const tipwidth = itemSize.width + thisguninfo.damage/3
          const bodylen = itemlength - 20

          // body part
          c.beginPath()
          c.moveTo(this.x, this.y)
          c.lineTo(this.x + direction.x * bodylen, this.y + direction.y * bodylen)
          c.lineWidth = gunmainwidth + 2
          c.stroke()


          c.beginPath()
          c.moveTo(this.x + direction.x * tipstart, this.y + direction.y * tipstart)
          c.lineTo(this.x + direction.x * itemlength, this.y + direction.y * itemlength)
          c.lineWidth = tipwidth
          c.stroke()




        } else if(thisguninfo.ammotype==='5mm'){
          const cylotip = 2
          const tipstart = 10 + cylotip
          const tipwidth = itemSize.width + (thisguninfo.projectileSpeed-18)/2

          c.beginPath()
          // c.strokeStyle = this.color
          c.moveTo(this.x + direction.x * tipstart, this.y + direction.y * tipstart)
          c.lineTo(this.x + direction.x * (itemlength-cylotip), this.y + direction.y * (itemlength-cylotip))

          c.lineWidth = tipwidth
          c.stroke()
        }

      }
    }

    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()


    if (!this.visible){ // not visible
      return
    }
    c.fillStyle = 'white'
    c.fillText(this.username,this.x - 3*this.username.length ,this.y - this.radius*3)

    c.fillText(`HP: ${Math.round(this.health * 100) / 100}`,this.x - 12 ,this.y - this.radius*2)
    const itemName = currentHoldingItem.name
    c.fillText(`[${this.currentSlot}] ${itemName}`,this.x - 14 ,this.y + this.radius*3)



  }
  showAmount(){
    const inventoryPointer = this.currentSlot - 1 // current slot is value between 1 to 4
    const currentHoldingItem = frontEndItems[this.inventory[inventoryPointer]]

    if (currentHoldingItem){
      // c.font ='10px sans-serif'
      if (currentHoldingItem.itemtype === 'gun'){
        if (this.reloading){
          c.fillText('reloading...',this.x - 10 ,this.y + this.radius*4)
        } else{
          c.fillText(`${currentHoldingItem.ammo}/${currentHoldingItem.magSize}`,this.x - 10 ,this.y + this.radius*4)
        }

        const ammoinfos = ammoInfoFrontEnd[currentHoldingItem.ammotype]
        // c.font ='12px sans-serif'
        c.fillStyle = ammoinfos.color
        //c.fillText(`${ammoinfos.color} remaining: {${this.ammoList[currentHoldingItem.ammotype]}}`,this.x - 10 ,this.y + this.radius*5)
        c.fillText(`${currentHoldingItem.ammotype}: {${this.ammoList[currentHoldingItem.ammotype]}}`,this.x - 10 ,this.y + this.radius*5)


      } 

    }
  }

}
