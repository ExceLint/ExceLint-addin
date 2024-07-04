![\[ExceLint logo\]](logos/ExceLint/ExceLint.png)

ExceLint is an Excel add-in that automatically finds formula errors in
spreadsheets. It is a product of research from the [PLASMA lab @ UMass
Amherst](https://plasma-umass.org) and Microsoft Research.

by [Dan Barowy](http://www.cs.williams.edu/~dbarowy/) (Williams
College), [Emery Berger](https://www.emeryberger.com/) (UMass Amherst /
Microsoft Research), and [Ben
Zorn](https://www.microsoft.com/en-us/research/people/zorn/) (Microsoft
Research).

## Installing ExceLint Add-in on your computer

ExceLint works as an add-in for all modern versions of Excel, including Mac, Windows, and online.
You need to install the file `manifest.xml` following the appropriate instructions for each platform.

First, <a href="https://raw.githubusercontent.com/ExceLint/ExceLint-addin/master/manifest.xml" download="manifest.xml">download `manifest.xml`.</a>

Next, follow the specific instructions for your platform:

* **Windows:** [https://docs.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins](https://docs.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins)
* **On-line:** [https://docs.microsoft.com/en-us/office/dev/add-ins/testing/sideload-office-add-ins-for-testing](https://docs.microsoft.com/en-us/office/dev/add-ins/testing/sideload-office-add-ins-for-testing)
* **Mac:** [https://docs.microsoft.com/en-us/office/dev/add-ins/testing/sideload-an-office-add-in-on-ipad-and-mac#sideload-an-add-in-in-office-on-mac](https://docs.microsoft.com/en-us/office/dev/add-ins/testing/sideload-an-office-add-in-on-ipad-and-mac#sideload-an-add-in-in-office-on-mac)

*Note:* If you are hosting ExceLint locally (for further development), you need to install `manifest-localhost.xml` instead.
 

## Talks on ExceLint

* [ExceLint - Automatically Finding Spreadsheet Formula Errors](https://www.youtube.com/watch?v=rEwUA0h2dsw), OOPSLA 2018 conference talk by Dan Barowy
* [Saving the world from spreadsheets](https://www.youtube.com/watch?list=SRYearby%20Super%20Mesh%20Task%20Chair&v=GyWKxFxyyrQ), Univ. of Washington PLSE seminar, by Emery Berger
* [The next generation of developer tools for data programming](https://note.microsoft.com/MSR-Webinar-Data-Programming-Registration-On-Demand.html), Microsoft Research Webinar Series, by Ben Zorn

## Technical Details about ExceLint

The following technical paper describes how ExceLint works and includes
an extensive empirical evaluation: [*ExceLint: Automatically Finding
Spreadsheet Formula
Errors*](https://github.com/ExceLint/ExceLint-addin/blob/master/docs/ExceLint-OOPSLA2018.pdf),
Daniel W. Barowy (Williams College), Emery D. Berger (University of
Massachusetts Amherst), Benjamin Zorn (Microsoft Research). In
*Proceedings of the ACM on Programming Languages*, Volume 2, Number
OOPSLA.

## Privacy

The ExceLint add-in does not collect personally identifiable
information. See [the privacy statement](privacy.html) for more details.

## Support

ExceLint is provided without any guarantee of support. However, we
welcome [bug
reports](https://github.com/plasma-umass/ExceLint-addin/issues/new?assignees=dbarowy%2C+emeryberger%2C+bzorn&labels=bug&template=bug_report.md&title=)
and [enhancement/feature
requests](https://github.com/plasma-umass/ExceLint-addin/issues/new?assignees=dbarowy%2C+emeryberger%2C+bzorn&labels=enhancement&template=feature_request.md&title=).

## Source Code & Development

Source code for the add-in may be found [at its GitHub
repository](https://github.com/plasma-umass/ExceLint-addin).

The ExceLint addin is written entirely in TypeScript. See the [DEPLOYMENT.md](./DEPLOYMENT.md) file for details. 

## Acknowledgements

This material is based upon work supported by the National Science
Foundation under Grant No. CCF-1617892. Any opinions, findings, and
conclusions or recommendations expressed in this material are those
of the author(s) and do not necessarily reflect the views of the National
Science Foundation.
