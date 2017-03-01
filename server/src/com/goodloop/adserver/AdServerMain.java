package com.goodloop.adserver;

import java.io.File;

import com.goodloop.data.DB;
import com.google.gson.FlexiGsonBuilder;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.KLoopPolicy;
import com.winterwell.datalog.server.DataLogServer;
import com.winterwell.datalog.server.DataLogSettings;
import com.winterwell.datalog.server.MasterHttpServlet;
import com.winterwell.es.XIdTypeAdapter;
import com.winterwell.es.client.ESConfig;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.gson.StandardAdapters;
import com.winterwell.utils.Dependency;
import com.winterwell.utils.io.ArgsParser;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.log.LogFile;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.time.Time;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.app.JettyLauncher;
import com.winterwell.web.data.XId;

/**
 * TODO
 * @author daniel
 *
 */
public class AdServerMain {

	private static JettyLauncher jl;
		
	public static LogFile logFile = new LogFile(new File("adserver.log"))
									.setLogRotation(TUnit.DAY.dt, 14);

	public static AdServerConfig settings;

	public static void main(String[] args) {
		settings = getConfig(new AdServerConfig(), args);

		Log.i("Go!");
		assert jl==null;
		jl = new JettyLauncher(new File("web"), settings.port);
		jl.setup();
		jl.addServlet("/*", new MasterHttpServlet());
		Log.i("web", "...Launching Jetty web server on port "+jl.getPort());
		jl.run();

		Log.i("Running...");
	}

	

	public static <X> X getConfig(X config, String[] args) {
		config = ArgsParser.getConfig(config, args, new File("config/adserver.properties"), null);
		String thingy = config.getClass().getSimpleName().toLowerCase().replace("config", "");
		config = ArgsParser.getConfig(config, args, new File("config/"+thingy+".properties"), null);
		config = ArgsParser.getConfig(config, args, new File("config/"+WebUtils2.hostname()+".properties"), null);
		Dependency.set((Class)config.getClass(), config);
		assert config != null;
		return config;
	}

	private static void init() {
		// gson
		GsonBuilder gb;
		Gson gson = new FlexiGsonBuilder()
		.setLenientReader(true)
		.registerTypeAdapter(Time.class, new StandardAdapters.TimeTypeAdapter())
		.registerTypeAdapter(XId.class, new XIdTypeAdapter())
		.serializeSpecialFloatingPointValues()
		.setDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
		.setClassProperty(null).setLoopPolicy(KLoopPolicy.QUIET_NULL)
		.create();
		// config
		ESConfig value = new ESConfig();
		value.gson = gson;
		Dependency.set(ESConfig.class, value);
		// client
		Dependency.setSupplier(ESHttpClient.class, true, 
				() -> new ESHttpClient(Dependency.get(ESConfig.class))
				);
		// mappings
		DB.init();
	}


}
