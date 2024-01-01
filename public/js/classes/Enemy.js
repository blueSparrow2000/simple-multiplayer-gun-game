class Enemy {
  constructor({ex, ey, eradius, ecolor, evelocity, edamage, ehealth=1}) {
    this.ex = ex
    this.ey = ey
    this.eradius = eradius
    this.ecolor = ecolor
    this.evelocity = evelocity
    this.edamage = edamage
    this.ehealth = ehealth
    //console.log(ex, ey, eradius, ecolor, evelocity, edamage)
  }

  draw() {
    c.save() 
    c.shadowColor = this.ecolor
    c.shadowBlur = 10
    c.beginPath()
    c.arc(this.ex, this.ey, this.eradius, 0, Math.PI * 2, false)
    c.fillStyle = this.ecolor
    c.fill()
    c.restore()
  }
}

