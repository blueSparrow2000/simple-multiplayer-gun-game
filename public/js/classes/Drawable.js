class Drawable {
    constructor({linewidth,start,end}) {
        this.linewidth = linewidth
        this.start = start
        this.end = end
        this.color = 'white'
        this.beta = 1
    }
  
    draw() {
        // c.save()
        c.beginPath()
        c.moveTo(this.start.x,this.start.y)
        c.lineTo(this.end.x,this.end.y)
        // c.globalAlpha = this.alpha
        c.strokeStyle = this.color
        c.lineWidth = this.linewidth * this.beta
        c.stroke()
        // c.restore()
        this.beta -= 0.02

    }
}


class LocationShower {
    constructor({x,y,color}) {
        this.x = x
        this.y = y
        this.width = 10
        this.color = color
        //console.log("Created")
    }
    draw(){
        c.strokeStyle = this.color
        c.lineWidth = this.width
        c.beginPath()
        c.arc(this.x, this.y, 300/this.width - 20, 0, Math.PI * 2, false)
        c.stroke()
        this.width -= 0.05
    }
    deleteRequest(){
        if (this.width <= 1){
            //console.log("Draw delete called")
            return true
        } 
        return false
    }
}

