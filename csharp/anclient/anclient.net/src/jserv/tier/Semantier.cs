using static io.odysz.semantic.jprotocol.JProtocol;

namespace anclient.net.jserv.tier
{
    class Semantier
    {
        /**main table name */
        string mtabl;

        /** list's columns */
        TierCol[] _cols;

        /** client function / CRUD identity */
        string uri;

        /** Fields in details from, e.g. maintable's record fields */
        TierCol[] _fields;

        /** optional main table's pk */
        // pk: string;

        /** current crud */
        CRUD crud;

        /** current list's data */
        Tierec[] rows;

        /** current pk value */
        PkMeta pkval; //  = {pk: undefined, v: undefined};

        /** current record */
        Tierec rec;

        /** All sub table's relationships */
        Tierelations relMeta;

    }
}
