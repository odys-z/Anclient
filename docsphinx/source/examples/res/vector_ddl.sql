drop table if exists s_domain;
CREATE TABLE s_domain (
    did      TEXT PRIMARY KEY,
    tag      TEXT,
    parent   TEXT,
    label    TEXT NOT NULL,
    remarks  TEXT
);

drop table if exists vector;
CREATE TABLE vector (
    vid    VARCHAR2(12) PRIMARY KEY,
    val    VARCHAR2(1000),
    dim1   VARCHAR2(12) NOT NULL,
    dim2   VARCHAR2(12),
    dim3   VARCHAR2(12),
    dim4   VARCHAR2(12),
    dim5   VARCHAR2(12),
    dim6   VARCHAR2(12),
    dim7   VARCHAR2(12),
    dim8   VARCHAR2(12)
);

-- GICS https://en.wikipedia.org/wiki/Global_Industry_Classification_Standard       
insert into s_domain VALUES("GICS-10",       "GICS", null,          "Energy", "");
insert into s_domain VALUES("GICS-1010",     "GICS", "GICS-10",     "Energy", "");
insert into s_domain VALUES("GICS-101010",   "GICS", "GICS-1010",   "Energy Equipment & Services", "");
insert into s_domain VALUES("GICS-10101010", "GICS", "GICS-101010", "Oil & Gas Drilling", "");
insert into s_domain VALUES("GICS-10101020", "GICS", "GICS-101010", "Gas Equipment & Services", "");

insert into s_domain VALUES("GICS-101020",   "GICS", "GICS-1010",   "Oil, Gas & Consumable Fuels", "");
insert into s_domain VALUES("GICS-10102010", "GICS", "GICS-101020", "Integrated Oil & Gas", "");
insert into s_domain VALUES("GICS-10102020", "GICS", "GICS-101020", "Oil & Gas Exploration & Production", "");
insert into s_domain VALUES("GICS-10102030", "GICS", "GICS-101020", "Oil & Gas Refining & Marketing", "");
insert into s_domain VALUES("GICS-10102040", "GICS", "GICS-101020", "Oil & Gas Strorage & Transportation", "");
insert into s_domain VALUES("GICS-10102050", "GICS", "GICS-101020", "Oil & Gas Coal & Consumable Fuels", "");

insert into s_domain VALUES("GICS-15",       "GICS", null,          "Materials", "");
insert into s_domain VALUES("GICS-1510",     "GICS", "GICS-15",     "Materials", "");
insert into s_domain VALUES("GICS-151010",   "GICS", "GICS-1510",   "Chemicals", "");
insert into s_domain VALUES("GICS-15101010", "GICS", "GICS-151010", "Commodity Chemicals", "");
insert into s_domain VALUES("GICS-15101020", "GICS", "GICS-151010", "Diversified Chemicals", "");
insert into s_domain VALUES("GICS-15101030", "GICS", "GICS-151010", "Fertilizer & Agricultural Chemicals", "");
insert into s_domain VALUES("GICS-15101040", "GICS", "GICS-151010", "Industrial Gases", "");
insert into s_domain VALUES("GICS-15101050", "GICS", "GICS-151010", "Special Chemicals", "");

insert into s_domain VALUES("GICS-151020",   "GICS", "GICS-1510",   "Construction Materials", "");
insert into s_domain VALUES("GICS-15102010", "GICS", "GICS-151020", "Construction Materials", "");

insert into s_domain VALUES("GICS-151030",   "GICS", "GICS-1510",   "Containers & Packaging", "");
insert into s_domain VALUES("GICS-15103010", "GICS", "GICS-151030", "Metal & Glass Containers", "");
insert into s_domain VALUES("GICS-15103020", "GICS", "GICS-151030", "Paper Packaging", "");

insert into s_domain VALUES("own",   "ownership", null,  "business ownership", "");
insert into s_domain VALUES("own-1", "ownership", "own", "public", "public owned");
insert into s_domain VALUES("own-2", "ownership", "own", "listed", "public owned");
insert into s_domain VALUES("own-3", "ownership", "own", "state",  "state owned");
insert into s_domain VALUES("own-4", "ownership", "own", "private","personal owned");
insert into s_domain VALUES("own-5", "ownership", "own", "joint",  "joint venture");

insert into vector VALUES("v 001", "100", "80-", "0",  "GICS-15101010", "B1", "C1", "D1", "own-1", "F1");
insert into vector VALUES("v 002", "103", "80-", "3",  "GICS-15101010", "B2", "C2", "D2", "own-2", "F2");
insert into vector VALUES("v 003", "105", "80-", "5",  "GICS-15102020", "B1", "C3", "D1", "own-3", "F1");
insert into vector VALUES("v 004", "113", "80-", "13", "GICS-15102010", "B1", "C3", "D2", "own-4", "F2");
insert into vector VALUES("v 005", "111", "80-", "11", "GICS-15103020", "B1", "C1", "D3", "own-1", "F1");
insert into vector VALUES("v 006", "103", "80-", "3",  "GICS-10101050", "B1", "C2", "D2", "own-2", "F2");
insert into vector VALUES("v 007", "105", "80-", "5",  "GICS-15103010", "B1", "C4", "D3", "own-3", "F1");
insert into vector VALUES("v 008", "106", "80-", "6",  "GICS-15103020", "B1", "C2", "D4", "own-4", "F2");
insert into vector VALUES("v 009", "102", "80-", "2",  "GICS-15103020", "B1", "C2", "D2", "own-4", "F2");

