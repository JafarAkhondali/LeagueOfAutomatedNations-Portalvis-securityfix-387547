const NODE_COLOR = 'red';//'#92140C';
const FILTERED_COLOR = '#FAA916';
const FILTERED_COLOR_2 = '#228B22';
const BOTH_FILTER_COLOR = '#8A2BE2';
const ACCENT_COLOR = '#FBFFFE';
const SUBTLE_COLOR = '#6D676E';
const ALLIANCE_COLOR = '#FF7700';
const SELECTED_COLOR = '#004777';

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

function PortalOverlay(portalData, roomData, sectorData) {
	this.data = new DataTools(portalData, roomData, sectorData);
	this.originFilter = new PortalFilter(this);
	this.destinationFilter = new PortalFilter(this);
	//PortalOverlay.instance = this;
}

PortalOverlay.prototype._selectImage = function() {
	return d3.select("#mapimg");
};
PortalOverlay.prototype._selectSvg = function() {
	return d3.select("#mapsvg");
};
PortalOverlay.prototype._selectPortals = function() {
	return this._selectSvg().selectAll(".portal");
};
PortalOverlay.prototype._selectConnections = function() {
	return this._selectSvg().selectAll(".connection");
};
PortalOverlay.prototype._selectRooms = function() {
	return this._selectSvg().selectAll(".room");
};


PortalOverlay.prototype._bindPortalData = function() {
	let dataToBind = Object.keys(this.data.portals).filter(d => {
		return this.testPortalAndDestinationFilters(d);
	});
	return this._selectPortals().data(dataToBind);
};
PortalOverlay.prototype._bindConnectionData = function() {
	let dataToBind = Object.keys(this.data.connections).reduce((dataArr, originRoom) => {
	    Object.keys(this.data.connections[originRoom]).forEach(destRoom => {
	        if (this.testPortalAndDestinationFilters(originRoom)) {
                dataArr.push({originRoom, destRoom});
            }
        });
        return dataArr;
    }, []);
	return this._selectConnections().data(dataToBind);
};
PortalOverlay.prototype._bindRoomData = function() {
	let dataToBind = Object.keys(this.data.rooms);
	return this._selectRooms().data(dataToBind);
};


PortalOverlay.prototype._modifySelection = function(selection, selectionName) {
	let mod = this.selectionModifiers[selectionName];
	return selection
		.call(mod.enter, this)
		.call(mod.exit, this)
		.call(mod.update, this);
};

PortalOverlay.prototype.run = function() {
	this._determineSizes();
	['rooms', 'connections', 'portals'].forEach(selectionName => {
		let boundData = this[`_bind${selectionName.slice(0,selectionName.length - 1).capitalize()}Data`]();
		this._modifySelection(boundData, selectionName);
	});
};



PortalOverlay.prototype._getImageBounds = function() {
	return this._selectImage().node().getBBox();
};
PortalOverlay.prototype._determineSizes = function() {
	let bounds = this._getImageBounds();
	this.sectorWidth = bounds.width / NUM_SECTORS;
	this.roomWidth = bounds.width / MAP_WIDTH_ROOMS;
	this.center = {x: bounds.width / 2, y: bounds.height / 2};
};


PortalOverlay.prototype.portals_enter = function(selection, thisArg) {
    let enter = selection.enter();
    enter
        .append('circle')
        .classed('portal', true)
        .call(thisArg.selectionModifiers.portals.update, thisArg);
};
PortalOverlay.prototype.portals_update = function(selection, thisArg) {
    selection
        .attr("r", thisArg.roomWidth * 3 / 2)
        .style("fill", d => thisArg.getNodeColor(d))
        .attr("cx", d => thisArg.getX(d))
        .attr("cy", d => thisArg.getY(d))
        .style("stroke", d => thisArg.getNodeStroke(d))
        .style("stroke-width", d => thisArg.getNodeStrokeWidth(d))
        .on("click", d => thisArg.nodeClicked(d));
};
PortalOverlay.prototype.portals_exit = function(selection, thisArg) {
    selection.exit().remove();
};

