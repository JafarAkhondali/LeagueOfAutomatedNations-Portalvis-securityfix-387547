
let processData = require('./ProcessData');

let fs = require('fs');
let https = require('https');
let http = require('http');
let path = require('path');

let shards = require('./shards');

let URLS = {
	portals: function(shard) {
		return `https://esryok.screepspl.us/servers/main/${shard}/portals.json`;
	},
	rooms: function(shard) {
		return `http://www.leagueofautomatednations.com/map/${shard}/rooms.js`;
	},
	ALLIANCES: `http://www.leagueofautomatednations.com/alliances.js`
};

function createDirIfNotExists(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath);
	}
}

function download(fileUrl, destinationPath, callback) {
	let file = fs.createWriteStream(destinationPath);
	let secure = fileUrl.includes("https");
	let method = secure ? https : http;
	let request = method.get(fileUrl, function(response) {
		response.pipe(file);
		file.on('finish', function() {
			file.close(callback);
			filesDownloaded += 1;
			console.log(`Finished downloading ${destinationPath}`);
			console.log(filesDownloaded);
			if (filesDownloaded == FILES_TO_DOWNLOAD) {
				processData();
			}
		});
	});
}

function downloadAlliancesFile() {
	download(URLS.ALLIANCES, 'alliances.js')
}

function downloadFilesForShard(shard) {
	createDirIfNotExists(`./${shard}`);
	download(URLS.portals(shard), `./${shard}/portals.js`);
	download(URLS.rooms(shard), `./${shard}/rooms.js`);
}

const FILES_TO_DOWNLOAD = 1 + shards.length * 2;
let filesDownloaded = 0;

module.exports = function() {
    filesDownloaded = 0;
	downloadAlliancesFile();
	console.log(`Shards: ${shards}`);
	shards.forEach(shard => {
		console.log(shard);
		downloadFilesForShard(shard);
	});
};