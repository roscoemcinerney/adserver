if ( ! window.goodloop) window.goodloop = {};
goodloop.BURL= '';
goodloop.LBURL= '';

goodloop.publisher = window.location.hostname;

goodloop.variant = {
	adsecs: 9 // TODO explore the effect of 5-15 seconds
};

// Thank You (and no repeat) valid across this site for 1 minute TODO 1 day
goodloop.expires = 1.0 / (24*60);
