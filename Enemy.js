/**
 *  An enemy class for holding drawables.
 */
class Enemy
{
    constructor (enemyID = 0, startX = 500, startY = 180, width = 170, height = 170, dir = 0, serialID = -1)
    {
        // Sprite init
        this.enemyID    = enemyID;
        this._serialID  = serialID;
        this._x         = startX;
        this._y         = startY;
        this.spriteW    = width;
        this.spriteH    = height;
        this._dir       = dir;
        this.fireRate   = 5;        // How long it takes to fire
        this.fireCount  = this.fireRate; // Seconds until fire
        this.destiny    = {X: -1, Y: -1};
        this.speed      = 0;
        this.health     = 99999999; // Hits required to sink

        // Determines fire rate, health & speed
        switch ( enemyID )
        {
            // Squarey (Fires slow tracker)
            case 0:
                this.fireRate = 5;
                this.speed    = 0;
                this.health   = 2;
                break;

            // Circley (Fires long seeker)
            case 1:
                this.fireRate = 10;
                this.speed    = 5;
                this.health   = 1;
                break;

            // Pointy (Fires spread projectiles every 5 degrees)
            case 2:
                this.fireRate = 2;
                this.speed    = 10;
                this.health   = 2;
                break;

            // Starry (Creates particle barrier around self, every 5 degrees)
            case 3:
                this.fireRate = 3;
                this.speed    = 5;
                this.health   = 3;
                break;
            
            // Oop
            default:
                console.log("Error in determining enemy type: " + enemyID);
                break;
        }

        // Constant enumerated types for easy action info access (useful for C#/Unity development too)
        this.actionSet  = { ATTACK: 0, MOVE_RIGHT: 1, MOVE_LEFT: 2, MOVE_UP: 3, MOVE_DOWN: 4, STAND: 5 };
        this.moveSet    = { LEFT: 0,   RIGHT: 1,      UP: 2,        DOWN: 3 };
    }

    /** Retrieves this enemy's current sprite location in the x coordinate plane. */
    get x () { return this._x; }

    /** Retrieves this enemy's current sprite location in the y coordinate plane. */
    get y () { return this._y; }

    /** Retrieves this enemy's current directions in radians. */
    get dir () { return this._dir; }

    get serialID () { return this._serialID; }

    /** Sets this enemy's current sprite location in the x coordinate plane. */
    set x (newX) { this._x = newX; }

    /** Sets this enemy's current sprite location in the y coordinate plane. */
    set y (newY) { this._y = newY; }

    /** Sets this enemy's current directions in radians. */
    set dir (newDir) {this._dir = newDir; }

    set serialID (newID) { this._serialID = newID; }

    /**
     *  Returns true if enemy is still alive.
     */
    damage()
    {
        this.health--;
        return ( this.health > 0 );
    }

