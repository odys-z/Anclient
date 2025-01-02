Issues & Handling
=================

Invalid hook call
-----------------

To solve the "Invalid hook call" error and helping example tests, Anclient/js now
break into 2 module, @anclient/semantier & @anclient/anreact.
( :ref:`the next section<about-invalid-hook-call>` can be a good example shows
how this issue is a big trouble)

For details on structure used to meet independent unit test and test with local
npm link.

see :ref:`@anclient/aneact tree<anreact-tree>`.

.. _about-invalid-hook-call:

React Issue #13991 - Invalid hook call
--------------------------------------

.. attention:: Since @anclient/react verified, this issue is closed.
..

.. attention:: [deprecated] Since new example of North is verified. This issue is closed.
..

.. note:: To test with test/jsample, use
    [ npm link anclient ]
..

About the error
_______________

With webpack transpiled package, both via NPM and minified js, referencing component
will reporting error.

::

    NorthApp
      |-> AnCliant package
          |-> SysComp
          |   |-> AppBar (Material UI Function)
          |   |-> WithStyles()  (of Material UI)
          |-> Sys (withStyle(SysComp))

Error report:

.. image:: ./imgs/00-react-hook-warning.png
    :height: 400px
..

Where AppBar is exported from Material UI, SysComp, extending React.Component,
from Anclient.js lib.

The React document didn't solve this problem, and redirected to issue 13991.
Webpack also have similar issue report. See
`Rreact Document <https://reactjs.org/link/error-boundaries>`_ and issues:

`Facebook issue 13991 <https://github.com/facebook/react/issues/13991>`_ and

`Webpack issue 13868 <https://github.com/webpack/webpack/issues/13868>`_

Cause of Error
______________

This error is suppressed by resolving react of NorthApp to Anclient's node_modules/react.

In example.js/north-star/webpack.config.js:

.. code-block:: javascript

	resolve: {
		alias: { react: path.resolve('../../../js/node_modules/react') }
	},

..

This can be explained as duplicated react libs been used.

Solution
________

In Anclient, react, react-dom & material-ui/core are transpiled as external by webpack, see webpack.config.js.

.. code-block:: javascript

    module.exports = {
        externals: {
            'react': 'react',
            'react-dom' : 'reactDOM',
            "@material-ui/core": "MaterialUI"
        },

        ...

    }
..

In NorthApp, react & react-dom are installed locally. Then Anclient can be imported like:

.. code-block:: javascript

    import {
        an, AnClient, SessionClient, Protocol,
        L, Langstrs,
        AnContext, AnError, AnReactExt,
        Sys, SysComp, Domain, Roles, Orgs, Users
    } from 'anclient';
..

Similar of React Issue #13991
_____________________________

A tried scenario:

1. publish test/react-app as @anclient/test-react

2. install anclient in test/react-app

3. AnContext.anReact is undefined for <QueryForm /> in <Domain />

.. code-block:: javascript

    componentDidMount() {
      if (!this.context || !this.context.anReact)
        throw new Error('AnQueryFormComp can\'t bind controls without AnContext initialized with AnReact.');
      ...
    }
..

ReferenceError: regeneratorRuntime is not defined
-------------------------------------------------

About the error
_______________

When handling D3 with Babel 8.2.2 or later, the async functions requiring
`regenerator runtime <https://babeljs.io/docs/en/babel-plugin-transform-regenerator>`_.

There are similar reports like `here <https://stackoverflow.com/questions/53558916/babel-7-referenceerror-regeneratorruntime-is-not-defined>`_.

Solution
________

Follow `the answer <https://stackoverflow.com/a/54490329>`_.

install core-js & regenerator-runtime

.. code-block:: bash

    npm install --save core-js
    npm install --save regenerator-runtime
..

In histogram.jsx:

.. code-block:: javascript

    import "core-js/stable";
    import "regenerator-runtime/runtime";
..

These 2 steps should solve the problem.

Query Android PDF / Office Files Results Empty
----------------------------------------------

About the issue
_______________

On Android 10, API lever 29 (Q) or lower, CursorLoader#on won't get any files
because of the Scoped Storage natural.

CursorLoader:

