package com.goodloop.adserver;

import com.google.gson.FlexiGson;
import com.winterwell.utils.io.Option;

public class GLBaseConfig {

	@Override
	public String toString() {
		return getClass().getSimpleName()+FlexiGson.toJSON(this);
	}
	
	@Option
	public String adserverDomain;
	
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
