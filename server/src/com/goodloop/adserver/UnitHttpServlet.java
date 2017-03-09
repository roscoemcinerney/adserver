package com.goodloop.adserver;

import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.net.URLDecoder;
import java.util.*;
import java.util.concurrent.ExecutionException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.util.ajax.JSON;

import com.winterwell.utils.log.Log;
import com.winterwell.utils.time.Time;
import com.winterwell.utils.BestOne;
import com.winterwell.utils.Dep;
import com.winterwell.utils.IBuildStrings;
import com.winterwell.utils.Key;
import com.winterwell.utils.Printer;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.TodoException;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.Range;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.utils.io.UpToDateTextFile;
import com.winterwell.web.app.FileServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.fields.AField;
import com.winterwell.web.fields.Checkbox;
import com.winterwell.web.fields.JsonField;
import com.winterwell.web.fields.SField;
import com.goodloop.data.DB;
import com.goodloop.data.Publisher;
import com.google.common.util.concurrent.ListenableFuture;
import com.winterwell.datalog.DataLog;
import com.winterwell.datascience.Experiment;
import com.winterwell.depot.Desc;
import com.winterwell.es.client.DeleteByQueryRequestBuilder;
import com.winterwell.es.client.DeleteRequestBuilder;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.GetRequestBuilder;
import com.winterwell.es.client.GetResponse;
import com.winterwell.es.client.IESResponse;
import com.winterwell.es.client.IndexRequestBuilder;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.es.client.UpdateRequestBuilder;
import com.winterwell.gson.Gson;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.ListMap;
import com.winterwell.utils.web.SimpleJson;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.WebEx;
import com.winterwell.web.WebInputException;
import com.winterwell.web.WebPage;
import com.winterwell.web.ajax.JsonResponse;

/**
 * Serve the adunit
 */
public class UnitHttpServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	private UpToDateTextFile unitjs;

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doGet(req, resp);
	}
	
	public UnitHttpServlet() {
		unitjs = new UpToDateTextFile(new File("adunit/original.unit.js"));
	}
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		try {
			WebRequest request = new WebRequest(null, req, resp);
			Log.d("servlet", request);
			doServeUnitJs(request);
//			String path = request.getRequestPath();
//			if (path.startsWith("/foo")) {
		} catch(Throwable ex) {
			ex.printStackTrace();
			Log.e("error", ex);
			WebUtils2.sendError(500, "Server Error: "+ex, resp);
		}
	}

	
	
	private void doServeUnitJs(WebRequest state) throws Exception {
		Log.d("unit", state);
		AdServerConfig config = Dep.get(AdServerConfig.class);
		ListenableFuture<Publisher> fpub = DB.getAdUnit(state);
		Publisher adunit = fpub.get();
		if (adunit==null) {
			// make a new publisher
			adunit = new Publisher();			
			String ref = state.getReferer();
			adunit.domain = WebUtils2.getDomain(ref);
			adunit.validate();
			ESHttpClient es = Dep.get(ESHttpClient.class);
			es.debug = true;
			String id = Publisher.idFromDomain(WebUtils2.getDomain(state.getReferer()));
			adunit.id = id;			
			IndexRequestBuilder pi = es.prepareIndex(config.publisherIndex, config.publisherType, id);
			Gson gson = Dep.get(Gson.class);
			String json = gson.toJson(adunit);
			pi.setBodyJson(json);
			pi.execute();
			Log.d("unit", "create Publisher: "+json);
		}
		Log.d("unit", "Publisher: "+adunit);
		
		// on or off?
		if ( ! adunit.active) {
			if (state.getReferer() == null || ! state.getReferer().contains("goodloop=")) {
				// off
				Log.d("unit.off", "Not active "+state.getReferer()+" "+adunit.id);
				WebUtils2.sendError(401, "Good-Loop adunit isn't active for this site - Please contact Good-Loop to activate it.", state.getResponse());
				return;
			}			
		}
		
		String json = Dep.get(Gson.class).toJson(adunit);
//		String charityJson = mc.getJson();		
		String charityMap = "\ngoodloop.unit="+json+";";
		
		PickAdvert pa = new PickAdvert(state, fpub);
		pa.run();
		
		if (pa.advert==null) {
			// TODO fallback tag or url if provided
			// send http 503 error
			WebUtils2.sendError(503, "Sorry we dont have an advert for you today.", state.getResponse());
			return;
		}
		Log.d("unit", "Advert: "+pa.advert);
		
		String advertJson = pa.getJson();
		Log.d("unit", "Advert-json: "+advertJson);
		String charityVar = "\ngoodloop.vert="+advertJson+";\n";
		
		String initjs = "if ( ! window.goodloop) window.goodloop={}; goodloop.BURL='//"
				+config.adserverDomain+"/'; goodloop.LBURL='//"+config.datalogDomain+"'; ";
		Log.d("unit", "config: "+config);
		Log.d("unit", "vars: "+initjs);
		String js = initjs+charityMap+charityVar+unitjs;
		
		// CORS? Assuming you've done security elsewhere
		WebUtils2.CORS(state, true);		
		// Respond
		state.getResponse().setContentType(WebUtils2.MIME_TYPE_JAVASCRIPT);
		BufferedWriter out = FileUtils.getWriter(state.getResponse().getOutputStream());
		out.write(js);
		FileUtils.close(out);
	}
}
