// internal dependencies
import {
    _httpItem,
    getNextUrl,
    getRESPONSE,
    getResponseFromObject,
    setProtocolStatus,
    _headerItem,
    _response,
    _header,
    _raw,
    _http,
    _head,
    formatResponse,
} from './mock';

// config
import {
    DOMAIN_200,
    DOMAIN_301,
    DOMAIN_404,
    DOMAIN_STATUS_0,
    DOMAIN_UNKNOWN,
} from './mock.config';

// types
import type { FORWARD_ITEMS } from './mock.d';

// constants
const protocol = 'http';
const protocolVersion = '1.1';
const INTERNAL_ERROR = 'Internal Server Error';
const MOVED = 'Moved Permanently';
const DOMAIN = 'example.yy';
const UNKNOWN = 'unknown.xx';
const PROTOCOL = { protocol, protocolVersion };
const etag = '"65f7fcac-12cb4"';
const lastModified = 'Mon, 18 Mar 2024 08:34:52 GMT';
const contentLength = '7698';

describe('✅ setProtocolStatus()', () => {
    const FN = setProtocolStatus;
    const EXPECTED = {
        '200': { status: '200', statusMessage: 'OK', ...PROTOCOL },
        '404': { status: '404', statusMessage: 'Not Found', ...PROTOCOL },
        '500': { status: '500', statusMessage: INTERNAL_ERROR, ...PROTOCOL },
        '301': { status: '301', statusMessage: MOVED, ...PROTOCOL },
        '0': { status: '0', statusMessage: 'unknown', ...PROTOCOL },
        '333': { status: '333', statusMessage: 'unknown', ...PROTOCOL }, // TODO: correct?
    };
    it('should set the protocol status correctly', () => {
        expect(FN(200)).toEqual(EXPECTED['200']);
        expect(FN(404)).toEqual(EXPECTED['404']);
        expect(FN(500)).toEqual(EXPECTED['500']);
        expect(FN(301)).toEqual(EXPECTED['301']);
        expect(FN(0)).toEqual(EXPECTED['0']);
        expect(FN(333)).toEqual(EXPECTED['333']);
    });
});
describe('✅ getNextUrl()', () => {
    const FN = getNextUrl;
    const FORWARDS: FORWARD_ITEMS = {
        [DOMAIN]: {
            status: 200,
            order: [
                `${DOMAIN}`,
                `www.${DOMAIN}`,
                `http://${DOMAIN}`,
                `https://${DOMAIN}`,
                `https://www.${DOMAIN}`,
                `https://www.${DOMAIN}/`,
            ],
            httpItems: {},
        },
    };
    it('should get the next URL correctly', () => {
        // Add your test cases here
        expect(FN(`${DOMAIN}`, FORWARDS)).toEqual({
            url: `www.${DOMAIN}`,
            statusCode: 301,
            isLast: false,
        });
        expect(FN(`www.${DOMAIN}`, FORWARDS)).toEqual({
            url: `http://${DOMAIN}`,
            statusCode: 301,
            isLast: false,
        });
        expect(FN(`http://${DOMAIN}`, FORWARDS)).toEqual({
            url: `https://${DOMAIN}`,
            statusCode: 301,
            isLast: false,
        });
        expect(FN(`https://${DOMAIN}`, FORWARDS)).toEqual({
            url: `https://www.${DOMAIN}`,
            statusCode: 301,
            isLast: false,
        });
        expect(FN(`https://www.${DOMAIN}/`, FORWARDS)).toEqual({
            url: `https://www.${DOMAIN}/`,
            statusCode: 200,
            isLast: true,
        });
    });
    it('should get the next URL correctly when at the last item', () => {
        expect(FN(`https://www.${DOMAIN}/`, FORWARDS)).toEqual({
            url: `https://www.${DOMAIN}/`,
            statusCode: 200,
            isLast: true,
        });
    });
    it('should get the next URL correctly when forwarding is enabled', () => {
        expect(FN(`${DOMAIN}`, FORWARDS, { forwarding: true })).toEqual({
            url: `https://www.${DOMAIN}/`,
            statusCode: 200,
            isLast: true,
        });
    });
    it('should handle unknown URLs gracefully', () => {
        expect(FN(`unknown.${UNKNOWN}`, FORWARDS)).toEqual({
            url: `unknown.${UNKNOWN}`,
            statusCode: 0,
            isLast: true,
        });
    });
});
describe('✅ _httpItem()', () => {
    const FN = _httpItem;
    const content = 'Hello, world!';
    it('[200] should return the correct HTTP item', () => {
        const status = 200;
        const opts = { content, etag, lastModified, contentLength };
        const EXPECTED = _http(status, opts);
        const result = FN(DOMAIN, { content, status });

        expect(result).toEqual(EXPECTED);
    });
    it('[301] should return the correct HTTP item for a different status code detected by domain', () => {
        const lastLocation = `https://www.${DOMAIN_200}`;
        const location = `${lastLocation}/`;
        const contentLength = '185';
        const opts = { contentLength, location, lastLocation };
        const EXPECTED = _http(301, opts);
        expect(FN(lastLocation)).toEqual(EXPECTED);
    });
    it('[301] should return the correct HTTP item for a different status code detected by domain', () => {
        const lastLocation = `https://www.${DOMAIN_301}`;
        const location = `${lastLocation}/`;
        const contentLength = '185';
        const opts = { contentLength, location, lastLocation };
        const EXPECTED = _http(301, opts);
        expect(FN(lastLocation)).toEqual(EXPECTED);
    });
    it('[301] should return the correct HTTP item for a different status code detected by domain', () => {
        const lastLocation = `https://www.${DOMAIN_301}/`;
        const contentLength = '185';
        const EXPECTED = _http(200, { contentLength, lastLocation });
        const result = FN(lastLocation);

        expect(result).toEqual(EXPECTED);
    });
    it('[111] should return the correct HTTP item when status code is unknown', () => {
        const content = 'xx';
        const status = 111;
        const EXPECTED = _http(status, { content });
        const result = FN(DOMAIN, { content, status });
        expect(result).toEqual(EXPECTED);
    });
    it('[200] should get the next URL correctly when forwarding is enabled', () => {
        const lastLocation = DOMAIN_200;
        const contentLength = '7698';
        const opts = { contentLength, lastLocation, etag, lastModified };
        const EXPECTED = _http(200, opts);
        expect(FN(lastLocation, {}, { forwarding: true })).toEqual(EXPECTED);
    });
    it('[301 ]should get the next URL correctly when forwarding is NOT enabled', () => {
        const lastLocation = DOMAIN_200;
        const location = `www.${lastLocation}`;
        const opts = { contentLength: '185', location, lastLocation };
        const EXPECTED = _http(301, opts);
        expect(FN(lastLocation, {}, { forwarding: false })).toEqual(EXPECTED);
    });
});

