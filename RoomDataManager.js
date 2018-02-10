/**
 * Created by Jake on 10/2/17.
 */

class RoomDataManager {
    constructor(fileString) {
        this.raw = fileString;
        this.parsed = JSON.parse(this.raw);
    }

    getRooms() {
        return this.parsed;
    }

    getRoomInfo(roomName) {
        return this.getRooms()[roomName];
    }

    getRoomOwner(roomName) {
        return this.getRoomInfo(roomName).owner;
    }

    getRoomAlliance(roomName, allianceData) {
        let owner = this.getRoomOwner(roomName);
        return allianceData.allianceByPlayer[owner];
    }

    getRoomLevel(roomName) {
        return this.getRoomInfo(roomName).level;
    }

    existsRoomInfo(roomName) {
        return this.getRoomInfo(roomName) != undefined;
    }
}

module.exports = RoomDataManager;