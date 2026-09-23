/**
 * 🧪 Testing module HTTP
 * @module backend/_shared/HTTP
 * @version 2.0.1
 * @date 2026-09-23
 * @license MIT
 * @author Robert Willemelis <github.com/willi84>
 */

// external dependencies
import { LOG } from '@robert.tools/log';
import type { URI } from '@robert.tools/typings';

// internal dependencies
import {
    getConnectionTime,
    getHttpStatusValue,
    getHttpBase,
    getHttpItem,
    getResponse,
} from './index';
import { _header, _headerItem, _http, _httpItem } from './mock/mock';
import { spyOnCommand, spyOnURLs } from './spy/spy';

// config
import {
    DOMAIN_200,
    DOMAIN_301,
    DOMAIN_404,
    DOMAIN_STATUS_0,
    HTTP_UNKNOWN_HOST,
    getForwards,
    CONTENT_301,
    lastModified,
    etag,
} from './mock/mock.config';

// types
import type { URL_ITEMS } from './spy/spy.d';
import type { RAW } from './index.d';
import { getHttpFromHeader } from './utils/utils';

const content = 'some get response content';
const URI_ITEMS: URL_ITEMS = getForwards(content); // TODO: ggf. export in mock.config

describe('CLASS: HTTP', () => {
    describe('✅ getHttpFromHeader()', () => {
        const FN = getHttpFromHeader;
        it('[200] should result a 200 at forward step1', () => {
            const url = `https://${DOMAIN_200}`;
            const opts = { noLastLocation: true };
            const header = _header(url);
            const expected = _headerItem(url, {}, opts);
            expect(FN(header)).toEqual(expected);
        });
        it('[200] should not evaluate content section', () => {
            const url = `https://${DOMAIN_200}`;
            const opts = { noLastLocation: true };
            const header = (_header(url) + '\r\n' + 'some content') as RAW;
            const expected = _headerItem(url, {}, opts);
            expect(FN(header)).toEqual(expected);
        });
        it('[200] should result a 200 at forward step2', () => {
            const url = `https://www.${DOMAIN_200}/`;
            const header = _header(url);
            expect(FN(header)).toEqual(_headerItem(url));
        });
        it('[301] should result a 301 with correct location', () => {
            const url = `http://${DOMAIN_301}`;
            const opts = { noLastLocation: true };
            const header = _header(url);
            const expected = _headerItem(url, {}, opts);
            expect(FN(header)).toEqual(expected);
        });
        it('[404] should result a 404 at forward step3', () => {
            const url = `https://www.${DOMAIN_404}/`;
            const header = _header(url);
            expect(FN(header)).toEqual(_headerItem(url));
        });
    });
    describe('✅ getConnectionTime()', () => {
        const FN = getConnectionTime;
        let mockCommand: jest.SpyInstance;
        beforeEach(() => {
            mockCommand = spyOnCommand('0.123');
        });
        afterEach(() => {
            mockCommand.mockRestore();
        });
        it('should return connection time', () => {
            const INPUT = `https://www.${DOMAIN_200}/`;
            const EXPECTED = '0.123';
            expect(FN(INPUT)).toEqual(EXPECTED);
        });
    });
    describe('✅ getHttpStatusValue()', () => {
        const FN = getHttpStatusValue;
        let mockCommand: jest.SpyInstance;
        const options = { forwarding: true };
        describe('get next step response', () => {
            beforeEach(() => {
                mockCommand = spyOnURLs(URI_ITEMS);
            });
            afterEach(() => {
                mockCommand.mockRestore();
            });
            it('return 200 direct', () => {
                expect(FN(`https://www.${DOMAIN_200}/`)).toEqual('200');
            });
            it('return 200 with forward', () => {
                const DOMAIN = DOMAIN_200;
                expect(FN(`${DOMAIN}`)).toEqual('301');
                expect(FN(`http://${DOMAIN}`)).toEqual('301');
                expect(FN(`https://${DOMAIN}`)).toEqual('301');
                expect(FN(`https://www.${DOMAIN}`)).toEqual('301');
                expect(FN(`https://www.${DOMAIN}/`)).toEqual('200');
            });
            it('return 404', () => {
                const DOMAIN = DOMAIN_404;
                expect(FN(`https://www.${DOMAIN}/xx`)).toEqual('404');
            });
            it('return 404 with forward', () => {
                const DOMAIN = DOMAIN_404;
                expect(FN(`${DOMAIN}`)).toEqual('301');
                expect(FN(`http://${DOMAIN}`)).toEqual('301');
                expect(FN(`https://${DOMAIN}`)).toEqual('301');
                expect(FN(`https://www.${DOMAIN}`)).toEqual('301');
                expect(FN(`https://www.${DOMAIN}/`)).toEqual('404');
            });
            it('return 0', () => {
                const DOMAIN = DOMAIN_STATUS_0;
                expect(FN(`${DOMAIN}`)).toEqual('0');
                expect(FN(`https://www.${DOMAIN}/`)).toEqual('404');
            });
        });
        describe('handle 0 response', () => {
            const options = { timeout: 50 };
            it('should not log a warning for unknown domain', () => {
                const spy = jest.spyOn(LOG, 'WARN');
                const DOMAIN = DOMAIN_STATUS_0;
                expect(FN(`${DOMAIN}`, options)).toEqual('0');
                expect(spy).not.toHaveBeenCalled();
                spy.mockRestore();
            });
            it('should log a warning for unknown domain', () => {
                const spy = jest.spyOn(LOG, 'FAIL');
                const DOMAIN = DOMAIN_STATUS_0;
                const opts = { forwarding: true, timeout: 50, showLog: true };
                expect(FN(`${DOMAIN}`, opts)).toEqual('0');
                expect(spy).toHaveBeenCalled();
                spy.mockRestore();
            });
        });
        describe('get last step response', () => {
            beforeEach(() => {
                mockCommand = spyOnURLs(URI_ITEMS);
            });
            afterEach(() => {
                mockCommand.mockRestore();
            });
            it('return 200 with forward 1', () => {
                const DOMAIN = DOMAIN_200;
                const EXPECTED = '200';
                // console.log(`www.${DOMAIN_200}`);
                const opts = { ...options, maxRedirects: 10, blubber: true };
                expect(FN(`${DOMAIN}`, opts)).toEqual(EXPECTED); // TODO EXPECTED
                expect(FN(`www.${DOMAIN}`, opts)).toEqual(EXPECTED);
                expect(FN(`http://${DOMAIN}`, opts)).toEqual(EXPECTED);
                expect(FN(`https://${DOMAIN}`, opts)).toEqual(EXPECTED);
                expect(FN(`https://www.${DOMAIN}`, opts)).toEqual(EXPECTED);
                expect(FN(`https://www.${DOMAIN}/`, opts)).toEqual(EXPECTED);
                // expect(FN(`${DOMAIN_200}`, true)).toEqual('200');
                // expect(FN(`http://${DOMAIN_200}`, true)).toEqual('200');
                // expect(FN(`www.${DOMAIN_200}`, true)).toEqual('200');
            });
            xit('return 301', () => {
                // TODO: wie forwarding mocken
                const opts = { ...options, maxRedirects: 10 };
                expect(FN(`${DOMAIN_301}`, opts)).toEqual('200');
            });
            it('return 404', () => {
                expect(FN(`${DOMAIN_404}`, options)).toEqual('404');
            });
            it('return 0 with forward max', () => {
                expect(FN(`${DOMAIN_STATUS_0}`, options)).toEqual('0');
            });
        });
    });
    describe('✅ getHttpBase()', () => {
        const FN = getHttpBase;
        let mockCommand: jest.SpyInstance;
        beforeEach(() => {
            mockCommand = spyOnURLs(URI_ITEMS);
        });
        afterEach(() => {
            mockCommand.mockRestore();
        });
        describe('get response object', () => {
            const URL: URI = `https://www.${DOMAIN_200}/`;
            const EXPECTED = _headerItem(URL);
            // const EXPECTED = _httpItem(200, URL);
            it('should result a valid response object', () => {
                expect(FN(URL)).toEqual(EXPECTED);
                expect(FN(URL, { timeout: 2 })).toEqual(EXPECTED);
                expect(FN(URL, { timeout: 0.2 })).toEqual(EXPECTED);
            });
            it('[timeout] should result a non valid response object', () => {
                const result = FN(URL, { timeout: 0.001 });
                expect(result).toEqual(EXPECTED);
                // expect(result).toEqual(_httpItem(0, URL));
            });
        });
    });
    describe('✅ getHttpItem()', () => {
        const FN = getHttpItem;
        let mockCommand: jest.SpyInstance;
        beforeEach(() => {
            mockCommand = spyOnURLs(URI_ITEMS);
        });
        afterEach(() => {
            mockCommand.mockRestore();
        });
        it('return 200 direct', () => {
            const URL = `https://www.${DOMAIN_200}/`;
            expect(FN(URL)).toEqual(_headerItem(URL));
        });
    });
    describe('✅ getResponse()', () => {
        const FN = getResponse;
        const opts = { isMock: true };
        // const opts = { noLastLocation: true, isMock: true };
        let mockCommand: jest.SpyInstance;
        beforeEach(() => {
            mockCommand = spyOnURLs(URI_ITEMS);
        });
        afterEach(() => {
            mockCommand.mockRestore();
        });
        describe('base function', () => {
            it('[200] should return http item with content (with untrimmed content)', () => {
                const URL = `https://www.${DOMAIN_200}/`;
                const EXPECTED = _httpItem(URL, { content, status: 200 }, opts);
                expect(FN(URL, opts)).toEqual(EXPECTED);
            });
            it('[301] should return http item with content (with untrimmed content)', () => {
                const URL = `https://www.${DOMAIN_200}`;
                const EXPECTED = _httpItem(URL, { content: CONTENT_301 }, opts);
                expect(FN(URL, opts)).toEqual(EXPECTED);
            });
            it('[301] should return http item with content but different header', () => {
                const URL = DOMAIN_200;
                const EXPECTED = _httpItem(URL, { content: CONTENT_301 }, opts);
                expect(FN(URL, opts)).toEqual(EXPECTED);
            });
            // redirect
        });
        describe('options', () => {
            const URL = DOMAIN_200;
            const ua = '-H "User-Agent: nodejs"';
            it('should have default user-agent in the curl request', () => {
                FN(URL, {});
                expect(mockCommand).toHaveBeenCalledWith(
                    `curl ${ua} -s -i "${URL}"`
                );
            });
            it('should add user-agent in the curl request', () => {
                const ua = 'fooUA';
                const UA = `-H "User-Agent: ${ua}"`;
                FN(URL, { ua });
                expect(mockCommand).toHaveBeenCalledWith(
                    `curl ${UA} -s -i "${URL}"`
                );
            });
            it('should add token for github', () => {
                const URL_GITHUB = 'https://api.github.com/repos/owner/repo';
                const TOKEN = 'xxxx';
                FN(URL_GITHUB, { token: TOKEN });
                expect(mockCommand).toHaveBeenCalledWith(
                    `curl -H "Authorization: token ${TOKEN}" -s -i "${URL_GITHUB}"`
                );
            });
            it('should add token for github', () => {
                const URL_GITLAB = 'https://api.gitlab.com/repos/owner/repo';
                const TOKEN = 'xxxx';
                FN(URL_GITLAB, { token: TOKEN });
                expect(mockCommand).toHaveBeenCalledWith(
                    `curl ${ua} -H "PRIVATE-TOKEN: ${TOKEN}" -s -i "${URL_GITLAB}"`
                );
            });
        });
        describe('edge cases', () => {
            const URL = `https://www.${DOMAIN_200}`;
            it('should return forwarded http item', () => {
                const URL2 = DOMAIN_200;
                const opts = { forwarding: true, noLastLocation: true }; // TODO: implement
                const EXPECTED = _httpItem(URL, { content, status: 200 }, opts);
                EXPECTED.time = expect.any(Number);
                const result = FN(URL2, opts);
                expect(result).toEqual(EXPECTED);
                mockCommand.mockRestore();
            });
            it('[0] should return 0 when no valid HTTP response', () => {
                // const content = `<svg>`; // force trim
                const URL = 'invalid-http';
                const content = '';
                const spy = jest.spyOn(LOG, 'FAIL');
                const EXPECTED = _http(0, { content, success: false });
                expect(FN(URL)).toEqual(EXPECTED);
                const error = `Invalid HTTP response: ${HTTP_UNKNOWN_HOST + ' ' + URL}`;
                expect(spy).toHaveBeenCalledWith(error);
                spy.mockRestore();
            });
        });
        describe('url specific', () => {
            // let mockCommand: j -sest.SpyInstance;
            let spyLOG: jest.SpyInstance;
            let URL = 'https://api.github.com/icons/icon.svg';
            const MISSING_TOKEN = `Please set a GITHUB_TOKEN in the environment variables.`;
            beforeEach(() => {
                spyLOG = jest.spyOn(LOG, 'FAIL');
            });
            afterEach(() => {
                // mockCommand.mockRestore();
                spyLOG.mockRestore();
            });
            describe('github', () => {
                it('should return content when github url and token given', () => {
                    const EXPECTED = _http(200, { content: '<svg>' });
                    expect(FN(URL, { token: 'xxxx' })).toEqual(EXPECTED);
                    expect(spyLOG).not.toHaveBeenCalled();
                    expect(mockCommand).toHaveBeenCalledWith(
                        `curl -H "Authorization: token xxxx" -s -i "${URL}"`
                    );
                });
                it('should return warning when token is missing', () => {
                    const EXPECTED = _http(0, { success: false });
                    expect(FN(URL)).toEqual(EXPECTED);
                    expect(spyLOG).toHaveBeenCalledWith(MISSING_TOKEN);
                });
            });
            describe('gitlab', () => {
                it('should return content when gitlab url and token given', () => {
                    const EXPECTED = _http(200, { content: '<svg>' });
                    const URL_GITLAB = URL.replace('github', 'gitlab');

                    expect(FN(URL_GITLAB, { token: 'xxxx' })).toEqual(EXPECTED);
                    expect(spyLOG).not.toHaveBeenCalled();
                    const ua = '-H "User-Agent: nodejs"';
                    expect(mockCommand).toHaveBeenCalledWith(
                        `curl ${ua} -H "PRIVATE-TOKEN: xxxx" -s -i "${URL_GITLAB}"`
                    );
                });
            });
        });
        describe('dev mode', () => {
            it('should log OK when statusCode=200', () => {
                const URL = `https://www.${DOMAIN_200}/`;
                const spyLOG = jest.spyOn(LOG, 'OK');
                FN(URL, { isDev: true });
                expect(spyLOG).toHaveBeenCalled();
                spyLOG.mockRestore();
                // mockCommand.mockRestore();
            });
            it('should log when statusCode > 400', () => {
                const URL = `https://www.${DOMAIN_404}/`;
                const spyLOG = jest.spyOn(LOG, 'INFO');
                FN(URL, { isDev: true });
                expect(spyLOG).toHaveBeenCalled();
                spyLOG.mockRestore();
                mockCommand.mockRestore();
            });
        });
        describe('error handling', () => {
            it('should return 0 when there is no status code', () => {
                const spyLOG = jest.spyOn(LOG, 'WARN');
                const EXPECTED = _http(0, { success: false });
                const result = FN(`${DOMAIN_STATUS_0}`);
                expect(result).toEqual(EXPECTED);
                expect(spyLOG).toHaveBeenCalledWith(
                    'no status code found. set to 0'
                );
                spyLOG.mockRestore();
                // mockCommand.mockRestore();
            });
        });
        describe('get response object', () => {
            const contentLength = '7698';
            const URL: URI = `https://www.${DOMAIN_200}/`;
            const opts = { content, etag, lastModified, contentLength };
            const EXPECTED = _http(200, opts);
            // const EXPECTED = _headerItem(URL);
            // const EXPECTED = _httpItem(200, URL);
            it('should result a valid response object', () => {
                expect(FN(URL)).toEqual(EXPECTED);
                expect(FN(URL, { timeout: 2 })).toEqual(EXPECTED);
                expect(FN(URL, { timeout: 0.2 })).toEqual(EXPECTED);
            });
            it('[timeout] should result a non valid response object', () => {
                const result = FN(URL, { timeout: 0.001 });
                expect(result).toEqual(EXPECTED);
                // expect(result).toEqual(_httpItem(0, URL));
            });
        });
    });
});
