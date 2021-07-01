import { x10 } from '@ms/excel-online-calc';
import { ExceLint } from './excelint/excelint';

export class ExceLintPlugin implements x10.IPlugin<x10.RequestKind.functionSuggestion> {
  public static readonly kind = x10.RequestKind.functionSuggestion;

  public static create() {
    return new ExceLintPlugin();
  }

  public *run(msg: x10.UIMessage & x10.HasCorrelationId): x10.PluginRunReturnType<x10.RequestKind.functionSuggestion> {
    return x10.functionSuggestionMessage(msg.correlationId, yield* ExceLint.getSuggestions());
  }
}

// Register for dynamic plugin loading
x10.registerPluginFactory(x10.PluginFactoryName.ExceLintPlugin, ExceLintPlugin);
