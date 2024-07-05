getparamvalue()
{
  PARAMVALUE=`grep "^${PARAMKEY}=" $CONFIGFILE | awk -F= '{print $2}'`
}
setparamvalue()
{
  rm -f $CONFIGFILENEW

  if [ $? -ne 0 ]
  then
    echo "Failure: error deleting temporary property file"
    exit 1
  fi

  mv -f $CONFIGFILE $CONFIGFILENEW 

  if [ $? -ne 0 ]
  then
    echo "Failure: error renaming property file"
    exit 1
  fi

  # Escape any slashes if the PARAMVALUE is a path
  PARAMVALUETEMP=`echo $PARAMVALUE | sed "s/\//~~\//g"`
  PARAMVALUEESC=`echo $PARAMVALUETEMP | sed "s/~~/\\\\\/g"`

  sed  "s/^${PARAMKEY}=.*$/${PARAMKEY}=${PARAMVALUEESC}/g" $CONFIGFILENEW > $CONFIGFILE 

  if [ $? -ne 0 ]
  then
    echo "Failure: error changing property value"
    exit 1
  fi

  rm -f $CONFIGFILENEW
  if [ $? -ne 0 ]
  then
    echo "Failure: error deleting temporary property file"
    exit 1
  fi
}

cd ..
cd conf 

# edit bdt.properties file
CONFIGFILE=$(pwd)/bdt.properties
CONFIGFILENEW=${CONFIGFILE}_$$.temp;

#
# NAE IP
#
PARAMKEY=NAE_IP.1
PARAMVALUE=0
getparamvalue
NAE_IP=$PARAMVALUE

if [ -z "$NAE_IP" ]
then
  read -p " Enter the IP Address of the Cipher Manager : " TMP_NAE_IP
else
  read -p " Enter the IP Address of the Cipher Manager $NAE_IP: " TMP_NAE_IP
fi

if [ "x$TMP_NAE_IP" != "x" ]
then
  NAE_IP=$TMP_NAE_IP
fi

# set value of NAE_IP 
PARAMVALUE=$NAE_IP
setparamvalue

#
# NAE Port 
#
PARAMKEY=NAE_Port
getparamvalue
NAE_PORT=$PARAMVALUE

if [ -z "$NAE_PORT" ]
then
   read -p " Enter the Port of the CipherTrust Manager: " TMP_NAE_PORT
else
   read -p " Enter the Port of the CipherTrust Manager $NAE_PORT: " TMP_NAE_PORT
fi

if [ "x$TMP_NAE_PORT" != "x" ]
then
  NAE_PORT=$TMP_NAE_PORT
fi

# set value of NAE_Port
PARAMVALUE=$NAE_PORT
setparamvalue

# edit bdt.properties file
CONFIGFILE=$(pwd)/log4j2.properties
CONFIGFILENEW=${CONFIGFILE}_$$.temp;

#
#Log File Path 
#
PARAMKEY=appender.rolling.fileName
PARAMVALUE=0
getparamvalue
appender_rolling_fileName=$PARAMVALUE

if [ -z "$appender_rolling_fileName" ]
then
  read -p " Enter log file path : " TMP_LOG_FILE_PATH
else
  read -p " Enter log file path  $appender_rolling_fileName: " TMP_LOG_FILE_PATH 
fi

if [ "x$TMP_LOG_FILE_PATH" != "x" ]
then
  appender_rolling_fileName=$TMP_LOG_FILE_PATH
fi

# set value of LOG FILE PATH 
PARAMVALUE=$appender_rolling_fileName
setparamvalue

#
#Log Level
#
PARAMKEY=logger.bdtfile.level
PARAMVALUE=0
getparamvalue
logger_bdtfile_level=$PARAMVALUE

if [ -z "$logger_bdtfile_level" ]
then
  read -p " Enter log level : " TMP_LOG_LEVEL
else
  read -p " Enter log level  $logger_bdtfile_level: " TMP_LOG_LEVEL
fi

if [ "x$TMP_LOG_LEVEL" != "x" ]
then
  logger_bdtfile_level=$TMP_LOG_LEVEL
fi


# set value of LOG LEVEL
PARAMVALUE=$logger_bdtfile_level
setparamvalue

#End of Log File 
