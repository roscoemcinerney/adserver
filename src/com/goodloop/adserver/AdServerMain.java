package com.goodloop.adserver;

import java.io.File;

import com.winterwell.datalog.server.DataLogServer;
import com.winterwell.datalog.server.DataLogSettings;
import com.winterwell.datalog.server.MasterHttpServlet;
import com.winterwell.utils.io.ArgsParser;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.log.LogFile;
import com.winterwell.utils.time.TUnit;
import com.winterwell.web.app.JettyLauncher;

/**
 * TODO
 * @author daniel
 *
 */
public class AdServerMain {

	private static JettyLauncher jl;
		
	public static LogFile logFile = new LogFile(new File("adserver.log"))
									.setLogRotation(TUnit.DAY.dt, 14);

	public static AdServerSettings settings;

	public static void main(String[] args) {
		settings = ArgsParser.getConfig(new AdServerSettings(), args, new File("config/adserver.properties"), null);

		logFile = new LogFile(DataLogServer.settings.logFile)
					// keep 8 weeks of 1 week log files ??revise this??
					.setLogRotation(TUnit.WEEK.dt, 8);

		Log.i("Go!");
		assert jl==null;
		jl = new JettyLauncher(new File("web"), settings.port);
		jl.setup();
		jl.addServlet("/*", new MasterHttpServlet());
		Log.i("web", "...Launching Jetty web server on port "+jl.getPort());
		jl.run();

		Log.i("Running...");
	}


}
