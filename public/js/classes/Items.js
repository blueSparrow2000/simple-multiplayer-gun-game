class Item {
    constructor({ groundx, groundy, size, name, onground = true , color = 'white'}) {
      this.groundx = groundx
      this.groundy = groundy
      this.size = size
      this.length = size.length
      this.width = size.width
      this.name = name
      this.color = color
      this.onground = onground // before pickup: true
      //console.log(groundx, groundy, size, name, color, onground)
    }
    drawHalo(){
      // halo
      const haloRadius = Math.max(this.length,this.width)/2 + 5
      c.save() // use global canvas effect
      c.globalAlpha = 0.2
      c.beginPath()
      c.arc(this.groundx, this.groundy, haloRadius, 0, Math.PI * 2, false)
      c.fillStyle = 'gray'
      c.fill()
      c.restore() // use global canvas effect

      c.save() // use global canvas effect
      c.beginPath()
      c.arc(this.groundx, this.groundy, haloRadius, 0, Math.PI * 2, false)
      c.lineWidth = 3
      c.strokeStyle = 'gray'
      c.stroke()
      c.restore() // use global canvas effect
    }
    draw() { // on the ground
      if (this.onground){
        this.drawHalo()

        // item
        // c.save()
        // c.beginPath()
        // c.moveTo(this.groundx - this.length/2,this.groundy)
        // c.lineTo(this.groundx + this.length/2,this.groundy)
        // c.strokeStyle = this.color
        // c.lineWidth = this.width
        // c.stroke()
        // c.restore()

        // name
        c.font ='italic bold 14px sans-serif'
        c.fillStyle = 'white'
        c.fillText(this.name,this.groundx - 4*this.name.length,this.groundy+3)
      }
    }


  }


class Gun extends Item {
    constructor({groundx, groundy, size, name, onground = true, color = 'white',iteminfo = {ammo,ammotype}}) {
        super({groundx, groundy, size, name,onground, color})
        this.ammo = iteminfo.ammo
        this.ammotype = iteminfo.ammotype
        this.itemtype = 'gun'
        this.magSize = gunInfoFrontEnd[this.name].magSize
        this.reloadTime = gunInfoFrontEnd[this.name].reloadTime
    }

    showAmount(){
      return
    }

    restock(playerId){
      const ammoList = frontEndPlayers[playerId].ammoList
      //console.log(ammoList)
      const typetemp = this.ammotype

      let ammostock = ammoList[typetemp] // current ammo amount in my backpack
      let requestAmount = this.magSize - this.ammo // how much ammo needed to restock fully

      if (ammostock > requestAmount){ // if we have more than needed
        ammostock = requestAmount // cap
      }
      //console.log(`requestamount${requestAmount}`)
      //console.log(`ammostock: ${ammostock}`)
      //console.log(`typetemp${typetemp}`)
      this.ammo += ammostock;
      console.log(`${this.name} restocked to: +${this.ammo}/${this.magSize}`);
      
      // consumed ammo amount = ammostock
      frontEndPlayers[playerId].consumeAmmo(this.ammotype,ammostock)
    }
}

class Ammo extends Item {
  constructor({groundx, groundy, size, name, onground=true, color = 'white',iteminfo = {amount , ammotype}}) {
      super({groundx, groundy, size, name, onground, color})
      this.amount = iteminfo.amount
      this.ammotype = iteminfo.ammotype 
      this.itemtype = 'ammo'
  }
  draw() { // on the ground
    if (this.onground){
      const gap = 5
      c.save()
      c.beginPath()
      c.moveTo(this.groundx - this.length/2 - gap,this.groundy)
      c.lineTo(this.groundx + this.length/2 + gap,this.groundy)
      c.strokeStyle = 'black'
      c.lineWidth = this.width + gap*2
      c.stroke()
      c.restore()

      c.save()
      c.shadowColor = this.color
      c.shadowBlur = 10
      c.beginPath()
      c.moveTo(this.groundx - this.length/2,this.groundy)
      c.lineTo(this.groundx + this.length/2,this.groundy)
      c.strokeStyle = this.color
      c.lineWidth = this.width
      c.stroke()
      c.restore()

      // amount
      c.font ='italic bold 8px sans-serif'
      c.fillStyle = 'black'
      c.fillText(this.amount,this.groundx-5,this.groundy+4)
    }
  }
}

class Consumable extends Item {
  constructor({groundx, groundy, size, name, onground=true, color = 'white',iteminfo = {amount , healamount}}) {
      super({groundx, groundy, size, name, onground, color})
      this.amount = iteminfo.amount
      this.healamount = iteminfo.healamount
      this.itemtype = 'consumable'
  }
  draw() { // on the ground
    if (this.onground){
      c.save()
      c.beginPath()
      c.moveTo(this.groundx - this.length/2,this.groundy)
      c.lineTo(this.groundx + this.length/2,this.groundy)
      c.strokeStyle = this.color
      c.lineWidth = this.width
      c.stroke()
      c.restore()

      if (this.name == 'medkit'){
        const gap = 2
        const barlen = 6
        c.save()
        c.shadowColor = 'red'
        c.shadowBlur = 3
  
        c.beginPath()
        c.moveTo(this.groundx - barlen,this.groundy)
        c.lineTo(this.groundx + barlen,this.groundy)
        c.strokeStyle = 'red'
        c.lineWidth = gap
        c.stroke()
        c.restore()
        
        c.save()
        c.beginPath()
        c.moveTo(this.groundx,this.groundy - barlen)
        c.lineTo(this.groundx,this.groundy + barlen)
        c.strokeStyle = 'red'
        c.lineWidth = gap
        c.stroke()
  
        c.restore()
      }


    }
  }
}


class Melee extends Item {
  constructor({groundx, groundy, size, name, onground = true, color = 'white',iteminfo = {damage, reach}}) {
      super({groundx, groundy, size, name,onground, color})
      this.itemtype = 'melee'
      this.damage = iteminfo.damage
      this.reach = iteminfo.reach
  }
}