describe('✅ _headerItem()', () => {
    const FN = _headerItem;
    it('[404] should return header part of response', () => {
        const result = FN(`https://www.${DOMAIN_404}/`);
        const EXPECTED = _head(404, { contentLength: '1500' });
        expect(result).toEqual(EXPECTED);
    });
    it('[301] should return header part of response', () => {
        const lastLocation = `https://www.${DOMAIN_301}`;
        const location = `https://www.${DOMAIN_301}/`;
        const contentLength = '185';
        const result = FN(lastLocation);
        const EXPECTED = _head(301, { contentLength, location, lastLocation });
        expect(result).toEqual(EXPECTED);
    });
    it('[301] should return header part of response without lastLocation', () => {
        const URL = `https://www.${DOMAIN_301}`;
        const location = `https://www.${DOMAIN_301}/`;
        const result = FN(URL, {}, { noLastLocation: true });
        const EXPECTED = _head(301, { contentLength: '185', location });
        expect(result).toEqual(EXPECTED);
    });
});
describe('✅ getResponseFromObject()', () => {
    const FN = getResponseFromObject;
    const contentLength: string = '7698';
    it('[404] should return simple response', () => {
        const input = _http(404, { contentLength: '1500' });
        const result = FN(input);
        expect(result).toEqual(_raw(404));
    });
    it('[200] should return response', () => {
        const input = _http(200, { contentLength, etag, lastModified });
        const result = FN(input);
        expect(result).toEqual(_raw(200));
    });
    it('[200] should return response with content', () => {
        const content = `{"status":"data_found"}`;
        const inpt = _http(200, { contentLength, etag, lastModified, content });
        const alt = { content };
        const config = { format: 'default' };
        expect(FN(inpt)).toEqual(_raw(200, alt, config));
    });
    it('should return response with empty content', () => {
        const input: any = {};
        const EXPECTED = '\n';
        expect(FN(input)).toEqual(EXPECTED);
    });
});
describe('✅ getRESPONSE()', () => {
    const FN = getRESPONSE;
    it('[404] should return simple response', () => {
        expect(FN(`https://www.${DOMAIN_404}/`)).toEqual(_raw(404));
    });
    it('[200] should return extended response', () => {
        expect(FN(`https://www.${DOMAIN_200}/`)).toEqual(_raw(200));
    });
    it('[301] should return extended response', () => {
        // TODO: alt { Location} => { location}
        const alt: any = { Location: `www.${DOMAIN_200}` }; // new location
        expect(FN(DOMAIN_200)).toEqual(_raw(301, alt));
    });
    it('[200] should force manually response', () => {
        expect(FN(DOMAIN_200, { status: 200 })).toEqual(_raw(200));
    });
    // TODO:  evt. ein problem for forward
    it('[200] should use forward to provide final status code', () => {
        const opts = { forwarding: true };
        expect(FN(DOMAIN_200, undefined, opts)).toEqual(_raw(200));
    });
    it('[0] should return response with content', () => {
        expect(FN(DOMAIN_UNKNOWN)).toEqual(_raw(0));
    });
    it('[0] should return response with content', () => {
        expect(FN(DOMAIN_STATUS_0)).toEqual(_raw(0));
    });
});
describe('✅ _response()', () => {
    const FN = _response;
    const content = 'response content';
    const config = { format: 'response' };
    const alt = { content };
    it('[404] should return simple response', () => {
        const result = FN(`https://www.${DOMAIN_404}/`, 404, content);
        expect(result).toEqual(_raw(404, alt, config));
    });
    it('[200] should return extended response', () => {
        const result = FN(`https://www.${DOMAIN_200}/`, 200, content);
        expect(result).toEqual(_raw(200, alt, config));
    });
    it('[301] should return extended response', () => {
        const result = FN(DOMAIN_200, 301, content);
        const alt = { Location: `www.${DOMAIN_200}`, content }; // new location
        expect(result).toEqual(_raw(301, alt, config));
    });
});
describe('✅ _header()', () => {
    const FN = _header;
    it('[404] should return simple response', () => {
        const result = FN(`https://www.${DOMAIN_404}/`);
        expect(result).toEqual(_raw(404));
    });
    it('[200] should return extended response', () => {
        const result = FN(`https://www.${DOMAIN_200}/`);
        expect(result).toEqual(_raw(200));
    });
    it('[301] should return extended response', () => {
        const result = FN(`https://www.${DOMAIN_301}`);
        expect(result).toEqual(_raw(301));
    });
});
describe('✅ formatResponse()', () => {
    const FN = formatResponse;
    const DOMAIN = 'example.com';
    const DOMAIN_2 = 'xyz.com';
    const content = 'response content';
    const TAB = '        ';
    // const SEPERATOR = `${TAB}\r\n\r\n`;
    const SEPERATOR = `${TAB}\n\n\n${TAB}${TAB}${TAB}`;
    const INPUT = {
        'HTTP/1.1 301 Moved Permanently': '',
        'Accept-Ranges': 'bytes',
        Connection: 'keep-alive',
        contentLength: '185', // testing lower keys
        'Content-Type': 'text/html; charset=UTF-8',
        date: 'Fri, 29 Mar 2024 21:28:51 GMT', // testing lower keys
        Location: `https://www.${DOMAIN}/`,
        'Referrer-Policy': 'no-referrer-when-downgrade',
        Server: 'nginx/1.14.1',
        'Strict-Transport-Security': 'max-age=31536000;',
        'X-Frame-Options': 'SAMEORIGIN',
    };
    it('should return formatted response', () => {
        const EXPECTED =
            '\n' +
            'HTTP/1.1 301 Moved Permanently\r\n' +
            'Accept-Ranges: bytes\r\n' +
            'Connection: keep-alive\r\n' +
            'Content-Length: 185\r\n' +
            'Content-Type: text/html; charset=UTF-8\r\n' +
            'Date: Fri, 29 Mar 2024 21:28:51 GMT\r\n' +
            `Location: https://www.${DOMAIN}/\r\n` +
            // 'Location: www.domain-200.de\r\n' +
            'Referrer-Policy: no-referrer-when-downgrade\r\n' +
            'Server: nginx/1.14.1\r\n' +
            'Strict-Transport-Security: max-age=31536000;\r\n' +
            'X-Frame-Options: SAMEORIGIN\r\n' +
            `${TAB}\n`;
        const result = FN(INPUT);

        expect(result).toEqual(EXPECTED);
    });
    it('should return formatted response with different location', () => {
        const EXPECTED =
            '\n' +
            'HTTP/1.1 301 Moved Permanently\r\n' +
            'Accept-Ranges: bytes\r\n' +
            'Connection: keep-alive\r\n' +
            'Content-Length: 185\r\n' +
            'Content-Type: text/html; charset=UTF-8\r\n' +
            'Date: Fri, 29 Mar 2024 21:28:51 GMT\r\n' +
            `Location: https://www.${DOMAIN_2}/\r\n` +
            // 'Location: www.domain-200.de\r\n' +
            'Referrer-Policy: no-referrer-when-downgrade\r\n' +
            'Server: nginx/1.14.1\r\n' +
            'Strict-Transport-Security: max-age=31536000;\r\n' +
            'X-Frame-Options: SAMEORIGIN\r\n' +
            `${TAB}\n`;
        const result = FN(INPUT, { Location: `https://www.${DOMAIN_2}/` });

        expect(result).toEqual(EXPECTED);
    });
    it('should return formatted response with content', () => {
        const EXPECTED =
            '\n' +
            'HTTP/1.1 301 Moved Permanently\r\n' +
            'Accept-Ranges: bytes\r\n' +
            'Connection: keep-alive\r\n' +
            'Content-Length: 185\r\n' +
            'Content-Type: text/html; charset=UTF-8\r\n' +
            'Date: Fri, 29 Mar 2024 21:28:51 GMT\r\n' +
            `Location: https://www.${DOMAIN}/\r\n` +
            // 'Location: www.domain-200.de\r\n' +
            'Referrer-Policy: no-referrer-when-downgrade\r\n' +
            'Server: nginx/1.14.1\r\n' +
            'Strict-Transport-Security: max-age=31536000;\r\n' +
            'X-Frame-Options: SAMEORIGIN\r\n' +
            '' +
            SEPERATOR +
            content;

        const result = FN(INPUT, { content }, { format: 'other' });

        expect(result).toEqual(EXPECTED);
    });
});
