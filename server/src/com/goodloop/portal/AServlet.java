package com.goodloop.portal;

import com.winterwell.es.client.ESHttpClient;
import com.winterwell.utils.Dependency;

public class AServlet {

	ESHttpClient es;
	PortalConfig config;

	public AServlet() {
		es = Dependency.get(ESHttpClient.class);
		config = Dependency.get(PortalConfig.class);
	}
	
}
