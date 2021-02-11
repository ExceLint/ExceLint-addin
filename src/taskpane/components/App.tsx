import * as React from "react";

// images references in the manifest
// import "../../../assets/icon-16.png";
// import "../../../assets/icon-32.png";
// import "../../../assets/icon-80.png";

/**
 * Represents the underlying data model.
 */
export interface AppProps {
  title: string;
  isOfficeInitialized: boolean;
}

/**
 * An interface representing React App UI state.
 * Currently just a stub.
 */
export interface AppState {
  placeholder: string;
}

/**
 * Global startup function for the plugin. Excel API and spreadsheet will be
 * initialized.  App class (below) and React state will note initialized.
 */
(async () => {
  await Office.onReady();
  if (!Office.context.requirements.isSetSupported("ExcelApi", "1.7")) {
    console.log("Sorry, this add-in only works with newer versions of Excel.");
  }
  // Put stuff here, like handlers
})();

/**
 * The class that represents the task pane, including React UI state.
 */
export default class App extends React.Component<AppProps, AppState> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      placeholder: "start"
    };
  }

  /**
   * onChange event handler for a cell that can modify a react component.
   * Note that this handler cannot be registered directly since event handlers
   * must have the signature: Excel.WorksheetChangedEventArgs => Promise<any>.
   *
   * @param args WorksheetChangedEvent information.
   * @param appInstance A reference to the `appInstance` instance.
   */
  public async onRangeChangeInReact(args: Excel.WorksheetChangedEventArgs, appInstance: App): Promise<any> {
    if (args.changeType === "RangeEdited") {
      /* const address = args.address; */
      await Excel.run(async (context: Excel.RequestContext) => {
        const rng = args.getRange(context);
        await context.sync();

        // we only care about events where the user changes a single cell
        rng.load(["cellCount", "values", "formulas"]);
        await context.sync();

        // now that we have all the data loaded...
        if (rng.cellCount === 1) {
          /*
           * const value: string = rng.values[0][0];
           * const formula: string = rng.formulas[0][0];
           */

          // update the UI state
          appInstance.setState({
            placeholder: Date.now().toString()
          });
        }
      });
    }
  }

  /**
   * Runs after this component is rendered. Used to initialize the UI, including
   * event handlers, etc.
   */
  public componentDidMount(): void {
    this.setState({
      placeholder: Date.now().toString()
    });

    // Registers an event handler "in context" AFTER React is done rendering.
    Excel.run(async (context: Excel.RequestContext) => {
      const worksheets = context.workbook.worksheets;
      // here, we use a closure to capture the `this` param to pass to the handler
      const handler = (args: Excel.WorksheetChangedEventArgs) => this.onRangeChangeInReact(args, this);
      worksheets.onChanged.add(handler);
    });
  }

  /**
   * Renders the task pane.
   */
  render() {
    return <div className="ms-welcome">{this.state.placeholder}</div>;
  }
}
