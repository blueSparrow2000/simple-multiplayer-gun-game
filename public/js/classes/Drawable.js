class Drawable {
    constructor({linewidth,start,end}) {
        this.linewidth = linewidth
        this.start = start
        this.end = end
        this.color = 'white'
        this.alpha = 1
    }
  
    draw() {
        c.save()
        c.beginPath()
        c.moveTo(this.start.x,this.start.y)
        c.lineTo(this.end.x,this.end.y)
        c.globalAlpha = this.alpha
        c.strokeStyle = this.color
        c.lineWidth = this.linewidth
        c.stroke()
        c.restore()
        this.alpha -= 0.02

    }
}
