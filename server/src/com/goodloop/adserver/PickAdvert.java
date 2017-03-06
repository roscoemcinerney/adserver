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
import com.winterwell.utils.Dep;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.TodoException;
import com.winterwell.utils.Utils;
import com.winterwell.utils.log.Log;
import com.winterwell.web.app.WebRequest;

public class PickAdvert {

	
	private WebRequest state;
	
	Advert advert;

	private ListenableFuture<Publisher> fpub;

	public PickAdvert(WebRequest state, ListenableFuture<Publisher> fpub) {
		this.state = state;
		this.fpub = fpub;
		Utils.check4null(state, fpub);
	}

	public void run() throws Exception {
		Publisher pub = fpub.get();
		ESHttpClient es = Dep.get(ESHttpClient.class);
		AdServerConfig config = Dep.get(AdServerConfig.class);
		SearchRequestBuilder s = es.prepareSearch(config.advertIndex);
		List<Advert> ads = s.get().getSearchResults();
		// TODO no results?? Make a default / pick from a remnant index
		if (ads==null || ads.isEmpty()) return;
		Best<Advert> bestAd = new Best<>();
		for (Advert ad : ads) {
			double score = ad.maxBid==null? 0.01 : ad.maxBid.getValue();
			// key words match?
			List<String> keywords = StrUtils.split(ad.keywords);
			boolean ok = true;
			for (String kw : keywords) {
				if (pub.keywords==null || ! StrUtils.containsIgnoreCase(pub.keywords, kw)) {
					Log.d("PickAdvert", "Skip "+ad+" for "+pub);
					ok = false;
					break;
				}				
			}
			if (ok) {
				bestAd.maybeSet(ad, score);
			}
		}
		advert = bestAd.getBest();
	}

	public String getJson() {
		Gson gson = Dep.get(Gson.class);
		return gson.toJson(advert);
	}

}
