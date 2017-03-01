package com.goodloop;


import java.io.File;
import java.util.Arrays;
import java.util.Collection;

import org.junit.Test;

import com.winterwell.bob.BuildTask;
import com.winterwell.bob.tasks.RSyncTask;
import com.winterwell.utils.io.FileUtils;

/**
 * ??How is sogive.org setup?
 * 
 * This pushes files into frank.
 * Somehow they are copied within frank to /var/www/sogive.org (this can take a minute)
 * Which is where nginx looks for them
 * 
 * DA probably knows how and why
 * 
 * @author daniel
 *
 */
public class PublishAdUnit extends BuildTask {

	@Override
	public Collection<? extends BuildTask> getDependencies() {
		return Arrays.asList();
	}
	
	@Override
	protected void doTask() throws Exception {
		String destPath = "winterwell@heppner.soda.sh:/home/winterwell/as.good-loop.com/web/"; 
		File localDir = new File(FileUtils.getWinterwellDir(), "adunit");
		RSyncTask rsync = new RSyncTask(localDir+"/", destPath, false);
		rsync.run();
	}

}
