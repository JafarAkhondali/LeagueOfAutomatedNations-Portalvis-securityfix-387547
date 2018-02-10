
class Portal {
	constructor(obj) {
		Object.assign(this, obj);
	}

	getOriginRoom() {
		return this.pos.room;
	}

	getDestinationRoom() {
	    if (!this.dest) {
	        console.log(this);
        }
		return this.dest.room;
	}

	getOriginShard() {
		return this.pos.shard;
	}

	getDestinationShard() {
		return this.dest.shard;
	}

	getUnstableDate() {
		return this.unstableDate || false;
	}

	getDecayTick() {
		return this.decayTick || false;
	}

	getCurrentGameTick() {
		// Not implemented
		return Infinity;
	}
}
/*Portal.prototype.getPositions = function() {
	if (!this.decodedPositions) {
		this.decodedPositions = this.positions
			.split("")
			.map(c=>c.charCodeAt(0) & 0x3f)
			.reduce((arr, elem, i) => {
				if (i % 2 == 0) {
					let newPos = {x:elem};
					arr.push(newPos);
				} else {
					arr[arr.length - 1].y = elem;
				}
				return arr;
			}, []);
	}
	return this.decodedPositions;
};*/


Portal.prototype.getRooms = function() {
	if (!this._rooms) {
		this._rooms = Object.keys(this.rooms).map(roomName => {
			let roomInfo = this.rooms[roomName];
			return new PortalRoom(roomName, roomInfo);
		});
	}
	return this._rooms;
}
Portal.prototype.getAlliances = function() {
	return this.getRooms().reduce((alliancesObject, room) => {
		let alliance = room.getAlliance();
		if (alliance)
			alliancesObject[alliance.toLowerCase()] = true;
		return alliancesObject;
	}, {});
}
Portal.prototype.getPlayers = function() {
	return this.getRooms().reduce((playersObject, room) => {
		let player = room.getOwner();
		if (player)
			playersObject[player.toLowerCase()] = true;
		return playersObject;
	})
}

Portal.prototype.test = function(...filters) {
	return filters.some(filter => filter.test(this));
}
Portal.prototype.colorTest = function(...filters) {
	return filters.some(filter => filter.isActive() && filter.test(this));
}



const portalStates = [
	'STATE_STABLE',
	'STATE_DECAYING',
	'STATE_UNKNOWN'
];

portalStates.forEach(state => {
	Object.defineProperty(Portal, state, {
		writable: false,
		value: state
	});
});

Portal.prototype.isStable = function() {
	let unstableDate = this.getUnstableDate();
	if (unstableDate && Date.now() < unstableDate)
		return true;
	else
		return false;
};

Portal.prototype.isDecaying = function() {
	let decayTick = this.getDecayTick();
	let currentTick = this.getCurrentGameTick();
	if (decayTick && decayTick < currentTick)
		return true;
	else
		return false;
};

Portal.prototype.getState = function() {
	if (this.isStable())
		return Portal.STATE_STABLE;
	else if (this.isDecaying())
		return Portal.STATE_DECAYING;
	else
		return Portal.STATE_UNKNOWN;
};