.. code-block:: java

    public class FileLoader extends CursorLoader {

        public FileLoader(Context context) {
            super(context);
            setProjection(FILE_PROJECTION);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q)
                setUri(MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL));
            else
                setUri(MediaStore.Files.getContentUri("external"));

            setSortOrder(MediaStore.Files.FileColumns.DATE_ADDED + " DESC");
        }
    }
..

Usage (with performance issue):

.. code-block:: java

    filefilter = new FileFilterx(t, directories -> {
        if (isNeedFolderList) {
            ArrayList<Directory> list = new ArrayList<>();
            Directory all = new Directory();
            all.setName(getResources().getString(R.string.vw_all));
            list.add(all);
            list.addAll(directories);
            mFolderHelper.fillData(list);
        }
        loadirs(directories); // parse files, can't find files other than medias
    });
    filefilter.filter(this, suffix);
..

Reference:

[1] `Data and file storage overview, DOCUMENTATION at developers <https://developer.android.com/training/data-storage>`_ ,

[2]  Android API Level and Cumulative Usage, `apilevels.com <https://apilevels.com>`_

[3] Grant access to a directory's contents, Access documents and other files from shared storage
    `DOCUMENTATION at developers <https://developer.android.com/training/data-storage/shared/documents-files#grant-access-directory>`_

[4] `Android Developers, Storage access with Android 11, Youtube <https://www.youtube.com/watch?v=RjyYCUW-9tY>`_

[5] `HBiSoft, PickiT <https://github.com/HBiSoft/PickiT>`_

[6] `An up-voted answers <https://stackoverflow.com/a/71260711>`_

[7] `Answer for Android 11 <https://stackoverflow.com/a/70562311>`_

[8] `Manage all files on a storage device <https://developer.android.com/training/data-storage/manage-all-files>`_

But Google Play has a `restrict policy <https://support.google.com/googleplay/android-developer/answer/10467955>`_ :

If your app meets the policy requirements for acceptable use or is eligible for an
exception, you will be required to declare this and any other high-risk permissions
using the Permissions Declaration Form in Play Console.

Decision
________

Let users pick local files then match the results with pushed records.

Sample App: `PickiT <https://github.com/HBiSoft/PickiT>`_

.. image:: ./imgs/02-pickit-mime-application.png
    :height: 360px
..

Using `Grant access to a directory's contents <https://developer.android.com/training/data-storage/shared/documents-files#grant-access-directory>`_
and disable the function lower than API 21.

What's next
___________

Try on Android 11.

See [4], [6] & [7].

Code snipet of [6]:

.. code-block:: java

    List<String> getPdfList(
            Uri collection,         // MediaStore.Downloads.getContentUri("external")
            String[] projection,    // result list's columes index
            String selection,       // mime of pdf
            String[] selectionArgs, // mime
            String sortOrder) {

        List<String> pdfList = new ArrayList<>();

        try (Cursor cursor = getContentResolver().query(collection, projection, selection, selectionArgs, sortOrder)) {
            assert cursor != null;

            if (cursor.moveToFirst()) {
                int columnData = cursor.getColumnIndex(MediaStore.Files.FileColumns.DATA);
                do {
                    pdfList.add((cursor.getString(columnData)));
                    Log.d(TAG, "getPdf: " + cursor.getString(columnData));
                    //you can get your pdf files
                } while (cursor.moveToNext());
            }
        }
        return pdfList;
    }
..

Nginx Request Size Limit
------------------------

About the issue
_______________

