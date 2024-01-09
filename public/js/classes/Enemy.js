class Enemy {
  constructor({x, y, radius, color, velocity, damage, health=1,wearingarmorID = -1}) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.damage = damage
    this.health = health
    this.wearingarmorID = wearingarmorID
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }
}

