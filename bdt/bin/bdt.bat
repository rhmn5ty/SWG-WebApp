@echo off
SET populatePF="-f"
for %%d in (%*) do (
    if "%%d" == %populatePF% (
       call config.bat 
       )
    )
cd ..
set "BDT_HOME=%cd%"
cd bin
java -Dlog4j.configurationFile=file:"/%BDT_HOME%/conf/log4j2.properties"  -Dbdt.home="%BDT_HOME%" -cp "%BDT_HOME%\lib\*;%CLASSPATH%"  com.vormetric.bdt.cli.BDTCli %*
