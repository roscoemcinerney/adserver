package com.goodloop.adserver;

import org.eclipse.jetty.util.ajax.JSON;

import com.goodloop.data.Advert;
import com.google.gson.Gson;
import com.winterwell.utils.Dependency;
import com.winterwell.web.app.WebRequest;

public class PickAdvert {

	String ADS_BASE = "http://localas.good-loop.com/advert";
	
	private WebRequest state;
	
	private Advert advert;

	public PickAdvert(WebRequest state) {
		this.state = state;
	}

	public void run() {
		advert = new Advert();
		advert.campaign = "campaign1";
		advert.name = "Kerb1";
		advert.video = ADS_BASE+"/kerb-720p.m4v";
		advert.mobileVideo = ADS_BASE+"/kerb-360p.m4v";	
		advert.url = "http://www.kerbfood.com/markets/camden/";
		advert.poster = "http://www.kerbfood.com/wp-content/themes/kerb/images/logo.svg";
	}

	public String getJson() {
		Gson gson = Dependency.get(Gson.class);
		return gson.toJson(advert);
	}

}
