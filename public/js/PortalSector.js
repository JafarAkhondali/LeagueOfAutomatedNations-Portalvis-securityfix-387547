
class PortalSector {
    constructor(sectorName, obj) {
        this.sectorName = sectorName;
        Object.assign(this, obj);

        if (this.rooms) {
            this.rooms = Object.keys(this.rooms).map(roomName => new PortalRoom(roomName, this.rooms[roomName]));
        }
    }

    getName() {
        return this.sectorName;
    }

    getAlliances() {
        return this.alliances;
    }

    getPlayers() {
        return this.players;
    }

    getRooms() {
        return this.rooms;
    }

    isPlayerInSector(playerName) {
        return this.players[playerName] || false;
    }

    isAllianceInSector(allianceName) {
        return this.alliances[allianceName] || false;
    }

    getRoomsForPlayer(player) {
        return this.rooms.filter(room => room.getOwner() == player);
    }

    getRoomsForAlliance(alliance) {
        return this.rooms.filter(room => room.getAlliance() == alliance);
    }
}