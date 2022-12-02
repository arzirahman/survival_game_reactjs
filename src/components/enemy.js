class Enemy{
    constructor(attribute){
        this.ctx = attribute.ctx;
        this.size = attribute.size;
        this.color = attribute.color;
        this.position = attribute.position;
        this.speed = attribute.speed;
        this.target = attribute.target;
        this.image = attribute.image;
        this.scale = this.image.height / this.image.width;
    }

    draw(degree){
        this.ctx.save();
        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.rotate(degree);
        this.ctx.translate(-this.position.x, -this.position.y);
        this.ctx.drawImage(this.image, this.position.x - this.size / 2, this.position.y - (this.size * this.scale/2), this.size, this.size * this.scale);
        this.ctx.fillRect(this.position.x,this.position.y,5,5);
        this.ctx.restore();
    }

    move(degree){
        this.draw(degree);
        const direction = {x: (this.target.x - this.position.x), y: (this.target.y - this.position.y)}
        const angle = Math.atan2(Math.abs(direction.y), Math.abs(direction.x));
        this.position.x += (direction.x / Math.abs(direction.x)) * this.speed * Math.cos(angle);
        this.position.y += (direction.y / Math.abs(direction.y)) * this.speed * Math.sin(angle);
    }
}

export default Enemy;