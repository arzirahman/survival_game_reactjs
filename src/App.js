import React from 'react';
import Player from './components/player';
import Projectile from './components/projectile';
import Enemy from './components/enemy';
import ImageUrl from './images/image';

class App extends React.Component {
  componentDidMount(){
    this.loadImage();
    this.getCanvasComponent();
    this.initialParameter();
    this.createPlayer();
    this.startAnimation();
    this.eventListener();
    setTimeout(()=>{
      this.enemiesFrame = setInterval(()=>{this.spawnEnemies()}, this.wave.spawnRatio);
    },3000);
    setInterval(()=>{this.shoot()}, 70);
  }

  loadImage(){
    const imageUrl = new ImageUrl();
    const backgroundImage = new Image();
    backgroundImage.src = imageUrl.background;
    const healthBar = new Image();
    healthBar.src = imageUrl.healthBar;
    const player = new Image();
    player.src = imageUrl.player;
    const enemy = new Image();
    enemy.src = imageUrl.enemy;
    this.images = {
      background:backgroundImage,
      healthBar:healthBar,
      player:player,
      enemy:enemy
    }
  }

  getCanvasComponent(){
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initialParameter(){
    this.movement = {left:0, right:0, up:0, down:0}
    this.projectiles = [];
    this.wave = {level:1,enemies:10,spawned:0,score:0,prevScore:0,spawnRatio:1000}
    this.pause = false;
    this.shootEnable = false;
    this.prepareTime = 1;
    this.enemiesFrame = undefined;
    this.enemies = [];
    this.cursorPosition = {x:0, y:0}
  }

  createPlayer(){
    this.player = new Player({
      ctx:this.ctx,
      size:100,
      color:'blue', 
      position:{x:window.innerWidth/2, y:window.innerHeight/2},
      speed:6,
      health: 100,
      image:this.images.player
    });
    this.player.draw(0);
  }

  eventListener(){
    document.addEventListener('keydown',(event)=>{this.buttonDown(event)});
    document.addEventListener('keyup',(event)=>{this.buttonUp(event)});
    document.addEventListener('mousedown',()=>{this.shootEnable = true});
    document.addEventListener('mouseup',()=>{this.shootEnable = false});
    document.addEventListener('mousemove',(event)=>{
      this.cursorPosition.x = event.clientX;
      this.cursorPosition.y = event.clientY;
    });
  }

  startAnimation(){
    this.animationFrame = requestAnimationFrame(()=>{this.startAnimation()});
    if(!this.pause){
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      this.ctx.drawImage(this.images.background, 0, 0, window.innerWidth, window.innerHeight);
      this.player.move({
        x:(this.movement.right - this.movement.left),
        y:(this.movement.down - this.movement.up)
      },
      Math.atan2((this.cursorPosition.y - this.player.position.y),(this.cursorPosition.x - this.player.position.x)));
      this.enemyMovement();
      this.projectileMovement();
      this.scoreBoard();
      this.healthBar();
    }
  }

  spawnEnemies(){
    if(!this.pause){
      if((this.wave.spawned < this.wave.enemies)){
        let [x, y] = this.getRandomCoordinate();
        this.enemies.push(new Enemy({
          ctx:this.ctx,
          size:100,
          color:'green', 
          position:{x:x, y:y},
          speed:4,
          target: this.player.position,
          image:this.images.enemy
        }));
        this.wave.spawned += 1;
      }
      if(this.wave.score - this.wave.prevScore === this.wave.spawned){
        this.nextWave();
      }
    }
  }

  nextWave(){
    clearInterval(this.enemiesFrame);
    this.wave.spawned = 0;
    this.wave.level += 1;
    this.wave.enemies *= 1.5;
    this.wave.prevScore = this.wave.score;
    this.wave.spawnRatio -= 100;
    this.prepareTime = 0;
    setTimeout(()=>{
      this.enemiesFrame = setInterval(()=>{this.spawnEnemies()},this.wave.spawnRatio);
    },3000);
  }

  getRandomCoordinate(){
    let x, y;
    if(Math.random() < 0.5){
      x = (Math.random() < 0.5) ? 0 - 20 : window.innerWidth + 20;
      y = Math.random() * window.innerHeight;
    }
    else{
      y = (Math.random() < 0.5) ? 0 - 20 : window.innerHeight + 20;
      x = Math.random() * window.innerWidth;
    }
    return [x,y]
  }

  enemyMovement(){
    this.enemies.every(enemy => {
      const theta = Math.atan2((enemy.position.y - this.player.position.y),(enemy.position.x - this.player.position.x));
      if(Math.abs(enemy.position.x - enemy.target.x) < (enemy.size/2) &&
         Math.abs(enemy.position.y - enemy.target.y) < (enemy.size/2)){
          if(this.player.health >= 0){this.player.health -= 0.5;enemy.draw(theta - Math.PI);}
          else{this.gameOver(); return false;}
      }
      else{enemy.move(theta - Math.PI)}
      return true;
    });
  }

  gameOver(){
    cancelAnimationFrame(this.animationFrame);
    alert('You Lose');
    window.location.href = '/';
  }

  shoot(){
    if(this.shootEnable && !this.pause){
      let theta = Math.atan2((this.player.position.y-this.cursorPosition.y),(this.player.position.x-this.cursorPosition.x));
      this.projectiles.push(new Projectile({
        ctx:this.ctx,
        size:5,
        color:'red', 
        position:{
          x:this.player.position.x - (70 * Math.cos(theta)),
          y:this.player.position.y - (70 * Math.sin(theta))
        },
        speed:10,
        range:200,
        target: {x:this.cursorPosition.x, y:this.cursorPosition.y}
      }));
    }
  }

  projectileMovement(){
    this.projectiles.forEach((projectile, projectileIndex) => {
      projectile.move();
      this.enemies.forEach((enemy, enemyIndex) => {
        if(Math.abs(enemy.position.x - projectile.position.x) < (enemy.size/2) &&
           Math.abs(enemy.position.y - projectile.position.y) < (enemy.size/2)){
            this.enemies.splice(enemyIndex, 1);
            this.projectiles.splice(projectileIndex, 1);
            this.wave.score += 1;
        }
      });
      if((Math.sqrt((projectile.firstPosition.x - projectile.position.x)**2 + 
        (projectile.firstPosition.y - projectile.position.y)**2) > projectile.range) ||
        (Math.abs(projectile.position.x - projectile.target.x) < 5 &&
        Math.abs(projectile.position.y - projectile.target.y) < 5)){
          this.projectiles.splice(projectileIndex, 1);
      }
    });
  }

  healthBar(){
    this.ctx.drawImage(this.images.healthBar, 0, -20, this.images.healthBar.width / 2.5, this.images.healthBar.height / 2.5);
    this.ctx.beginPath();
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(52,34,this.player.health/this.player.healthMax*230,21);
    
  }

  scoreBoard(){
    this.ctx.beginPath();
    this.ctx.fillStyle = "white";
    this.ctx.font = "50px Arial";
    this.ctx.fillText(`Score: ${this.wave.score}`, 20, window.innerHeight - 20);
    this.ctx.beginPath();
    this.ctx.fillStyle = "white";
    this.ctx.font = "50px Arial";
    this.ctx.fillText(`Wave: ${this.wave.level}`, window.innerWidth - 220, window.innerHeight - 20);
  }

  pauseMenu(){
    this.pause = (this.pause) ? false : true;
    if(this.pause){
      this.ctx.beginPath();
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
      this.ctx.beginPath();
      this.ctx.fillStyle = "white";
      this.ctx.font = "50px Arial";
      this.ctx.fillText(`Game Paused`, window.innerWidth/2 - 165, window.innerHeight/2);
      this.ctx.beginPath();
      this.ctx.fillStyle = "white";
      this.ctx.font = "30px Arial";
      this.ctx.fillText(`Press ESC to Continue`, window.innerWidth/2 - 159, window.innerHeight/2 + 50);
    }
  }

  buttonDown(event){
    switch(event.key){
      case 'a': this.movement.left = 1; break;
      case 'w': this.movement.up = 1;  break;
      case 'd': this.movement.right = 1;  break;
      case 's': this.movement.down = 1; break;
      case 'Escape':this.pauseMenu(); break;
      default:break;
    }
  }

  buttonUp(event){
    switch(event.key){
      case 'a': this.movement.left = 0; break;
      case 'w': this.movement.up = 0;  break;
      case 'd': this.movement.right = 0;  break;
      case 's': this.movement.down = 0; break;
      default:break;
    }
  }

  render(){
    return(
      <canvas id='canvas' />
    );
  }
}

export default App;
