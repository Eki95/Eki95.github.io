var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var CANVAS_WIDTH = canvas.width;
var CANVAS_HEIGHT = canvas.height;
var PLAYER_BLOCK_WIDTH = canvas.width / 7;
var PLAYER_BLOCK_HEIGHT = canvas.height / 40;
var BLOCK_WIDTH = canvas.width / 8;
var BLOCK_HEIGHT = canvas.height / 15;
var BALL_RADIUS = 10;
var BLOCK_COLUMN_COUNT = 7;
var BLOCK_ROW_COUNT = 4;
var historyX;
var levelCount = 1;
var hitPaddle = 0;
var pause = false;
var score = 0;
var dx = 0;

while(dx < 1 && dx > -1){
   dx = Math.random() * (-8) + 4;
}
var dy = Math.random() * 5;

dy = 3;

console.log(dx,dy);

var blocks = [];
for(c=0; c<BLOCK_ROW_COUNT; c++) {
    blocks[c] = [];
    for(r=0; r<BLOCK_COLUMN_COUNT; r++) {
        blocks[c][r] = {x: 0, y: 0, visible: 1};
    }
}
var ball = {
  x: CANVAS_WIDTH / 2 + 1,
  y: CANVAS_HEIGHT - PLAYER_BLOCK_HEIGHT*2 + 1,
  r: BALL_RADIUS
}
var playerBlock = {
  x: CANVAS_WIDTH / 2 - PLAYER_BLOCK_WIDTH / 2,
  y: CANVAS_HEIGHT - PLAYER_BLOCK_HEIGHT
}



game();

// Function that runs the game itself. This function also contains all event
// listerners for the onscreen buttons, arrow keys and pause key.
function game(){

  var message = {
      messageType: "SETTING",
      options: {
          "width": CANVAS_WIDTH, //Integer
          "height": CANVAS_HEIGHT //Integer
      }
  };
  window.parent.postMessage(message, "*");
  initialize();

  document.getElementById("submitScore").addEventListener("click", function(){
    var message = {
      messageType: "SCORE",
      score: getScore()
    };
    window.parent.postMessage(message, "*");
    alert("Score submitted!");

  });
  document.getElementById("saveGame").addEventListener("click", function(){
    var message =  {
      messageType: "SAVE",
      gameState: {
        bally: ball.y,
        ballx: ball.x,
        playerBlockx: playerBlock.x,
        playerBlocky: playerBlock.y,
        level: levelCount,
        blocks: blocks,
        score: getScore() // Float
        }
    };
    window.parent.postMessage(message, "*");
    console.log("savegame pressed", message)
  });
  document.getElementById("loadGame").addEventListener("click", function(){
    console.log("loading")
    var message = {
      messageType: "LOAD_REQUEST"
    };
  });

  window.addEventListener("message", function(e) {
      if(e.data.messageType === "LOAD") {
          loadGame(e.data);
      } else if (e.data.messageType === "ERROR") {
          alert(e.data.info);
      }
  },false);


  window.addEventListener("keydown", function(event){
    if(event.defaultPrevented){
      return;
    }
    switch (event.key) {
      case "spacebar":
        alert("spacebar pressed");
        pause = true;
      default:
        return;
    }

  });
  window.addEventListener("keydown", function(event) {
      if(event.defaultPrevented){
        return;
      }
      switch (event.key) {
        case "ArrowRight":
          console.log("arrowright pressed");
          historyX = playerBlock.x;
          if(playerBlock.x + PLAYER_BLOCK_WIDTH < CANVAS_WIDTH) {
            playerBlock.x += 20;
          }
          break;
        case "ArrowLeft":
          console.log("arrowleft pressed")
          historyX = playerBlock.x;
          if(playerBlock.x > 0){
            playerBlock.x -= 20;
          }
          break;
        case "p":
          console.log("p pressed");
          if(pause == false){
            pause = true
          }
          else{
            pause = false;
          }
          break;


        default:
          return;
      }
      event.preventDefault();
  }, true);
}

// Function that loads game data
function loadGame(data){
  ball.y = data.gameState.bally,
  ball.x = data.gameState.ballx,
  playerBlock.x = data.gameState.playerBlockx,
  playerBlock.y = data.gameState.playerBlocky,
  levelCount = data.gameState.level,
  blocks = data.gameState.blocks,
  score = data.gameState.score
}

