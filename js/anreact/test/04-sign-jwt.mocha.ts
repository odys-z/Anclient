import { assert } from 'chai'
import * as jwt from 'jsonwebtoken';
import { only_payload } from './sessionless/src/ext/gen_jwtoken';

describe('case: [04.1 JWT Token]', () => {

	it('digital signature with jsonwebtoken', () => {
        let d = Date.now();
        const token = jwt.sign({d}, "secret");
        const decode = jwt.verify(token, "secret");
        console.log(new Date(d).toString());
        assert.equal(decode.d, d, "time now ---");

        const secret = 'mysecret';
        const onlyoffice_token = jwt.sign(only_payload, secret, { algorithm: 'HS256' });
        const only_secret = jwt.verify(onlyoffice_token, secret); 
        console.log(onlyoffice_token, '\n==>\n', only_secret);
        assert.equal(only_secret.documentType, 'word', "OnlyOffice Configuration - 1");
        assert.equal(only_secret.document.key, only_payload.document.key, "OnlyOffice Configuration - 2");
    })
})