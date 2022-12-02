class Projectile{
    constructor(attribute){
        this.ctx = attribute.ctx;
        this.size = attribute.size;
        this.color = attribute.color;
        this.position = attribute.position;
        this.firstPosition = {x: attribute.position.x, y: attribute.position.y}
        this.speed = attribute.speed;
        this.target = attribute.target;
        this.range = attribute.range;
    }

    draw(){
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        this.ctx.arc(this.position.x, this.position.y, this.size, 0, 2*Math.PI);
        this.ctx.fill()
    }

    move(){
        this.draw();
        const direction = {x: (this.target.x - this.position.x), y: (this.target.y - this.position.y)}
        const angle = Math.atan2(Math.abs(direction.y), Math.abs(direction.x));
        this.position.x += (direction.x / Math.abs(direction.x)) * this.speed * Math.cos(angle);
        this.position.y += (direction.y / Math.abs(direction.y)) * this.speed * Math.sin(angle);
    }
}

export default Projectile;