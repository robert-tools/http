/**
 * 🧪 Testing module HTTP
 * @module backend/_shared/HTTP
 * @version 0.0.1
 * @date 2025-09-18
 * @license MIT
 * @author Robert Willemelis <github.com/willi84>
 */
import {
    getConnectionTime,
    getHttpItemFromHeader,
    getHttpBase,
    getHttpStatusValue,
    getResponse,
    getHttpItem,
    getSLD,
    getHostname,
} from './index';
// import * as http from './http';
import { HTTP_OBJECT, HTTP_CONTENT_301 } from './index.mocks_old';
import {
    DOMAIN_200,
    DOMAIN_301,
    DOMAIN_404,
    DOMAIN_UNKNOWN,
} from './index.config';

import { _httpItem, _header, _response, spyOnCommand } from './index.mocks';
import { $MOCK_VALUE, HOSTNAME } from './index.d';
import { LOG } from '@robert.tools/log';

const API_V2: [$MOCK_VALUE, number] = [undefined, 2];

describe('CLASS: HTTP', () => {
    describe('✅ getHttpItemFromHeader()', () => {
        const FN = getHttpItemFromHeader;
        it('should result a 200 at forward step2', () => {
            const url = `https://www.${DOMAIN_200}/`;
            const header = _header(url);
            expect(FN(header)).toEqual(_httpItem(url));
        });
        it('should result a 301 with correct location', () => {
            const url = `http://${DOMAIN_301}`;
            const header = _header(url);
            expect(FN(header)).toEqual(_httpItem(url));
        });
        it('should result a 404 at forward step3', () => {
            const url = `https://www.${DOMAIN_404}/`;
            const header = _header(url);
            expect(FN(header)).toEqual(_httpItem(url));
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
        beforeEach(() => {
            mockCommand = spyOnCommand(...API_V2);
        });
        afterEach(() => {
            mockCommand.mockRestore();
        });
        describe('get next step response', () => {
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
                const DOMAIN = DOMAIN_UNKNOWN;
                expect(FN(`${DOMAIN}`)).toEqual('0');
                expect(FN(`https://www.${DOMAIN}/`)).toEqual('0');
            });
        });
        describe('get last step response', () => {
            it('return 200 with forward 1', () => {
                const DOMAIN = DOMAIN_200;
                const EXPECTED = '200';
                const FORWARD = true;
                // console.log(`www.${DOMAIN_200}`);
                expect(FN(`${DOMAIN}`, FORWARD)).toEqual('0'); // TODO EXPECTED
                expect(FN(`http://${DOMAIN}`, FORWARD)).toEqual(EXPECTED);
                expect(FN(`https://${DOMAIN}`, FORWARD)).toEqual(EXPECTED);
                expect(FN(`https://www.${DOMAIN}`, FORWARD)).toEqual(EXPECTED);
                expect(FN(`https://www.${DOMAIN}/`, FORWARD)).toEqual(EXPECTED);
                // expect(FN(`${DOMAIN_200}`, true)).toEqual('200');
                // expect(FN(`http://${DOMAIN_200}`, true)).toEqual('200');
                // expect(FN(`www.${DOMAIN_200}`, true)).toEqual('200');
            });
            it('return 404', () => {
                expect(FN(`${DOMAIN_301}`, true)).toEqual('0');
                // expect(FN(`${DOMAIN_301}`, true)).toEqual('301'); // TODO
                expect(FN(`${DOMAIN_404}`, true)).toEqual('404');
            });
            it('return 0 with forward max', () => {
                expect(FN(`${DOMAIN_UNKNOWN}`, true)).toEqual('0');
            });
        });
    });
    describe('✅ getHttpBase()', () => {
        const FN = getHttpBase;
        let mockCommand: jest.SpyInstance;
        beforeEach(() => {
            mockCommand = spyOnCommand(...API_V2);
        });
        afterEach(() => {
            mockCommand.mockRestore();
        });
        describe('get response object', () => {
            const URL: string = `https://www.${DOMAIN_200}/`;
            const EXPECTED = _httpItem(URL);
            // const EXPECTED = _httpItem(200, URL);
            it('should result a valid response object', () => {
                expect(FN(URL)).toEqual(EXPECTED);
                expect(FN(URL, 2)).toEqual(EXPECTED);
                expect(FN(URL, 0.2)).toEqual(EXPECTED);
            });
            it('[timeout] should result a non valid response object', () => {
                const result = FN(URL, 0.001);
                expect(result).toEqual(_httpItem(URL));
                // expect(result).toEqual(_httpItem(0, URL));
            });
        });
    });
    describe('✅ getHttpItem()', () => {
        const FN = getHttpItem;
        let mockCommand: jest.SpyInstance;
        beforeEach(() => {
            mockCommand = spyOnCommand(...API_V2);
        });
        afterEach(() => {
            mockCommand.mockRestore();
        });
        it('return 200 direct', () => {
            const URL = `https://www.${DOMAIN_200}/`;
            const EXPECTED = {
                ..._httpItem(URL),
                // ..._httpItem(200, URL),
                lastLocation: `${URL}`, // internal set
                // lastLocation: `https://www.${DOMAIN_200}/`,
            };
            expect(FN(URL)).toEqual(EXPECTED);
        });
    });
    describe('✅ getResponse()', () => {
        const FN = getResponse;
        describe('base function', () => {
            // const URL = 'google.de';
            const URL = `https://www.${DOMAIN_200}`;
            it('should return http item with content (with untrimmed content)', () => {
                const URL = `https://www.${DOMAIN_200}`;
                const CONTENT = HTTP_CONTENT_301;
                const mockCommand = spyOnCommand(CONTENT, 2);
                const EXPECTED = _httpItem(URL, CONTENT, undefined, true);
                // const EXPECTED = _httpItem(301, URL);
                const result = FN(URL);
                EXPECTED.time = expect.any(Number);
                expect(result).toEqual(EXPECTED);
                mockCommand.mockRestore();
            });
            it('should return http item with content but different header', () => {
                const URL2 = DOMAIN_200;
                const CONTENT = HTTP_CONTENT_301;
                const mockCommand = spyOnCommand(CONTENT, 2);
                const EXPECTED = _httpItem(URL2, CONTENT, undefined, true);
                EXPECTED.time = expect.any(Number);
                const result = FN(URL2);
                expect(result).toEqual(EXPECTED);
                mockCommand.mockRestore();
            });
            it('should return content when no http header', () => {
                const mockResult = `<svg>`; // force trim
                const mockCommand = spyOnCommand(mockResult);
                const EXPECTED = {
                    header: { status: '0' },
                    content: '<svg>',
                    status: '0',
                    success: false, // TODO
                    time: expect.any(Number),
                };
                expect(FN(URL)).toEqual(EXPECTED);
                mockCommand.mockRestore();
            });
        });
        describe('url specific', () => {
            let mockCommand: jest.SpyInstance;
            let spyLOG: jest.SpyInstance;
            const CONTENT = '<svg>';
            let URL = 'https://api.github.com/icons/icon.svg';
            beforeEach(() => {
                const mockResult = _response(URL, 200, CONTENT);
                mockCommand = spyOnCommand(mockResult);
                spyLOG = jest.spyOn(LOG, 'FAIL');
            });
            afterEach(() => {
                mockCommand.mockRestore();
                spyLOG.mockRestore();
            });
            describe('github', () => {
                it('should return content when github url and token given', () => {
                    const EXPECTED = {
                        header: HTTP_OBJECT.HTTP_200,
                        content: CONTENT,
                        status: '200',
                        success: true,
                        time: expect.any(Number),
                    };

                    expect(FN(URL, { token: 'xxxx' })).toEqual(EXPECTED);
                    expect(spyLOG).not.toHaveBeenCalled();
                    expect(mockCommand).toHaveBeenCalledWith(
                        `curl -s -H "Authorization: token xxxx"   -i "${URL}"  `
                    );
                });
                it('should return warning when token is missing', () => {
                    const EXPECTED = {
                        header: {}, // HTTP_OBJECT.HTTP_200,
                        content: '', // <= no content
                        status: '0',
                        success: false,
                        time: expect.any(Number),
                    };
                    expect(FN(URL)).toEqual(EXPECTED);
                    expect(spyLOG).toHaveBeenCalled();
                });
            });
            describe('gitlab', () => {
                it('should return content when github url and token given', () => {
                    const URL_GITLAB = URL.replace('github', 'gitlab');
                    const EXPECTED = {
                        header: HTTP_OBJECT.HTTP_200,
                        content: '<svg>',
                        status: '200',
                        success: true,
                        time: expect.any(Number),
                    };

                    expect(FN(URL_GITLAB, { token: 'xxxx' })).toEqual(EXPECTED);
                    expect(spyLOG).not.toHaveBeenCalled();
                    const ua = '-H "User-Agent: nodejs" ';
                    expect(mockCommand).toHaveBeenCalledWith(
                        `curl -s -H "PRIVATE-TOKEN: xxxx"  ${ua} -i "${URL_GITLAB}"  `
                    );
                });
            });
        });
        describe('dev mode', () => {
            const url = 'https://www.domain.de';
            it('should log OK when statusCode=200', () => {
                const spyLOG = jest.spyOn(LOG, 'OK');
                const mockResult = _response(url, 200, '<svg>');
                const mockCommand = spyOnCommand(mockResult);
                FN(url, { isDev: true });
                expect(spyLOG).toHaveBeenCalled();
                spyLOG.mockRestore();
                mockCommand.mockRestore();
            });
            it('should log when statusCode > 400', () => {
                const spyLOG = jest.spyOn(LOG, 'INFO');
                const mockResult = _response(url, 404, '<svg>');
                const mockCommand = spyOnCommand(mockResult);
                FN(url, { isDev: true });
                expect(spyLOG).toHaveBeenCalled();
                spyLOG.mockRestore();
                mockCommand.mockRestore();
            });
        });
        describe('error handling', () => {
            it('should return 0 when there is no status code', () => {
                const spyLOG = jest.spyOn(LOG, 'WARN');
                const mockCommand = spyOnCommand(...API_V2);
                const EXPECTED = {
                    header: {
                        status: '0',
                        protocol: 'http',
                        protocolVersion: '1.1',
                        statusMessage: 'unknown',
                        connection: 'keep-alive',
                        server: 'nginx/1.14.1',
                        date: expect.any(String),
                        contentType: 'text/html; charset=UTF-8',
                    },
                    content: '', // <= no content
                    status: '0',
                    success: false,
                    time: expect.any(Number),
                };
                expect(FN(`${DOMAIN_UNKNOWN}`)).toEqual(EXPECTED);
                expect(spyLOG).toHaveBeenCalledWith(
                    'no status code found. set to 0'
                );
                spyLOG.mockRestore();
                mockCommand.mockRestore();
            });
        });
    });
});

