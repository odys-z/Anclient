Tips
====

Login error: Invalid AES key length: 26 bytes
---------------------------------------------

If the user's password is encrypted with a different root key, failed decryption
will results in this error.

context.xml:

.. code-block: xml

    <Context reloadable="true">
      <WatchedResource>WEB-INF/web.xml</WatchedResource>
      <Parameter name="io.oz.root-key" value="16 bytes root key" orride="false"/>
    </Context>
..
