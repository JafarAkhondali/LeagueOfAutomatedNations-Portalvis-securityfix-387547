
class PortalRoom {
    constructor(roomName, obj) {
        this.roomName = roomName;
        Object.assign(this, obj);
    }

    getName() {
        return this.roomName;
    }

    getOwner() {
        return this.owner;
    }

    getAlliance() {
        return this.alliance;
    }

    getLevel() {
        return this.level;
    }

    isClaimed() {
        return this.getLevel() > 0;
    }

    isReserved() {
        return this.getLevel() == 0;
    }
}










