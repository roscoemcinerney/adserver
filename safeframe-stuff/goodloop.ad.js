let $sfext = ($sf && $sf.ext) || window.extern;

$sfext.register(720, 90, status_update);
function status_update(status, data) {
	console.warn(status, data);
	if (status==='expanded') window.expanded = true;
}

document.write('<div style="background:lightblue;height:450px;width:400px;">');

document.write('<button onclick="doStuff()">:)</button>');

function doStuff() {
	let g = $sfext.geom();
	//inView = g.self.iv
	// can we go full-screen?		
	if (window.expanded) {
		$sfext.collapse();
		window.expanded = false;
		return;
	}
	$sfext.expand(g.exp);
}

document.write('<button onclick="testSupports()">extern.supports</button>');
document.write('<button onclick="testGeometry()">extern.geom</button>');
document.write('<button onclick="windowGeometry()">window geom</button>');
document.write('<button onclick="expandAd()">extern.expand</button>');
document.write('<button onclick="collapseAd()">extern.collapse</button>');
document.write('<button onclick="adStatus()">extern.status</button>');
document.write('<button onclick="externMeta()">extern.meta</button>');
document.write('<button onclick="getViewableAmount()">percent_viewable</button>');
document.write('<button onclick="getHostUrl()">extern.hostURL</button>');
document.write('<button onclick="showMyUrl()">My URL</button>');
document.write('<button onclick="clearLog()">Clear Log</button>');
document.write('<button onclick="throw(\"Error Forced\");" style="background:red;color:white;">THROW EXCEPTION</button>');
document.write('<button onclick="sendMessage()">SendMessage</button>');
document.write('<div id="feedback" style="height:240px;background:#333;color:yellow;overflow:auto;" ></div>');
//for local testing use
document.write('<scr' + 'ipt src=\"../../tests/sample_ads/vendorActionScript.js\" ></sc' + '' + 'ript>');
//document.write('<scr' + 'ipt src=\"http://localhost/tests/sample_ads/vendorActionScript.js\" ></sc' + '' + 'ript>');
document.write('</div>');



var rm_data = new Object();
rm_data.creative_id = 11409285;
rm_data.offer_type = 3;
rm_data.entity_id = 45574;
if (window.rm_crex_data) {rm_crex_data.push(11409285);}