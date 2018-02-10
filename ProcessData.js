
let fs = require('fs');
let path = require('path');

let rnUtils = require('./RoomNameUtils');

let shards = require('./shards');

let RoomDataManager = require('./RoomDataManager');
let PortalDataManager = require('./PortalDataManager');

module.exports = function() {
	let allianceData = getAllianceData();
	shards.forEach((shard,i) => processData(shard, allianceData, i > 0));

	let directory = path.join(process.cwd(), 'public', 'js');

	createDirIfNotExists(directory);

	let filename = path.join(directory, 'shards.js');
	console.log(filename);
	fs.writeFileSync(filename, `let shards = ${JSON.stringify(shards)};`);
};

function getAllianceData() {
	let alliancesString = fs.readFileSync('./alliances.js', 'utf8');
	let alliances = JSON.parse(alliancesString);

	let alliancesByPlayer = {};

	Object.keys(alliances).forEach(allianceName => {
		let alliance = alliances[allianceName];
		alliance.members.forEach(member => {
			alliancesByPlayer[member] = alliance.abbreviation;
		});
	});

	return {playersByAlliance: alliances, allianceByPlayer: alliancesByPlayer}
}

function processData(shard, allianceData, append=false) {
	let portalData = getPortalDataManager(shard);
	let roomManager = getRoomDataManager(shard);

	let sectors = {};

	let rooms = roomManager.getRooms();

	console.log('Started processing sectors');

	Object.keys(rooms).forEach(roomName => {
		let sectorName = rnUtils.getSectorCenter(roomName);
		if (!sectors[sectorName]) {
			sectors[sectorName] = {players: {}, rooms: {}, alliances: {}};
		}
		let sector = sectors[sectorName];
		let room = rooms[roomName];

		sector.players[roomManager.getRoomOwner(roomName).toLowerCase()] = true;

		let alliance = roomManager.getRoomAlliance(roomName, allianceData);
        if (alliance) {
            sector.alliances[alliance.toLowerCase()] = true;
        }

		room.alliance = alliance;
		sector.rooms[roomName] = room;
	});

	console.log('Finished processing sectors');

	let directory = path.join(process.cwd(), 'public', 'js');

	createDirIfNotExists(directory);

	let filename = path.join(directory, 'data.js');
	console.log(filename);
    let method = append ? fs.appendFileSync : fs.writeFileSync;

    let toWrite = ` allData.${shard}_portals = ${JSON.stringify(portalData.parsed)};
                        allData.${shard}_rooms = ${JSON.stringify(rooms)};
                        allData.${shard}_sectors = ${JSON.stringify(sectors)};
                        allData.${shard}_updated = ${Date.now()}; `;

    if (!append) {
        toWrite = `let allData = {}; ${toWrite}`;
    }

	method(filename, toWrite);
}

function createDirIfNotExists(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath);
	}
}

function getPortalDataManager(shard) {
	let portalsString = fs.readFileSync(`./${shard}/portals.js`, 'utf8');
	return new PortalDataManager(portalsString);
}

function getRoomDataManager(shard) {
	let roomsString = fs.readFileSync(`./${shard}/rooms.js`, 'utf8');
	return new RoomDataManager(roomsString);
}


