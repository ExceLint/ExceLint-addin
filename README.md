# ExceLint

This repository is for the latest version of ExceLint in development. ExceLint is currently being developed as a plugin for the forthcoming Excel X10 plugin architecture, which is also in development. In order to facilitate development, this codebase is developed against a mock X10 plugin architecture. The mock plugin adapts the X10 architecture to the ordinary OfficeJS plugin architecture.

Consequently, ExceLint can be run either as an OfficeJS plugin or installed into the 1JS Office repository for use with X10. Both sets of instructions are given below.

## Run as an OfficeJS Plugin

**Prerequisites**. You must have the following installed:

- NodeJS
- NPM

1. Clone this repository (an ordinary non-recursive clone is fine). E.g.,
   ```
   $ git clone git@github.com:ExceLint/ExceLint-addin.git
   ```
1. `cd ExceLint-addin`
1. Be sure that you're on the `x10-patchsets` branch.
   ```
   $ git checkout x10-patchsets
   ```
1. Install NPM dependencies:
   ```
   $ npm install
   ```
1. Build the plugin and package using webpack:
   ```
   $ npm run build
   ```
1. Start the dev server. If this is your first time running it, OfficeJS will generate and install self-signed TLS certificates so that the plugin can communicate with Excel over HTTPS. Note that, by default, this command runs the dev server in the foreground, and that whenever it detects a source code change, will rerun webpack and restart the server.
   ```
   $ npm run dev-server
   ```
   If this is your first time using an OfficeJS plugin, you may be prompted to install a CA certificate like so.  This is to be expected:
   ```
   Installing CA certificate "Developer CA for Microsoft Office Add-ins"...
   Password:
   ```
1. Finally, in another terminal window, start Excel, sideloading the plugin.
   ```
   $ npm run start
   ```
1. To activate the plugin once Excel starts, look for the `Show Taskpane` button on the Excel ribbon, and click it.  ExceLint will then appear in a taskpane window.  To trigger an on-cell-change analysis, select a cell and then edit the cell's contents _in the taskpane_.  Editing this way is necessary because OfficeJS does not have an on-cell-change event (whereas X10 does).

## 1JS Installation Instructions

NOTE: These instructions were last tested with 1JS commit `e27a8070e07d7d37ce49e4b7877144e49d9ab3a1` (Fri May 28 17:34:37 2021 +0000).

1. Copy `excelint`, `excelint-tests`, `exceLint.plugin.ts`, and `exceLint.plugin.test.ts` to `1JS\ooui\packages\excel-online-intelligent-formula-autocomplete\src`.
2. Find the file `1JS\ooui\packages\excel-online-calc\src\definitions\smartCompletionDefinitions.ts` and change
   ```
   {
       name: 'PluginFactoryName',
       values: [
       { name: 'TestPlugin', value: 0 },
       { name: 'AutocompletePlugin', value: 1 },
       { name: 'HighlightPlugin', value: 2 },
       { name: 'DragPlugin', value: 3 },
       { name: 'ConfigTestPlugin', value: 4 },
       ],
       nameLookup: 'ScriptSharpAndTypeScript',
   },
   ```
   to
   ```
   {
       name: 'PluginFactoryName',
       values: [
       { name: 'TestPlugin', value: 0 },
       { name: 'AutocompletePlugin', value: 1 },
       { name: 'HighlightPlugin', value: 2 },
       { name: 'DragPlugin', value: 3 },
       { name: 'ConfigTestPlugin', value: 4 },
       { name: 'ExceLintPlugin', value: 538 },
       ],
       nameLookup: 'ScriptSharpAndTypeScript',
   },
   ```
   In other words, add `{ name: 'ExceLintPlugin', value: 538 },` to the enum.
3. Find the file `1JS\ooui\packages\excel-online-calc\src\x10-formula-bar\pluginFactory.ts` and change
   ```
   type PluginFactoryKindMap = {
       [PluginFactoryName.TestPlugin]: RequestKind.functionSuggestion;
       [PluginFactoryName.AutocompletePlugin]: RequestKind.functionSuggestion;
       [PluginFactoryName.HighlightPlugin]: RequestKind.formulaHighlighting;
       [PluginFactoryName.DragPlugin]: RequestKind.functionSuggestion;
       [PluginFactoryName.ConfigTestPlugin]: RequestKind.functionSuggestion;
   };
   ```
   to
   ```
   type PluginFactoryKindMap = {
       [PluginFactoryName.TestPlugin]: RequestKind.functionSuggestion;
       [PluginFactoryName.AutocompletePlugin]: RequestKind.functionSuggestion;
       [PluginFactoryName.HighlightPlugin]: RequestKind.formulaHighlighting;
       [PluginFactoryName.DragPlugin]: RequestKind.functionSuggestion;
       [PluginFactoryName.ConfigTestPlugin]: RequestKind.functionSuggestion;
       [PluginFactoryName.ExceLintPlugin]: RequestKind.functionSuggestion;
   };
   ```
   In other words, add `[PluginFactoryName.ExceLintPlugin]: RequestKind.functionSuggestion;` to the type.
4. In the same file, change
   ```
   type PluginFactoryParamMap = {
       [PluginFactoryName.TestPlugin]: string;
       [PluginFactoryName.AutocompletePlugin]: undefined;
       [PluginFactoryName.HighlightPlugin]: undefined;
       [PluginFactoryName.DragPlugin]: undefined;
       [PluginFactoryName.ConfigTestPlugin]: undefined;
   };
   ```
   to
   ```
   type PluginFactoryParamMap = {
       [PluginFactoryName.TestPlugin]: string;
       [PluginFactoryName.AutocompletePlugin]: undefined;
       [PluginFactoryName.HighlightPlugin]: undefined;
       [PluginFactoryName.DragPlugin]: undefined;
       [PluginFactoryName.ConfigTestPlugin]: undefined;
       [PluginFactoryName.ExceLintPlugin]: undefined;
   };
   ```
   In other words, add `[PluginFactoryName.ExceLintPlugin]: undefined;` to the type.
5. Now recompile `excel-online-calc`. `cd` to the `1JS\ooui\packages\excel-online-calc` directory and run
   ```
   $ yarn build
   ```
6. Recompile `excel-online-intelligent-formula-autocomplete`. `cd` to the `1JS\ooui\packages\excel-online-intelligent-formula-autocomplete` directory, run
   ```
   $ yarn build
   ```
7. Now run the ExceLint unit tests in the same folder.
   ```
   $ npx jest -t "excelint"
   ```

ExceLint should pass all (two) tests.

## ExceLint benchmarks

This repository includes a sample of spreadsheets taken from the EUSES corpus used in the evaluation of the [CUSTODES](https://ieeexplore.ieee.org/document/7886926) smell detection tool. We manually audited these spreadsheets for reference errors and include them in our `benchmarks` folder. To run ExceLint against this benchmark suite, run

```
$ npm run build:cli
$ npm run cli -- --directory benchmarks/files --annotations benchmarks/annotations-processed.json
```

## TODOs

1. Condition analysis on the partial string being typed in by the user; integrate partial parsing.
1. Remove dead code.
