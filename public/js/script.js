
let overlays = shards.reduce((obj, shard) => {
    obj[shard] = new PortalOverlay(...['portals','rooms','sectors'].map(data => allData[`${shard}_${data}`]));
    return obj;
}, {});

let po = overlays.shard0;

po.run();

shards.forEach(shard => {
    d3.select("#shard_selection")
        .append(`option`)
        .attr("value", shard)
        .text(shard);
});

d3.select("#shard_selection")
    .on("change", function() {
        let shard = d3.select(this).property("value");
        changeShard(shard);
        po._updateUrl();
    });

function changeShard(shard) {
    po = overlays[shard];
    po.run();
}

let filterIds = ["allianceFilter1", "allianceFilter2", "playerFilter1", "playerFilter2"];

filterIds.forEach(id => {
	d3.select(`#${id}`).on("keypress", function() {
        if (d3.event.code === "Enter") {
            po.filterButtonPressed();
        }
    });
});

d3.select("#filterButton")
        .on('click', function() {
        	po.filterButtonPressed();
        });

d3.select("#clearFilterButton")
    .on('click', function() {
    		filterIds.forEach(id => {
    			document.getElementById(id).value = '';
    		});
				po.filterButtonPressed();
    });

if (updated) {
    let diff = (Date.now() - allData.shard0_updated) / 36e5;
    document.getElementById('updated').textContent = `Updated ${diff.toLocaleString()} hours ago, but data may be up to ${Math.ceil(diff + 24.0).toLocaleString()} hours old.`;
}

let paramKeys = ['shard', 'alliance1', 'player1', 'alliance2', 'player2'];

let params = paramKeys.reduce((obj, param) => {
    let re = new RegExp(`[&?]${param}=([^&]+)`);
    let result = re.exec(location.search);
    if (result)
        obj[param] = result[1].split('%20').join(' ');
    return obj;
}, {});

if (Object.keys(params).length > 0) {
    let {shard, alliance1, player1, alliance2, player2} = params;

    if (shard) {
        d3.select("#shard_selection").property('value', shard);
        changeShard(shard);
    }
    if (alliance1)
        d3.select('#allianceFilter1').attr('value', alliance1);
    if (player1)
        d3.select('#playerFilter1').attr('value', player1);
    if (alliance2)
        d3.select('#allianceFilter2').attr('value', alliance2);
    if (player2)
        d3.select('#playerFilter2').attr('value', player2);

    po.filterButtonPressed();
}