    /**
     *  Determines the behavior for each enemy as frames progress.
     *  TODO: Fix collision check.
     *  @param timing - The current timing. Used for determining fire rate.
     *  @param playerX - The x position of the player's center.
     *  @param playerY - The y position of the player's center.
     *  @returns Whether the object should fire.
     */
    updateFrame(timing, canvas, playerX, playerY)
    {
        // Update position
        if ( timing % 7 == 0 )
        {
            switch ( this.enemyID )
            {
                // Squarey (doesn't move)
                case 0:
                    // Faces player
                    this._dir = this.updateDir(playerX, playerY);

                    break;

                // Circley (slowly moves towards player)
                case 1:
                    // Move towards player
                    if ( !this.collideX(this._x, playerX) )
                        this._x = this._x + (( this._x > playerX ) ? -1 * this.speed : this.speed);
                    if ( !this.collideY(this._y, playerY) )
                        this._y = this._y + (( this._y < playerY ) ? -1 * this.speed : this.speed);
                        
                    // Face player
                    this._dir = this.updateDir(playerX, playerY);

                    break;

                // Pointy (slowly moves toward center of screen)
                case 2:
                    // Get center
                    var w = canvas.width  / 2;
                    var h = canvas.height / 2;
                    
                    // Move towards center
                    if ( !this.collideX(this._x, w) )
                        this._x = this._x + (( this._x > w ) ? -1 * this.speed : this.speed);
                    if ( !this.collideY(this._y, h) )
                        this._y = this._y + (( this._y < h ) ? -1 * this.speed : this.speed);

                    // Face center of screen
                    this._dir = this.updateDir(w, h);
                    break;

                // Starey (slowly moves in a random direction, bounces off walls)
                case 3:
                    // Ensures destiny is within bounds
                    while 
                        ( 
                        this.destiny.X <= 5 || 
                        this.destiny.Y <= 5 || 
                        this.destiny.X >= canvas.width  - 5 || 
                        this.destiny.Y >= canvas.height - 5 || 
                        this.collide(this._x, this._y, this.destiny.X, this.destiny.Y, this.speed * 2) 
                        )
                    {
                        this.destiny.X = Math.floor(Math.random() * (canvas.width  - 10)) + 5;
                        this.destiny.Y = Math.floor(Math.random() * (canvas.height - 10)) + 5;
                    }

                    // Move towards destiny
                    this._x = this._x + ((this._x > this.destiny.X) ? -1 * this.speed : this.speed);
                    this._y = this._y + ((this._y < this.destiny.Y) ? -1 * this.speed : this.speed);

                    // Face destiny
                    this.updateDir(this.destiny.X, this.destiny.Y);
                    
                    break;
                
                default:
                    console.log("Error-type enemy detected: " + this.enemyID);
                    break;
            }
        }
        
        // Update fire rate & fire if needed
        if (timing % 60 == 0)
        {
            if ( this.fireCount <= 0 ) 
            {
                this.fireCount = this.fireRate;
                //this.fire();
                return true;
            }
            else this.fireCount--;
        }

        return false;
    }

    /**
     *  Calculates the direction this object should face, in radians.
     *  @param pX - The player's x position.
     *  @param pY - The player's y position.
     */
    updateDir(pX, pY)
    {
        var degrees = 0;

        // Get x & y in terms of this enemy (Hypotenuse vector line)
        // Might need refactoring
        var relativeX = pX - this._x;
        var relativeY = pY - this._y;

        // Y axis vector line
        var y_x = 0;
        var y_y = relativeX;

        // Calculate dot product to get theta (the angle to rotate by)
        degrees = (this.dot(y_x, y_y, relativeX, relativeY) / (this.mag(y_x, y_y) * this.mag(relativeX, relativeY)));

        // When pX < x, it will need to rotate 180 degrees (or negative degrees)
        if ( pX < this._x ) 
        {
            if ( pY == this._y ) degrees = 270;
            else degrees += 180;
        }
        return degrees;
    }

    dot (x1, y1, x2, y2)
    {
        return (x1 * x2) + (y1 * y2);
    }

    mag (x1, y1)
    {
        return Math.sqrt((x1 * x1) + (y1 * y1));
    }

    /**
     *  Checks for collisions between the two objects within the specified number of pixels.
     *  @param x1    - The x position of the first object.
     *  @param y1    - The y position of the first object.
     *  @param x2    - The x position of the second object.
     *  @param y2    - The y position of the second object.
     *  @param alpha - The pixel tolerance level.
     */
    collide (x1, y1, x2, y2, alpha = 3) { return (( x1 + alpha <= x2 - alpha && x1 - alpha <= x2 + alpha ) && ( y1 + alpha <= y2 - alpha && y1 - alpha <= y2 + alpha )); }

    /**
     *  Checks for collisions between the two objects in the X direction within the specified number of pixels.
     *  @param x1    - The x position of the first object.
     *  @param x2    - The x position of the second object.
     *  @param alpha - The pixel tolerance level.
     */
    collideX (x1, x2, alpha = 3) { return ( x1 + alpha <= x2 - alpha && x1 - alpha <= x2 + alpha ); }

