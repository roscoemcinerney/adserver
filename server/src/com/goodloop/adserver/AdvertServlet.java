package com.goodloop.adserver;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.winterwell.web.app.WebRequest;

/**
 * Handles /api/advert requests, for advert.html
 * @author daniel
 *
 */
public class AdvertServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		WebRequest state = new WebRequest(this, req, resp);
		String ad = state.getSlug();
		// Get the advert
		
		
	}
	
}
