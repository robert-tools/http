/**
 * 🧪 Testing module HTTP
 * @module backend/_shared/HTTP/helper
 * @version 0.0.1
 * @date 2025-09-18
 * @license MIT
 * @author Robert Willemelis <github.com/willi84>
 */
import { DOMAIN_200, STANDARD_CURL_TIMEOUT } from './index.config';
import {
    getMockedResponse,
    getRealResponse,
    getResponseByUrl,
    getResponseFromObject,
    getUrlID,
    MOCKED_RESPONSES,
    normalizeResponses,
} from './index.helper';
import { setProtocolStatus } from './index.mocks';

describe('helper functions', () => {
    describe('✅ getRealResponse()', () => {
        it('should return response correct formatted', () => {
            const input = {
                msg: `
                    xxx
                    yyy
                    `,
            };
            const output = `xxx\r
yyy\r
\r
`;
            const result = getRealResponse(input.msg);
            expect(result).toEqual(output);
        });
    });
    describe('✅ normalizeResponses()', () => {
        const FN = normalizeResponses;
        it('should return normalized responses', () => {
            const input = {
                TEST: {
                    step1: `
                    ${'HTTP/1.0 200 OK'}
                    BB: CC; DD
                    `,
                    step2: `
                    ${'HTTP/2 404 Not found'}
                    BB: CC; DD
                    `,
                },
            };
            const output = {
                TEST: {
                    step1: `HTTP/1.0 200 OK\r\nBB: CC; DD\r\n\r\n`,
                    step2: `HTTP/2 404 Not found\r\nBB: CC; DD\r\n\r\n`,
                },
            };
            const result = FN(input);
            expect(result).toEqual(output);
        });
    });
    describe('✅ getUrlID()', () => {
        const FN = getUrlID;
        it('should return url from curl command', () => {
            const input = `curl -I -m 0.4 --silent https://www.google.de/`;
            const output = 'https://www.google.de/';
            expect(FN(input)).toEqual(output);
        });
        it('should return url from curl command with double quotes ', () => {
            const input = `curl -I -m 0.4 --silent "https://www.google.de/"`;
            const output = 'https://www.google.de/';
            expect(FN(input)).toEqual(output);
        });
        it('should return url from curl command with single quotes "', () => {
            const input = `curl -I -m 0.4 --silent 'https://www.google.de/'`;
            const output = 'https://www.google.de/';
            expect(FN(input)).toEqual(output);
        });
        it('should return url from curl command with user agent', () => {
            const input = `curl -s  -H "User-Agent: nodejs"  -i "https://www.domain.de" `;
            const output = 'https://www.domain.de';
            expect(FN(input)).toEqual(output);
        });
        it('should return url from curl command user agent & auth token', () => {
            const input = `curl -s -H "Authorization: token xxxx"   -i "https://api.github.com/icons/icon.svg" `;
            const output = 'https://api.github.com/icons/icon.svg';
            expect(FN(input)).toEqual(output);
        });
        it('should return url from curl command user agent & private token', () => {
            const input = `curl -s -H "PRIVATE-TOKEN: xxxx"  -H "User-Agent: nodejs"  -i "https://api.gitlab.com/icons/icon.svg" `;
            const output = 'https://api.gitlab.com/icons/icon.svg';
            expect(FN(input)).toEqual(output);
        });
    });
    describe('✅ getResponseByUrl()', () => {
        const FN = getResponseByUrl;
        const RESPONSES = {
            HTTP_200: {
                step1: `HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n`,
            },
            HTTP_UNKNOWN: {
                step1: `curl: (6) Could not resolve host: unknown.de\r\n`,
            },
        };
        const URLS = {
            HTTP_200: {
                step1: 'https://www.domain.de/',
            },
            HTTP_UNKNOWN: {
                step1: 'https://www.unknown.de/',
            },
        };
        it('should return unknown response', () => {
            const input = `https://www.unknown.de/`;
            const output = RESPONSES.HTTP_UNKNOWN.step1;
            const result = FN(input, RESPONSES, URLS);
            expect(result).toEqual(output);
        });
        it('should return 200 response', () => {
            const input = `https://www.domain.de/`;
            const output = RESPONSES.HTTP_200.step1;
            const result = FN(input, RESPONSES, URLS);
            expect(result).toEqual(output);
        });
    });
    describe('✅ getMockedResponse()', () => {
        const FN = getMockedResponse;
        // implementMockCommand();
        it('should test the testing usage', () => {
            const input = `curl -I -m ${STANDARD_CURL_TIMEOUT} --silent https://www.${DOMAIN_200}/`;
            const output = MOCKED_RESPONSES.HTTP_200.step1;
            const result = FN(input);
            expect(result).toEqual(output);
        });
    });
    describe('getResponseFromObject()', () => {
        const FN = getResponseFromObject;
        // let mockCommand: jest.SpyInstance;
        // beforeEach(() => {
        //     mockCommand = jest
        //         // .spyOn(http, 'getResponse')
        //         .spyOn(cmd, 'command')
        //         .mockImplementation((curl: string) => {
        //             console.log(curl);
        //             return getMockedResponse(curl);
        //         });
        // });
        // afterEach(() => {
        //     mockCommand.mockRestore();
        // });
        it('should return simple 404 response', () => {
            const input: any = {
                ...setProtocolStatus(404),
                contentType: 'text/html; charset=UTF-8',
                connection: 'keep-alive',
                server: 'nginx/1.14.1',
                date: 'Fri, 29 Mar 2024 21:28:51 GMT',
            };
            const EXPECTED =
                '\n' +
                '        HTTP/1.1 404 Not Found\r\n' +
                '        Content-Type: text/html; charset=UTF-8\r\n' +
                '        Connection: keep-alive\r\n' +
                '        Server: nginx/1.14.1\r\n' +
                '        Date: Fri, 29 Mar 2024 21:28:51 GMT\r\n' +
                '        \n';
            const result = FN(input);
            expect(result).toEqual(EXPECTED);
        });
        it('should return extended 200 response', () => {
            const input: any = {
                ...setProtocolStatus(200),
                contentLength: '76980',
                lastModified: 'Mon, 18 Mar 2024 08:34:52 GMT',
                // ETag: '"65f7fcac-12cb4"',
                acceptRanges: 'bytes',
                contentType: 'text/html; charset=UTF-8',
                connection: 'keep-alive',
                server: 'nginx/1.14.1',
                date: 'Fri, 29 Mar 2024 21:28:51 GMT',
                xFrameOptions: 'SAMEORIGIN',
                strictTransportSecurity: 'max-age=31536000;',
                referrerPolicy: 'no-referrer-when-downgrade',
            };
            const EXPECTED =
                '\n' +
                '        HTTP/1.1 200 OK\r\n' +
                '        Content-Length: 76980\r\n' +
                '        Last-Modified: Mon, 18 Mar 2024 08:34:52 GMT\r\n' +
                // '        ETag: "65f7fcac-12cb4"\r\n' +
                '        Accept-Ranges: bytes\r\n' +
                '        Content-Type: text/html; charset=UTF-8\r\n' +
                '        Connection: keep-alive\r\n' +
                '        Server: nginx/1.14.1\r\n' +
                '        Date: Fri, 29 Mar 2024 21:28:51 GMT\r\n' +
                '        X-Frame-Options: SAMEORIGIN\r\n' +
                '        Strict-Transport-Security: max-age=31536000;\r\n' +
                '        Referrer-Policy: no-referrer-when-downgrade\r\n' +
                '        \n';
            const result = FN(input);
            expect(result).toEqual(EXPECTED);
        });
        it('should return response with content', () => {
            const input: any = {
                ...setProtocolStatus(200),
                contentType: 'application/json; charset=UTF-8',
                connection: 'keep-alive',
                server: 'Apache',
                date: 'Mon, 24 Nov 2025 14:47:26 GMT',
                contentLocation: 'reverse.php',
                vary: 'negotiate',
                tcn: 'choice',
                xFrameOptions: 'SAMEORIGIN',
                xPoweredBy: 'PHP/7.1.33',
                accessControlAllowOrigin: '*',
                accessControlAllowMethods: 'OPTIONS,GET',
                contentLength: '29',
            };
            const content = `{"status":"data_found"}`;
            const EXPECTED =
                '\n' +
                '        HTTP/1.1 200 OK\r\n' +
                '        Content-Type: application/json; charset=UTF-8\r\n' +
                '        Connection: keep-alive\r\n' +
                '        Server: Apache\r\n' +
                '        Date: Mon, 24 Nov 2025 14:47:26 GMT\r\n' +
                '        Content-Location: reverse.php\r\n' +
                '        Vary: negotiate\r\n' +
                '        Tcn: choice\r\n' +
                '        X-Frame-Options: SAMEORIGIN\r\n' +
                '        X-Powered-By: PHP/7.1.33\r\n' +
                '        Access-Control-Allow-Origin: *\r\n' +
                '        Access-Control-Allow-Methods: OPTIONS,GET\r\n' +
                '        Content-Length: 29\r\n' +
                '        \r\n\r\n' +
                '{"status":"data_found"}\n';
            const result = FN(input, content);
            expect(result).toEqual(EXPECTED);
        });
    });
});
