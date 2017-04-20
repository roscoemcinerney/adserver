package com.goodloop.data;

import lombok.Data;

/**
 * See https://schema.org/Thing
 * @author daniel
 *
 */
@Data
public class NGO extends Thing {
	
	String logo;
	/**
	 * A white+transparent logo for use on a dark background.
	 */
	String logo_white;
	/**
	 * The "primary" colour for this charity.
	 */
	String color;
	
}
