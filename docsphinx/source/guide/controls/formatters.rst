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

Called by Treegrid#render().

.. _api_widgets_tree:

Signature defined in `tree.tsx <https://github.com/odys-z/Anclient/blob/master/js/anreact/src/react/widgets/tree.tsx>`_:

.. code-block:: typescript

    interface AnTreegridCol extends AnlistColAttrs<JSX.Element, CompOpts> {
        /**
         * Overide AnTablistProps#formatter
         * Formatt a tree item cell/grid from col and node.
         */
        colFormatter?: (col: AnTreegridCol, n: AnTreeNode, opts?: CompOpts) => JSX.Element;

        thFormatter?: (col: AnTreegridCol, colx: number, opts?: CompOpts) => JSX.Element;
    }
..

For the example, see :ref:`Doc type parser<controls_typeparser>`.
