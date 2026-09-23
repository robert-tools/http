// external dependencies
import { LOG } from '@robert.tools/log';

// internal dependencies
import {
    hasTimeout,
    setLastLocation,
    splitHeaderAndContent,
    getDefaultResponse,
    toHTTP,
    isHTTP,
    getSuccess,
    getCurlOpts,
} from './utils';
import { _http } from '../mock/mock';

// config
import { DEFAULT_HTTP } from './utils.config';

// types
import { HTTP, HTTP_OPTS } from './../index.d';

const DOMAIN = 'http://example.com';
describe('✅ hasTimeout()', () => {
    const FN = hasTimeout;
    it('should return true if timeout is less than 0.01', () => {
        expect(FN(`curl -m 0.001 ${DOMAIN}`)).toBe(true);
        expect(FN(`curl -m 0.01 ${DOMAIN}`)).toBe(true);
        expect(FN(`curl -m 0.1 ${DOMAIN}`)).toBe(true);
        expect(FN(`curl -m 0_1 ${DOMAIN}`)).toBe(false);
        expect(FN(`curl -m 1 ${DOMAIN}`)).toBe(true);
        expect(FN(`curl -m 1.2 ${DOMAIN}`)).toBe(true);
    });

    it('should return false if no timeout is specified', () => {
        expect(FN(`curl ${DOMAIN}`)).toBe(false);
    });

    it('should return false if curl is undefined', () => {
        expect(FN(undefined)).toBe(false);
    });
});
describe('✅ setLastLocation', () => {
    const FN = setLastLocation;
    const DOMAIN = 'https://example.com';
    it('should set last location if location !== url && noLastLocation is not set', () => {
        const item = { location: `${DOMAIN}/next` } as HTTP;
        const url = `${DOMAIN}/current`;
        const opts = {};
        FN(item, url, opts);
        expect(item['lastLocation']).toBe(url);
    });

    it('should not set last location if location is the same as url', () => {
        const item = { location: `${DOMAIN}/current` } as HTTP;
        const url = `${DOMAIN}/current`;
        const opts = {};
        FN(item, url, opts);
        expect(item['lastLocation']).toBeUndefined();
    });

    it('should not set last location if noLastLocation is true', () => {
        const item = { location: `${DOMAIN}/next` } as HTTP;
        const url = `${DOMAIN}/current`;
        const opts = { noLastLocation: true };
        FN(item, url, opts);
        expect(item['lastLocation']).toBeUndefined();
    });
});
describe('✅ splitHeaderAndContent', () => {
    const FN = splitHeaderAndContent;
    const content = 'Content';
    const http1 = `HTTP/1.1 200 OK`;
    const http2 = `HTTP/2 200 OK`;
    it('should return content based on http item and raw response', () => {
        const raw = `HTTP/1.1 200 OK\n\n${content}`;
        expect(FN(raw)).toEqual({ header: toHTTP(http1), content });
    });
    it('should return empty content if only HTTP header is present', () => {
        const raw = `HTTP/1.1 200 OK\n`;
        expect(FN(raw)).toEqual({ header: toHTTP(http1), content: '' });
    });
    it('should return raw content if it does not start with HTTP/ and trimmed', () => {
        const content = 'XXX/1.1 200 OK\n\nfoobar';
        const raw = `${content}\n`;
        expect(FN(raw)).toEqual({ header: DEFAULT_HTTP, content });
    });
    it('should return all raw as content if it does not start with HTTP/', () => {
        const raw = `foobar`;
        expect(FN(raw)).toEqual({ header: DEFAULT_HTTP, content: raw });
    });
    it('should return content for HTTP/2 response', () => {
        const raw = `HTTP/2 200 OK\n\nfoobar`;
        expect(FN(raw)).toEqual({ header: toHTTP(http2), content: 'foobar' });
    });
});
describe('✅ getCurlOpts', () => {
    const FN = getCurlOpts;
    it('should return curl options based on HTTP options', () => {
        const opts: HTTP_OPTS = {
            forwarding: true,
            ua: 'user-agent',
            method: 'GET',
            token: 'token',
        };
        const EXPECTED = {
            header: {
                ua: 'user-agent',
                token: 'token',
            },
            method: 'GET',
            data: JSON.stringify({ forwarding: true }),
        };
        expect(FN(opts)).toEqual(EXPECTED);
    });
    it('should create just header with empty options', () => {
        const EXPECTED = {
            header: {},
        };
        expect(FN()).toEqual(EXPECTED);
    });
});
describe('✅ getDefaultResponse', () => {
    const FN = getDefaultResponse;
    it('should return default response with mock time', () => {
        const start = new Date().getTime();
        const response = FN(start, true);
        const EXPECTED = _http(0, { content: '', success: false });
        expect(response).toEqual(EXPECTED);
    });
    it('should return default response with actual time', () => {
        const start = 1689663222549;
        const response = FN(start);
        const EXPECTED = _http(0, { content: '', success: false });
        expect(response).toEqual(EXPECTED); // default success
    });
});
describe('✅ getSuccess()', () => {
    const FN = getSuccess;
    it('should return true for status codes 200-399', () => {
        expect(FN('200')).toBe(true);
        expect(FN('299')).toBe(true);
        expect(FN('399')).toBe(true);
    });
    it('should return false for status codes below 200 or 400 and above', () => {
        expect(FN('100')).toBe(false);
        expect(FN('199')).toBe(false);
        expect(FN('400')).toBe(false);
        expect(FN('500')).toBe(false);
    });
    it('should return false for status code 0', () => {
        expect(FN('0')).toBe(false);
    });
    it('should return false for invalid status codes', () => {
        expect(FN('INVALID')).toBe(false);
    });
    it('should log a warning for status code 0', () => {
        const spy = jest.spyOn(LOG, 'WARN');
        FN('0');
        expect(spy).toHaveBeenCalledWith('no status code found. set to 0');
        spy.mockRestore();
    });
    it('should log OK for status code 200 when isDev is true', () => {
        const spy = jest.spyOn(LOG, 'OK');
        FN('200', { isDev: true });
        expect(spy).toHaveBeenCalledWith('Response: <no-url>: 200');
        spy.mockRestore();
    });
    it('should log INFO for status code 500 when isDev is true', () => {
        const spy = jest.spyOn(LOG, 'INFO');
        FN('500', { isDev: true });
        expect(spy).toHaveBeenCalledWith('Response: <no-url>: 500');
        spy.mockRestore();
    });
});
describe('✅ isHTTP()', () => {
    const FN = isHTTP;
    it('should return true for a valid HTTP string', () => {
        const input = '\nHTTP/1.1 200 OK\r\n';
        expect(FN(input)).toBe(true);
    });

    it('should return false for an invalid HTTP string', () => {
        const input = 'INVALID HTTP STRING';
        expect(FN(input)).toBe(false);
    });
});
describe('✅ toHTTP()', () => {
    const FN = toHTTP;
    it('should convert a valid HTTP string to HTTP type', () => {
        const input = '\nHTTP/1.1 200 OK\r\n';
        const result = FN(input);
        expect(result).toBe(input);
    });

    it('should log an error for an invalid HTTP string', () => {
        const input = 'INVALID HTTP STRING';
        const spy = jest.spyOn(LOG, 'FAIL');
        FN(input);
        expect(spy).toHaveBeenCalledWith('Invalid HTTP response: ' + input);
        spy.mockRestore();
    });
});
