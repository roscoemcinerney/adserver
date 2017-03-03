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
import com.winterwell.utils.Dependency;
import com.winterwell.utils.IBuildStrings;
import com.winterwell.utils.Key;
import com.winterwell.utils.Printer;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.TodoException;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.Range;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.web.app.FileServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.fields.AField;
import com.winterwell.web.fields.Checkbox;
import com.winterwell.web.fields.JsonField;
import com.winterwell.web.fields.SField;
import com.goodloop.data.DB;
import com.goodloop.data.Publisher;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.gson.Gson;
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
	
	private String unitjs;

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doGet(req, resp);
	}
	
	public UnitHttpServlet() {
		unitjs = FileUtils.read(new File("adunit/unit.js"));
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
		Publisher adunit = DB.getAdUnit(state).get();
		if (adunit==null) {
			AdServerConfig config = Dependency.get(AdServerConfig.class);
			ESHttpClient es = Dependency.get(ESHttpClient.class);
			GetRequestBuilder gr = new GetRequestBuilder(es);
			gr.setIndex(config.publisherIndex).setType(config.publisherType).setId(Publisher.DEFAULT_ID);
			gr.setSourceOnly(true);
			GetResponse r = gr.get();
			Gson gson = Dependency.get(Gson.class);
			adunit = gson.fromJson(r.getSourceAsString());
		}
		String json = Dependency.get(Gson.class).toJson(adunit);
//		String charityJson = mc.getJson();		
		String charityMap = "var goodloop.adunit="+json+";";
		
		PickAdvert pa = new PickAdvert(state);
		pa.run();
		String advertJson = pa.getJson();
		String charityVar = "var goodloop.advert="+advertJson+";";
		
		String js = unitjs+charityMap+advertJson;
		
		// CORS? Assuming you've done security elsewhere
		WebUtils2.CORS(state, true);		
		// Respond
		state.getResponse().setContentType(WebUtils2.MIME_TYPE_JAVASCRIPT);
		BufferedWriter out = FileUtils.getWriter(state.getResponse().getOutputStream());
		out.write(js);
		FileUtils.close(out);
	}
}
