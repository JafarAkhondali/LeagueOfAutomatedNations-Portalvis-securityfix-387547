/**
 * Created by Jake on 10/2/17.
 */
module.exports = class RoomNameUtils {
    static parseRoomName(roomName) {
        return roomName.match(/^(E|W)([0-9]+)(N|S)([0-9]+)$/);
    }

// returns the room name of the room in the center of the sector containing the given room name
    static getSectorCenter(roomName) {
        let [ , we, x, ns, y] = RoomNameUtils.parseRoomName(roomName);

        let cx = Math.round(+x / 10) * 10;
        let cy = Math.round(+y / 10) * 10;

        if (cx < x) cx += 5;
        else cx -= 5;

        if (cy < y) cy += 5;
        else cy -= 5;

        return `${we}${cx}${ns}${cy}`;
    }

// returns an array of all the sector names of the given room names
    static getSectors(rooms) {
        let sectors = {};
        rooms.forEach(room => {
            sectors[RoomNameUtils.getSectorCenter(room)] = true;
        });
        return Object.keys(sectors);
    }

// map sector names to their portal exit sector names
    static getPortalExitSectors(sectors) {
        return sectors.map(sector => (portals[sector] || {}).destination);
    }

// return all the room names that are in the given sector name
    static getSectorRooms(sectorName) {
        let [ , we, x, ns, y] = RoomNameUtils.parseRoomName(sectorName);
        x = +x;
        y = +y;
        let sectorRooms = [];
        for (let xc = x - 4; xc <= x + 4; xc++) {
            for (let yc = y - 4; yc <= y + 4; yc++) {
                sectorRooms.push(`${we}${xc}${ns}${yc}`);
            }
        }
        return sectorRooms;
    }
};