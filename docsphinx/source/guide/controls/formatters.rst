Formatters
==========

TRecordForm Formatter
---------------------

- called by

::

    TRecordForm


- signature

.. code-block:: javascript

    function() {

	}
..

- example

.. code-block:: javascript

	/**
	 * Format an image upload component.
	 * @param {object} record for the form
	 * @param {object} field difinetion, e.g. field of tier._fileds
	 * @param {Semantier} tier
	 * @return {React.component} ImageUpload
	 */
	loadAvatar(rec, field, tier) {
		return (
			<ImageUpload
				blankIcon={{color: "primary", width: 32, height: 32}}
				tier={this} field={field}
				src64={rec && field && rec[field.field]}
			/>);
	}
..

Treegrid Cell Formatter
-----------------------

TODO ...
