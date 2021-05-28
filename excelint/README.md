ExceLint-core is the component functionality for an Excel add-in that
automatically finds formula errors in spreadsheets. It is a product of
research from the [PLASMA lab @ UMass
Amherst](https://plasma-umass.org) and Microsoft Research. The add-in
itself is available here: [ExceLint add-in](https://github.com/plasma-umass/ExceLint-addin).

ExceLint was originally created by [Dan
Barowy](http://www.cs.williams.edu/~dbarowy/) (Williams College),
[Emery Berger](https://www.emeryberger.com/) (UMass Amherst /
Microsoft Research), and [Ben
Zorn](https://www.microsoft.com/en-us/research/people/zorn/)
(Microsoft Research).

## Building

The commands below will build ExceLint-core on Unix-like systems. Note that
this requires a recent version of `node`.

    npm install
    npm install typescript
    # below not needed for Mac
    sudo apt install node-typescript
    npm run build

To install an up-to-date version of `node` on Linux:

    npm install --update node

To install an up-to-date version of `node` on Mac OS X with Homebrew:

    brew uninstall --force --ignore-dependencies node npm
    brew install node npm

## Testing

ExceLint comes with a range of test inputs. The simplest sanity check is to run on a single spreadsheet included in the distribution.

    node build/src/cli/excelint-cli.js --input test/act3_lab23_posey.xlsx

We manually audited a number of spreadsheets (from the "CUSTODES"
suite); this annotations file is included in the `test`
directory. When ExceLint can find it, `excelint-cli.js` will automatically use this data.

    cd test
    node ../build/src/cli/excelint-cli.js --directory subjects_xlsx

## Technical Details

The following technical paper describes how ExceLint works and includes
an extensive empirical evaluation: [*ExceLint: Automatically Finding
Spreadsheet Formula
Errors*](https://github.com/ExceLint/ExceLint/blob/master/ExceLint-OOPSLA2018.pdf),
Daniel W. Barowy (Williams College), Emery D. Berger (University of
Massachusetts Amherst), Benjamin Zorn (Microsoft Research). In
*Proceedings of the ACM on Programming Languages*, Volume 2, Number
OOPSLA.

## Development

ExceLint-core is written entirely in TypeScript.

## Acknowledgements

This material is based upon work supported by the National Science
Foundation under Grant No. CCF-1617892. Any opinions, findings, and
conclusions or recommendations expressed in this material are those
of the author(s) and do not necessarily reflect the views of the National
Science Foundation.