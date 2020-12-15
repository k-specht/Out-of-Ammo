/**
 *  A particle class for holding drawable projectiles.
 */
class Particle
{
    constructor (particleID = 0, startX = 500, startY = 180, dir = 0, enemySRC = null, enemyOffSet = {X: 0, Y: 0}, image = null)
    {
        // Sprite init
        this.particleID  = particleID;
        this._x          = startX;
        this._y          = startY;
        this._dir        = dir;
        this.enemySRC    = enemySRC;
        this.enemyOffSet = enemyOffSet;
        this.speed       = 0;

        this.img         = image;

        switch ( this.particleID )
        {
            case 0:
                this.img = new Image('pulse.png');
                this.speed = 8;
                break;

            case 1:
                this.img = new Image('seeker.png');
                this.speed = 13;
                break;

            case 2:
                this.img = new Image('spreadshot.png');
                this.speed = 8;
                break;

            case 3:
                this.img = new Image('barrier.png');
                this.speed = 0;
                break;

            default:
                this.img = null;
                break;
        }
    }

    /** Retrieves this particle's current sprite location in the x coordinate plane. */
    get x () { return this._x; }

    /** Retrieves this particle's current sprite location in the y coordinate plane. */
    get y () { return this._y; }

    /** Retrieves this particle's currently faced direction in radians. */
    get dir () { return this._dir; }

    /** Sets this particle's current sprite location in the x coordinate plane. */
    set x (newX) { this._x = newX; }

    /** Sets this particle's current sprite location in the y coordinate plane. */
    set y (newY) { this._y = newY; }

    /** Sets this particle's currently faced direction in radians. */
    set dir (newDir) { this._dir = newDir; }

    /**
     *  Moves the particle along its path (towards the player, straight or tracking an enemy).
     *  @param canvas - The 2D HTML5 canvas this particle is located spatially.
     */
    updateFrame ( timing, canvas, playerX, playerY )
    {
        switch ( this.particleID )
        {
            // Squarey projectile; tracks player loosely
            case 0:
                // Move towards player
                if ( !this.collideX(this._x, playerX) )
                    this._x = this._x + (( this._x > playerX ) ? -1 * this.speed : this.speed);
                if ( !this.collideY(this._y, playerY) )
                    this._y = this._y + (( this._y < playerY ) ? -1 * this.speed : this.speed);
                    
                // Face player
                this._dir = this.updateDir(playerX, playerY);

                break;

            // Circley projectile; tracks player quickly
            case 1:
                // Move towards player
                if ( this._dir == null ) console.log("???");

                if ( !this.collideX(this._x, playerX) )
                    this._x = this._x + (( this._x > playerX ) ? -1 * this.speed : this.speed);
                if ( !this.collideY(this._y, playerY) )
                    this._y = this._y + (( this._y < playerY ) ? -1 * this.speed : this.speed);
                    
                // Face player
                this._dir = this.updateDir(playerX, playerY);

                break;

            // Pointy projectile; moves in dir until it reaches a wall
            case 2:

                break;

            // Starry projectile, clings to Starry enemy
            case 3:

                break;

            // Oop
            default:
                console.log("Error-type particle movement: " + this.particleID);
                break;
        }
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
     *  Draws this particle to the given canvas context.
     *  TODO: Load from file.
     *  TODO: Add rotational logic.
     *  @param context - The canvas context to which this player's sprite should be drawn.
     */
    draw (context)
    {
        if ( this.img == null ) console.log("AAAAAAAAAAAAAAAAAAAA");
        context.drawImage( this.img, this.x, this.y, 20, 20);
        /*// Draws different particle shapes based on ID
        switch ( this.particleID )
        {
            case 0:

                break;

            
            default:
                context.beginPath();
                context.fillStyle = 'blue';
                context.fillRect(this._x, this._y, 5, 5);
                context.fill();
                context.closePath();
                //context.drawImage( this.img, this.sX, this.sY, this.spriteW, this.spriteH, this.x, this.y, this.spriteW, this.spriteH);
                break;
        }*/
    }
}