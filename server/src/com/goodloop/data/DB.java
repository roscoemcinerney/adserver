package com.goodloop.data;

import java.io.File;
import java.util.Arrays;
import java.util.Map;
import java.util.logging.Level;

import com.winterwell.utils.io.SqlUtils;
import com.goodloop.adserver.GLBaseConfig;
import com.winterwell.es.ESType;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.IESResponse;
import com.winterwell.es.client.IndexRequestBuilder;
import com.winterwell.es.client.admin.CreateIndexRequest;
import com.winterwell.es.client.admin.PutMappingRequestBuilder;
import com.winterwell.utils.Dependency;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.io.ArgsParser;
import com.winterwell.utils.io.DBUtils.DBOptions;
import com.winterwell.utils.log.Log;
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

	public static void init() {
		ESHttpClient es = Dependency.get(ESHttpClient.class);
		GLBaseConfig config = Dependency.get(GLBaseConfig.class);
		
		CreateIndexRequest pi = es.admin().indices().prepareCreate(config.publisherIndex);
		IESResponse r = pi.get();
		
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
		
		
		IndexRequestBuilder prepIndex = es.prepareIndex(config.publisherIndex, "charities", "charities_default");
		Map msrc = new ArrayMap(
				// 3 of the largest
				"charities", Arrays.asList(
						new ArrayMap("id", "oxfam", "name", "Oxfam", 
								"url", "https://www.oxfam.org", 
								"logo", "https://www.oxfam.org/sites/all/themes/oxfamzen/logo.png"),
						new ArrayMap("id", "save-the-children", "name", "Save the Children", 
								"url", "http://www.savethechildren.org.uk/", 
								"logo", "http://www.savethechildren.org.uk/sites/all/themes/freshlime/img/save_the_children_logo.png"),
						new ArrayMap("id", "cancer-research-uk", "name", "Cancer Research UK", 
								"url", "http://www.cancerresearchuk.org/", 
								"logo", "http://www.cancerresearchuk.org/sites/all/themes/custom/cruk/logo.png")
						)
				);
		prepIndex.setSource(msrc);
		IESResponse resp = prepIndex.get().check();
	}

	public static Person getUser(XId id) {
		ESHttpClient es = Dependency.get(ESHttpClient.class);
		Map<String, Object> person = es.get("sogive", "user", id.toString());
		return (Person) person;
	}
}
