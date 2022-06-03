![\[ExceLint logo\]](logos/ExceLint/ExceLint.png)

ExceLint is an Excel add-in that automatically finds formula errors in
spreadsheets. It is a product of research from the [PLASMA lab @ UMass
Amherst](https://plasma-umass.org) and Microsoft Research.

by [Dan Barowy](http://www.cs.williams.edu/~dbarowy/) (Williams
College), [Emery Berger](https://www.emeryberger.com/) (UMass Amherst /
Microsoft Research), and [Ben
Zorn](https://www.microsoft.com/en-us/research/people/zorn/) (Microsoft
Research).

## Talks on ExceLint

* [ExceLint - Automatically Finding Spreadsheet Formula Errors](https://www.youtube.com/watch?v=rEwUA0h2dsw), OOPSLA 2018 conference talk by Dan Barowy
* [Saving the world from spreadsheets](https://www.youtube.com/watch?list=SRYearby%20Super%20Mesh%20Task%20Chair&v=GyWKxFxyyrQ), Univ. of Washington PLSE seminar, by Emery Berger
* [The next generation of developer tools for data programming](https://note.microsoft.com/MSR-Webinar-Data-Programming-Registration-On-Demand.html), Microsoft Research Webinar Series, by Ben Zorn


## Installation

ExceLint works as an add-in for all modern versions of Excel, including Mac, Windows, and online.
You need to install the file `manifest.xml` following the appropriate instructions for each platform:

* Windows: https://docs.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins
* on-line: https://docs.microsoft.com/en-us/office/dev/add-ins/testing/sideload-office-add-ins-for-testing
* Mac: https://docs.microsoft.com/en-us/office/dev/add-ins/testing/sideload-an-office-add-in-on-ipad-and-mac#sideload-an-add-in-in-office-on-mac


## Source code

Source code for the add-in may be found [at its GitHub
repository](https://github.com/plasma-umass/ExceLint-addin).

## Privacy

The ExceLint add-in does not collect personally identifiable
information. See [the privacy statement](privacy.html) for more details.

## Support

ExceLint is provided without any guarantee of support. However, we
welcome [bug
reports](https://github.com/plasma-umass/ExceLint-addin/issues/new?assignees=dbarowy%2C+emeryberger%2C+bzorn&labels=bug&template=bug_report.md&title=)
and [enhancement/feature
requests](https://github.com/plasma-umass/ExceLint-addin/issues/new?assignees=dbarowy%2C+emeryberger%2C+bzorn&labels=enhancement&template=feature_request.md&title=).

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

The ExceLint addin is written entirely in TypeScript. It is already set up to be hostable locally.

### Requirements

To run ExceLint locally, you will first need to install [Node](https://nodejs.org/en/) and [Git](https://git-scm.com/downloads).

### Running the ExceLint service locally

First, run the following commands to build and start the local ExceLint service (which just hosts the assets).

```
git clone https://github.com/plasma-umass/ExceLint-addin
cd ExceLint-addin
export NODE_OPTIONS=--no-experimental-fetch
npm install
npm run start-local
```

### Testing

The easiest way to test the local service is to use Excel 365
(https://www.office.com/launch/excel?auth=2). Open a workbook, click
the Insert menu, then click "Office Add-ins" on the ribbon. Click
"Upload My Add-in" (in the upper-right hand corner), and select the
file `manifest-localhost.xml`. If everything works as planned, you should
see an icon for ExceLint on the Home ribbon. Click on it and it should open
the task pane on the right-hand side of the window.


## Acknowledgements

This material is based upon work supported by the National Science
Foundation under Grant No. CCF-1617892. Any opinions, findings, and
conclusions or recommendations expressed in this material are those
of the author(s) and do not necessarily reflect the views of the National
Science Foundation.