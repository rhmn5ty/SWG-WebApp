cd ..
cd conf
set PRPTY_FILE_PATH=%cd%

if not exist "%PRPTY_FILE_PATH%" goto :NOPFILE


set NAE_IP=
set NAE_PORT=
set appender.rolling.fileName=
set logger.bdtfile.level=
set LOG4J_PRPTY_FILE_NAME="\log4j2.properties"
set PRPTY_FILE_NAME="\bdt.properties"

For /F "delims='=' tokens=2" %%i IN ( 'findstr NAE_IP.1 "%PRPTY_FILE_PATH%%PRPTY_FILE_NAME%"' ) do set NAE_IP=%%i
For /F "delims='=' tokens=2" %%i IN ( 'findstr NAE_Port "%PRPTY_FILE_PATH%%PRPTY_FILE_NAME%"' ) do set NAE_PORT=%%i
For /F "delims='=' tokens=2" %%i IN ( 'findstr Log_File "%PRPTY_FILE_PATH%%LOG4J_PRPTY_FILE_NAME%"' ) do set appender.rolling.fileName=%%i
For /F "delims='=' tokens=2" %%i IN ( 'findstr Log_File "%PRPTY_FILE_PATH%%LOG4J_PRPTY_FILE_NAME%"' ) do set logger.bdtfile.level=%%i

if "%NAE_IP%" == "" (set NAE_IP=)
if "%NAE_PORT%" == ""  (set NAE_PORT=)
if "%appender.rolling.fileName%" == ""  (set appender.rolling.fileName=)
if "%logger.bdtfile.level%" == ""  (set logger.bdtfile.level=)

:IPADDRESS
if not "%NAE_IP%" == "" (set /p NAE_IP=Enter IP address of CipherTrust Manager[%NAE_IP%]:)
if "%NAE_IP%" == "" (set /p NAE_IP=Enter IP address of CipherTrust Manager:)

if "%NAE_IP%" == "" (goto :IPADDRESS)

:PORT
if not "%NAE_PORT%" == "" (set /p NAE_PORT=Enter port number of CipherTrust Manager[%NAE_PORT%]:)
if "%NAE_PORT%" == "" (set /p NAE_PORT=Enter port number of CipherTrust Manager:)

if "%NAE_PORT%" == "" (goto :PORT)

:LFILE
if not "%appender.rolling.fileName%" == "" set /p appender.rolling.fileName=Enter log file path[%appender.rolling.fileName%]:
if "%appender.rolling.fileName%" == "" set /p appender.rolling.fileName=Enter log file path:

if "%appender.rolling.fileName%" == "" (goto :LFILE)

:FILELOGLEVEL 
if not "%logger.bdtfile.level%" == "" (set /p logger.bdtfile.level=Enter log level [%logger.bdtfile.level%] :) 
if "%logger.bdtfile.level%" == "" (set /p logger.bdtfile.level=Enter log level :) 


if "%logger.bdtfile.level%" == "" (goto :FILELOGLEVEL)

call cscript.exe ModifyProperties.vbs "%PRPTY_FILE_PATH%" %NAE_IP% %NAE_PORT% "%appender.rolling.fileName%" %logger.bdtfile.level% 

copy /y bdt.properties.new bdt.properties
del /F bdt.properties.new
echo Properties file is populated with NAE_IP NAE_PORT Log_File
copy /y log4j2.properties.new log4j2.properties
del /F log4j2.properties.new
echo log4j2 file is populated
goto END

:NOPFILE
echo Properties file %PRPTY_FILE_PATH% does not exist.
goto END


:END
