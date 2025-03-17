import { assert } from 'chai'
import * as jwt from 'jsonwebtoken';
import { config_docx } from './sessionless/src/ext/doc-res-config.mjs';

describe('case: [04.1 JWT Token]', () => {

	it('digital signature with jsonwebtoken', () => {
        let d = Date.now();
        const token = jwt.sign({d}, "secret");
        const decode = jwt.verify(token, "secret");
        console.log(new Date(d).toString());
        assert.equal(decode.d, d, "time now ---");

        const secret = 'mysecret';
        const onlyoffice_token = jwt.sign(config_docx, secret, { algorithm: 'HS256' });
        const only_secret = jwt.verify(onlyoffice_token, secret); 
        console.log(onlyoffice_token, '\n==>\n', only_secret);
        assert.equal(only_secret.documentType, 'word', "OnlyOffice Configuration - 1");
        assert.equal(only_secret.document.key, config_docx.document.key, "OnlyOffice Configuration - 2");
    })
})