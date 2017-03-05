package com.goodloop.adserver;

import com.winterwell.utils.io.Option;

public class GLBaseConfig {

	@Option
	public String adserverDomain = "localas.good-loop.com";
	@Option 
	public String datalogDomain = "lg.good-loop.com";

	public String adserverUrl() { return "http://"+adserverDomain+"/"; }
	
	public String advertBaseUrl() { return adserverUrl()+"advert"; }
	
	public String publisherIndex = "publisher";
	public String publisherType = "Publisher";

	/**
	 * TODO a fast index of exactly what the adunit needs, duplicating but streamlining info from the publisherIndex
	 */
	public String unitIndex = "adunit";
	public String unitType = "AdUnit";

	
	public String advertiserIndex = "advertiser";
	public String advertiserType = "Advertiser";

	
	public String advertIndex = "advert";
	public String advertType = "Advert";
	public String campaignType = "Campaign";

	
}