Nginx reverse proxy by default will limit the request's body size [#ref1]_, which will result in failure of pushing blocks.
Block size currently is a hard coded parameter. Returned http code for this is 413 [#ref2].

TODO: Best Practice
___________________

Multiple Nginx proxy example [#ref3]:

::

    http {
        # Server B
        server {
            listen 127.0.0.1:5001;
            server_name 127.0.0.1;

            location / {
                proxy_pass http://127.0.0.1:5000;
            }
        }

        # Server A
        server {
            listen 4999;
            server_name domain.com;

            location / {
                proxy_pass http://127.0.0.1:5001;
                proxy_set_header  X-Forwarded-User 'username';
            }
        }
    }

Resposnse Header::

    GET / HTTP/1.0
    Host: 127.0.0.1:5000
    Connection: close
    ...
    X-Forwarded-User: username
    User-Agent: curl/7.58.0
    Accept: */*
    X-size: 20M
    X-size: 30M
    ...

.. https://www.scm.com/doc/Metadocumentation/ReST_overview.html#citations-references

.. [#ref1] `Request Body Size Limit <https://docs.nginx.com/nginx-management-suite/acm/how-to/policies/request-body-size-limit/>`_

.. [#ref2] `413 Content Too Large, MDN <https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/413>`_

.. [#ref3] `Nginx proxy_pass through 2 servers and and custom headers <https://stackoverflow.com/q/60591298/7362888>`_


Apache Tika behave different in Eclipse & Docker
------------------------------------------------

About the issue
_______________

For short, external tika parser configured can not working correctly.

Since jserv-album 0.6.50, a test case, ExifTest#testTika is added to check this
problem, which can work differently in different environment. The correct output
of Exif#init(String) should like this::

    [Exif.init] Loading tika configuration:
    /home/ody/d/git/semantic-jserv/jserv-album/src/main/webapp/WEB-INF/tika.xml
    SLF4J: No SLF4J providers were found.
    SLF4J: Defaulting to no-operation (NOP) logger implementation
    SLF4J: See https://www.slf4j.org/codes.html#noProviders for further details.
    ERROR StatusLogger Log4j2 could not find a logging implementation. Please add log4j-core to the classpath. Using SimpleLogger to log to the console...
    [Exif.init] Tika config:
    [application/vnd.ms-htmlhelp, message/rfc822, application/vnd.visio, application/atom+xml, image/x-xcf, image/wmf, audio/midi, ...
    [Exif.init] Parser for video/mp4: org.apache.tika.parser.ParserDecorator$1,
    declared (supported types):[video/mp4]

    [Exif.init] ------------ Exteranl tika parser configured for vide/mp4 --------------
        video/avi,	    org.apache.tika.parser.external.ExternalParser@4a07d605
        video/mpeg,	    org.apache.tika.parser.external.ExternalParser@4a07d605
        video/x-msvideo,	org.apache.tika.parser.external.ExternalParser@4a07d605
        video/mp4,	    org.apache.tika.parser.external.ExternalParser@4a07d605

The last a few lines is the diagnose of an external parser configured in WEB-INF/tika.xml.

In Album 0.2.2, the external parser, i.e. org.apache.tika.parser.external.CompositeExternalParser,
is configured as:

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
    <properties>
      <parsers>
        <parser class="org.apache.tika.parser.DefaultParser">
        </parser>
        <parser class="org.apache.tika.parser.mp4.MP4Parser">
          <mime-exclude>video/mp4</mime-exclude>
        </parser>
        <parser class="org.apache.tika.parser.external.CompositeExternalParser">
          <mime>video/mp4</mime>
        </parser>
      </parsers>
    </properties>
..

This can cause error when running in docker. The secret for this is the parser
is actually based on external tools.

How does ExternalParser working?
________________________________

The external parser is loaded by ExternalParsersFactory, according to configuration
located in jar:tika-core-2.8.0.jar!tika-externals.xml

.. code-block:: xml

    <?xml version="1.0" encoding="UTF-8"?>
    <external-parsers>
      <!-- This example uses ffmpeg for video metadata extraction -->
      <parser>
         <check>
           <command>ffmpeg -version</command>
           <error-codes>126,127</error-codes>
         </check>
         <command>ffmpeg -i ${INPUT}</command>
         <mime-types>
           <mime-type>video/avi</mime-type>
           <mime-type>video/mpeg</mime-type>
           <mime-type>video/x-msvideo</mime-type>
         </mime-types>
         <metadata>
           <match key="xmpDM:audioSampleRate">\s*Stream.*:.+Audio:.*,\s+(\d+)\s+Hz,.*</match>
           <match key="xmpDM:audioChannelType">\s*Stream.*:.+Audio:.*\d+\s+Hz,\s+(\d{1,2})\s+channels.*</match>
           <match key="xmpDM:audioCompressor">\s*Stream.*:.+Audio:\s+([A-Za-z0-9_\(\)/\[\] ]+),.*</match>
           <match key="xmpDM:duration">\s*Duration:\s*([0-9:\.]+),.*</match>
           <match key="xmpDM:fileDataRate">\s*Duration:.*,\s*bitrate:\s+([0-9A-Za-z/ ]+).*</match>
           <match key="xmpDM:videoColorSpace">\s*Stream.*:\s+Video:\s+[A-Za-z0-9\(\)/ ]+,\s+([A-Za-z0-9\(\) ,]+),\s+[0-9x]+,.*</match>
           <match key="xmpDM:videoCompressor">\s*Stream.*:\s+Video:\s+([A-Za-z0-9\(\)/ ]+),.*</match>
           <match key="xmpDM:videoFrameRate">\s*Stream.*:\s+Video:.*,\s+([0-9]+)\s+fps,.*</match>
           <match key="encoder">\s*encoder\s*\:\s*(\w+).*</match>
           <match key="videoResolution">\s*Stream.*:\s+Video:.*,\s+([0-9x]+),.*</match>
         </metadata>
      </parser>
      <parser>
         <check>
           <command>exiftool -ver</command>
           <error-codes>126,127</error-codes>
         </check>
         <command>env FOO=${OUTPUT} exiftool ${INPUT}</command>
         <mime-types>
           <mime-type>video/avi</mime-type>
           <mime-type>video/mpeg</mime-type>
           <mime-type>video/x-msvideo</mime-type>
           <mime-type>video/mp4</mime-type>
         </mime-types>
         <metadata>
           <match>\s*([A-Za-z0-9/ \(\)]+\S{1})\s+:\s+([A-Za-z0-9\(\)\[\] \:\-\.]+)\s*</match>
         </metadata>
      </parser>
    </external-parsers>
..

The constructor of CompositeExternalParser as configured above uses a factory to
check and load the parser, which is actually using java runtime.exec() to call the
configured commands, with org.apache.tika.parser.external.ExternalParsersConfigReader
parsing the xml file.

::
    TikaConfig.init() ->
        XmlLoader.loadOverAll() -> loadOne() ->
            ParserXmlLoader.createComposit() ->
                ...
                new CompositeExternalParser() ->
                    ExternalParsersFactory.create() ->
                        ExternalParsersConfigReader.read(element) -> // element: xml/external-parsers
                            ExternalParsersConfigReader.readCheckTagAndCheck() ->
                                ExternalParser.check()

The check commands is run at loading,

.. code-block:: java


    public class ExternalParser extends AbstractParser {

      // This line explain why no tika error output if the tool is missing.
      private static final Logger LOG = LoggerFactory.getLogger(ExternalParser.class);

      public static boolean check(String[] checkCmd, int... errorValue) {
        if (errorValue.length == 0) {
            errorValue = new int[]{127};
        }

        Process process = null;
        try {
            process = Runtime.getRuntime().exec(checkCmd);
            Thread stdErrSuckerThread = ignoreStream(process.getErrorStream(), false);
            Thread stdOutSuckerThread = ignoreStream(process.getInputStream(), false);
            stdErrSuckerThread.join();
            stdOutSuckerThread.join();
            //make the timeout parameterizable
            boolean finished = process.waitFor(60000, TimeUnit.MILLISECONDS);
            if (!finished) {
                throw new TimeoutException();
            }
            int result = process.exitValue();
            LOG.debug("exit value for {}: {}", checkCmd[0], result);
            for (int err : errorValue) {
                if (result == err) {
                    return false;
                }
            }
            return true;
        }
        catch (Exception e) {
            LOG.debug("exception trying to run  " + checkCmd[0], e);
            return false;
        }
      }
    }
..

The parsing command is called by user,

.. code-block:: java

    // cmd instance: [env, FOO=/tmp/apache-tika-9023966031715135711.tmp, exiftool, /tmp/apache-tika-4419354677653382044.tmp]
    private void parse(TikaInputStream stream, XHTMLContentHandler xhtml, Metadata metadata) {
        ...
        if (cmd.length == 1) {
            process = Runtime.getRuntime().exec(cmd[0]);
        } else {
            process = Runtime.getRuntime().exec(cmd);
        }
    }
..

Load exiftool in Windows 
________________________

The problem is the checking and running command connfigured in package org.apache.tika.parser.external,
in tika-external-parsers.xml, won't work in Windows.

The jserv-album way
+++++++++++++++++++

Replace ExternalParsersFactory.create():

.. code-block:: java

    if (windows) {
        filepath = new File(filepath).getAbsolutePath();
        return create(new File(filepath).toURI().toURL());
    }
..

The give user a chance to configure the file.
