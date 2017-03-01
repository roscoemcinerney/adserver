package com.goodloop.adserver;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.eclipse.jetty.util.ajax.JSON;

import com.winterwell.es.client.ESHttpClient;
import com.winterwell.utils.Dependency;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.web.app.WebRequest;

public class MyCharities {

	private List<Map> charities;
	private AdServerConfig config;
	private String domain;

	public MyCharities(WebRequest state) {
		domain = state.getFullDomain();		
		
	}

	public String getJson() {
		get();
		return JSON.toString(charities);
	}

	private void get() {
		// What charities does this publisher like?
		config = Dependency.get(AdServerConfig.class);
		ESHttpClient es = Dependency.get(ESHttpClient.class);
		String id = "charities_"+domain;
		Map<String, Object> cs = es.get(config.publisherIndex, "charities", id);
		if (cs==null) {
			cs = es.get(config.publisherIndex, "charities", "charities_default");
		}
		charities = (List<Map>) cs.get("charities");		
	}
	
//	var charities = [
//	             	{id:'Battersea Dogs & Cats Home', name:'Battersea Dogs & Cats Home', url:'https://www.battersea.org.uk/', logo: BURL+"mock-server/battersea-square-logo.png"},
//	             	{id:'Meningitis Foundation', name:'Meningitis Foundation', url:'http://www.meningitis.org', logo: BURL+"mock-server/meningitis_foundation_wider.png"},
//	             	{id:'Alzheimers Research UK', name:'Alzheimers Research UK', url:'http://www.alzheimersresearchuk.org/', logo:BURL+"mock-server/alzheimers_research_square.png"},
//	             	// {id:'batterseadogs', name:'Cancer Research UK', logo:BURL+"mock-server/Cancer_Research_UK.svg"},
//	             	// Battersea Cats & Dogs, Meningitis Research Foundation and probably Alzheimer's Research UK.
//	             ];
}
