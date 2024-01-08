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

    }
    draw() { // on the ground
        c.beginPath()
        c.moveTo(this.start.x,this.start.y)
        c.lineTo(this.end.x,this.end.y)
        c.strokeStyle = this.color
        c.lineWidth = this.linewidth * (this.health)/this.originalHealth
        c.stroke()
    }
    drawShade(playerX,playerY){
      const PSX = this.start.x - playerX
      const PSY = this.start.y - playerY
      const PSInvserse = Math.floor(15*SCREENWIDTH/Math.hypot(PSX,PSY))

      const PEX = this.end.x - playerX
      const PEY = this.end.y - playerY
      const PEInverse = Math.floor(15*SCREENWIDTH/Math.hypot(PEX,PEY))

      c.beginPath();
      c.moveTo(this.start.x, this.start.y);
      c.lineTo(this.start.x + PSX*PSInvserse, this.start.y + PSY*PSInvserse);
      c.lineTo(this.end.x + PEX*PEInverse, this.end.y + PEY*PEInverse);
      c.lineTo(this.end.x, this.end.y);
      c.closePath();
      c.fill();


    }
    checkVisibility(playerx,playery, entity){ /*player pos in {x:, y:}  / entity: mutable object (players) */
      if (this.orientation==='vertical'){
        if ( (playerx - this.start.x > 0 && entity.x - this.start.x < 0) ||  (playerx - this.start.x < 0 && entity.x - this.start.x > 0) ){
          // same code for speed
          const line1 = (entity.x - this.start.x)*(playery - this.start.y) - (entity.y - this.start.y)*(playerx - this.start.x)
          const line2 = (entity.x - this.end.x)*(playery - this.end.y) - (entity.y - this.end.y)*(playerx - this.end.x)
          if ( (line1 > 0 && line2 < 0) || (line1 < 0 && line2 > 0) ){
            entity.visible = false
          }
          ////
        }
      } 
      else{ // horizontal
        if ( (playery - this.start.y > 0 && entity.y - this.start.y < 0) ||  (playery - this.start.y < 0 && entity.y - this.start.y > 0) ){
          // same code for speed
          const line1 = (entity.x - this.start.x)*(playery - this.start.y) - (entity.y - this.start.y)*(playerx - this.start.x)
          const line2 = (entity.x - this.end.x)*(playery - this.end.y) - (entity.y - this.end.y)*(playerx - this.end.x)
          if ( (line1 > 0 && line2 < 0) || (line1 < 0 && line2 > 0) ){
            entity.visible = false
          }
          ////
        }
      }



      // if (this.whichSide(playerx,playery) !== this.whichSide(entity.x,entity.y) ){// not on same side
      //   entity.visible = false
      //   //console.log('different side!')
      // } 
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
    drawShade(playerX,playerY){
     //pass 
    }
    checkVisibility(playerpos, entity){ /*player pos in {x:, y:}  / entity also*/
    //pass
    }
  }
