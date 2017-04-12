# !/bin/bash

## Cleaning the target's old JARs
ssh winterwell@$1 'service adservermain stop'
ssh winterwell@$1 'rm -rf /home/winterwell/as.good-loop.com/lib/*.jar'
echo "Jar files on $server cleared, putting in new jars..."
rsync -rhP tmp-lib/*.jar winterwell@$1:/home/winterwell/as.good-loop.com/lib/
echo "New jars have been synced.  Now syncing configs, JS, and everything else"
ssh winterwell@$1 'rm -rf /home/winterwell/as.good-loop.com/adunit/*'
rsync -rhP adunit/* winterwell@$1:/home/winterwell/as.good-loop.com/adunit/
ssh winterwell@$1 'rm -rf /home/winterwell/as.good-loop.com/config/*'
rsync -rhP config/* winterwell@$1:/home/winterwell/as.good-loop.com/config/
ssh winterwell@$1 'rm -rf /home/winterwell/as.good-loop.com/server/*'
rsync -rhP server/* winterwell@$1:/home/winterwell/as.good-loop.com/server/
ssh winterwell@$1 'rm -rf /home/winterwell/as.good-loop.com/src/*'
rsync -rhP src/* winterwell@$1:/home/winterwell/as.good-loop.com/src/
ssh winterwell@$1 'rm -rf /home/winterwell/as.good-loop.com/test/*'
rsync -rhP test/* winterwell@$1:/home/winterwell/as.good-loop.com/test/
ssh winterwell@$1 'rm -rf /home/winterwell/as.good-loop.com/web-as/*'
rsync -rhP web-as/* winterwell@$1:/home/winterwell/as.good-loop.com/web-as/
echo "All files synced"
echo ""
echo "Starting the Adserver process"
ssh winterwell@$1 'service adservermain start'
echo "$server has been updated"
echo ''
echo ''
echo "Pushing process has completed"