// Depends on:
// - zepto
// - goodloop.vert

$(function(){
// Installed on the page already?
if (goodloop.installed) return;
goodloop.installed = true;
console.warn("goodloop",goodloop);

/* DETECTION & ANY POLYFILL */
// no ads for this page?
if ($('.good-loop-adblock').length !== 0) {
	return; 
}

var userAgent = navigator.userAgent || navigator.vendor || window.opera;
goodloop.env = {};
goodloop.env.iOS = (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream);
// Size based instead? But SafeFrame would bugger that up.
goodloop.env.isMobile = !!(userAgent.match('/mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry/i'));

 /* ??detect CSS animation support?? c.f. gdlpafg.js */
// Detect and hook in IAB SafeFrame handler
// Legacy sf variable (Copied from example code. Does this ever happen??)
if (typeof($sf) === 'undefined' && window.sfAPI) {
	window.$sf = {ext: sfAPI};
}
if (typeof($sf) !== 'undefined') {
	goodloop.sfHandler = function(status, data) {
		console.log("#sfHandler", status, data);
		if (status==='expanded') {				
			goodloop.act.openLightbox2();
		}
	};	
	goodloop.$sf = $sf;
	// width & height - default to a medium-rectangle
	var w = goodloop.vert.w || 300, h = goodloop.vert.h || 250;
	console.log("$sf.ext.register", w, h, goodloop.sfHandler);
	$sf.ext.register(w, h, goodloop.sfHandler);
	goodloop.env.geom = $sf.ext.geom();
} else {
	window.$sf = false; // easier tests later
}


// STATE
goodloop.dataspace='goodloop';
goodloop.state = {
	/** Your chosen charity */
	charity: {},
	playing: false,
	done: false,
	/** If you pause & restart, this is the restart time. */
	startTime: null,
	/** If you pause, this is the previously elapsed time. */
	elapsed: 0,
	/** true => open */
	lightbox: false,
	/** SF is picky about expand to show unit => must collapse before a re-expand to show lightbox */
	expanded: false
};


// Tracking Pixel
datalog.track();

function renderUnit(id, $div) {
	console.log(this, $div, $div.width(), 'x', $div.height());
	// pick format
	var format = pickFormat($div);	
	goodloop.env.format = format;	
	// // expand?
	// if ($sf) {		
	// 	var wh = {
	// 		mediumrectangle: [300, 250],
	// 		leaderboard: [728, 90],
	// 		vbnr: [120, 240],
	// 		stickybottom: [728, 50] // NB: stickybottom width = 100%
	// 	}[format];
	// 	var ew = wh[0] - goodloop.env.geom.self.w;
	// 	var eh = wh[1] - goodloop.env.geom.self.h;
	// 	if (ew>0 || eh>0) {
	// 		$sf.ext.expand(Math.max(0, ew), Math.max(0, eh), true);
	// 		goodloop.state.expanded = true;
	// 	}
	// }
	// done?
	var done = goodloop.state.done;
	if (done) {
		// one TQ html for all slots -- modified by css
		var tqhtml = goodloop.html.tq(format);
		$div.html(tqhtml);
		return;	
	}
	// show offer
	var $unit = $(goodloop.html[format]());	
	$unit.click(goodloop.act.openLightbox);
	$('.close', $unit).click(goodloop.act.closeUnit);
	$unit.addClass(format);
	$div.append($unit);
}

function pickFormat($div) {
	var format = $div.data(goodloop.env.isMobile? 'mobile-format' : 'format');
	// TODO set by publisher info? To allow eg the blogger to say "I dont like stickys" without reinstalling the tag.
	if (format) {
		// replace "-", so medium-rectangle = mediumrectangle
		var f = format.toLowerCase().replace(/\W/, '');
		if (f==='verticalbanner') return 'vbnr'; // TODO shrink them all
		return f;
	}
	if (goodloop.env.isMobile && ! $sf) return 'stickybottom';
	// space?
	var w = $div.width();
	if ($sf) {
		w = parseInt(goodloop.env.geom.self.w);
		if ($sf.ext.supports("exp-push")) {
			w += parseInt(goodloop.env.geom.exp.w);
		}
	}
	// NB: -4 to allow that minor clipping is better than a smaller ad.
	if (w >= 728 - 4) {
		return 'leaderboard';
	}
	if (w >= 300 - 4) {
		return 'mediumrectangle';
	}
	// limited space
	return 'vbnr';
}

// Make the adverts!
// TODO do we have to release control to let the page-load finish?? Or does <script async> cover that?
// setTimeout(function() {
	// TODO support ad units added dynamically
function render() {
	// style
	var css = "@import '"+goodloop.BURL+"all.css';";
	if ($sf && false) {
		// for some reason adding to head fails :(
		document.write('<style type="text/css">'+css+'</style>');
	} else {
		var style = document.createElement("style");
		style.type = 'text/css';
		if (style.styleSheet) {
			style.styleSheet.cssText = css;
		} else {
			style.appendChild(document.createTextNode(css));
		}
		document.head.appendChild(style);
	}

	// ads
	var $ads = $('div.goodloopad');
	if ($ads.length==0 && $sf) {
		document.write('<div class="goodloopad"></div>');
		$ads = $('div.goodloopad');
	}
	$ads.each(function(i) {
		var $div = $(this);
		// give everything an id
		var id = $div.attr('id');
		if ( ! id) {
			id = 'glad'+i; //Math.floor(Math.random()*1000000);
			$div.attr('id', id);
		}
		renderUnit(id, $div);
	});	
}
render();


});
