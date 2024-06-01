# DEPLOYMENT

Things you need to know to rebuild and deploy the ExceLint add-in.

## Building for Github Pages

Github Pages provides a public server to host the files
necessary for the ExceLint add-in.
This is the main source for people to use ExceLint.
Those files are built and hosted from the _addin-dist_ directory.
To do this:

1. Run `npm run build-addin` to update the contents of _addin-dist_.
This uses the _config/webpack.build-addin.js_ file (which imports
_config/webpack.common.js_) to bundle all the files to the destination.
2. Push the repo back to Github.
2. Ensure that Github Pages is setup to serve the _addin-dist_ directory.
3. Wait a moment while Github Pages processes the files.
4. Ensure the _manifest.xml_ file points to the proper URL for the Github Pages.


### Testing before and after deployment

After building the _addin-dist_ directory, you can test the local file by:

```
cd <ExceLint directory>
npx http-server addin-dist # opens port 8080
```
 and browse to [localhost:8080](localhost:8080).
 You should see the ExceLint logo and a perpetual spinner.
 
 **After deploying to Github Pages:** Browse to the Github url

## Development on a local machine

The ExceLint addin is written entirely in TypeScript.
It is already set up to be hostable locally.
(Or use the Docker container, see below.)

### Requirements

To run ExceLint locally, you will first need to install [Node](https://nodejs.org/en/) and [Git](https://git-scm.com/downloads).
This version works successfully with Node 16.4.0.

_At this time, it is CRITICAL that all work be done with Node 16.4.0.
Many build errors creep in when attempting to use newer versions._

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

## Running in Docker

The _Dockerfile_ in this repo permits testing/use of
ExceLint locally without installing a number of
software packages that may or may not conflict
with other installations on your computer.
In addition, the Dockerfile "locks" the software tools
to known-good versions so that all collaborators
are working with the same configuration.

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

## Using ExceLint add-in Docker

To use this container with the ExceLint add-in:

1. Install the ExceLint addin using the
[instructions in the ExceLint github repo](https://github.com/ExceLint/ExceLint-addin#installation)
2. You must install the _manifest-localhost.xml_ file on your computer.
3. Run the `excelint-addin-local` container as described above.
4. Click the "Add-ins" button in Excel to install the ExceLint add-in.
5. When installing the ExceLint add-in into Excel, you may see
"Add-in Error" explaining that there is a self-signed certificate.
Look for a means to "Accept the certificate".


## PRIOR NOTES

_NB: It is no longer required to obtain Let's Encrypt certificates for
the add-in. Github Pages provides the SSL certificates as needed._

Install stuff:

https://docs.microsoft.com/en-us/office/dev/add-ins/quickstarts/excel-quickstart-react

add a certificate:
https://github.com/OfficeDev/generator-office/blob/master/src/docs/ssl.md

Now install stuff:

* With administrative privileges, do this:
npm install -g yo@latest webpack rimraf webpack-dev-server webpack-cli

* Without admin privileges, do this:
npm run build
npm start

Open up Excel Online - office.com

Now click on Insert -> Office Add-ins -> Upload My Add-in (text in upper-right hand side) -> select manifest.xml

