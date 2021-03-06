package com.goodloop;


import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.jar.Attributes;
import java.util.jar.JarFile;
import java.util.jar.Manifest;
import java.util.logging.Level;

import javax.swing.text.StyledEditorKit.ForegroundAction;

import org.junit.Test;

import com.goodloop.adserver.ManifestServlet;
import com.winterwell.bob.BobSettings;
import com.winterwell.bob.BuildTask;
import com.winterwell.bob.tasks.EclipseClasspath;
import com.winterwell.bob.tasks.GitTask;
import com.winterwell.bob.tasks.JarTask;
import com.winterwell.bob.tasks.ProcessTask;
import com.winterwell.bob.tasks.RSyncTask;
import com.winterwell.bob.tasks.RemoteTask;
import com.winterwell.bob.tasks.SCPTask;
import com.winterwell.es.BuildESJavaClient;
import com.winterwell.utils.Environment;
import com.winterwell.utils.FailureException;
import com.winterwell.utils.Printer;
import com.winterwell.utils.Proc;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.Utils;
import com.winterwell.utils.Warning;
import com.winterwell.utils.gui.GuiUtils;
import com.winterwell.utils.io.CSVReader;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.web.DnsUtils;

import com.winterwell.utils.io.LineReader;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.XStreamUtils;
import com.winterwell.web.LoginDetails;
import com.winterwell.web.email.SMTPClient;
import com.winterwell.web.email.SimpleMessage;

import jobs.BuildBob;
import jobs.BuildFlexiGson;
import jobs.BuildMaths;
import jobs.BuildStat;
import jobs.BuildUtils;
import jobs.BuildWeb;
import jobs.BuildWinterwellProject;


/**
 * 
 * TODO refactor merge with publish-adserver.sh
 * 
 * copy pasta of {@link PublishDataServer}
 * FIXME rsync is making sub-dirs :(
 */
public class PublishAdserver extends BuildTask {

	String server = 
//			"as.good-loop.com";
			"testas.good-loop.com";
	String remoteUser;
	private String remoteWebAppDir;
	private File localWebAppDir;
			
	public PublishAdserver() throws Exception {
		this.remoteUser = "winterwell";
		this.remoteWebAppDir = "/home/winterwell/as.good-loop.com";
		// local
		this.localWebAppDir = FileUtils.getWorkingDirectory();
	}

	@Override
	public Collection<? extends BuildTask> getDependencies() {
		return Arrays.asList(
				new BuildUtils(),
				new BuildMaths(),
				new BuildBob(),
				new BuildWeb(),
				new BuildStat(), // This!
				new BuildESJavaClient(),
				new BuildFlexiGson()
				);
	}

	private void doUploadProperties(Object timestampCode) throws IOException {
		// Copy up creole.properties and version.properties		
		Log.report("publish","Uploading .properties...", Level.INFO);
		ManifestServlet.saveVersionProperties();
		File localConfigDir = new File(localWebAppDir, "config");
		{	// create the version properties
			File creolePropertiesForSite = new File(localConfigDir, "version.properties");
			Properties props = creolePropertiesForSite.exists()? FileUtils.loadProperties(creolePropertiesForSite)
								: new Properties();
			// set the publish time
			props.setProperty("publishDate", ""+System.currentTimeMillis());
			// set info on the git branch
			String branch = GitTask.getGitBranch(null);
			props.setProperty("branch", branch);
			// ...and commit IDs
			try {
				Map<String, Object> info = GitTask.getLastCommitInfo(localWebAppDir);
				props.setProperty("lastCommitId", (String)info.get("hash"));
				props.setProperty("lastCommitInfo", StrUtils.compactWhitespace(XStreamUtils.serialiseToXml(info)));
			} catch(Exception ex) {
				// oh well;
				Log.d("git.info", ex);
			}

			// the timestamp code
			props.setProperty("timecode", ""+timestampCode);

			// save
			BufferedWriter w = FileUtils.getWriter(creolePropertiesForSite);
			props.store(w, null);
			FileUtils.close(w);
		}

//		// Don't upload any local properties
//		File localProps = new File(localConfigDir, "local.properties");
//		File localPropsOff = new File(localConfigDir, "local.props.off");
//		if (localProps.exists()) {
//			FileUtils.move(localProps, localPropsOff);
//		}
		
//		// rsync the directory
//		try {
//			assert localConfigDir.isDirectory() : localConfigDir;
//			Log.d("publish","Sending config dir files: "+Printer.toString(localConfigDir.list()));
//			String remoteConfig = remoteUser+"@"+server+":"+remoteWebAppDir+"/config";
//			RSyncTask task = new RSyncTask(localConfigDir.getAbsolutePath()+"/", remoteConfig, true);
//			task.run();		
//			
//		} finally {
//			// put local-props back
//			if (localPropsOff.exists()) {
//				FileUtils.move(localPropsOff, localProps);
//			}
//		}
	}