PortalOverlay.prototype.connections_enter = function(selection, thisArg) {
    let enter = selection.enter();
    enter
        .append('line')
        .classed('connection', true)
        .call(thisArg.selectionModifiers.connections.update, thisArg);
};
PortalOverlay.prototype.connections_update = function(selection, thisArg) {
    selection
        .style('opacity', 0.3)
        .attr('x1', d => thisArg.getX(d.originRoom))
        .attr('y1', d => thisArg.getY(d.originRoom))
        .attr('x2', d => thisArg.getX(d.destRoom))
        .attr('y2', d => thisArg.getY(d.destRoom))
        .attr('stroke', SUBTLE_COLOR)
        .attr('stroke-width', 2);

};
PortalOverlay.prototype.connections_exit = function(selection) {
    selection.exit().remove();
};

PortalOverlay.prototype.rooms_enter = function(selection, thisArg) {
    let enter = selection.enter();
    enter
        .append('rect')
        .classed('room', true)
        .call(thisArg.selectionModifiers.rooms.update, thisArg);
};
PortalOverlay.prototype.rooms_update = function(selection, thisArg) {
    selection
        .attr('x', d => thisArg.getX(d) - thisArg.roomWidth / 2)
        .attr('y', d => thisArg.getY(d) - thisArg.roomWidth / 2)
        .attr('width', thisArg.roomWidth)
        .attr('height', thisArg.roomWidth)
        .style('fill', d => {
            if (thisArg.originFilter.testRoom(d) && thisArg.destinationFilter.testRoom(d)) {
                return BOTH_FILTER_COLOR;
            } else if (thisArg.originFilter.testRoom(d)) {
                return FILTERED_COLOR;
            } else if (thisArg.destinationFilter.testRoom(d)) {
                return FILTERED_COLOR_2;
            } else {
                return 'white'
            }
        })
        .style('opacity', d => {
            if (thisArg.originFilter.testRoom(d) || thisArg.destinationFilter.testRoom(d)) {
                return thisArg.data.getRoom(d).level ? 0.95 : 0.5
            } else {
                return thisArg.data.getRoom(d).level ? 0.25 : 0.1
            }
        });
};
PortalOverlay.prototype.rooms_exit = function(selection) {
    selection.exit().remove();
};

PortalOverlay.prototype.selectionModifiers = {
	portals: {
		enter: PortalOverlay.prototype.portals_enter,
		update: PortalOverlay.prototype.portals_update,
		exit: PortalOverlay.prototype.portals_exit
	},
	connections: {
		enter: PortalOverlay.prototype.connections_enter,
		update: PortalOverlay.prototype.connections_update,
		exit: PortalOverlay.prototype.connections_exit
	},
	rooms: {
		enter: PortalOverlay.prototype.rooms_enter,
		update: PortalOverlay.prototype.rooms_update,
		exit: PortalOverlay.prototype.rooms_exit
	}
};


PortalOverlay.prototype.getX = function(roomName) {
	let [ , we, x, ns, y] = this.data.parseRoomName(roomName);
	if (we === 'W') {
		return this.center.x - (+x) * this.roomWidth - this.roomWidth / 2;
	} else {
		return this.center.x + (+x) * this.roomWidth + this.roomWidth / 2;
	}
};
PortalOverlay.prototype.getY = function(roomName) {
	let [ , we, x, ns, y] = this.data.parseRoomName(roomName);
	if (ns === 'N') {
		return this.center.y - (+y) * this.roomWidth - this.roomWidth / 2;
	} else {
		return this.center.y + (+y) * this.roomWidth + this.roomWidth / 2;
	}
};



PortalOverlay.prototype.setSelected = function(d) {
	let portal = this.data.getPortals(d)[0];
	this.selected = portal.getOriginRoom();
};
PortalOverlay.prototype.clearSelected = function() {
	this.selected = undefined;
};



PortalOverlay.prototype.getNodeColor = function(d) {
	let portals = this.data.getPortals(d);
	if (portals.some(p => p.getOriginRoom() == this.selected)) {
		return SELECTED_COLOR;
	} else if (this.bothFiltersActive()) {
		if (portals.some(p => this.originFilter.test(p.getOriginRoom()) && this.destinationFilter.test(p.getOriginRoom()))) {
			return BOTH_FILTER_COLOR;
		} else if (portals.some(p => this.originFilter.test(p.getOriginRoom()))) {
			return FILTERED_COLOR;
		} else if (portals.some(p => this.destinationFilter.test(p.getOriginRoom()))) {
			return FILTERED_COLOR_2;
		} else {
			return NODE_COLOR;
		}
	} else if (portals.some(p => this.originFilter.colorTest(p.getOriginRoom()) || this.destinationFilter.colorTest(p.getOriginRoom()))) {
		return FILTERED_COLOR;
	} else {
		return NODE_COLOR;
	}
};

