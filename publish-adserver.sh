# !/bin/bash

#Publisher/Updater to the Good-Loop AdServer

TYPEOFPUSH=$1

TESTSERVERS=(hugh)
PRODUCTIONSERVERS=(heppner)

##Is this a test-push or a production-push?
case $TYPEOFPUSH in
	test)
	echo "This is a Push to $TESTSERVERS ... Is that correct? Press RETURN to continue, press Ctrl+C  to stop"
	read VAR
	if [[ -z $VAR ]]; then
		echo -e "Proceeding..."
		TARGETSERVERS=$TESTSERVERS
	fi
	;;
	production)
	echo "This is a Push to $PRODUCTIONSERVERS ... Is that correct? Press RETURN to continue, press Ctrl+C  to stop"
	read VAR
	if [[ -z $VAR ]]; then
		echo -e "Proceeding..."
		TARGETSERVERS=$PRODUCTIONSERVERS
	fi
	;;
	*)
	echo "I couldn't understand weather you want to publish to the test servers or the production servers.  So I'm pushing to neither.  This publish process has now haulted."
	exit 1
esac

## Cleaning the target's old JARs
for server in ${TARGETSERVERS[*]}; do
	ssh winterwell@$server.soda.sh 'service adservermain stop'
	ssh winterwell@$server.soda.sh 'rm -rf /home/winterwell/as.good-loop.com/lib/*.jar'
	echo "Jar files on $server cleared, putting in new jars..."
	rsync -rhP tmp-lib/*.jar winterwell@$server.soda.sh:/home/winterwell/as.good-loop.com/lib/
	echo "New jars have been synced.  Now syncing configs, JS, and everything else"
	ssh winterwell@$server.soda.sh 'rm -rf /home/winterwell/as.good-loop.com/adunit/*'
	rsync -rhP adunit/* winterwell@$server.soda.sh:/home/winterwell/as.good-loop.com/adunit/
	ssh winterwell@$server.soda.sh 'rm -rf /home/winterwell/as.good-loop.com/config/*'
	rsync -rhP config/* winterwell@$server.soda.sh:/home/winterwell/as.good-loop.com/config/
# no source code
#	ssh winterwell@$server.soda.sh 'rm -rf /home/winterwell/as.good-loop.com/server/*'
#	rsync -rhP server/* winterwell@$server.soda.sh:/home/winterwell/as.good-loop.com/server/
#	ssh winterwell@$server.soda.sh 'rm -rf /home/winterwell/as.good-loop.com/src/*'
#	rsync -rhP src/* winterwell@$server.soda.sh:/home/winterwell/as.good-loop.com/src/
#	ssh winterwell@$server.soda.sh 'rm -rf /home/winterwell/as.good-loop.com/test/*'
#	rsync -rhP test/* winterwell@$server.soda.sh:/home/winterwell/as.good-loop.com/test/
#	no need to rm web-as ^DW ssh winterwell@$server.soda.sh 'rm -rf /home/winterwell/as.good-loop.com/web-as/*'
	rsync -rhP web-as/* winterwell@$server.soda.sh:/home/winterwell/as.good-loop.com/web-as/
	echo "All files synced"
	echo ""
	echo "Starting the Adserver process"
	ssh winterwell@$server.soda.sh 'service adservermain start'
	echo "$server has been updated"
	echo ''
	echo ''
done
echo "Pushing process has completed"