describe('✅ getSLD()', () => {
    const FN = getSLD;
    const DOMAIN = 'example';
    // TODO: improve test cases
    it('should return SLD for a valid URL', () => {
        expect(FN(`sub.${DOMAIN}.com`)).toEqual(DOMAIN);
        expect(FN(`${DOMAIN}.com`)).toEqual(DOMAIN);
        expect(FN(`https://sub.${DOMAIN}.com/path`)).toEqual(DOMAIN);
        expect(FN(`https://${DOMAIN}.com/path`)).toEqual(DOMAIN);
    });
    it('should return SLD for a URL with multiple subdomains', () => {
        expect(FN(`https://sub.sub2.${DOMAIN}.co.uk/path`)).toEqual(DOMAIN); // TODO
    });
    it('should return simple host', () => {
        expect(FN(`${DOMAIN}`)).toEqual(DOMAIN);
    });
    it('should return sld  even if wrong formatted', () => {
        expect(FN(`https:///${DOMAIN}`)).toEqual(DOMAIN);
        expect(FN(``)).toEqual(``);
    });
});
describe('✅ getHostname()', () => {
    const FN = getHostname;
    it('should return domain from a standard URL', () => {
        const hostname: HOSTNAME = 'example.com';
        expect(FN(`${hostname}`)).toEqual(hostname);
        expect(FN(`${hostname}/`)).toEqual(hostname);
        expect(FN(`${hostname}/foo`)).toEqual(hostname);
        expect(FN(`${hostname}/foo/`)).toEqual(hostname);
        expect(FN(`${hostname}/foo/bar`)).toEqual(hostname);
        expect(FN(`${hostname}/foo/bar/`)).toEqual(hostname);
        expect(FN(`www.${hostname}`)).toEqual(hostname);
        expect(FN(`//${hostname}`)).toEqual(hostname);
        expect(FN(`http://www.${hostname}`)).toEqual(hostname);
        expect(FN(`https://www.${hostname}`)).toEqual(hostname);
        expect(FN(`https://wwww.${hostname}`)).toEqual(hostname);
        expect(FN(`http://${hostname}`)).toEqual(hostname);
        expect(FN(`https://${hostname}`)).toEqual(hostname);
        expect(FN(`https://${hostname}/`)).toEqual(hostname);
        expect(FN(`https://${hostname}/foo`)).toEqual(hostname);
        expect(FN(`${hostname}/foo`)).toEqual(hostname);
        expect(FN(`https://${hostname}/foo/`)).toEqual(hostname);
        expect(FN(`https://${hostname}/foo/bar`)).toEqual(hostname);
        expect(FN(`https://${hostname}/foo/bar/`)).toEqual(hostname);
        expect(FN(`ftp://${hostname}`)).toEqual(hostname); // other protocol
    });
    it('should return domain from a standard URL with SLD', () => {
        const hostname: HOSTNAME = 'sub.example.com';
        expect(FN(`${hostname}`)).toEqual(hostname);
        expect(FN(`${hostname}/`)).toEqual(hostname);
        expect(FN(`${hostname}/foo`)).toEqual(hostname);
        expect(FN(`${hostname}/foo/`)).toEqual(hostname);
        expect(FN(`${hostname}/foo/bar`)).toEqual(hostname);
        expect(FN(`${hostname}/foo/bar/`)).toEqual(hostname);
        expect(FN(`www.${hostname}`)).toEqual(hostname);
        expect(FN(`//${hostname}`)).toEqual(hostname);
        expect(FN(`http://www.${hostname}`)).toEqual(hostname);
        expect(FN(`https://www.${hostname}`)).toEqual(hostname);
        expect(FN(`http://${hostname}`)).toEqual(hostname);
        expect(FN(`https://${hostname}`)).toEqual(hostname);
        expect(FN(`https://${hostname}/`)).toEqual(hostname);
        expect(FN(`https://${hostname}/foo`)).toEqual(hostname);
        expect(FN(`${hostname}/foo`)).toEqual(hostname);
        expect(FN(`https://${hostname}/foo/`)).toEqual(hostname);
        expect(FN(`https://${hostname}/foo/bar`)).toEqual(hostname);
        expect(FN(`https://${hostname}/foo/bar/`)).toEqual(hostname);
        expect(FN(`ftp://${hostname}`)).toEqual(hostname); // other protocol
    });
    it('special cases', () => {
        const hostname: HOSTNAME = 'example.com';
        expect(FN(``)).toEqual('');
        expect(FN(`//la.${hostname}/d/aa?xx=2&yy=2`)).toEqual(`la.${hostname}`);
        expect(FN(`://example.com`)).toEqual(hostname);
        expect(FN(`http:///example.com`)).toEqual(hostname);
    });
});