PortalOverlay.STATE_STROKE = {
	[Portal.STATE_STABLE]: "",
	[Portal.STATE_DECAYING]: "cyan",
	[Portal.STATE_UNKNOWN]: "yellow"
};
PortalOverlay.STATE_STROKE_WIDTH = {
	[Portal.STATE_STABLE]: 0,
	[Portal.STATE_DECAYING]: 1,
	[Portal.STATE_UNKNOWN]: 1
};
PortalOverlay.prototype.getNodeStroke = function(d) {
	let portals = this.data.getPortals(d);
	return PortalOverlay.STATE_STROKE[portals[0].getState()];
};
PortalOverlay.prototype.getNodeStrokeWidth = function(d) {
	let portals = this.data.getPortals(d);
	return PortalOverlay.STATE_STROKE_WIDTH[portals[0].getState()];
};

PortalOverlay.prototype.nodeClicked = function(d) {
	let originPortals = this.data.getPortals(d);
    this.setSelected(d);
	//this.selected = originPortals[0].getOriginRoom();
	let destinationPortals = this.data.getPortals(originPortals[0].getDestinationRoom());
	this.setPortalInfoHtml(this.sectorToString(originPortals[0].getOriginRoom(), 'Origin'));
	this.setDestinationInfoHtml(this.sectorToString(destinationPortals[0].getOriginRoom(), 'Destination'));
	
	this._selectPortals()
		.transition('portalRadius')
		.duration(100)
		.attr("r", d => {
			if (originPortals.some(op => op.getOriginRoom() == d) || destinationPortals.some(dp => dp.getOriginRoom() == d)) {
				return this.roomWidth * 6 / 2;
			} else {
				return this.roomWidth * 3 / 2;
			}
		})
		.style('fill', d => this.getNodeColor(d));

		this._selectConnections()
			.style("stroke", d => {
				if (originPortals.some(op => op.getOriginRoom() == d.originRoom) || destinationPortals.some(dp => dp.getOriginRoom() == d.originRoom)) {
					return "white";
				} else {
					return SUBTLE_COLOR;
				}
			})
			.style("opacity", d => {
                if (originPortals.some(op => op.getOriginRoom() == d.originRoom) || destinationPortals.some(dp => dp.getOriginRoom() == d.originRoom)) {
					return 1;
				} else {
					return 0.3;
				}
			})
};

PortalOverlay.prototype._selectPortalInfo = function() {
	return d3.select("#portalInfo");
};
PortalOverlay.prototype.setPortalInfoHtml = function(html) {
	this._selectPortalInfo().html(html);
};
PortalOverlay.prototype._selectDestinationInfo = function() {
	return d3.select("#destinationInfo");
};
PortalOverlay.prototype.setDestinationInfoHtml = function(html) {
	this._selectDestinationInfo().html(html);
};

PortalOverlay.prototype._getFilterStrings = function() {
	let alliance1 = document.getElementById(`allianceFilter1`).value;
	let player1 = document.getElementById(`playerFilter1`).value;
	let alliance2 = document.getElementById(`allianceFilter2`).value;
	let player2 = document.getElementById(`playerFilter2`).value;
	return {origin: {alliance: alliance1, player: player1}, destination: {alliance: alliance2, player: player2}};
};

PortalOverlay.prototype._updateUrl = function() {
    let filterStrings = this._getFilterStrings();
	if (history.pushState) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;

            let expressions = [];

            if (filterStrings.origin.alliance) 
            	expressions.push(`alliance1=${filterStrings.origin.alliance}`);
            if (filterStrings.origin.player) 
            	expressions.push(`player1=${filterStrings.origin.player}`);
            if (filterStrings.destination.alliance) 
            	expressions.push(`alliance2=${filterStrings.destination.alliance}`);
            if (filterStrings.destination.player) 
            	expressions.push(`player2=${filterStrings.destination.player}`);

            let shard = d3.select("#shard_selection").property("value");
            expressions.push(`shard=${shard}`);

            if (expressions.length > 0)	{
                newurl += `?`;
                newurl += expressions.shift();
                expressions.forEach(expression => {
                	newurl += `&${expression}`;
                });
            }
            window.history.pushState({path:newurl},'',newurl);
        }
};

