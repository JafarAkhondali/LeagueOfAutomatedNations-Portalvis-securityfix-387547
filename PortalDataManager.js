/**
 * Created by Jake on 10/2/17.
 */

class PortalDataManager {
    constructor(fileString) {
        this.raw = fileString;
        this.parsed = JSON.parse(this.raw);
    }

    getPortalsInRoom(roomName) {
        return this.parsed[roomName];
    }

    getPortalPosition(portal) {
        return portal.pos;
    }

    getPortalDestination(portal) {
        return portal.dest;
    }

    getPortalUnstableDate(portal) {
        return portal.unstableDate;
    }

    getPortalDecayTick(portal) {
        return portal.decayTick;
    }
}

let exampleData = {
    "W100N100":
    [
        {
            "pos": {"x":16,"y":21,"room":"W100N100","shard":"shard0"},
            "dest":{"room":"W50N50","shard":"shard1"},
            "unstableDate":null,
            "decayTick":null
        }
    ]
};

module.exports = PortalDataManager;