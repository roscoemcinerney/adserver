if ( ! window.goodloop) window.goodloop = {};
goodloop.BURL='//localas.good-loop.com/'; //not needed??
goodloop.LBURL='//locallg.good-loop.com'; 

goodloop.publisher = {
	"active":true,
	"domain":"good-loop.com",
	"id":"good-loop.com"
};

goodloop.vert = {
	// WTF? SafeFrame makes you declare width & height upfront to get callbacks
	w: 720, h:90,
	"campaign":"real campaign :)",
	"video":"https://as.good-loop.com/vert/kerb-480p.m4v",
	"mobileVideo":"https://as.good-loop.com/vert/kerb-288p.m4v",
	"name":"Kerb",
	"url":"http://kerbfood.com",
	"logo": "ad-logo@2x.png",
	"id":"egpub good loop com yhxz"
};

goodloop.charities = [
	{"logo":"https://logo.clearbit.com/shelter.org.uk","name":"Shelter","url":"http://shelter.org.uk","id":"shelter", "photo":"image_shelter.jpg"},
	{"logo":"http://as.good-loop.com/vert/alzheimers_research.png","name":"Alzheimer\u0027s Research","url":"http://www.alzheimersresearchuk.org/","id":"alzheimers"},
	{"logo":"http://as.good-loop.com/vert/Battersea_Dogs_\u0026_Cats_Home_logo.png","name":"Battersea Dogs \u0026 Cats Home","url":"https://www.battersea.org.uk/","id":"battersea-dogs"},
];

goodloop.variant = {
	adsecs: 5, // TODO explore the effect of 5-15 seconds
	expln: "Give a donation by watching an advert"
};

