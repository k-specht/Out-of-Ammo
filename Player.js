/**
 *  A player class for holding sprite variables.
 */
class Player 
{
    constructor 
        (
            imgName     = 'sprite.png', 
            imgName2    = 'sprite.png', 
            imgName3    = 'sprite.png', 
            imgName4    = 'sprite.png', 
            startX      = 500, 
            startY      = 180, 
            imgFrames   = 4, 
            //jFrames   = 5, 
            swidth      = 170, 
            sheight     = 170, 
            renderSizeX = -1,
            renderSizeY = -1
        )
    {
        // Sprite init
        this.img1         = new Image();
        this.img1.src      = imgName;
        this.img2         = new Image();
        this.img2.src     = imgName2;
        this.img3         = new Image();
        this.img3.src     = imgName3;
        this.img4         = new Image();
        this.img4.src     = imgName4;
        this.currentImg   = this.img1;

        this._x           = startX;
        this._y           = startY;
        this.sX           = 0;
        this.sY           = 0;

        this.frame        = 0;
        this.frames       = imgFrames;

        //this.sitFrames    = 1;
        //this.jumpFrames   = jFrames;
        //this.jumpAnimLvl  = -1;
        //this.jumpMax      = jFrames;

        this.spriteW      = swidth;
        this.spriteH      = sheight;

        this.renderX      = renderSizeX;
        this.renderY      = renderSizeY;

        // Constant enumerated types for easy action info access (useful for C#/Unity development too)
        this.actionSet  = { STAND: 0, MOVE_RIGHT: 1, MOVE_LEFT: 2, MOVE_DOWN: 3, MOVE_UP: 4,    MOVE_DOWN_RIGHT: 5, MOVE_UP_LEFT: 6, MOVE_DOWN_LEFT: 7, MOVE_UP_RIGHT: 8 };
        this.moveSet    = { LEFT: 0, RIGHT: 1,      UP: 2,        DOWN: 3,      DOWN_RIGHT: 4, UP_LEFT: 5,         DOWN_LEFT: 6,    UP_RIGHT: 7 };
        //this.animations = { JUMP: 0, PHASE: 1 };
    }

    /** Retrieves this player's current sprite location in the x coordinate plane. */
    get x () { return this._x; }

    /** Retrieves this player's current sprite location in the y coordinate plane. */
    get y () { return this._y; }

    /** Sets this player's current sprite location in the x coordinate plane. */
    set x (newX) { this._x = newX; }

    /** Sets this player's current sprite location in the y coordinate plane. */
    set y (newY) { this._y = newY; }

    /**
     *  Begins the requested animation.
     * @param which - Which animation to begin. (Use Player.animations to select)
     */
    /*startAnimation(which)
    {
        if ( which == 0 )
        {
            this.jumpAnimLvl = 0;
        }
        else if ( which == 1 ) // possible additional animation in the future
        {
            //this.attAnimLvl = 0;
        }
        else console.log("ERR: Invalid animation request, please select an animation from Player.animations.");
    }*/

    /**
     *  Returns the current jump animation status.
     *  @return The current animation depth, or -1 if any pending animations have completed.
     */
    /*jumpAnimationStatus ()
    {
        return ( this.jumpAnimLvl > 0 ) ? this.jumpAnimLvl : -1;
    }*/