function draw(){
    if(pause == false) {

      //clearing old frame
      ctx.clearRect(ball.x - BALL_RADIUS - 2, ball.y - BALL_RADIUS - 2, BALL_RADIUS*2+4, BALL_RADIUS*2+4);
      ctx.clearRect(historyX - 2, playerBlock.y - 1, PLAYER_BLOCK_WIDTH + 4 , PLAYER_BLOCK_HEIGHT + 1)

      //bouncing from the walls
      if(ball.x < 0 || ball.x > CANVAS_WIDTH){
        dx = -dx;
      }
      if(ball.y< 0 + BALL_RADIUS){
        dy = -dy;
      }

      //game over
      if(ball.y > CANVAS_HEIGHT){
        alert('Game over! Press enter to continue or submit score.');
        score = 0;
        ball.y = -dy;
        location.reload();
      }

      hitPaddle++;

      //hitting the playerblock
      if(ball.x + BALL_RADIUS>playerBlock.x && ball.x - BALL_RADIUS<playerBlock.x + PLAYER_BLOCK_WIDTH &&
          ball.y + BALL_RADIUS > CANVAS_HEIGHT - PLAYER_BLOCK_HEIGHT && hitPaddle > 10){
          hitPaddle = 0;
          if(ball.x < playerBlock.x + (1/3) * PLAYER_BLOCK_WIDTH){
            if(ball.x < playerBlock.x + (1/10) * PLAYER_BLOCK_WIDTH){
              dy = -dy;
              if(dx > 0 && dx < 1){
                dx = dx*5;
              }
              if(dx > 0){
                dx = dx*0.7;
              }
            }
            else{
              dy = -dy;
              if(dx > 1 && dx < 5){
                dx = dx*1.4;
              }
              if(dx < 0){
                dx = dx*0.7;
              }
            }

          }
          else if(ball.x > playerBlock.x + (2/3) * PLAYER_BLOCK_WIDTH){
            if(ball.x > playerBlock.x + (9/10) * PLAYER_BLOCK_WIDTH){
              dy = -dy;
              if(dx > -1 && dx < 0){
                dx = dx*5;
              }
              if(dx > 0){
                dx = dx*0.7;
              }
            }
            else{
              dy = -dy;
              if(dx < 0 && dx > -5) {
                dx = dx*1.4;
              }
              if(dx > 0){
                dx = dx*0.7;
              }
            }
          }
          else{
            dy = -dy;
          }
      }


      ball.x -= dx;
      ball.y -= dy;

      collisionDetection();

      drawBlocks();

      ctx.beginPath();
      ctx.rect(playerBlock.x, playerBlock.y, PLAYER_BLOCK_WIDTH, PLAYER_BLOCK_HEIGHT);
      ctx.arc(ball.x, ball.y,
         ball.r, 0, Math.PI*2);
      ctx.fillStyle = 'blue';
      ctx.fill();
      ctx.closePath();
    }
}

// Function that returns the current score
function getScore(){
  return parseFloat(score);
}

// Function that initilizes the blocks on the gameboard and begins the game
function initialize(){
  drawBlocks();
  setInterval(draw, 8);
}

// Function that handles collisions between the ball and the blocks
function collisionDetection(){
  for(i=0; i<BLOCK_ROW_COUNT; i++){
    for(j=0; j<BLOCK_COLUMN_COUNT; j++){
      var block = blocks[i][j]
      if(ball.x + BALL_RADIUS>block.x && ball.x - BALL_RADIUS<block.x + BLOCK_WIDTH &&
          ball.y + BALL_RADIUS>block.y && ball.y - BALL_RADIUS<block.y + BLOCK_HEIGHT && block.visible == 1){
            block.visible = 0;
            //hitting either side of a blocks:
            if(ball.y > block.y && ball.y < block.y + BLOCK_HEIGHT ) {
              dx = -dx;
            }
            //hitting the bottom or top of a block:
            else{
              dy = -dy;
            }
            score++;
            document.getElementById("score").innerHTML = "Score: " + score;
            break;

        }
    }
  }
}

// Function that handles drawing the blocks
function drawBlocks() {

  var x = 15;
  var y = 10;
  var visibleBlockCount = 0;

  ctx.beginPath();
  for (i=0; i<BLOCK_ROW_COUNT; i++){
    for(j=0; j<BLOCK_COLUMN_COUNT; j++){
      var block = blocks[i][j];
      if(block.visible == 1){
        ctx.rect(x, y, BLOCK_WIDTH, BLOCK_HEIGHT)
        block.x = x;
        block.y = y;
        ctx.fillStyle = 'skyblue';
        ctx.fill();
        visibleBlockCount++;
      }
      else{
        ctx.clearRect(block.x, block.y, BLOCK_WIDTH, BLOCK_HEIGHT);
      }
      x += BLOCK_WIDTH + 10;
    }
    x = 15;
    y += BLOCK_HEIGHT + 15;
  }

  if (visibleBlockCount == 0) {
    alert("Level completed, press enter to continute!")
    levelCount++;
    document.getElementById("level").innerHTML = "Level: " + levelCount;
    for (i=0; i<BLOCK_ROW_COUNT; i++){
      for(j=0; j<BLOCK_COLUMN_COUNT; j++){
        blocks[i][j].visible = 1;
      }
    }
  }

  ctx.closePath();
}
