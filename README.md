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

* **Windows:** [https://docs.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins](https://docs.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins)
* **On-line:** [https://docs.microsoft.com/en-us/office/dev/add-ins/testing/sideload-office-add-ins-for-testing](https://docs.microsoft.com/en-us/office/dev/add-ins/testing/sideload-office-add-ins-for-testing)
* **Mac:** [https://docs.microsoft.com/en-us/office/dev/add-ins/testing/sideload-an-office-add-in-on-ipad-and-mac#sideload-an-add-in-in-office-on-mac](https://docs.microsoft.com/en-us/office/dev/add-ins/testing/sideload-an-office-add-in-on-ipad-and-mac#sideload-an-add-in-in-office-on-mac)

*Note:* If you are hosting ExceLint locally (for further development), you need to install `manifest-localhost.xml` instead.
 
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
Errors*](https://github.com/ExceLint/ExceLint-addin/blob/master/docs/ExceLint-OOPSLA2018.pdf),
Daniel W. Barowy (Williams College), Emery D. Berger (University of
Massachusetts Amherst), Benjamin Zorn (Microsoft Research). In
*Proceedings of the ACM on Programming Languages*, Volume 2, Number
OOPSLA.

## Development

The ExceLint addin is written entirely in TypeScript. It is already set up to be hostable locally.
_Note:_ See also the **Running in Docker** secton below.

### Requirements

To run ExceLint locally, you will first need to install [Node](https://nodejs.org/en/) and [Git](https://git-scm.com/downloads).
This version works successfully with Node 16.4.0.

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

## Running in Docker

The _Dockerfile_ in this repo permits testing/use of ExceLint locally without
installing a number of software packages that may or may not conflict
with other installations on your computer.
In addition, the Dockerfile "locks" the software tools to known-good versions
so that all collaborators are working with the same configuration.

- To **install** Docker on your computer, use any of the guides on the internet.
This one-time task lets you run any Docker container on your system.

- To **build** the Docker container named `excelint-addin-local`
run the commands below.

    ```bash
    cd <directory-for-ExceLint>
    docker build -t excelint-addin-local .
    ```

- To **run** the container, use the command below.
It starts the container, then starts the `webpack serve` process.

    ```bash
    docker run -p 3000:3000 --rm excelint-addin-local
    ```

- To **test,** browse to
[https://0.0.0.0:3000/index.html](https://0.0.0.0:3000/index.html).
You should see an ExceLint logo and a (perpetual) "Initializing" spinner.
This should allow Excel to connect to the add-in.

- To **exit** the container, simply type ^C (Ctl-C).

_Note:_ It takes a minute or so for the container to be ready to respond.
Wait ~60 seconds until you see the "Compiled with warnings" message.

_Note:_ Your browser may display a "self-signed certificate"
warning when you first connect. This is expected.

## Using ExceLint add-in with Excel

To use this container with the ExceLint add-in:

1. Install the ExceLint addin using the
[instructions in the ExceLint github repo](https://github.com/ExceLint/ExceLint-addin#installation)
2. You must install the _manifest-localhost.xml_ file on your computer.
3. Run the `excelint-addin-local` container as described above.
4. Click the "Add-ins" button in Excel to install the ExceLint add-in.
5. When installing the ExceLint add-in into Excel, you may see
"Add-in Error" explaining that there is a self-signed certificate.
Look for a means to "Accept the certificate".
