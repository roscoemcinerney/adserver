package com.goodloop.portal;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.eclipse.jetty.util.ajax.JSON;
import org.elasticsearch.index.query.Operator;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;

import com.goodloop.data.Publisher;
import com.google.gson.Gson;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.IESResponse;
import com.winterwell.es.client.IndexRequestBuilder;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.es.client.UpdateRequestBuilder;
import com.winterwell.utils.Dependency;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.WebEx;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.fields.JsonField;

public class PublisherServlet extends AServlet {

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
		if (publisher != null) {
			Gson gson = Dependency.get(Gson.class);
			String json = gson.toJson(publisher);
			JsonResponse output = new JsonResponse(state).setCargoJson(json);
			WebUtils2.sendJson(output, state);
			return;
		}
		JsonResponse output = new JsonResponse(state);
		WebUtils2.sendJson(output, state);
	}
	
	private void doList(WebRequest state) throws IOException {
		// copied from SoGive SearchServlet
		SearchRequestBuilder s = es.prepareSearch(config.publisherIndex);
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
		List hits2 = Containers.apply(h -> h.get("_source"), hits);
		long total = sr.getTotal();
		String json = Dependency.get(Gson.class).toJson(
				new ArrayMap(
					"hits", hits2, 
					"total", total
				));
		JsonResponse output = new JsonResponse(state).setCargoJson(json);
		WebUtils2.sendJson(output, state);
	}

	private void doSave(WebRequest state) {
		String json = state.get("publisher");
		String id = state.getSlugBits(1);
//		if (id.endsWith(".json")) id = id.substring(0, id.length()-5); not needed - done in slug??
		Gson gson = Dependency.get(Gson.class);
		publisher = gson.fromJson(json, Publisher.class);
		JSON.parse(json);
		publisher.validate();
		assert true;
		// new
		if ("new".equals(id)) {
			if (Utils.isBlank(publisher.domain)) {
				throw new WebEx.E400("No domain for publisher?! "+json);
			}
			// make an id - just use the domain
			id = Publisher.idFromDomain(publisher.domain);
			publisher.id = id;			
			json = gson.toJson(publisher);
			IndexRequestBuilder pu = es.prepareIndex(config.publisherIndex, config.publisherType, id);
			pu.setSource(json);		
			IESResponse r = pu.get().check();
			System.out.println(r.getJson());
			return;
		}
		assert id.equals(publisher.id);
		{	// update
			UpdateRequestBuilder pu = es.prepareUpdate(config.publisherIndex, config.publisherType, id);
			pu.setDoc(json);		
			IESResponse r = pu.get().check();
		}
	}

	Publisher publisher;
	
}
