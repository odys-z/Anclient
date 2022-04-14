Formatters (AnReact)
====================

TRecordForm Formatter
---------------------

- called by

::

    TRecordForm


- signature

.. code-block:: javascript

    /**
     * @param {object} record
     * @param {object} fields information
	 * @param {Semantier} tier
     * @return {React.Component}
     */
    function(record, field, tier);
..

- example

.. code-block:: javascript

	/**
	 * Format an image upload component.
	 * @param {object} record for the form
	 * @param {object} field definition, e.g. a field of tier._fileds
	 * @param {Semantier} tier
	 * @return {React.component} ImageUpload
	 */
	loadAvatar(rec, field, tier) {
		return (
			<ImageUpload
				blankIcon={{color: "primary", width: 32, height: 32}}
				tier={tier} field={field}
				src64={rec && field && rec[field.field]}
			/>);
	}
..

Treegrid Cell Formatter
-----------------------

TODO ...
