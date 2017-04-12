package com.goodloop.adserver;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import com.goodloop.data.DB;
import com.winterwell.es.XIdTypeAdapter;
import com.winterwell.es.client.ESConfig;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.gson.FlexiGsonBuilder;
import com.winterwell.gson.Gson;
import com.winterwell.gson.GsonBuilder;
import com.winterwell.gson.KLoopPolicy;
import com.winterwell.gson.StandardAdapters;
import com.winterwell.utils.Dep;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.ArraySet;
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
 * Run the Good-Loop AdServer!
 * @author daniel
 *
 */
public class AdServerMain {

	public static final Time startTime = new Time();

	private static JettyLauncher jl;
		
	public static LogFile logFile = new LogFile(new File("adserver.log"))
									.setLogRotation(TUnit.DAY.dt, 14);

	public static AdServerConfig settings;

	static ArraySet<File> configFiles = new ArraySet();
	
	public static void main(String[] args) {
		try {
			settings = getConfig(new AdServerConfig(), args);
			try {
				Properties props = getConfig(new Properties(), args);
				File f = new File("config/version.properties");
				if (f.isFile()) {
					configFiles.add(f);
					new ArgsParser(props).set(f);
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
		} catch (Throwable ex) {
			Log.e("init", ex);
		}
	}

	

	public static <X> X getConfig(X config, String[] args) {
		// check several config files
		List<File> files = new ArrayList();
		files.add(new File("config/adserver.properties"));
		String thingy = config.getClass().getSimpleName().toLowerCase().replace("config", "");
		files.add(new File("config/"+thingy+".properties"));
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
		files.add(new File("config/"+serverType+".properties"));
		// this computer specific
		files.add(new File("config/"+machine+".properties"));		
		// read them in
		for (File file : files) {
			if (file.exists()) {
				config = ArgsParser.getConfig(config, args, file, null);
				configFiles.add(file);
			}
		}
		// dep.set
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
		Log.d("init", "Config files: "+configFiles);
	}


}
