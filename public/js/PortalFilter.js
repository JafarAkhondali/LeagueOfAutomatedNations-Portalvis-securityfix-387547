
function PortalFilter(overlay, allianceExpressionString, playerExpressionString) {
	this._allianceExpressionString = allianceExpressionString;
	this._playerExpressionString = playerExpressionString;
	this.overlay = overlay;
}

PortalFilter.prototype.setAllianceString = function(newString) {
	this._allianceExpressionString = newString;
};
PortalFilter.prototype.setPlayerString = function(newString) {
	this._playerExpressionString = newString;
};

PortalFilter.prototype.getAllianceString = function() {
	return this._allianceExpressionString;
};
PortalFilter.prototype.getPlayerString = function() {
	return this._playerExpressionString;
};

PortalFilter.prototype.hasAllianceFilter = function() {
	return !!this._allianceExpressionString;
};
PortalFilter.prototype.hasPlayerFilter = function() {
	return !!this._playerExpressionString;
};

PortalFilter.prototype._convertStringToBoolean = function(str, objectName) {
	let re = new RegExp(/\(|\)|&&|\|\|/);

	let identifiers = str.split(/\s+/).filter(x=>x).join('').split(re).filter(x=>x);

	let uniqueIdentifiers = [...new Set(identifiers)];

	let expressions = uniqueIdentifiers.map(identifier => {
		return `${objectName}['${identifier.toLowerCase()}']==true`;
	});

	let finalExpression = str;

	uniqueIdentifiers.forEach((identifier, i) => {
		finalExpression = finalExpression.split(identifier).join(expressions[i]);
	});

	return finalExpression;
};

PortalFilter.prototype._getAllianceExpression = function(objectName) {
	return this._convertStringToBoolean(this.getAllianceString(), objectName);
};
PortalFilter.prototype._getPlayerExpression = function(objectName) {
	return this._convertStringToBoolean(this.getPlayerString(), objectName);
};

PortalFilter.prototype._testAlliances = function(roomName) {
    let sector = this.overlay.data.getSector(roomName);
	let alliances = sector.getAlliances();

    if (!alliances) {
        return false;
    }

	let expression = this._getAllianceExpression('alliances');
	return eval(expression);
};
PortalFilter.prototype._testPlayers = function(roomName) {
    let sector = this.overlay.data.getSector(roomName);
    let players = sector.getPlayers();

    if (!players) {
        return false;
    }

	let expression = this._getPlayerExpression('players');
	return eval(expression);
};

PortalFilter.prototype.isActive = function() {
	return this.hasAllianceFilter() || this.hasPlayerFilter();
};

PortalFilter.prototype.test = function(roomName) {
	let passesAllianceFilter = this.hasAllianceFilter() && this._testAlliances(roomName);
	let passesPlayerFilter = this.hasPlayerFilter() && this._testPlayers(roomName);
	return passesAllianceFilter || passesPlayerFilter;
};

PortalFilter.prototype.colorTest = function(roomName) {
    return this.isActive() && this.test(roomName);
};


PortalFilter.prototype._testRoomAlliance = function(roomName) {
    let room = this.overlay.data.getRoom(roomName);
    let alliance = room.getAlliance();
    if (!alliance) {
        return false;
    }
    let alliances = {[alliance.toLowerCase()]: true};
    let expression = this._getAllianceExpression('alliances');
    return eval(expression);
};

PortalFilter.prototype._testRoomPlayer = function(roomName) {
    let room = this.overlay.data.getRoom(roomName);
    let player = room.getOwner();
    if (!player) {
        return false;
    }
    let players = {[player.toLowerCase()]: true};
    let expression = this._getPlayerExpression('players');
    return eval(expression);
};

PortalFilter.prototype.testRoom = function(roomName) {
    let passesAllianceFilter = this.hasAllianceFilter() && this._testRoomAlliance(roomName);
    let passesPlayerFilter = this.hasPlayerFilter() && this._testRoomPlayer(roomName);
    return passesAllianceFilter || passesPlayerFilter;
};