    /**
     *  Moves the player according to the specified movement direction.
     *  @param direction - The movement direction as specified in Player.moveSet. If left/right only, left = 0 and right = 1.
     *  @param max       - The maximum allowed distance this character can move.
     *  @param pixels    - The amount of pixels to move the character. Defaults to 15.
     */
    move (direction, maxX, maxY = 0, pixels = 15)
    {
        switch (direction)
        {
            case 0: // Left
                if ( this.x > maxX )
                    this.x -= pixels;
            break;

            case 1: // Right
                if ( this.x < maxX )
                    this.x += pixels;
            break;

            case 2: // Up
                if ( this.y > maxY )
                    this.y -= pixels;
            break;

            case 3: // Down
                if ( this.y < maxY )
                    this.y += pixels;
            break;

            case 4: // Down right
                if ( this.x < maxX )
                    this.x += pixels;
                if ( this.y < maxY )
                    this.y += pixels;
            break;

            case 5: // Up left
                if ( this.x > maxX )
                    this.x -= pixels;
                if ( this.y > maxY )
                    this.y -= pixels;
            break;

            case 6: // Down left
                if ( this.x > maxX )
                    this.x -= pixels;
                if ( this.y < maxY )
                    this.y += pixels;
            break;

            case 7: // Up right
                if ( this.x < maxX )
                    this.x += pixels;
                if ( this.y > maxY )
                    this.y -= pixels;
            break;

            default:
                console.log("ERR: Use Player.moveSet to select a movement direction: " + direction);
            break;
        }
    }

    /**
     *  Updates the sprite frame for this player according to the action the sprite should perform.
     *  @param action - The action the sprite should pull frames from. Use Player.actionSet to select an action integer.
     */
    updateFrame (action, still = false)
    {
        switch (action)
        {
            case 0: // Stand
                this.frame = (this.frame + 1) % this.frames;
                this.sX    = this.frame * this.spriteW;
                //if (still)
                //{
                if ( this.currentImg == this.img1 )
                    this.currentImg = this.img2;
                else if ( this.currentImg == this.img3 )
                    this.currentImg = this.img4;
                //}
                break;

            case 1: // Move right
                this.frame      = (this.frame + 1) % this.frames;
                this.sX         = this.frame * this.spriteW;
                this.sY         = 0;//this.spriteH;
                this.currentImg = this.img1;
                break;
                
            case 2: // Move left
                this.frame      = (this.frame + 1) % this.frames;
                this.sX         = this.frame * this.spriteW;
                this.sY         = this.spriteH;
                this.currentImg = this.img1;
                break;

            case 3: // Move down
                this.frame      = (this.frame + 1) % this.frames;
                this.sX         = this.frame * this.spriteW;
                this.sY         = 2 * this.spriteH;
                this.currentImg = this.img1;
                break;

            case 4: // Move up
                this.frame      = (this.frame + 1) % this.frames;
                this.sX         = this.frame * this.spriteW;
                this.sY         = 3 * this.spriteH;
                this.currentImg = this.img1;
                break;

            case 5: // Move down-right
                this.frame      = (this.frame + 1) % this.frames;
                this.sX         = this.frame * this.spriteW;
                this.sY         = 0;//this.spriteH;
                this.currentImg = this.img3;
                break;

            case 6: // Move up-left
                this.frame      = (this.frame + 1) % this.frames;
                this.sX         = this.frame * this.spriteW;
                this.sY         = this.spriteH;
                this.currentImg = this.img3;
                break;

            case 7: // Move down-left
                this.frame      = (this.frame + 1) % this.frames;
                this.sX         = this.frame * this.spriteW;
                this.sY         = 2 * this.spriteH;
                this.currentImg = this.img3;
                break;

            case 8: // Move up-right
                this.frame      = (this.frame + 1) % this.frames;
                this.sX         = this.frame * this.spriteW;
                this.sY         = 3 * this.spriteH;
                this.currentImg = this.img3;
                break;

            default:
                console.log("ERR: Use Player.actionSet to choose an action: " + action);
                break;
        }
    }

    /**
     *  Draws this player's sprite to the given canvas context.
     *  @param context - The canvas context to which this player's sprite should be drawn.
     */
    draw (context)
    {
        if ( this.renderX < 0 )
            context.drawImage( this.currentImg, this.sX, this.sY, this.spriteW, this.spriteH, this.x, this.y, this.spriteW, this.spriteH);
        else context.drawImage(this.currentImg, this.sX, this.sY, this.spriteW, this.spriteH, this.x, this.y, this.renderX, this.renderY);
    }
}