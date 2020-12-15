// Globals
var canvas, ctx, timing, level, score, lives, keys, player, enemy, enemies, particles, gameover, startGame;
var lastCollision, spawned, first, enemySize;
var audio, playAudio, hitAudio, damageAudio;

//var background = new Image();
//background.src = 'background.png';

var sprite     = new Image();
sprite.src     = 'SpriteShip.png';

/** Entry point into the Dodge game. */
function main()
{
    // Initialize game variables
    canvas      = document.getElementById('canvas1');
    ctx         = canvas.getContext('2d');
    timing      = 0;

    player      = new Player
                        ( 
                            'SpriteShip.png', 
                            'SpriteShip_Still.png', 
                            'SpriteShip_Diagonal.png', 
                            'SpriteShip_Diagonal_Still.png', 
                            canvas.width / 2, 
                            canvas.height / 2, 
                            2, 
                            Math.floor(sprite.width / 2), 
                            Math.floor(sprite.height / 4), 
                            80, 
                            80 
                        );
    particles   = new Array();
    enemies     = new Array();

    keys        = { UP: false, LEFT: false, DOWN: false, RIGHT: false };
    gameover    = false;
    startGame   = false;
    lives       = 3;
    level       = 1;
    score       = 0;
    first       = true;

    audio       = new Audio('bgm.mp3');
    hitAudio    = new Audio('hit.mp3');
    damageAudio = new Audio('damage.mp3');

    audio.loop  = true;
    playAudio   = false;

    spawned     = {Squarey: 0, Circley: 0, Pointy: 0, Starey: 0};

    enemySize  = 40;

    // Register key listeners
    window.onkeydown = (event) => 
    {
        switch(event.key)
        {
            case 'w':
                keys.UP    = true;
                break;

            case 'a':
                keys.LEFT  = true;
                break;

            case 's':
                keys.DOWN  = true;
                break;

            case 'd':
                keys.RIGHT = true;
                break;
            
            default: 
                // Ignore other keys
                //console.log(event.key);
                break;
        }
    }

    window.onkeyup = (event) => 
    {
        switch(event.key)
        {
            case 'w':
                keys.UP    = false;
                break;

            case 'a':
                keys.LEFT  = false;
                break;

            case 's':
                keys.DOWN  = false;
                break;

            case 'd':
                keys.RIGHT = false;
                break;
            
            default: 
                // Ignore other keys
                break;
        }
    }

    window.onclick = () => { playAudio = true; startGame = true; first = false;}

    // Start game render loop
    update();
}

