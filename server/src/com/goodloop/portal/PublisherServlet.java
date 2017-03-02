package com.goodloop.portal;

import java.io.IOException;

import com.goodloop.data.Publisher;
import com.google.gson.Gson;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.IESResponse;
import com.winterwell.es.client.IndexRequestBuilder;
import com.winterwell.es.client.UpdateRequestBuilder;
import com.winterwell.utils.Dependency;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.fields.JsonField;

public class PublisherServlet extends AServlet {

	public void process(WebRequest state) throws IOException {		
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
	
	private void doSave(WebRequest state) {
		String json = state.get("publisher");
		String id = state.getSlugBits(1);
//		if (id.endsWith(".json")) id = id.substring(0, id.length()-5); not needed - done in slug??
		// new
		if ("new".equals(id)) {
			Gson gson = Dependency.get(Gson.class);
			publisher = gson.fromJson(json, Publisher.class);
			publisher.id = StrUtils.toCanonical(publisher.name.trim());			
			IndexRequestBuilder pu = es.prepareIndex(config.publisherIndex, "publisher", id);
			pu.setSource(json);		
			IESResponse r = pu.get().check();
			System.out.println(r.getJson());
			return;
		}
		// update
		UpdateRequestBuilder pu = es.prepareUpdate(config.publisherIndex, "publisher", id);
		pu.setDoc(json);		
		IESResponse r = pu.get().check();
		System.out.println(r.getJson());
	}

	Publisher publisher;
	
}
