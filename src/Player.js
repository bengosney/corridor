import React, { Component } from 'react';
import PropTypes from 'prop-types';


class Player  {
    constructor(id, x, y, walls) {
	this.x = x;
	this.y = y;
	this.id = id;
	this.walls = walls;
    }

    move(x, y) {
	this.x = x;
	this.y = y;
    }
}

export default Player;
