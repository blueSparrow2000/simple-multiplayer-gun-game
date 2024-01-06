class Projectile {
  constructor({x, y, radius,velocity, color = 'white', gunName}) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.gunName = gunName
    this.angle = Math.atan2(
      velocity.y,
      velocity.x
    )// only needed for crossbow
    this.startangle = this.angle + Math.PI - Math.PI/8
    this.endangle = this.angle + Math.PI + Math.PI/8
    //console.log(gunName)
  }

  draw() {
    if (this.gunName === 'CrossBow'){
      // c.save()
      c.lineWidth = 6
      c.fillStyle = 'white'
      c.beginPath()
      c.arc(this.x,this.y, 10, this.startangle, this.endangle, false) // 10 is about the speed at terminal
      c.fill()

      c.strokeStyle = 'DarkCyan'
      c.lineWidth = 2
      // trail effect
      c.beginPath()
      c.moveTo(this.x - this.velocity.x, this.y - this.velocity.y)
      c.lineTo(this.x,this.y)
      c.stroke()
      // c.restore()
      return
    }
 
    // c.save()
    // trail effect
    c.strokeStyle = this.color
    c.lineWidth = 2*this.radius/3
    c.beginPath()
    c.moveTo(this.x - this.velocity.x/2, this.y - this.velocity.y/2)
    c.lineTo(this.x,this.y)
    c.stroke()

    // c.restore()
  }

  update() { // unused
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}
