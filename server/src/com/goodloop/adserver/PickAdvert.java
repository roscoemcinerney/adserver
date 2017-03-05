package com.goodloop.adserver;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import org.eclipse.jetty.util.ajax.JSON;

import com.goodloop.data.Advert;
import com.goodloop.data.Publisher;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.gson.Gson;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.utils.Best;
import com.winterwell.utils.Dependency;
import com.winterwell.utils.TodoException;
import com.winterwell.utils.Utils;
import com.winterwell.web.app.WebRequest;

public class PickAdvert {

	
	private WebRequest state;
	
	private Advert advert;

	private ListenableFuture<Publisher> fpub;

	public PickAdvert(WebRequest state, ListenableFuture<Publisher> fpub) {
		this.state = state;
		this.fpub = fpub;
		Utils.check4null(state, fpub);
	}

	public void run() throws Exception {
		Publisher pub = fpub.get();
		ESHttpClient es = Dependency.get(ESHttpClient.class);
		AdServerConfig config = Dependency.get(AdServerConfig.class);
		SearchRequestBuilder s = es.prepareSearch(config.advertIndex);
		List<Map> ads = s.get().getHits();
		// TODO no results?? Make a default / pick from a remnant index
		if (ads==null || ads.isEmpty()) return;
		Best<Advert> bestAd = new Best<>();
		for (Map ad : ads) {
			// key words match
			System.out.println(ad);
		}
		advert = bestAd.getBest();
		throw new TodoException();
	}

	public String getJson() {
		Gson gson = Dependency.get(Gson.class);
		return gson.toJson(advert);
	}

}
