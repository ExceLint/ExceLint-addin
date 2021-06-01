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

REM now do the copy
Xcopy /E /I /Y %target%\ooui\packages\excel-online-intelligent-formula-autocomplete\src\excelint excelint
Xcopy /E /I /Y %target%\ooui\packages\excel-online-intelligent-formula-autocomplete\src\excelint-tests excelint-tests
Xcopy /E /I /Y %target%\ooui\packages\excel-online-intelligent-formula-autocomplete\src\exceLint.plugin.ts exceLint.plugin.ts
Xcopy /E /I /Y %target%\ooui\packages\excel-online-intelligent-formula-autocomplete\src\exceLint.plugin.test.ts exceLint.plugin.test.ts

REM restore working directory
cd %olddir%

@echo on
exit