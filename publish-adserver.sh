# !/bin/bash
## Checking to see if your machine has the dependencies
GOTNPM=$(which npm)
GOTBABEL=$(which babel)
GOTBABILI=$(which babili)
GOTJPEGOPTIM=$(which jpegoptim)
GOTOPTIPNG=$(which optipng)

if [ "$GOTNPM" = "" ]; then
	echo "You must first install NPM before you can use this tool"
	exit 0
fi

if [ "$GOTBABEL" = "" ]; then
	echo -e "You must install babel globally before you can use this tool\nInstall with 'sudo npm install -g babel-cli'"
	exit 0
fi

if [ "$GOTBABILI" = "" ]; then
	echo -e "You must install babili globally before you can use this tool\nInstall with 'sudo npm install -g babili'"
	exit 0
fi

if [ "$GOTJPEGOPTIM" = "" ]; then
	echo -e "You must install 'jpegoptim' on this computer with an apt-get command before you can use this script"
	exit 0
fi

if [ "$GOTOPTIPNG" = "" ]; then
	echo -e "You must install 'optipng' on this computer with an apt-get command before you can use this script"
	exit 0
fi



mkdir adunit/build

# ## Babeling the JS files
# echo "Babeling and Minifying the JS files"
# babel adunit/zepto.min.js adunit/js.cookie.js adunit/datalog.js adunit/unit.js adunit/unit.html adunit/unit.act.js --out-file build/babeled-all.js --source-maps
# babel adunit/dummy-init.js build/babeled-all.js --out-file build/babeled-dummy.all.js --source-maps

# ## Babili (Uglify/min) the JS
# babili build/babeled-all.js | tee build/all.js
# babili build/babeled-dummy.all.js | tee build/dummy.all.js
# echo "Done Concactenating and Minifying the Javascript"
# echo ''

# Concaticnating JS
echo "combining JS files"
cat adunit/zepto.min.js adunit/js.cookie.js adunit/datalog.js adunit/unit.html adunit/unit.act.js adunit/unit.js > adunit/build/all.js
echo "done combining JS files"


# Concatinating CSS
echo "combining CSS files"
cat adunit/unit.css adunit/lightbox.css adunit/leaderboard.css adunit/sticky-bottom.css adunit/verticalbanner.css adunit/medium-rectangle.css > adunit/build/all.css
echo "done combining CSS files"
echo ''
echo "copying CSS for the adserver"
cp adunit/build/all.css web-as/all.css
echo ''
# echo "copying CSS for local tests"
# cp build/all.css ../all.css
# echo ''


# echo "Shinking/Optimising the Images"
# jpegoptim adunit/*.jpg
# optipng adunit/*.png
# echo "done Shrinking images"
# echo ''

## Cleaning the target's old JARs
echo "cleaning out $1 's old JAR files"
ssh winterwell@$1 'service adservermain stop'
ssh winterwell@$1 'rm -rf /home/winterwell/as.good-loop.com/lib/*.jar'
echo "Jar files on $server cleared, putting in new jars..."
rsync -rhP tmp-lib/*.jar winterwell@$1:/home/winterwell/as.good-loop.com/lib/
echo "New jars have been synced.  Now syncing configs, JS, and everything else"

ssh winterwell@$1 'rm -rf /home/winterwell/as.good-loop.com/adunit/*'
rsync -rhP adunit/* winterwell@$1:/home/winterwell/as.good-loop.com/adunit/

ssh winterwell@$1 'rm -rf /home/winterwell/as.good-loop.com/config/*'
rsync -rhP config/* winterwell@$1:/home/winterwell/as.good-loop.com/config/

ssh winterwell@$1 'rm -rf /home/winterwell/as.good-loop.com/web-as/*'
rsync -rhP web-as/* winterwell@$1:/home/winterwell/as.good-loop.com/web-as/

echo "All files synced"
echo ""
echo "Starting the Adserver process"
ssh winterwell@$1 'service adservermain start'
echo -e "$1 has been updated"
echo ''
echo ''
echo "Pushing process has completed"
