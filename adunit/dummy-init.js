if ( ! window.goodloop) window.goodloop = {};
goodloop.BURL='//as.good-loop.com/'; 
goodloop.LBURL='//lg.good-loop.com'; 

goodloop.publisher = {
	"active":true,
	"domain":"good-loop.com",
	"id":"good-loop.com"
};

goodloop.vert = {
	"campaign":"real campaign :)",
	"video":"https://as.good-loop.com/vert/kerb-480p.m4v",
	"mobileVideo":"https://as.good-loop.com/vert/kerb-288p.m4v",
	"name":"Kerb",
	"url":"http://kerbfood.com",
	"id":"egpub good loop com yhxz"
};

goodloop.charities = [
	{"logo":"https://logo.clearbit.com/shelter.org.uk","name":"Shelter","url":"http://shelter.org.uk","id":"shelter"},
	{"logo":"http://as.good-loop.com/vert/alzheimers_research.png","name":"Alzheimer\u0027s Research","url":"http://www.alzheimersresearchuk.org/","id":"alzheimers"},
	{"logo":"http://as.good-loop.com/vert/Battersea_Dogs_\u0026_Cats_Home_logo.png","name":"Battersea Dogs \u0026 Cats Home","url":"https://www.battersea.org.uk/","id":"battersea-dogs"},
];

goodloop.variant = {
	adsecs: 9 // TODO explore the effect of 5-15 seconds
};

// Thank You (and no repeat) valid across this site for 1 minute TODO 1 day
goodloop.expires = 1.0 / (24*60);
