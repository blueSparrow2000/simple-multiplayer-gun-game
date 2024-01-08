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
      this.haloRadius = Math.max(this.length,this.width)/2 + 5
    }
    draw() { // on the ground
      if (this.onground){
        c.beginPath()
        c.arc(this.groundx, this.groundy, this.haloRadius, 0, Math.PI * 2, false)
        c.lineWidth = 3
        c.strokeStyle = 'gray'
        c.stroke()

        // name
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
      if (!frontEndPlayers[playerId]){return} // safe - player deleted white recharging may inccur an error

      const ammoList = frontEndPlayers[playerId].ammoList
      const typetemp = this.ammotype

      let ammostock = ammoList[typetemp] // current ammo amount in my backpack
      let requestAmount = this.magSize - this.ammo // how much ammo needed to restock fully

      if (ammostock > requestAmount){ // if we have more than needed
        ammostock = requestAmount // cap
      }
      this.ammo += ammostock;
      frontEndPlayers[playerId].consumeAmmo(this.ammotype,ammostock)
    }
}



class Ammo extends Item {
  constructor({groundx, groundy, size, name, onground=true, color = 'white',iteminfo = {amount , ammotype}}) {
      super({groundx, groundy, size, name, onground, color})
      this.amount = iteminfo.amount
      this.ammotype = iteminfo.ammotype 
      this.itemtype = 'ammo'
      this.gap = 5
      
  }
  draw() { // on the ground
    if (this.onground){

      c.strokeStyle = this.color
      c.lineWidth = this.width
      c.beginPath()
      c.moveTo(this.groundx - this.length/2,this.groundy)
      c.lineTo(this.groundx + this.length/2,this.groundy)
      c.stroke()


      // c.save()
      // c.beginPath()
      // c.moveTo(this.groundx - this.length/2 - this.gap,this.groundy)
      // c.lineTo(this.groundx + this.length/2 + this.gap,this.groundy)
      // c.strokeStyle = 'black'
      // c.lineWidth = this.width + this.gap*2
      // c.stroke()

      // c.shadowColor = this.color
      // c.shadowBlur = 10
      // c.strokeStyle = this.color
      // c.lineWidth = this.width
      // c.beginPath()
      // c.moveTo(this.groundx - this.length/2,this.groundy)
      // c.lineTo(this.groundx + this.length/2,this.groundy)
      // c.stroke()
      // c.restore()

      // amount - this takes time...
      // c.fillStyle = 'white'
      // c.fillText(this.amount,this.groundx-5,this.groundy+4)
    }
  }
}

class Consumable extends Item {
  constructor({groundx, groundy, size, name, onground=true, color = 'white',iteminfo = {amount , healamount}}) {
      super({groundx, groundy, size, name, onground, color})
      this.amount = iteminfo.amount
      this.healamount = iteminfo.healamount
      this.itemtype = 'consumable'
      this.gap = 2
      this.barlen = 4
  }
  draw() { // on the ground
    if (this.onground){

      // c.beginPath()
      // c.moveTo(this.groundx - this.length/2,this.groundy)
      // c.lineTo(this.groundx + this.length/2,this.groundy)
      // c.strokeStyle = this.color
      // c.lineWidth = this.width
      // c.stroke()

      c.beginPath()
      c.arc(this.groundx, this.groundy, this.length, 0, Math.PI * 2, false)
      c.fillStyle = this.color
      c.fill()


      if (this.name == 'medkit'){

        // c.save()
        // c.shadowColor = 'red'
        // c.shadowBlur = 3
  
        c.beginPath()
        c.moveTo(this.groundx - this.barlen,this.groundy)
        c.lineTo(this.groundx + this.barlen,this.groundy)
        c.strokeStyle = 'red'
        c.lineWidth = this.gap
        c.stroke()

        c.beginPath()
        c.moveTo(this.groundx,this.groundy - this.barlen)
        c.lineTo(this.groundx,this.groundy + this.barlen)
        c.stroke()
  
        // c.restore()
      }


    }
  }
}


class Melee extends Item {
  constructor({groundx, groundy, size, name, onground = true, color = 'white',iteminfo = {ammo,ammotype}}) {
      super({groundx, groundy, size, name,onground, color})
      this.itemtype = 'melee'
      this.ammo = iteminfo.ammo
      this.ammotype = iteminfo.ammotype
  }
}



