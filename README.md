# Installation Instructions

These instructions are valid for 1JS commit `e27a8070e07d7d37ce49e4b7877144e49d9ab3a1` (Fri May 28 17:34:37 2021 +0000) or later.

1. Copy `excelint`, `excelint-tests`, `exceLint.plugin.ts`, and `exceLint.plugin.test.ts` to `1JS\ooui\packages\excel-online-intelligent-formula-autocomplete`.
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

## TODOs

1. Condition analysis on the partial string being typed in by the user; integrate partial parsing.
2. Synthesize replacement formulas.
3. Remove dead code.
