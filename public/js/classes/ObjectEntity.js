class ObjectEntity {
  constructor({objecttype, health}) {
    this.objecttype = objecttype
    this.health = health
    this.originalHealth = health
  }
  draw() {
  }
}

class Wall extends ObjectEntity {
    constructor({objecttype, health, objectinfo}) {
        super({objecttype, health})
        this.linewidth = objectinfo.width
        this.start = objectinfo.start
        this.end = objectinfo.end
        this.color = objectinfo.color
        this.orientation = objectinfo.orientation
        //console.log(objecttype, health, objectinfo)
    }
    draw() { // on the ground
        c.beginPath()
        c.moveTo(this.start.x,this.start.y)
        c.lineTo(this.end.x,this.end.y)
        c.strokeStyle = this.color
        c.lineWidth = this.linewidth * (this.health)/this.originalHealth
        c.stroke()
    }
  }


class Hut extends ObjectEntity {
    constructor({objecttype, health, objectinfo}) {
        super({objecttype, health})
        this.x = objectinfo.center.x
        this.y = objectinfo.center.y
        this.radius = objectinfo.radius
        this.color = objectinfo.color
        //console.log(objecttype, health, objectinfo)
    }
    draw() { // on the ground
        c.beginPath()
        c.arc(this.x, this.y, this.radius , 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
  }
