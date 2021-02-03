import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import { ExcelUtils } from "./ExceLint-core/src/excelutils";
import { ExceLintVector, ProposedFix } from "./ExceLint-core/src/ExceLintTypes";
import { Config } from "./ExceLint-core/src/config";

const barWidth = 100; // pixel length of the suspiciousness bar

export interface ContentProps {
  message1: string;
  buttonLabel1: string;
  click1: any;
  message2: string;
  buttonLabel2: string;
  click2: any;
  sheetName: string;
  currentFix: number;
  totalFixes: number;
  themFixes: ProposedFix[];
  suspiciousCells: ExceLintVector[];
  currentSuspiciousCell: number;
  numFixes: number;
  selector: any;
  cellSelector: any;
}

const divStyle: any = {
  height: "100px",
  overflowY: "auto",
  overflowX: "hidden",
};

const lineStyle: any = {
  color: "blue",
  textAlign: "left",
  verticalAlign: "middle",
};

const notSuspiciousStyle: any = {
  color: "red",
};

function makeTable(
  sheetName: string,
  arr: ProposedFix[],
  selector,
  current: number,
  numFixes: number
): any {
  if (numFixes === 0) {
    numFixes = 1;
  }
  let counter = 0;
  if (arr.length > 0) {
    let children = [];
    for (let i = 0; i < arr.length; i++) {
      let r = ExcelUtils.get_rectangle(arr, i);
      if (r) {
        let [col0, row0, col1, row1] = r;
        let scoreBar = arr[i].score;
        scoreBar *= barWidth;
        if (scoreBar > barWidth) {
          scoreBar = barWidth;
        }
        counter += 1;
        let rangeDisplay = <b></b>;
        if (current === i) {
          rangeDisplay = (
            <td style={{ width: 100 }}>
              <b>
                {col0}
                {row0}:{col1}
                {row1}
              </b>
            </td>
          );
        } else {
          rangeDisplay = (
            <td style={{ width: 100 }}>
              {col0}
              {row0}:{col1}
              {row1}
            </td>
          );
        }
        const scoreStr = arr[i].score.toString(); //  + "\n" + "(" + Math.round(score).toString() + "% anomalous)";
        let barColor = "red";
        if (Math.round(scoreBar) < 50) {
          barColor = "yellow";
        }
        children.push(
          <tr
            style={lineStyle}
            onClick={(ev) => {
              ev.preventDefault();
              selector(i);
            }}
          >
            {rangeDisplay}
            <td
              title={scoreStr}
              style={{
                width: Math.round(scoreBar),
                backgroundColor: barColor,
                display: "inline-block",
              }}
            >
              &nbsp;
            </td>
            <td
              title={scoreStr}
              style={{
                width: barWidth - Math.round(scoreBar),
                backgroundColor: "lightgray",
                display: "inline-block",
              }}
            >
              &nbsp;
            </td>
          </tr>
        );
      }
    }
    if (counter > 0) {
      let table = [];
      let header = (
        <tr>
          <th align="left">Range</th>
          <th align="left">Anomalousness</th>
        </tr>
      );
      table.push(
        <div style={notSuspiciousStyle}>
          Click to jump to anomalous formulas in {sheetName}:<br />
          <em>Hover over a range for more details.</em>
          <br />
          <br />
          <div style={divStyle}>
            <table style={{ width: "300px" }}>
              <tbody>
                {header}
                {children}
              </tbody>
            </table>
          </div>
        </div>
      );
      return table;
    }
  }
  return (
    <div style={notSuspiciousStyle}>
      No anomalous formulas found in {sheetName}.<br />
    </div>
  );
}

class PropsThing {
  sheetName: string;
  currentFix: number;
  totalFixes: number;
  themFixes: ProposedFix[];
  selector: any;
  numFixes: number;
  suspiciousCells: ExceLintVector[];
  cellSelector: any;
  currentSuspiciousCell: number;
}

function DisplayFixes(props: PropsThing) {
  if (props.sheetName === "") {
    return <div></div>;
  }

  let result1 = <div></div>;
  let str = "";
  // Filter out fixes whose score is below the threshold.
  let filteredFixes = props.themFixes.filter((pf) =>
    pf.score >= Config.getReportingThreshold() / 100
  );
  let table1 = <div></div>;

  // OK, if we got here, we did some analysis.
  if (filteredFixes.length === 0 && props.suspiciousCells.length === 0) {
    // We got nothing.
    table1 = (
      <div style={notSuspiciousStyle}>
        <br />
          Nothing anomalous found in {props.sheetName}.<br />
        <br />
      </div>
    );
  }

  table1 = makeTable(
    props.sheetName,
    filteredFixes,
    props.selector,
    props.currentFix,
    filteredFixes.length
  );
  result1 = (
    <div>
      <br />
      <br />
      {table1}
    </div>
  );
  return (
    <div>
      {result1}
    </div>
  );
}

class ReactState implements ContentProps {
  // obligatory react stuff
  message1: string;
  buttonLabel1: string;
  click1: any;
  message2: string;
  buttonLabel2: string;
  click2: any;
  selector: any;
  cellSelector: any;

  // my stuff
  sheetName: string;
  currentFix: number;
  totalFixes: number;
  themFixes: ProposedFix[];
  numFixes: number;
  suspiciousCells: ExceLintVector[];
  currentSuspiciousCell: number;
}

