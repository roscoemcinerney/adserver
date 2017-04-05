// Depends on:
// - zepto
// - goodloop.vert

$(function(){
// Installed on the page already?
if (goodloop.installed) return;
goodloop.installed = true;

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
if (typeof($sf) !== 'undefined') {
	goodloop.sfHandler = function(status, data) {
		console.log("#sfHandler", status, data);
		if (status==='expanded') {			
			$('#gdlpid .videobox').show();
		}
	};
	$sf.register(goodloop.vert.w, goodloop.vert.h, goodloop.sfHandler);
} else {
	window.$sf = false; // easier tests later
}


// STATE
goodloop.state = {
	/** Your chosen charity */
	charity: {},
	done: false,
	/** If you pause & restart, this is the restart time. */
	startTime: null,
	/** If you pause, this is the previously elapsed time. */
	elapsed: 0,
};


// Tracking Pixel
datalog.track();

function renderUnit(id, $div) {
	console.log(this, $div, $div.width(), 'x', $div.height());
	// pick format
	var format = pickFormat($div);
	// done?
	var done = goodloop.state.done;
	if (done) {
		var tqhtml = goodloop.html[format+"_tq"]();
		$div.html(tqhtml);
		return;	
	}
	// show offer
	var html = goodloop.html[format]();
	$div.html(html);
}

function pickFormat($div) {
	var format;
	if (goodloop.env.isMobile) {
		format = $div.data('mobile-format');
		// TODO set by publisher info? To allow eg the blogger to say "I dont like stickys" without reinstalling the tag.
		if (format) {
			return format.toLowerCase().replace(/\W/, '');
		}
		return 'sticky-bottom';
	}
	format = $div.data('format');
	// TODO set by publisher info? To allow eg the blogger to say "I dont like stickys" without reinstalling the tag.
	if (format) {
		return format.toLowerCase().replace(/\W/, '');
	}
	// space?
	var w = $div.width();
	if (w >= 728) {
		return 'leaderboard';
	}
	return 'mediumrectangle';
}


// Make the adverts!
// TODO do we have to release control to let the page-load finish?? Or does <script async> cover that?
// setTimeout(function() {
	// TODO support ad units added dynamically
function render() {
	var $ads = $('div.goodloopad');
	if ($ads.length==0 && $sf) {
		$('body').append('<div class="goodloopad"></div>');
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
