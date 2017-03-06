package com.goodloop.portal;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.elasticsearch.index.query.Operator;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;

import com.goodloop.data.Advert;
import com.google.gson.Gson;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.IESResponse;
import com.winterwell.es.client.IndexRequestBuilder;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.es.client.UpdateRequestBuilder;
import com.winterwell.utils.Dep;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.fields.JsonField;

public class AdvertServlet extends AServlet {

	public void process(WebRequest state) throws IOException {		
		// list?
		if (state.getSlug().contains("/list")) {
			doList(state);
			return;
		}
		// save?
		if (state.actionIs("save")) {
			doSave(state);
		}
		// return json?
		if (advert != null) {
			Gson gson = Dep.get(Gson.class);
			String json = gson.toJson(advert);
			JsonResponse output = new JsonResponse(state).setCargoJson(json);
			WebUtils2.sendJson(output, state);
			return;
		}
		JsonResponse output = new JsonResponse(state);
		WebUtils2.sendJson(output, state);
	}
	
	private void doList(WebRequest state) throws IOException {
		// copied from SoGive SearchServlet
		SearchRequestBuilder s = es.prepareSearch(config.advertIndex);
		String q = state.get("q");
		if ( q != null) {
			QueryBuilder qb = QueryBuilders.multiMatchQuery(q, 
					"id", "name", "keywords")
							.operator(Operator.AND);
			s.setQuery(qb);
		}
		// TODO paging!
		s.setSize(10000);
		SearchResponse sr = s.get();
		Map<String, Object> jobj = sr.getParsedJson();
		List<Map> hits = sr.getHits();
		List hits2 = Containers.apply(hits, h -> h.get("_source"));
		long total = sr.getTotal();
		String json = Dep.get(Gson.class).toJson(
				new ArrayMap(
					"hits", hits2, 
					"total", total
				));
		JsonResponse output = new JsonResponse(state).setCargoJson(json);
		WebUtils2.sendJson(output, state);
	}

	private void doSave(WebRequest state) {
		String json = state.get("vert");
		String id = state.getSlugBits(1);
//		if (id.endsWith(".json")) id = id.substring(0, id.length()-5); not needed - done in slug??
		Gson gson = Dep.get(Gson.class);
		advert = gson.fromJson(json, Advert.class);
		advert.validate();
		assert true;
		// new
		if ("new".equals(id)) {
			// make an id - just use the domain
			id = StrUtils.toCanonical(advert.url+" "+Utils.getRandomString(4));
			advert.id = id;			
			json = gson.toJson(advert);
			IndexRequestBuilder pu = es.prepareIndex(config.advertIndex, config.advertType, id);
			pu.setBodyJson(json);		
			IESResponse r = pu.get().check();
			System.out.println(r.getJson());
			return;
		}
		assert id.equals(advert.id);
		{	// update
			UpdateRequestBuilder pu = es.prepareUpdate(config.advertIndex, config.advertType, id);
			pu.setDoc(json);		
			IESResponse r = pu.get().check();
		}
	}

	Advert advert;
	
}
