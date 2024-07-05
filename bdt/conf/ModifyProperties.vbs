'Require Declaration of all variables
Option Explicit

Dim WSHShell, RegKey
Dim objArgs
Dim szUsage
Dim oFSO, oFile, oFSOLog, oFileLog,oRegexp, oLogFile
Dim strOrigFileName, strNewFileName, strData, strOrigFileNameLog, strNewFileNameLog, strDataLog
Dim strNaeIPPattern, strNaePortPattern,strLogFilePattern, strPfilePattern, strBdtFileLevel
Dim strFilePathPattern
Dim szPfilePath, szNaeIP, szNaePort, szBdtFileL, szLogFile, szNewLogFile
Dim szFilePath
Dim errVal
Dim CR_LF

Const ForReading = 1
Const ForWriting = 2

szUsage = "Usage: cscript.exe IngModifyProperties.vbs filePath naeIP naePort [logFileName]"

Set objArgs = WScript.Arguments


If objArgs.Count > 5 Then
     WScript.Echo "ERROR: Too many parameters supplied."
     WScript.Echo szUsage
     WScript.Echo " "
     WScript.Quit (1)
End If

If objArgs.Count < 5 Then
     WScript.Echo "ERROR: Not enough parameters supplied."
     WScript.Echo szUsage
     WScript.Echo " "
     WScript.Quit (1)
End If


szFilePath = objArgs.Item(0)
szPfilePath = objArgs.Item(0)
szNaeIP = objArgs.Item(1)
szNaePort = objArgs.Item(2)
szLogFile = objArgs.Item(3)
szBdtFileL = objArgs.Item(4)


Set oRegexp = New Regexp
oRegexp.Global = TRUE
oRegexp.IgnoreCase = TRUE

'
'Set NAE IP, PORT and Log file name
'
strOrigFileName = ".\bdt.properties"
strNewFileName = ".\bdt.properties.new"

strNaeIPPattern = "NAE_IP.1=.*"
strNaePortPattern = "NAE_Port=.*" 

strPfilePattern = "IngrianNAE_Properties_Conf_Filename=.*"
'Enable Error Handling
'On Error Resume Next

Set oFSO = CreateObject("Scripting.FileSystemObject")
Set oFile = oFSO.OpenTextFile(strOrigFileName, ForReading)
strData = oFile.ReadAll
oFile.Close

oRegexp.Pattern = strNaeIPPattern
szNaeIP = "NAE_IP.1=" + szNaeIP
strData = oRegexp.Replace(strData, szNaeIP)

oRegexp.Pattern = strNaePortPattern
szNaePort = "NAE_Port=" + szNaePort
strData = oRegexp.Replace(strData, szNaePort)

Set oFile = oFSO.CreateTextFile(strNewFileName, TRUE)
oFile.Write strData
oFile.Close

'
'Set logger.bdtfile.level
'
strOrigFileNameLog = ".\log4j2.properties"
strNewFileNameLog = ".\log4j2.properties.new"

strLogFilePattern = "appender.rolling.fileName=.*"
strBdtFileLevel = "logger.bdtfile.level=.*" 
'Enable Error Handling
'On Error Resume Next

Set oFSOLog = CreateObject("Scripting.FileSystemObject")
Set oFileLog = oFSOLog.OpenTextFile(strOrigFileNameLog, ForReading)
strDataLog = oFileLog.ReadAll
oFileLog.Close

oRegexp.Pattern = strLogFilePattern
szLogFile = "appender.rolling.fileName=" + szLogFile
strDataLog = oRegexp.Replace(strDataLog, szLogFile)

oRegexp.Pattern = strBdtFileLevel
szBdtFileL = "logger.bdtfile.level=" + szBdtFileL
strDataLog = oRegexp.Replace(strDataLog, szBdtFileL)

Set oFileLog = oFSOLog.CreateTextFile(strNewFileNameLog, TRUE)
oFileLog.Write strDataLog
oFileLog.Close