PortalOverlay.prototype.setFilters = function() {
	let filterStrings = this._getFilterStrings();
	this._updateUrl();
	this.originFilter = new PortalFilter(this, filterStrings.origin.alliance, filterStrings.origin.player);
	this.destinationFilter = new PortalFilter(this, filterStrings.destination.alliance, filterStrings.destination.player);
};

PortalOverlay.prototype.bothFiltersActive = function() {
	return this.originFilter.isActive() && this.destinationFilter.isActive();
};
PortalOverlay.prototype.neitherFilterActive = function() {
	return !this.originFilter.isActive() && !this.destinationFilter.isActive();
};

PortalOverlay.prototype.testPortalAndDestinationFilters = function(portalName) {
	let originPortals = this.data.getPortals(portalName);
    let originRoom = originPortals[0].getOriginRoom();
	let destinationRooms = originPortals.map(p => p.getDestinationRoom());//this.data.getPortal(portal1.getDestinationRoom());

	let test1, test2;
	if (this.bothFiltersActive()) {
		test1 = (this.originFilter.test(originRoom) && destinationRooms.some(destRoom => this.destinationFilter.test(destRoom)));
		test2 = (this.destinationFilter.test(originRoom) && destinationRooms.some(destRoom => this.originFilter.test(destRoom)));
	} else if (this.neitherFilterActive()) {
		return true;
	} else {
	    test1 = this.originFilter.test(originRoom) || this.destinationFilter.test(originRoom);
        test2 = destinationRooms.some(destRoom => this.originFilter.test(destRoom)) || destinationRooms.some(destRoom => this.destinationFilter.test(destRoom));
	}
	return test1 || test2;
};

PortalOverlay.prototype.filterButtonPressed = function() {
	console.log(`Filter button pressed`);
	this.clearSelected();
	this.setPortalInfoHtml(`Click on a portal to see more information.`);
	this.setDestinationInfoHtml(``);
	this.setFilters();
	this.run();
};


PortalOverlay.prototype.sectorInfo = function(sectorName) {
	//let portal = this.data.getPortal(sectorName);
    let sector = this.data.getSector(sectorName);
	let rooms = sector.getRooms();
	return rooms.reduce((obj, room) => {
		let player = room.getOwner();
		if (!player) return obj;
		if (!obj[player]) obj[player] = {};
		let playerInfo = obj[player];

		playerInfo.alliance = room.getAlliance();

		if (room.isClaimed())
			playerInfo.claimed = (playerInfo.claimed || []).concat([room.getLevel()]);
		else if (room.isReserved())
			playerInfo.reserved = (playerInfo.reserved || 0) + 1;

		return obj;
	}, {});
};

function makeHtmlTag(tag, constAttrs = "") {
	return function(contents = "", attrs = "") {
		return `<${tag} ${constAttrs} ${attrs}>${contents}</${tag}>`;
	}
}
let h1 = makeHtmlTag('h1');
let font = makeHtmlTag('font');
let cAccent = makeHtmlTag('font', `color='${ACCENT_COLOR}'`);
let cAlliance = makeHtmlTag('font', `color='${ALLIANCE_COLOR}'`);
let cFiltered = makeHtmlTag('font', `color='${FILTERED_COLOR}'`);
let br = () => `<br/>`;
let space = function(quantity) {
	return Array(quantity).fill(`&ensp;`).join('');
};


PortalOverlay.prototype.sectorToString = function(sectorName, name) {
	let portal = this.data.getPortals(sectorName)[0];
	let sectorInfo = this.sectorInfo(sectorName);

	let str = h1(name + ": " + portal.getOriginRoom());
	if (portal.getUnstableDate()) {
		str += 'Unstable Date: ' + cFiltered(new Date(portal.getUnstableDate()).toLocaleString()) + br();
	}
	if (portal.getDecayTick()) {
		str += 'Decay Tick: ' + cFiltered(portal.getDecayTick()) + br();
	}
	Object.keys(sectorInfo).forEach(playerName => {
		let info = sectorInfo[playerName];
		str += cAccent(playerName) + (info.alliance ? " | " + cAlliance(info.alliance) : "") + br();
		if (info.claimed)
			str += space(4) + "Claimed Levels: " + info.claimed + br();
		if (info.reserved)
			str += space(4) + "Num Reserved: " + info.reserved + br();
	});
	return str;
};
