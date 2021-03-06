package com.goodloop.portal;

import java.io.File;

import com.goodloop.adserver.AdServerMain;
import com.goodloop.data.DB;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.log.LogFile;
import com.winterwell.utils.time.TUnit;
import com.winterwell.web.app.JettyLauncher;

/**
 * The Good-Loop AdServer PORTAL where you manage publishers & advertisers.
 * @author daniel
 *
 */
public class PortalMain {

	private static JettyLauncher jl;
		
	public static LogFile logFile = new LogFile(new File("portal.log"))
									.setLogRotation(TUnit.DAY.dt, 14);

	public static void main(String[] args) {		
		PortalConfig pc = AdServerMain.getConfig(new PortalConfig(), args);
		AdServerMain.init(pc);
		DB.init(pc);
		
		Log.i("Go!");
		assert jl==null;
		jl = new JettyLauncher(new File("web-portal"), pc.port);
		jl.setup();
		jl.addServlet("/*", new MasterHttpServlet());
		Log.i("web", "...Launching Jetty web server on port "+jl.getPort());
		jl.run();
		
		Log.i("Running...");
	}


}