export class Content extends React.Component<ReactState, any> {
  constructor(props: ReactState, context: any) {
    super(props, context);
    this.state = {
      sheetName: props.sheetName,
      currentFix: props.currentFix,
      totalFixes: props.totalFixes,
      themFixes: props.themFixes,
      numFixes: props.numFixes,
      suspiciousCells: props.suspiciousCells,
      currentSuspiciousCell: props.currentSuspiciousCell,
    };
  }

  render() {
    let instructions = <div></div>;
    let slider1 = <div></div>;
    let slider2 = <div></div>;
    if (this.state.themFixes.length === 0 && this.state.suspiciousCells.length === 0) {
      instructions = (
        <div>
          <br />
          Click on{" "}
          <a onClick={this.props.click1}>
            <b>Reveal Structure</b>
          </a>{" "}
          to reveal the underlying structure of the spreadsheet. Different formulas are assigned
          different colors, making it easy to spot inconsistencies or to audit a spreadsheet for
          correctness.
          <br />
          <br />
          <br />
        </div>
      );
    }

    return (
      <div id="content-main">
        <div className="padding">
          <Button className="ms-button" buttonType={ButtonType.primary} onClick={this.props.click1}>
            {this.props.buttonLabel1}
          </Button>
          &nbsp;
          <Button className="ms-button" buttonType={ButtonType.primary} onClick={this.props.click2}>
            {this.props.buttonLabel2}
          </Button>
          <DisplayFixes
            sheetName={this.state.sheetName as string}
            currentFix={this.state.currentFix as number}
            totalFixes={this.state.totalFixes as number}
            themFixes={this.state.themFixes as ProposedFix[]}
            selector={this.props.selector}
            numFixes={this.state.numFixes as number}
            suspiciousCells={this.state.suspiciousCells as ExceLintVector[]}
            cellSelector={this.props.cellSelector}
            currentSuspiciousCell={this.state.currentSuspiciousCell as number}
          />
          {instructions}
          {slider1}
          {slider2}
          <br />
          <svg width="300" height="20">
            <rect x="0" y="0" width="3.5714285714285716" height="20" fill="#ecaaae" />
            <rect
              x="3.5714285714285716"
              y="0"
              width="3.5714285714285716"
              height="20"
              fill="#74aff3"
            />
            <rect
              x="7.142857142857143"
              y="0"
              width="3.5714285714285716"
              height="20"
              fill="#d8e9b2"
            />
            <rect
              x="10.714285714285715"
              y="0"
              width="3.5714285714285716"
              height="20"
              fill="#deb1e0"
            />
            <rect
              x="14.285714285714286"
              y="0"
              width="3.5714285714285716"
              height="20"
              fill="#9ec991"
            />
            <rect
              x="17.857142857142858"
              y="0"
              width="3.5714285714285716"
              height="20"
              fill="#adbce9"
            />
            <rect
              x="21.42857142857143"
              y="0"
              width="3.5714285714285716"
              height="20"
              fill="#e9c59a"
            />
            <rect
              x="25.000000000000004"
              y="0"
              width="3.5714285714285716"
              height="20"
              fill="#71cdeb"
            />
            <rect
              x="28.571428571428577"
              y="0"
              width="3.5714285714285716"
              height="20"
              fill="#bfbb8a"
            />
            <rect
              x="32.142857142857146"
              y="0"
              width="3.5714285714285716"
              height="20"
              fill="#94d9df"
            />
            <rect
              x="35.714285714285715"
              y="0"
              width="3.5714285714285716"
              height="20"
              fill="#91c7a8"
            />
            <rect
              x="39.285714285714285"
              y="0"
              width="3.5714285714285716"
              height="20"
              fill="#b4efd3"
            />
            <rect
              x="42.857142857142854"
              y="0"
              width="3.5714285714285716"
              height="20"
              fill="#80b6aa"
            />
            <rect
              x="46.42857142857142"
              y="0"
              width="3.5714285714285716"
              height="20"
              fill="#9bd1c6"
            />
            <text x="55" y="13">
              formulas (pastel colors)
            </text>
          </svg>
          <svg width="300" height="20">
            <rect x="0" y="0" width="50" height="20" fill="#d3d3d3" />
            <text x="55" y="13">
              data used by some formula (gray)
            </text>
          </svg>
          <br />
          <svg width="300" height="20">
            <rect x="0" y="0" width="50" height="20" fill="#eed202" />
            <text x="55" y="13">
              data not used by ANY formula (yellow)
            </text>
          </svg>
          <br />
          <br />
          <div className="ExceLint-scrollbar"></div>
          <br />
          <small>
            <a
              target="_blank"
              href="https://github.com/plasma-umass/ExceLint-addin/issues/new?assignees=dbarowy%2C+emeryberger%2C+bzorn&labels=enhancement&template=feature_request.md&title="
            >
              Send feedback
            </a>{" "}
            |{" "}
            <a
              target="_blank"
              href="https://github.com/plasma-umass/ExceLint-addin/issues/new?assignees=dbarowy%2C+emeryberger%2C+bzorn&labels=bug&template=bug_report.md&title="
            >
              Report bugs
            </a>
            <br />
            For more information, see <a href="https://excelint.org">excelint.org</a>.
          </small>
          <br />
        </div>
      </div>
    );
  }
}
