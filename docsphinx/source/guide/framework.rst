Application Framework
=====================

The JSample project is a good example to start work with the framework.

JSample Session Management
--------------------------

Jsample implementing session management based on Semantic.jserv, by providing a
configuration of user class name in config.xml:

.. code-block:: XML

    <configs>
      <t id="default" pk="k" columns="k,v">
        <c>
          <k>class-IUser</k>
          <v>io.odysz.jsample.SampleUser</v>
        </c>
      </t>
    </configs>
..

The *io.odysz.jsample.SampleUser* implementing *JUser* interface.

Now the clinet can login to jsample session like this

.. code-block:: javascript

    new AnClient.login('admin', 'pswd',
        (sessionClient) => {
            save(sessionClient);
        });
..

or in java

.. code-block:: java

    package io.odysz.jclient;

    /**
     * Unit test for sample App.
     */
    public class AnsonClientTest {

        private AnsonClient client;

        @BeforeAll
        public static void init() {
            Utils.printCaller(false);
            jserv = "http://localhost:8080/doc-base"
            pswd = ...;
            Clients.init(jserv);
        }

        @Test
        public void queryTest() throws IOException,
                SemanticException, SQLException, GeneralSecurityException, AnsonException {
            String sys = "sys-sqlite";
            client = Clients.login("admin", pswd);
            AnsonMsg<AnQueryReq> req = client.query(sys,
                    "a_users", "u",
                    -1, -1); // don't paging

            req.body(0)
                .expr("userName", "uname")
                .expr("userId", "uid")
                .expr("r.roleId", "role")
                .j("a_roles", "r", "u.roleId = r.roleId")
                .where("=", "u.userId", "'admin'");

            client.commit(req, (code, data) -> {
                    List<AnResultset> rses = (List<AnResultset>) data.rs();
                      for (AnResultset rs : rses) {
                          rs.printSomeData(true, 2, "uid", "uname", "role");
                          rs.beforeFirst();
                          while(rs.next()) {
                              String uid0 = rs.getString("uid");
                              assertEquals("admin", uid0);

                              String roleId = rs.getString("role");
                              getMenu("admin", roleId);

                              // function/semantics tests
                              testUpload(client);

                              // insert/load oracle reports
                              testORCL_Reports(client);
                          }
                      }
                }, (code, err) -> {
                      fail(err.msg());
                      client.logout();
            });
        }
    }
..

JServ resolving rules
---------------------

Jserv is the json data service used by Anclient. It's an SOA architect and can be
connected by Anclient with flexibility.

Resolving Process
_________________

Since v 0.9.27, Anclient for React using the context, called AnContext, as a
singleton and implement these rules to resolve / find the jserv address.

1. Ask

::

    <origin>/<app-path>/privat/host.json

for configuration to find what the jserv url is.

A jserv configuration object can be:

.. code-block:: json

    {
      "localhost": "http://localhost:8080/jserv-quiz",
      "host-1": "http://host-1.com:8080/jserv-quiz"
    }
..

2. If there are errors getting this json data, AnContext will try

::

   origin/app-path/github.com.

3. The jserv address are managed by AnContext.

4. When an Anclient supported (React) page is loaded, the page will set a url
parameter, serv to AnClient.servId. This is used as the default jserv location.
If there is no such parameter, Anclient will use "host" as the default value.

5. Ancontext are provided by React application as the type of root context. Nested
components will use it like a singleton.

When to setup
_____________

It's the deploying process setting what jserv id and ur to be used. Take
*jserv-quiz/react-quiz* for example, the jserv id is generated when user create
the "*Share*" link, included in the target url as parameter::

    serv='host-1'

This will be passed in plain-quiz/poll-anson.html as parameter to initialize the
React applicaion:

.. code-block:: javascript

    let searchParams = new URLSearchParams(window.location.search)
    let serv = searchParams ? searchParams.get('serv') : undefined;
    Quizlist.bindQuizzes('quizlist', serv);
..

Where the *quizlist* is the id of <div/> for React root component.

If the parameter doesn't been found, AnContext will use *undefined* as id which
will have AnContext use '*host*' as default jserv id.

.. note:: There are two different serv-id in

    *react-quiz/quizlist.html?serv=...*

    and

    *plain-quiz/poll-anson.html?serv=...*.

    The first serv-id specify where Quizlist root component should save it's data;
    the latter is specified by user while composing quizs and generated in share
    link, which will have target poll save data to there.

    We can't figure out what's the scenario a polling page doesn't use the quiz
    composer's data service as both share the same quizzes data.
..