    /**
     *  Checks for collisions between the two objects in the Y direction within the specified number of pixels.
     *  @param y1    - The y position of the first object.
     *  @param y2    - The y position of the second object.
     *  @param alpha - The pixel tolerance level.
     */
    collideY (y1, y2, alpha = 3) { return ( y1 + alpha <= y2 - alpha && y1 - alpha <= y2 + alpha ); }

    /**
     *  Generates (a) particle(s) at the current position and returns it/them.
     *  Returns null/empty if no new particle is generated.
     *  @returns An array containing (a) new particle(s) of the proper enemy type in the enemy's current position, or null/empty if no firing occurred.
     */
    fire()
    {
        var offset;
        var particlesArray = new Array();
        switch ( this.enemyID )
        {
            // Squarey (fires slow tracking projectile)
            case 0:
                particlesArray.push(new Particle(this.enemyID, this._x, this._y, this._dir, this._serialID));
                var audio0 = new Audio("p1_fire_sound.mp3");
                audio0.play();
                break;

            // Circley (fires quick tracking projectile)
            case 1:
                particlesArray.push(new Particle(this.enemyID, this._x, this._y, this._dir, this._serialID));
                var audio1 = new Audio("p2_fire_sound.mp3");
                audio1.play();
                break;

            // Pointy (fires line-bound spread)
            case 2:
                offset = {X: 0, Y: 0};

                // TODO: Calculate direction & offset for spread & create particles in for loop

                particlesArray.push(new Particle(this.enemyID, this._x, this._y, this._dir, this._serialID, offset));
                var audio2 = new Audio("p3_fire_sound.mp3");
                audio2.play();
                break;

            // Starey (fires projectiles that follow this enemy along the specified dir)
            case 3:
                offset = {X: 0, Y: 1};

                // TODO: Calculate direction & offset, avoid adding more particles if 

                particlesArray.push(new Particle(this.enemyID, this._x, this._y, this._dir, this._serialID, offset));
                var audio3 = new Audio("p3_fire_sound.mp3");
                audio3.play();
                break;

            // Oop
            default:
                console.log("Error-type projectile found: " + this.enemyID);
                break;
        }
        
        return particlesArray;
    }

    /**
     *  Draws this player's sprite to the given canvas context.
     *  TODO: Add rotational logic.
     *  @param context - The canvas context to which this player's sprite should be drawn.
     */
    draw (context)
    {
        // Draws different enemy shapes based on id
        switch ( this.enemyID )
        {
            // Squarey
            case 0:
                // Outer square
                context.beginPath();
                context.strokeStyle = 'red';
                context.lineWidth = '3';
                context.rect(this._x, this._y, this.spriteW, this.spriteH);
                context.stroke();
                context.closePath();

                // Cross line
                context.beginPath();
                context.strokeStyle = 'red';
                context.lineWidth = '3';
                context.moveTo(this._x, this._y);
                context.lineTo(this._x + Math.floor(this.spriteW), this._y + Math.floor(this.spriteH));
                context.stroke();
                context.closePath();

                break;

            // Circley
            case 1:
                // Outer circle
                context.beginPath();
                context.strokeStyle = 'green';
                context.lineWidth = '3';
                context.arc(this._x, this._y, this.spriteW, 0, 2 * Math.PI);
                context.stroke();
                context.closePath();

                // Inner Dot
                context.beginPath();
                context.fillStyle = 'red';
                context.lineWidth = '3';
                context.arc(this._x, this._y, 5, 0, 2 * Math.PI);
                context.fill();
                context.closePath();

                break;

            // Pointy
            case 2:
                
                break;

            // Starey
            case 3:
                
                break;
            
            default:
                context.beginPath();
                context.fillStyle = 'red';
                context.fillRect(this._x, this._y, this.spriteW, this.spriteH);
                context.fill();
                context.closePath();
                //context.drawImage( this.img, this.sX, this.sY, this.spriteW, this.spriteH, this.x, this.y, this.spriteW, this.spriteH);
                break;
        }
    }
}