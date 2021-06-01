REM @echo off
REM Use this script to copy ExceLint plugin files from the 1JS repo back into the GitHub repo.
REM Usage:
REM   1js-update-repo.cmd <1JS path>
REM For example,
REM   1js-update-repo.com ..\1JS

REM get the name of the script itself
SET self=%~nx0

REM find the number of arguments
set argC=0
for %%x in (%*) do Set /A argC+=1

REM quit if the number is not correct
IF %argC% EQU 1 GOTO ALLOK
echo Usage: %self% ^<1JS path^>
@echo on
exit 1

:ALLOK
REM get the absolute path to the given argument
SET target=%~dpnx1
echo %target%

REM get the path to the current directory, so it can be restored later
SET olddir=%CD%
REM get the path of the current batch command, which should be in the "scripts" folder
SET batchpath=%~dp0
REM get the path of the parent folder
SET batchpath=%batchpath:~0,-1%

REM cd to batch folder and then up to parent in case the user
REM started the script someplace else
cd %batchpath%
cd ..

REM TODO: update these paths
REM Xcopy /E /I /Y %1\ooui\packages\excel-online-intelligent-formula-autocomplete\src\excelint excelint
REM Xcopy /E /I /Y %1\ooui\packages\excel-online-intelligent-formula-autocomplete\src\excelint-tests excelint-tests

REM Xcopy /E /I /Y %1\ooui\packages\excel-online-intelligent-formula-autocomplete\src\exceLint.plugin.ts 
REM Xcopy /E /I /Y exceLint.plugin.test.ts %1\ooui\packages\excel-online-intelligent-formula-autocomplete\src

REM restore working directory
cd %olddir%

@echo on
exit