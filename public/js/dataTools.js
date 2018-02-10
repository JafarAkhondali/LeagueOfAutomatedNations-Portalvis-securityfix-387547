
function DataTools(portalData, roomData, sectorData) {
	this.portals = portalData;
	this.rooms = roomData;
	this.sectors = sectorData;

    Object.keys(this.portals).forEach(roomName => {
        if (this.portals[roomName].length == 0 ||
            this.roomIsHighway(roomName)) {
            delete this.portals[roomName];
        }
    });
}

DataTools.prototype._getPortalObjects = function(portalRoom) {
	return this.portals[portalRoom];
};

DataTools.prototype.getPortals = function(portalRoom) {
    return this._getPortalObjects(portalRoom).map(portalObject => new Portal(portalObject));
};

DataTools.prototype.getRoom = function(roomName) {
    let room = this.rooms[roomName];
    return new PortalRoom(roomName, room);
};

DataTools.prototype.getSector = function(roomName) {
    let sectorName = this.getSectorCenter(roomName);
    let sector = this.sectors[sectorName];
    return new PortalSector(sectorName, sector);
};

DataTools.prototype.parseRoomName = function(roomName) {
    if (!roomName.match) {
        console.log(roomName);
    }
	return roomName.match(/^(E|W)([0-9]+)(N|S)([0-9]+)$/);
};

DataTools.prototype.roomIsHighway = function(roomName) {
    let [ , we, x, ns, y] = this.parseRoomName(roomName);
    return x % 10 == 0 || y % 10 == 0;
};

DataTools.prototype.getSectorCenter = function(roomName) {
    let [ , we, x, ns, y] = this.parseRoomName(roomName);

    let cx = Math.round(+x / 10) * 10;
    let cy = Math.round(+y / 10) * 10;

    if (cx < x) cx += 5;
    else cx -= 5;

    if (cy < y) cy += 5;
    else cy -= 5;

    return `${we}${cx}${ns}${cy}`;
};

Object.defineProperty(DataTools.prototype, 'connections', {
	get: function() {
		if (!this._connections) {
		let portalRooms = Object.keys(this.portals);
		this._connections = portalRooms.reduce((obj, originRoom) => {
			let originPortals = this.getPortals(originRoom);
			let destinationRooms = originPortals.map(p => p.getDestinationRoom());
            if (!obj[originRoom]) {
                obj[originRoom] = {};
            }
            destinationRooms.forEach(destRoom => {
                obj[originRoom][destRoom] = true;
            });
			return obj;
		}, {});
	}
	return this._connections;
	},
	configurable: true,
	enumerable: true
});