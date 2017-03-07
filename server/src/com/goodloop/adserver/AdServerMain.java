package com.goodloop.adserver;

import java.io.File;
import java.util.Properties;

import com.goodloop.data.DB;
import com.google.gson.FlexiGsonBuilder;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.KLoopPolicy;

import com.winterwell.es.XIdTypeAdapter;
import com.winterwell.es.client.ESConfig;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.gson.StandardAdapters;
import com.winterwell.utils.Dep;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
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

	public static final Time startTime = new Time();

	private static JettyLauncher jl;
		
	public static LogFile logFile = new LogFile(new File("adserver.log"))
									.setLogRotation(TUnit.DAY.dt, 14);

	public static AdServerConfig settings;

	public static void main(String[] args) {
		settings = getConfig(new AdServerConfig(), args);
		try {
			Properties props = getConfig(new Properties(), args);
			if (new File("config/version.properties").isFile()) {
				new ArgsParser(props).set(new File("config/version.properties"));
			}
			System.out.println(props);
		} catch(Throwable ex) {
			Log.w("init", ex);
		}
		
		init(settings);
		
		Log.i("Go!");
		assert jl==null;
		jl = new JettyLauncher(new File("web-as"), settings.port);
		jl.setup();
		jl.addServlet("/unit.js", new UnitHttpServlet());
		jl.addServlet("/manifest", new ManifestServlet());
		Log.i("web", "...Launching Jetty web server on port "+jl.getPort());
		jl.run();

		Log.i("Running...");
	}

	

	public static <X> X getConfig(X config, String[] args) {
		config = ArgsParser.getConfig(config, args, new File("config/adserver.properties"), null);
		String thingy = config.getClass().getSimpleName().toLowerCase().replace("config", "");
		config = ArgsParser.getConfig(config, args, new File("config/"+thingy+".properties"), null);
		// live, local, test?
		String machine = WebUtils2.hostname();
		String serverType = new ArrayMap<String,String>(
				"aardvark", "localserver",
				"stross", "localserver",
				"mail.soda.sh", "testserver",
				"heppner", "liveserver"
				).get(machine);
		if (serverType == null) {
			Log.e("init", "Unknown machine: "+machine+" - defaulting to localserver!");
			serverType = "localserver";
		}
		Log.d("init", "serverType: "+serverType+" machine: "+machine);
		config = ArgsParser.getConfig(config, args, new File("config/"+serverType+".properties"), null);
		// this computer specific
		config = ArgsParser.getConfig(config, args, new File("config/"+machine+".properties"), null);
		Dep.set((Class)config.getClass(), config);
		assert config != null;
		return config;
	}

	public static void init(GLBaseConfig config) {
		// gson
		Gson gson = new GsonBuilder()
		.setLenientReader(true)
		.registerTypeAdapter(Time.class, new StandardAdapters.TimeTypeAdapter())
		.registerTypeAdapter(XId.class, new XIdTypeAdapter())
		.serializeSpecialFloatingPointValues()
		.setDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
//		.setClassProperty(null)
		.setLoopPolicy(KLoopPolicy.QUIET_NULL)
		.create();
		Dep.set(Gson.class, gson);
		// config
		ESConfig value = new ESConfig(); // from file??
		Dep.set(ESConfig.class, value);
		// client
		Dep.setSupplier(ESHttpClient.class, true, 
				() -> new ESHttpClient(Dep.get(ESConfig.class))
				);
		// mappings
		DB.init(config);
	}


}
