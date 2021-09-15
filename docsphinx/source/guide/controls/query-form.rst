QueryForm
=========

.. attention:: This doc is deprecated
..

1. Combobox binding:

Sample::

    jsample/views/domain.jsx

Query form uses dataset, sk='lvl1.domain.jsample' to mount Combobox;

Query form are configured with configuration data. Condition fields are generated
according to this.state.conds;

2. AnQueryForm usage

Query condition is controlled by <AnQueryForm [query]>. Provide a callback for
iterating through user's interaction results.

3. Use AnReactExt for list binding

DomainComp.toSearch() uses the query form results as conditions, load list from
port query.serv through API of AnContext.anClient, which is an instance of SessionClient,
then mount the list to the main table.
