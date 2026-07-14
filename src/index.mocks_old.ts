import type { HTTP_OBJECTS } from './index.d';
import { DOMAIN_200, DOMAIN_UNKNOWN } from './index.config';
import { MOCKED_URLS_TYPE } from './index.d';
import { setProtocolStatus } from './index.mocks';
// import { DOMAIN_UNKNOWN } from './index.mocks';
// import { DOMAIN_UNKNOWN } from './index.mocks';

export const DOMAIN_1 = 'domain-1.de';
export const DOMAIN_2 = 'domain-2.de';
export const DOMAIN_3 = 'robert.berlin';
export const DOMAIN_4 = 'aloha.com';
export const DOMAIN_5 = 'lorem.org';
export const DOMAIN_6 = 'blubb.de';
export const DOMAIN_7 = 'google.de';
// export const DOMAIN_UNKNOWN = 'domain-unknown.de';
// export const DOMAIN_200 = 'domain-200.de';

const DATE = 'Fri, 29 Mar 2024 21:28:51 GMT';
const LAST_MODIFIED = 'Mon, 18 Mar 2024 08:34:52 GMT';
const SERVER = {
    BASE: `
        Server: nginx/1.14.1
        Content-Type: text/html
        Connection: keep-alive`,
    BASE2: `
        Server: nginx/1.14.1
        Content-Type: text/html; charset=UTF-8
        Connection: keep-alive`,
    EXTENDED: `
        Server: nginx/1.14.1
        Content-Type: text/html; charset=UTF-8
        Connection: keep-alive
        X-Frame-Options: SAMEORIGIN
        Strict-Transport-Security: max-age=31536000;
        Referrer-Policy: no-referrer-when-downgrade`,
};
export const STATUS = {
    HTTP_301: `
        HTTP/1.1 301 Moved Permanently
        Date: ${DATE}
        Content-Length: 185
        ${SERVER.EXTENDED}`,
    HTTP_200: `
        HTTP/1.1 200 OK
        Date: ${DATE}
        Last-Modified: ${LAST_MODIFIED}
        Content-Length: 76980
        ETag: "65f7fcac-12cb4"
        Accept-Ranges: bytes
        ${SERVER.EXTENDED}`,
    HTTP_404: `
        HTTP/1.1 404 Not Found
        Date: ${DATE}
        Content-Length: 41739
        ETag: "6595577a-a30b"
        ${SERVER.BASE2}`,
};
// console.log(STATUS.HTTP_404);

export const MOCKED_URLS: MOCKED_URLS_TYPE = {
    HTTP_UNKNOWN: {
        step1: `${DOMAIN_UNKNOWN}`,
        // step1: 'https://wifi.inflightinternet.com',
    },
    DOMAIN_200: {
        step1: `https://www.${DOMAIN_200}/`,
    },
    HTTP_200: {
        step1: `https://www.${DOMAIN_1}/`,
    },
    HTTP_200_FORWARD_1: {
        step1: `${DOMAIN_2}`,
        step2: `https://www.${DOMAIN_2}/`,
    },
    HTTP_200_FORWARD_2: {
        step1: `${DOMAIN_3}`,
        step2: `https://${DOMAIN_3}/`,
    },
    HTTP_404: {
        step1: `https://www.${DOMAIN_4}/xx/`,
    },
    HTTP_404_FORWARD: {
        step1: `${DOMAIN_5}/xx`,
        step2: `https://www.${DOMAIN_5}/xx`,
        step3: `https://www.${DOMAIN_5}/xx/`,
    },
    HTTP_404_FORWARD_MAX: {
        step1: `${DOMAIN_6}/xx`,
        step2: `${DOMAIN_6}/xx/`,
        step3: `http://${DOMAIN_6}/xx/`,
        step4: `https://${DOMAIN_6}/xx/`,
        step5: `https://www.${DOMAIN_6}/xx/`,
        step6: `https://www.${DOMAIN_6.replace('.de', '.com')}/xx/`,
    },
};

// export const setProtocolStatus = (statusCode: number): PROTOCOL_STATUS => {
//     const statusMessage: string = STATUSCODES[`${statusCode}`];
//     const status: NumericString = `${statusCode}` as NumericString;
//     return {
//         protocol: 'http',
//         protocolVersion: '1.1',
//         status,
//         statusMessage,
//     };
// };
const BASE_HTTP_OBJECT = {
    // protocol: 'http',
    // protocolVersion: '1.1',
    // contentType: 'text/html',
    contentType: 'text/html; charset=UTF-8',
    connection: 'keep-alive',
    server: 'nginx/1.14.1',
    date: DATE,
};