/** Updates the game variables for each frame and chains the rendering call. */
function update()
{
    if ( !startGame && first )
    {
        // Draw start icon on top
        draw();
        ctx.beginPath();
        ctx.fillStyle = 'blue';
        ctx.font = '24px Arial';
        ctx.fillText("Start (Level 1: No Ammo, But...)", canvas.width / 2 - 200, canvas.height / 2);
        ctx.fill();
        ctx.closePath();
        
        requestAnimationFrame(update);
        return;
    }
    else if ( !startGame )
    {
        // Pause
        requestAnimationFrame(update);
        return;
    }

    if ( gameover ) 
    {
        playAudio = false;
        audio.pause();

        // Draw game over on top
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.font = '24px Arial';
        ctx.fillText("Game over! Your greatest score: " + score, (canvas.width / 2) - 200, canvas.height / 2);
        ctx.fill();
        ctx.closePath();
        
        return; 
    }
    timing++;   

    if ( playAudio ) audio.play();
    else audio.pause();

    // Handle enemy spawns based on level or handle pausing
    var tmpX, tmpY;
    switch (level)
    {
        // Level 1: 2 Squareys
        case 1:
            if ( timing % (60 * 5) == 0 && spawned.Squarey < 2 )
            {
                spawned.Squarey++;

                // Pick a random location on the screen
                tmpX = Math.floor(Math.random() * canvas.width  - 20) + 10;
                tmpY = Math.floor(Math.random() * canvas.height - 20) + 10;

                enemies.push(new Enemy(0, tmpX, tmpY, enemySize, enemySize, 0));
                if ( playAudio )
                {
                    var aud = new Audio('sTeleport.mp3');
                    aud.play();
                }
            }

            // If level has no more enemies (spawned or not) or particles, complete it
            else if ( enemies.length == 0 && spawned.Squarey == 2 && particles.length == 0 )
            {
                // Draw start icon on top
                ctx.beginPath();
                ctx.fillStyle = 'blue';
                ctx.font = '24px Arial';
                ctx.fillText("Level 2: Be There or Be These", canvas.width / 2, canvas.height / 2);
                ctx.fill();
                ctx.closePath();
                startGame = false;
            }
            break;

        // Level 2: 5 Squareys (max 3)
        case 2:
            if ( timing % (60 * 4) == 0 && spawned.Squarey < 5 && enemies.length < 3 )
            {
                spawned.Squarey++;

                // Pick a random location on the screen
                tmpX = Math.floor(Math.random() * canvas.width  - 20) + 10;
                tmpY = Math.floor(Math.random() * canvas.height - 20) + 10;


                enemies.push(new Enemy(0, tmpX, tmpY, enemySize, enemySize, 0));
                if ( playAudio )
                {
                    var audi = new Audio('sTeleport.mp3');
                    audi.play();
                }
            }
            break;

        // Level 3: 2 Circleys
        case 3:
            if ( timing % (60 * 4) == 0 && spawned.Circley < 2 && enemies.length < 3 )
            {
                spawned.Circley++;

                // Pick a random location on the screen
                tmpX = Math.floor(Math.random() * canvas.width  - 20) + 10;
                tmpY = Math.floor(Math.random() * canvas.height - 20) + 10;


                enemies.push(new Enemy(1, tmpX, tmpY, enemySize, enemySize, 0));
                if ( playAudio )
                {
                    var audioo = new Audio('sTeleport.mp3');
                    audioo.play();
                }
            }
            break;

        // Level 4: 3 Squareys, 1 Circley
        case 4:

            break;

        // Level 5: 2 Pointys
        case 5:

            break;

        // Level 6: 2 Squareys, 1 Circley, 1 Pointy
        case 6:

            break;

        // Level 7: 2 Stareys
        case 7:

            break;

        // Level 8: 2 Squareys, 1 Pointy, 1 Starey
        case 8:

            break;

        // Level 9: 6 Circleys, add by 2's when enemy count reaches 0
        case 9:

            break;

        // Level 10: 6 Pointys, 3 max at a time
        case 10:

            break;
        
        // Level 11: 
        case 11:

            break;
        

        default: // Over 11
            console.log("Wow. Beat the game, huh? Nice.");
            break;
    }

    // Set player movement & collisions to check every 6 frames
    if ( timing % 5 == 0 )
    {
        // Update player position based on input (ignores inputs of 3 keys or more)
        var cnt = 0;
        if ( keys.DOWN  ) cnt++;
        if ( keys.RIGHT ) cnt++;
        if ( keys.LEFT  ) cnt++;
        if ( keys.UP    ) cnt++;

        if ( cnt < 3 )
        {
            if ( keys.DOWN && keys.RIGHT )
            {
                player.move(player.moveSet.DOWN_RIGHT, canvas.width - 80, canvas.height - 80);
                player.updateFrame(player.actionSet.MOVE_DOWN_RIGHT);
            }
            else if ( keys.UP && keys.LEFT )
            {
                player.move(player.moveSet.UP_LEFT, 0, 0);
                player.updateFrame(player.actionSet.MOVE_UP_LEFT);
            }
            else if ( keys.DOWN && keys.LEFT )
            {
                player.move(player.moveSet.DOWN_LEFT, 0, canvas.height - 80);
                player.updateFrame(player.actionSet.MOVE_DOWN_LEFT);
            }
            else if ( keys.UP && keys.RIGHT )
            {
                player.move(player.moveSet.UP_RIGHT, canvas.width - 80, 00);
                player.updateFrame(player.actionSet.MOVE_UP_RIGHT);
            }
            else if ( keys.UP )
            {
                player.move(player.moveSet.UP, 0, 0);
                player.updateFrame(player.actionSet.MOVE_UP);
            }
            else if ( keys.DOWN )
            {
                player.move(player.moveSet.DOWN, 0, canvas.height - 80);
                player.updateFrame(player.actionSet.MOVE_DOWN);
            }
            else if ( keys.LEFT )
            {
                player.move(player.moveSet.LEFT, 0);
                player.updateFrame(player.actionSet.MOVE_LEFT);
            }
            else if ( keys.RIGHT )
            {
                player.move(player.moveSet.RIGHT, canvas.width - 80);
                player.updateFrame(player.actionSet.MOVE_RIGHT);
            }
            else 
            {
                player.updateFrame(player.actionSet.STAND);
            }
        }
        else player.updateFrame(player.actionSet.STAND);

        // Handle enemy movement
        for ( var j = 0; j < enemies.length; j++ )
        {
            if ( enemies[j].updateFrame(timing, canvas, player.x, player.y) )
            {
                var parts = enemies[j].fire();
                if ( parts != null)
                {
                    for (var k = 0; k < parts.length; k++)
                    {
                        particles.push(parts[k]);
                        // Add particle firing audio here
                    }
                }
            }
        }

        // Handle particle movement
        for ( var k = 0; k < particles.length; k++)
        {
            particles[k].updateFrame(timing, canvas, player.x, player.y);
        }
        
        // Check for collisions with particles & enemies, if so damage enemy and remove particle
        for ( var i = 0; i < particles.length; i++ )
        {
            // Check if particle i collided with any of the other particles
            if ( collision(particles[i].x, particles[i].y, particles[i].width, i) )
            {
                score += Math.round(level / 2);

                // Sound effect - The file is already loaded, the new object just lets you play it in parallel
                if ( playAudio )
                {
                    var audioObj = new Audio('hit.mp3'); 
                    audioObj.play();
                }                

                // Check the position of the collisions to make sure the correct element is removed
                if ( lastCollision > i )
                {
                    particles.splice(i, 1);
                    particles.splice(lastCollision - 1, 1);
                }
                else 
                {
                    particles.splice(lastCollision, 1);
                    particles.splice(i - 1, 1);
                }
                
                // Change the index so all particles are checked
                i -= 2;
                if ( i < 0 ) i = 0;
            }
        }

        // Check for collisions with character, if so reduce health
        if ( collision(player.x, player.y, 40) )
        {
            lives--;
            particles.splice(lastCollision, 1);

            // Sound effect
            if ( playAudio )
            {
                var damaAud = new Audio('damage.mp3');
                damaAud.play();
            }

            if ( lives < 0 )
            {
                gameover = true;
                requestAnimationFrame(update);
                return;
            }
        }
    }

    // Draw the game variables and continue loop
    if ( !gameover )
    {
        // Draw game stuff
        draw();

        requestAnimationFrame(update);
    }
}

