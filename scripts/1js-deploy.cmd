@echo off
REM Use this script to install the ExceLint plugin into the 1JS repository.
REM Usage:
REM   1js-deploy.cmd <1JS path>
REM For example,
REM   1js-deploy.com ..\1JS

Xcopy /E /I /Y excelint %1\ooui\packages\excel-online-intelligent-formula-autocomplete\src\excelint
Xcopy /E /I /Y excelint-tests %1\ooui\packages\excel-online-intelligent-formula-autocomplete\src\excelint-tests
Xcopy /E /I /Y exceLint.plugin.ts %1\ooui\packages\excel-online-intelligent-formula-autocomplete\src
Xcopy /E /I /Y exceLint.plugin.test.ts %1\ooui\packages\excel-online-intelligent-formula-autocomplete\src
@echo on
