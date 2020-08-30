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