	@Override
	protected void doTask() throws Exception {
		// Setup file paths
		// Check that we are running from a plausible dir:
		if (! localWebAppDir.exists() 
			|| !new File(localWebAppDir,"web-as").exists()) {
			throw new IOException("Not in the expected directory! dir="+FileUtils.getWorkingDirectory()+" but no "+localWebAppDir);
		}
		Log.i("publish", "Publishing to "+server+":"+ remoteWebAppDir);
		// What's going on?
		Environment.get().push(BobSettings.VERBOSE, true);

		// TIMESTAMP code to avoid caching issues: epoch-seconds, mod 10000 to shorten it
		String timestampCode = "" + ((System.currentTimeMillis()/1000) % 10000);

		// shell script build
//		ProcessTask ptask = new ProcessTask("adunit/bld.sh");
//		ptask.run();
//		ptask.close();
		
		{	// copy all the properties files
			doUploadProperties(timestampCode);
		}

		// Find jars and move them into tmp-lib
		{
			EclipseClasspath ec = new EclipseClasspath(localWebAppDir);
			Set<File> jars = ec.getCollectedLibs();
			// Create local lib dir
			File localLib = new File(localWebAppDir,"tmp-lib");
			localLib.mkdirs();
			assert localLib.isDirectory();
			// Ensure desired jars are present
			for (File jar : jars) {
				File localJar = new File(localLib, jar.getName());
				if (localJar.isFile() && localJar.lastModified() >= jar.lastModified()) {
					continue;
				}
				FileUtils.copy(jar, localJar);
			}
	//		// Remove unwanted jars
	//		for (File jar : localLib.listFiles()) {
	//			boolean found = false;
	//			for (File jar2 : jars) {
	//				if (jar.getName().equals(jar2.getName())) found = true;
	//			}
	//			if (!found) {
	//				// This was in the lib directory, but not in the classpath
	//				Log.w("publish", "Deleteing apparently unwanted file " + jar.getAbsolutePath());
	//				FileUtils.delete(jar);
	//			}
	//		}
			
			// WW jars
			Collection<? extends BuildTask> deps = getDependencies();
			for (BuildTask buildTask : deps) {
				if (buildTask instanceof BuildWinterwellProject) {
					File jar = ((BuildWinterwellProject) buildTask).getJar();
					FileUtils.copy(jar, localLib);
				}
			}			
			
			// This jar
			JarTask jarTask = new JarTask(new File(localLib, "adserver.jar"), new File(localWebAppDir, "bin"));
			jarTask.run();
			jarTask.close();
		}
		
		// Bash script which does the rsync work
//		ProcessTask pubas = new ProcessTask("./publish-adserver.sh "+server);
//		pubas.run();
//		System.out.println(pubas.getError());
//		pubas.close();
//		Log.d(pubas.getCommand(), pubas.getOutput());
		
	}
	

}
