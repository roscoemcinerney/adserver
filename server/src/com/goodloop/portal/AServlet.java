package com.goodloop.portal;

import com.winterwell.es.client.ESHttpClient;
import com.winterwell.utils.Dep;

public class AServlet {

	ESHttpClient es;
	PortalConfig config;

	public AServlet() {
		es = Dep.get(ESHttpClient.class);
		config = Dep.get(PortalConfig.class);
	}
	
}
