class Player{
    constructor(attribute){
        this.ctx = attribute.ctx;
        this.size = attribute.size;
        this.color = attribute.color;
        this.position = attribute.position;
        this.speed = attribute.speed;
        this.health = attribute.health;
        this.healthMax = attribute.health;
        this.image = attribute.image;
        this.scale = this.image.height / this.image.width;
    }

    draw(degree){
        this.ctx.save();
        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.rotate(degree);
        this.ctx.translate(-this.position.x, -this.position.y);
        this.ctx.drawImage(this.image, this.position.x - this.size / 4, this.position.y - (this.size * this.scale/2) - 14, this.size, this.size * this.scale);
        this.ctx.restore();
    }

    move(direction, degree){
        const angle = Math.atan2(Math.abs(direction.y), Math.abs(direction.x));
        this.position.x += direction.x * this.speed * Math.cos(angle);
        this.position.y += direction.y * this.speed * Math.sin(angle);
        this.position.x = (this.position.x < this.size) ? this.size : this.position.x;
        this.position.x = (this.position.x > window.innerWidth - this.size) ? window.innerWidth - this.size : this.position.x;
        this.position.y = (this.position.y < this.size) ? this.size : this.position.y;
        this.position.y = (this.position.y > window.innerHeight - this.size) ? window.innerHeight - this.size : this.position.y;
        this.draw(degree);
    }
}

export default Player;