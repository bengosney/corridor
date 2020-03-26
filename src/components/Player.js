class Player {
    constructor(id, x, y, walls, objectives) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.walls = walls;
        this.objectives = objectives;
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }

    getPos() {
        return { x: this.x, y: this.y };
    }

    hasWon() {
        const _x = this.objectives.x !== null ? this.objectives.x : this.x;
        const _y = this.objectives.y !== null ? this.objectives.y : this.y;

        return _x === this.x && _y === this.y;
    }

    useWall() {
        if (this.walls > 0) {
            this.walls--;
            return true;
        }

        return false;
    }
}

export default Player;