export const HTTP_OBJECT: HTTP_OBJECTS = {
    HTTP_301: {
        ...setProtocolStatus(301),
        // status: '301',
        // statusMessage: 'Moved Permanently',
        // 'http/1.1': '301 Moved Permanently',
        contentLength: '185',
        location: `https://www.${DOMAIN_2}/`,
        xFrameOptions: 'SAMEORIGIN',
        strictTransportSecurity: 'max-age=31536000;',
        referrerPolicy: 'no-referrer-when-downgrade',
        ...BASE_HTTP_OBJECT,
    },
    HTTP_301_GOOGLE: {
        ...setProtocolStatus(301),
        // status: '301',
        // statusMessage: 'Moved Permanently',
        // 'http/1.1': '301 Moved Permanently',
        contentLength: '185',
        location: `http://www.${DOMAIN_7}/`,
        xFrameOptions: 'SAMEORIGIN',
        // strictTransportSecurity: 'max-age=31536000;',
        // referrerPolicy: 'no-referrer-when-downgrade',
        ...BASE_HTTP_OBJECT,
        server: 'gws', // overwritten
        expires: 'Thu, 07 Aug 2025 10:03:58 GMT',
        cacheControl: 'public, max-age=2592000',
        xXssProtection: '0',
    },
    HTTP_200: {
        ...setProtocolStatus(200),
        // status: '200',
        // statusMessage: 'OK',
        // 'http/1.1': '200 OK',
        contentLength: '76980',
        lastModified: LAST_MODIFIED,
        etag: '"65f7fcac-12cb4"', // cahing
        xFrameOptions: 'SAMEORIGIN', // security: clickjacking
        strictTransportSecurity: 'max-age=31536000;', // security: https for 1 year
        referrerPolicy: 'no-referrer-when-downgrade', // policy for referrer: none for downgrade from https to http
        acceptRanges: 'bytes', // partieller download
        ...BASE_HTTP_OBJECT,
    },
    HTTP_404: {
        ...setProtocolStatus(404),
        // 'http/1.1': '404 Not Found',
        server: 'nginx/1.14.1',
        date: DATE,
        // contentType: 'text/html',
        contentLength: '41739',
        connection: 'keep-alive',
        etag: '"6595577a-a30b"',
        contentType: 'text/html; charset=UTF-8',
    },
    HTTP_0: {
        ...setProtocolStatus(0),
        server: 'nginx/1.14.1',
        date: DATE,
        contentType: 'text/html; charset=UTF-8',
        connection: 'keep-alive',
        contentLength: '0',
    },
};

export const MOCKED_HTTP_STATUS = {
    HTTP_UNKNOWN: {
        step1: `curl: (6) Could not resolve host: ${DOMAIN_UNKNOWN}`,
        // step1: `curl: (6) Could not resolve host: wifi.inflightinternet.com`,
    },
    DOMAIN_200: {
        step1: `
            ${STATUS.HTTP_200}
        `,
    },
    HTTP_200: {
        step1: `
            ${STATUS.HTTP_200}
        `,
    },
    HTTP_200_FORWARD_1: {
        step1: `
            ${STATUS.HTTP_301}
            Location: https://www.${DOMAIN_2}/

        `,
        step2: `
            ${STATUS.HTTP_200}
        `,
    },
    HTTP_404: {
        step1: `
            ${STATUS.HTTP_404}
        `,
    },
    HTTP_404_FORWARD: {
        step1: `
            ${STATUS.HTTP_301}
            Location: https://www.${DOMAIN_5}/xx
        `,
        step2: `
            ${STATUS.HTTP_301}
            Location: https://www.${DOMAIN_5}/xx/
        `,
        step3: `
            ${STATUS.HTTP_404}
        `,
    },
    HTTP_404_FORWARD_MAX: {
        step1: `
            ${STATUS.HTTP_301}
            Location: ${DOMAIN_6}/xx/
        `,
        step2: `
            ${STATUS.HTTP_301}
            Location: http://${DOMAIN_6}/xx/
        `,
        step3: `
            ${STATUS.HTTP_301}
            Location: https://${DOMAIN_6}/xx/
        `,
        step4: `
            ${STATUS.HTTP_301}
            Location: https://www.${DOMAIN_6}/xx/
        `,
        step5: `
            ${STATUS.HTTP_301}
            Location: https://www.${DOMAIN_6}/xx/
        `,
        step6: `
            ${STATUS.HTTP_404}
        `,
    },
    HTTP_200_FORWARD_2: {
        step1: `
            HTTP/1.0 308 Permanent Redirect
            Content-Type: text/plain
            Location: https://${DOMAIN_3}/
            Refresh: 0;url=https://${DOMAIN_3}/
            server: Vercel
        `,
        step2: `
            HTTP/2 200
            date: ${DATE}
            accept-ranges: bytes
            access-control-allow-origin: *
            age: 5626037
            cache-control: public, max-age=0, must-revalidate
            content-disposition: inline
            content-type: text/html; charset=utf-8
            etag: "2e6ccb0b0403aeb5796556f41b04c0fc"
            server: Vercel
            strict-transport-security: max-age=63072000
            x-vercel-cache: HIT
            x-vercel-id: fra1::296pw-1711747937798-0d4aec759f9a
            content-length: 1900
        `,
    },
};

export const HTTP_UNKNOWN = `curl: (28) Connection timed out after 2000 milliseconds`;

export const HTTP__301_TRIM = `HTTP/1.1 301 Moved Permanently
Location: http://www.google.de/
Content-Type: text/html; charset=UTF-8
connection: keep-alive
Date: ${DATE}
Expires: Thu, 07 Aug 2025 10:03:58 GMT
Cache-Control: public, max-age=2592000
Server: gws
Content-Length: 185
X-XSS-Protection: 0
X-Frame-Options: SAMEORIGIN`;
export const HTTP_CONTENT_301 = `<HTML><HEAD><meta http-equiv="content-type" content="text/html;charset=utf-8">
<TITLE>301 Moved</TITLE></HEAD><BODY>
<H1>301 Moved</H1>
The document has moved
<A HREF="http://www.google.de/">here</A>.
</BODY></HTML>`;
