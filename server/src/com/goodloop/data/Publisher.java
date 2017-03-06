package com.goodloop.data;

import java.util.List;

import com.winterwell.utils.web.WebUtils2;

public class Publisher extends Thing {

	public static final String DEFAULT_ID = "default_publisher";

	public boolean active;
	
	/**
	 * e.g. bbc.co.uk 
	 */
	public String domain;
	/**
	 * e.g. www.bbc.co.uk
	 */
	public String host;
	String owner;
	String keywords;
	
	NGO charity0;
	NGO charity1;
	NGO charity2;
	
	
	public void validate() {
		if (domain==null && url!=null) {
			domain = WebUtils2.getDomain(url);
		}
		if (this.domain!=null) {
			this.domain = WebUtils2.getDomain(domain);
			this.host = WebUtils2.getHost(domain);			
		}
		if (name==null) name = host;
	}


	public static String idFromDomain(String domain) {
		return domain;
	}
	
}
