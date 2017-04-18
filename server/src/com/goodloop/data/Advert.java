package com.goodloop.data;

import lombok.Data;

//TODO pick mobile/desktop video
//TODO adserver prepends this
//TODO use VAST format
//var advert = {
//	campaign:'campaign1',
//	name: "Kerb",
//	video: BURL+"mock-server/kerb-720p.m4v",
//	mobileVideo: BURL+"mock-server/kerb-360p.m4v",	
//	url: 'http://www.kerbfood.com/markets/camden/',
//	poster: 'http://www.kerbfood.com/wp-content/themes/kerb/images/logo.svg',
//};

@Data
public class Advert extends Thing {

	@Override
	public String toString() {
		return "Advert [keywords=" + keywords + ", maxBid=" + maxBid + ", active=" + active + ", name=" + name
				+ ", url=" + url + ", id=" + id + "]";
	}
	public String logo;
	public String campaign;
	public String video;
	public String mobileVideo;
	public String poster;
	public String keywords;	
	/**
	 * The maximum bid for a spot that matches the keywords (but without other info)
	 */
	public MonetaryAmount maxBid;
	public boolean active;
	
}
