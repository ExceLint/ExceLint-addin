import * as React from "react";
import HeroList, { HeroListItem } from "./HeroList";

// images references in the manifest
import "../../../assets/icon-16.png";
import "../../../assets/icon-32.png";
import "../../../assets/icon-80.png";

export interface AppProps {
  title: string;
  isOfficeInitialized: boolean;
}

export interface AppState {
  listItems: HeroListItem[];
}

// PLUGIN STARTUP CODE HERE
// ANYTHING HERE RUNS AT GLOBAL STARTUP
// EXCEL IS READY-- TASKPANE MAY NOT BE
(async () => {
  await Office.onReady();
  if (!Office.context.requirements.isSetSupported("ExcelApi", "1.7")) {
    console.log("Sorry, this add-in only works with newer versions of Excel.");
  }
  // Put stuff here, like handlers
})();

export default class App extends React.Component<AppProps, AppState> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      listItems: []
    };
  }

  // onChange handler for a cell that can modify a react component
  // Note that this cannot be registered directly since event handlers
  // must have the signature: Excel.WorksheetChangedEventArgs => Promise<any>
  public async onRangeChangeInReact(args: Excel.WorksheetChangedEventArgs, appInstance: App): Promise<any> {
    if (args.changeType === "RangeEdited") {
      const range = args.address;
      await Excel.run(async (context: Excel.RequestContext) => {
        const rng = args.getRange(context);
        await context.sync();
        // we only care if the user changed a single cell
        rng.load(["cellCount", "values", "formulas"]);
        await context.sync();
        if (rng.cellCount === 1) {
          const value: string = rng.values[0][0];
          const formula: string = rng.formulas[0][0];
          const li = {
            icon: "Design",
            primaryText: "CHANGED " + range + " to '" + formula + "' which evaluates to '" + value + "'"
          };
          appInstance.setState(state => {
            state.listItems.push(li);
            return state;
          });
        }
      });
    }
  }

  public componentDidMount(): void {
    this.setState({
      listItems: []
    });

    // register an event handler AFTER React is done rendering the thing
    Excel.run(async (context: Excel.RequestContext) => {
      const worksheets = context.workbook.worksheets;
      // here, we use a closure to capture `this` to pass to the handler
      const handler = (args: Excel.WorksheetChangedEventArgs) => this.onRangeChangeInReact(args, this);
      worksheets.onChanged.add(handler);
    });
  }

  render() {
    return (
      <div className="ms-welcome">
        <HeroList message="Events:" items={this.state.listItems}></HeroList>
      </div>
    );
  }
}
