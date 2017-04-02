
$(function(){
// Installed on the page already?
if (goodloop.installed) return;
goodloop.installed = true;

// no ads for this page?
if ($('.good-loop-adblock').length !== 0) {
	return; 
}

// Tracking Pixel
datalog.track();

// TODO Insert style sheet

// Make the adverts!
// TODO do we have to release control to let the page-load finish?? Or does <script async> cover that?
// setTimeout(function() {
	// TODO support ad units added dynamically
function render() {
	$('div.goodloopad').each(function(i) {
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

// TODO size based instead?
function isMobile() {
	return !!(navigator.userAgent.match('/mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry/i'));
}

function getCharityId($div) {
	return $div.data('cid');
}
function setCharityId($div, charityId) {
	return $div.data('cid', charityId);
}

function renderUnit(id, $div) {
	console.log(this, $div, $div.width(), 'x', $div.height());
	// pick format
	var format = pickFormat($div);
	// done?
	var done = $div.data('done');
	if (done) {
		var cname = getCharityId($div);
		var tqhtml = "TODO Thank You";
		$div.html(tqhtml);
		return;	
	}
	// show offer
	var html = goodloop.html[format];
	$div.html(html);
}

function pickFormat($div) {
	var format;
	if (isMobile()) {
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

function startVideo() {

}

function pick(charitydiv) {
	var KEYCODE_ESC = 27;
	var cname = $(charitydiv).data('charity');
	var curl = $(charitydiv).data('charity-url');

	pickedCharity = cname;
	// TODO record the click

	// TODO select an ad (actually, maybe do this in the background)

	// display it
	//  crossorigin='use-credentials'


	$adcontents.css('margin-top', mt);
	var closeButton = $('<div style="margin:10pt;cursor:pointer;padding:0px;float:right;font-size:18pt;color:#ccc;" onclick="goodloop.skip();">&times;</div>');
	var $header = $('<div style="font-size:20pt;"">'+goodloop.vert.name+' will fund your donation to '+cname+'</div>');
	$adcontents.empty().append($header);
	$adcontents.prepend(closeButton);
	$(document).on('keyup.goodloop', function(event) {
		if(event.which === KEYCODE_ESC) {
			goodloop.skip();	
		}
	});

	// poster='"+(advert.poster||'')+"'
	
	var adEnd = new Date().getTime() + adSecs*1000;
	$adcontents.append('<div id="skip" style="padding:0px;margin:10px; font-size:20pt;"></div>');
	setTimeout(function(){skipDown(adEnd);}, 100);

	// Put the element in the DOM, but keep it hidden until we've set the video height
	$vidbox.css('max-width', $(window).width());
	$vidbox.css('visibility', 'hidden');
	$vidbox.css('display', 'block');

	// The video-less box is in place - use it to work out how big the video should be
	var mw = Math.min($(window).width(), 1280);
	var mh = Math.min($(window).height() * 0.8, 720);
	var mt = Math.round(Math.max(0, ($(window).height() - $vidbox.height()) / 2));
	var vidurl = isMobile()? goodloop.vert.mobileVideo : goodloop.vert.video;
	var $video = $('<video autoplay style="max-width:'+mw+'px;max-height:'+mh+'px;" preload="metadata" src="'+vidurl+'"></video>');
	var $avid = $('<a href="'+goodloop.vert.url+'" onclick="goodloop.clickthru();" target="_blank" rel="nofollow"></a>');
	$avid.append($video);
	$header.after($avid);
	$vidbox.css('visibility', 'visible');

	$video[0].addEventListener('ended', function(event) {
		// fix lightbox height before we start moving elements around
		// ??@Roscoe: height=height? Why is this needed? ^Dan
		var acHeight = $adcontents.height();
		$adcontents.css('height', acHeight + 'px');

		// shrink video
		$video.css('max-width', '50%');
		$video.css('display', 'inline-block');
		$adcontents.empty().append($video.detach());

		// add thank-you page
		$adcontents.prepend(closeButton);
		var $thankYou = $('<div style="display:inline-block; font-size:20pt; margin:20px; vertical-align:top;"></div>');
		$thankYou.append($('<div style="margin:10px;">Thanks for your donation!</div>'));
		$thankYou.append($('<div style="margin:10px;"><a href="#" onclick="goodloop.skip();">Return to page</a></div>'));
		$thankYou.append($('<div style="margin:10px;"><a href="'+goodloop.vert.url+'" target="_blank" rel="nofollow" onclick="goodloop.clickthru(this);">Go to ' + goodloop.vert.name + '</a></div>'));
		$thankYou.append($('<div style="margin:10px;"><a href="' + curl + '" target="_blank" rel="nofollow" onclick="goodloop.clickthru(this);">Go to ' + cname + '</a></div>'));
		$thankYou.append($('<div style="margin:10px; font-size:75%;"><a href="http://www.good-loop.com/" target="_blank" onclick="goodloop.clickthru(this);">Find out more about Good-Loop</a></div>'));
		$adcontents.append($thankYou);
	}.bind(this));

	$video[0].play();
	startTime = new Date().getTime();

	// display our custom end-frame?? SHrink the video and give more donation details
	// document.getElementById('myVideo').addEventListener('ended',myHandler,false);
	var dataspace = 'goodloop';
	datalog.log(dataspace, 'pick', {
			publisher: publisher,
			charity: pickedCharity,
			variant: variant
	}, true);
}

/**
 * Called when the video view is complete (i.e. after 14 seconds)
 */
function viewed() {
	// TODO adunit specific
	Cookies.set('charity', pickedCharity, { expires: expires });
	// log with base
	var dataspace = 'goodloop';
	datalog.log(dataspace, 'adview', {
			campaign: goodloop.vert.campaign,
			publisher: publisher,
			charity: pickedCharity,
			variant: variant,
			view: 'complete'
		}, true);
	// replace the adunits with a thank you
	render();
}

function clickthru(el) {
	// default
	var url = goodloop.vert.url;
	// click came from a link?
	const href = $(el).attr('href');
	if (href) url = href;
	// log the click
	var dataspace = 'goodloop';
	datalog.log(dataspace, 'click', {
			publisher: publisher,
			variant: variant,
			url: url
	}, true);
	// window.location = url; this wouldn't open a new tab :(
	return true;
}

function skip() {
	$vidbox.css('display','none');
	$('video', $vidbox).remove();
	var viewtime = startTime? (new Date().getTime() - startTime)/1000 : 0;
	// log it
	datalog.log('goodloop', 'skip', {
		publisher: publisher,
		campaign: goodloop.vert.campaign, 
		viewtime: viewtime,
		variant: variant
	}, true);
	$(document).off('keyup.goodloop');
}

function hideUnit() {
	$('.goodloop-adunit').css('display', 'none');
}

function skipDown(adEnd) {	
	var s = Math.ceil((adEnd - new Date().getTime()) / 1000.0);
	if (s > 0) {
		$('#skip').text("Donation in "+s+"s")
		if ($vidbox.css('display') !== 'none') {
			setTimeout(function(){skipDown(adEnd);}, 100);
		}
	} else {
		$('#skip').text("Thanks! Your donation has been made.");
		viewed();
		$('#skip').click(skip);
	}
}

});
