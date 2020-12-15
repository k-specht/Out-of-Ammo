// Globals
var canvas, ctx, timing, level, score, lives, keys, player, enemy, particles, gameover;
var lastCollision;
var audio, playAudio, hitAudio, damageAudio;

var background = new Image();
background.src = 'background.png';

var sprite     = new Image();
sprite.src     = 'sprite.png';

/** Entry point into the Dodge game. */
function main()
{
    // Initialize game variables
    canvas      = document.getElementById('canvas1');
    ctx         = canvas.getContext('2d');
    timing      = 0;

    player      = new Player( 'sprite.png', canvas.width / 2, canvas.height / 2, 7, 7, Math.floor(sprite.width / 4), Math.floor(sprite.height / 2), 40, 40 );
    particles   = new Array();

    keys        = { UP: false, LEFT: false, DOWN: false, RIGHT: false };
    gameover    = false;
    lives       = 3;
    level       = 1;
    score       = 0;

    audio       = new Audio('bgm.mp3');
    hitAudio    = new Audio('hit.mp3');
    damageAudio = new Audio('damage.mp3');

    audio.loop  = true;
    playAudio   = false;

    // Add enemy particles
    particles.push( { x: (Math.random() * 100 > 50) ? 5 : canvas.width - 5, y: Math.floor(Math.random() * canvas.height), color: BRIGHT_COLORS[0], width: 10 } );
    particles.push( { x: (Math.random() * 100 > 50) ? 5 : canvas.width - 5, y: Math.floor(Math.random() * canvas.height), color: BRIGHT_COLORS[1], width: 13 } );
    particles.push( { x: (Math.random() * 100 > 50) ? 5 : canvas.width - 5, y: Math.floor(Math.random() * canvas.height), color: BRIGHT_COLORS[2], width: 7  } );

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

    window.onclick = () => { playAudio = true; }

    // Start game render loop
    update();
}

/** Updates the game variables for each frame and chains the rendering call. */
function update()
{
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

    if ( timing % (60 * 10) == 0 && level < 10 ) 
        level++;

    // Add a new enemy particle at the edge of the screen every 5 seconds
    if ( timing % (60 / level * 5 ) == 0 )
    {
        // Randomly pick one of the particle types
        var pos = Math.random() * 100;
        var w   = 0;
        
        // Set the color and width based on which particle type it is
        if (pos < ((score < 25) ? 33 : 25) )
        {
            pos = 0;
            w   = 10;
        } 
        else if (pos < ((score < 25) ? 66 : 50) )
        {
            pos = 1;
            w   = 13;
        } 
        else if (pos < ((score < 25) ? 100 : 75) )
        {
            pos = 2;
            w   = 7;
        }
        else 
        {
            pos = 3;
            w   = 30;
        }

        // Calculate edge zone
        var edgeX = Math.random() * 100 > 50;
        var right = Math.random() * 100 > 50;

        // Ternary operator heaven (add the particle to the edge of the screen)
        particles.push( 
            { 
                x: (edgeX)  ? Math.floor(Math.random() * canvas.width ) : ((right) ? canvas.width  - 5 : 5), 
                y: (!edgeX) ? Math.floor(Math.random() * canvas.height) : ((right) ? canvas.height - 5 : 5), 
                color: BRIGHT_COLORS[pos], 
                width: w
            }
        );
    }

    if ( timing % 5 == 0 )
    {
        // Check for collisions with particles, if so remove them both
        for (var i = 0; i < particles.length; i++)
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

        // Update player position based on input
        if ( keys.UP )
        {
            player.move(player.moveSet.UP, 0, 10);
        }
        if ( keys.DOWN )
        {
            player.move(player.moveSet.DOWN, canvas.height - 40, 10);
        }
        if ( keys.LEFT )
        {
            player.move(player.moveSet.LEFT, 0, 10);
        }
        if ( keys.RIGHT )
        {
            player.move(player.moveSet.RIGHT, canvas.width - 40, 10);
        }
        // If I need to set default behavior later idk
        /*if ( keys.UP == false && keys.RIGHT == false && keys.DOWN == false && keys.LEFT == false )
        {
            player.updateFrame(player.actionSet.STAND);
        }*/
        
        // Update particle positions (movement depends on color)
        for (var j = 0; j < particles.length; j++)
        {
            // Calculate tracking speed based on the color (a fun addition might be making them track previous player positions to add time lag)
            var speed = 0;
            if      ( particles[j].color == 'Aqua'    ) speed = 3;
            else if ( particles[j].color == 'Lime'    ) speed = 2;
            else if ( particles[j].color == 'Crimson' ) speed = 4;
            else speed = 10;

            // Separate movement speed into x/y
            var xDiff = speed / 2;
            var yDiff = speed - xDiff;

            // Adjusts movement direction towards player
            if ( (player.x + 20) < particles[j].x ) 
                xDiff *= -1;
            if ( (player.y + 20) < particles[j].y ) 
                yDiff *= -1;

            // Prevents vibrating objects by locking movement
            if ( (player.x + 20) >= particles[j].x - xDiff && (player.x + 20) <= particles[j].x + xDiff )
                xDiff = 0;
            if ( (player.y + 20) >= particles[j].y - yDiff && (player.y + 20) <= particles[j].y + yDiff )
                yDiff = 0;

            particles[j].x += xDiff;
            particles[j].y += yDiff;
        }
        
    }
    if ( timing % 4 == 0 ) player.updateFrame(player.actionSet.STAND);

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

    // Particles
    for (var i = 0; i < particles.length; i++)
    {
        ctx.beginPath();

        ctx.fillStyle = particles[i].color;
        //ctx.rect(particles[i].x, particles[i].y, 10, 10);
        ctx.arc(particles[i].x, particles[i].y, Math.floor(particles[i].width / 2), 0, 2 * Math.PI);

        ctx.fill();

        ctx.closePath();
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