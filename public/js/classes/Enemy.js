class Enemy {
  constructor({x, y, radius, color, velocity, damage, health=1}) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.damage = damage
    this.health = health

  }

  draw() {
    // c.save() 
    // c.shadowColor = this.color
    // c.shadowBlur = 10
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    // c.restore()
  }
}

