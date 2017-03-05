package com.goodloop.data;

import java.io.File;
import java.util.Arrays;
import java.util.Map;
import java.util.logging.Level;

import com.winterwell.utils.io.SqlUtils;
import com.goodloop.adserver.GLBaseConfig;
import com.goodloop.portal.PortalConfig;
import com.google.common.base.Function;
import com.google.common.util.concurrent.FutureCallback;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.gson.Gson;
import com.winterwell.es.ESType;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.ESHttpResponse;
import com.winterwell.es.client.GetRequestBuilder;
import com.winterwell.es.client.IESResponse;
import com.winterwell.es.client.IndexRequestBuilder;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.es.client.admin.CreateIndexRequest;
import com.winterwell.es.client.admin.PutMappingRequestBuilder;
import com.winterwell.utils.Dependency;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.io.ArgsParser;
import com.winterwell.utils.io.DBUtils.DBOptions;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;

/**
 * What do we store in SQL? Low latency stuff.
 * 
 *  - Transactions
 *  - Is that it?
 *  
 * @author daniel
 *
 */
public class DB {

	public static void init(GLBaseConfig config) {
		ESHttpClient es = Dependency.get(ESHttpClient.class);
		Gson gson = Dependency.get(Gson.class);
		
		for(String index : new String[]{config.publisherIndex, config.advertIndex}) {
			CreateIndexRequest pi = es.admin().indices().prepareCreate(index);
			IESResponse r = pi.get();
		}				
		
		// default publisher
		Publisher dpub = es.get(config.publisherIndex, config.publisherType, Publisher.DEFAULT_ID, Publisher.class);
		if (dpub==null) {
			dpub = new Publisher();
			dpub.id = Publisher.DEFAULT_ID;
			IndexRequestBuilder pi = es.prepareIndex(config.publisherIndex, config.publisherType, Publisher.DEFAULT_ID);
			pi.setSource(gson.toJson(dpub));
			pi.execute();
		}
		// default advert
		SearchRequestBuilder s = es.prepareSearch(config.advertIndex);
		SearchResponse sr = s.get();
		if (sr.getTotal() == 0) {
			Advert advert = new Advert();
			advert.active = true;
			advert.campaign = "campaign1";
			advert.name = "Kerb1";
			advert.video = config.advertBaseUrl()+"/kerb-720p.m4v";
			advert.mobileVideo = config.advertBaseUrl()+"/kerb-360p.m4v";	
			advert.url = "http://www.kerbfood.com/markets/camden/";
			advert.poster = "http://www.kerbfood.com/wp-content/themes/kerb/images/logo.svg";
			advert.maxBid = new MonetaryAmount(60);
		}
		
//		PutMappingRequestBuilder pm = es.admin().indices().preparePutMapping(config.publisherIndex, "website");
//		ESType dtype = new ESType();
//		dtype.property("from", new ESType().keyword());
//		dtype.property("to", new ESType().keyword());
//		dtype.property("time", new ESType().date());
//		pm.setMapping(dtype);
//		IESResponse r2 = pm.get();
//		r2.check();
		
//		DBOptions options = ArgsParser.getConfig(new DBOptions(), 
//									new File("config/sogive.properties"));
//		SqlUtils.setDBOptions(options);
		
		
//		IndexRequestBuilder prepIndex = es.prepareIndex(config.publisherIndex, "charities", "charities_default");
//		Map msrc = new ArrayMap(
//				// 3 of the largest
//				"charities", Arrays.asList(
//						new ArrayMap("id", "oxfam", "name", "Oxfam", 
//								"url", "https://www.oxfam.org", 
//								"logo", "https://www.oxfam.org/sites/all/themes/oxfamzen/logo.png"),
//						new ArrayMap("id", "save-the-children", "name", "Save the Children", 
//								"url", "http://www.savethechildren.org.uk/", 
//								"logo", "http://www.savethechildren.org.uk/sites/all/themes/freshlime/img/save_the_children_logo.png"),
//						new ArrayMap("id", "cancer-research-uk", "name", "Cancer Research UK", 
//								"url", "http://www.cancerresearchuk.org/", 
//								"logo", "http://www.cancerresearchuk.org/sites/all/themes/custom/cruk/logo.png")
//						)
//				);
//		prepIndex.setSource(msrc);
//		IESResponse resp = prepIndex.get().check();
	}

	public static Person getUser(XId id) {
		ESHttpClient es = Dependency.get(ESHttpClient.class);
		Map<String, Object> person = es.get("sogive", "user", id.toString());
		return (Person) person;
	}

	static GLBaseConfig config;
	
	public static ListenableFuture<Publisher> getAdUnit(WebRequest state) {
		ESHttpClient es = Dependency.get(ESHttpClient.class);		
		String id = Publisher.idFromDomain(WebUtils2.getDomain(state.getReferer()));
		GetRequestBuilder gr = new GetRequestBuilder(es);
		gr.setIndex(config.publisherIndex).setType(config.publisherType).setId(id);
		gr.setSourceOnly(true);
		Gson gson = Dependency.get(Gson.class);
		ListenableFuture<ESHttpResponse> f = gr.execute();
		ListenableFuture<Publisher> f2 = Futures.transform(f, res -> gson.fromJson(res.getSourceAsString()));		
		return f2;
	}
}
