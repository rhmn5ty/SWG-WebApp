#!/bin/bash

populatePF="-f"
argc=$#
argv=("$@")

j=0
while [ $j -lt $argc ]
do
    if [ ${argv[j]} = $populatePF ]
    then 
	    sh config.sh 
            break
    fi
    j=$(( j + 1 ))
done
cd ..
export BDT_HOME=$(pwd)
cd bin
java -Dlog4j.configurationFile=file:"$BDT_HOME/conf/log4j2.properties"  -Dbdt.home="$BDT_HOME" -cp "$BDT_HOME/lib/*:$CLASSPATH"  com.vormetric.bdt.cli.BDTCli "$@"
