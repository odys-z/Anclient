package io.odysz.jclient.tier;

import io.odysz.semantic.jprotocol.JProtocol.CRUD;

public class Semantier {
    /**main table name */
    String mtabl;

    /** list's columns */
    TierCol[] _cols;

    /** client function / CRUD identity */
    String uri;

    /** Fields in details from, e.g. maintable's record fields */
    TierCol[] _fields;

    /** optional main table's pk */
    // pk: string;

    /** current crud */
    CRUD crud;

    /** current list's data */
    Tierec[] rows;

    /** current pk value */
    PkVal pkval; //  = {pk: undefined, v: undefined};

    /** current record */
    Tierec rec;

    /** All sub table's relationships */
    Tierelations relMeta;
}