/** Draws the game variables to the screen. */
function draw()
{
    // Background
    ctx.beginPath();
    ctx.fillStyle = '#f0f0f0';
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    ctx.closePath();
    //ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Player
    player.draw(ctx);

    // Enemies
    for (var j = 0; j < enemies.length; j++)
    {
        enemies[j].draw(ctx);
    }

    // Particles
    for (var i = 0; i < particles.length; i++)
    {
        particles[i].draw(ctx);
        /*ctx.beginPath();

        ctx.fillStyle = particles[i].color;
        //ctx.rect(particles[i].x, particles[i].y, 10, 10);
        ctx.arc(particles[i].x, particles[i].y, Math.floor(particles[i].width / 2), 0, 2 * Math.PI);

        ctx.fill();

        ctx.closePath();*/
    }

    // UI
    // Draw score
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.font      = '18px Arial';
    ctx.fillText("Score: " + score, 5, 25);
    ctx.fill();
    ctx.closePath();

    // Draw level
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.font      = '18px Arial';
    ctx.fillText("Level: " + level, canvas.width - 75, 25);
    ctx.fill();
    ctx.closePath();

    // Draw lives
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.font      = '18px Arial';
    ctx.fillText("Lives remaining: " + lives, 5, canvas.height - 5);
    ctx.fill();
    ctx.closePath();
}

/**
 *  Checks for collisions between the given object and the particles.
 *  @param x_pos - The x position of the object to check.
 *  @param y_pos - The y position of the object to check.
 *  @param width - The width of the object to check.
 */
function collision(x_pos, y_pos, width, ignoreNum = -1, isImg = false)
{
    for (var i = 0; i < particles.length; i++)
    {
        if 
        ( 
            ((x_pos + width / 2) > (particles[i].x - particles[i].width / 2) && (x_pos + width / 2) < (particles[i].x + particles[i].width / 2)) && // x dir
            ((y_pos + width / 2) > (particles[i].y - particles[i].width / 2) && (y_pos + width / 2) < (particles[i].y + particles[i].width / 2)) && // y dir
            (i != ignoreNum)
        )
        {
            //console.log("Collided: " + i + ", X position: " + x_pos + " collided with " + particles[i].x + ", and Y position " + y_pos + " collided with " + particles[i].y + ".");
            lastCollision = i;
            return true;
        }
    }
    return false;
}