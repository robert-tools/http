import { CurlItem, HTTPStatusBase, NumericString, OPTS } from './index.d';
import {
    DOMAIN_200,
    DOMAIN_301,
    DOMAIN_301_2,
    DOMAIN_404,
    DOMAIN_500,
    DOMAIN_UNKNOWN,
    FORWARDS,
    STATUSCODES,
} from './index.config';
import * as cmd from '@robert.tools/cmd';
// import { getMockedResponse, getResponseFromObject } from './index.helper';
import { NEXT_URL, PROTOCOL_STATUS } from './index.mocks.d';
import { $MOCK_VALUE } from './index.d';
import { getHostname } from './index';
import { getMockedResponse, getResponseFromObject } from './index.helper';
// TODO: umschreiben
/**
 * 🎯 set the protocol status object
 * @param {number} statusCode ➡️ The status code to set.
 * @returns {PROTOCOL_STATUS} 📤 The protocol status object.
 */
export const setProtocolStatus = (statusCode: number): PROTOCOL_STATUS => {
    const statusMessage: string = STATUSCODES[`${statusCode}`].text;
    const status: NumericString = `${statusCode}` as NumericString;
    return {
        protocol: 'http',
        protocolVersion: '1.1',
        status,
        statusMessage,
    };
};

/**
 * 🎯 get next url in the forwarding order
 * @param {string} url ➡️ The current url.
 * @return {NEXT_URL} 📤 next url item
 */
export const getNextUrl = (url: string): NEXT_URL => {
    if (!url) return { url, statusCode: 0 };
    const urlID = getHostname(url);
    const item = FORWARDS[urlID];
    let statusCode = item ? item.status : 0;
    const order = item ? item.order : [];
    const index = order.indexOf(url);
    const indexMax = order.length - 1;
    if (index > -1) {
        if (index === indexMax) {
            // last item
            return { url, statusCode };
        } else {
            const nextIndex = index + 1;
            const nextUrl = order[nextIndex];
            if (nextUrl) {
                return { url: nextUrl, statusCode: 301 };
            }
        }
    }
    return { url, statusCode };
};

/**
 * 🎯 get the httpItem
 * @param {string} url ➡️ The url to get the item for.
 * @param {string} content ➡️ The content to append. (optional)
 * @param {number} newStatusCode ➡️ The new status code to set. (optional)
 * @param {boolean} fullResponse ➡️ Whether to return a full CurlItem response. Default is false.
 * @returns {CurlItem} 📤 The http item or full response. // TODO: fix
 */
export const _httpItem = (
    url: string,
    content?: string,
    newStatusCode?: number,
    fullResponse = false
): HTTPStatusBase | CurlItem => {
    const urlItem = getNextUrl(url);
    const statusCode = newStatusCode || urlItem.statusCode;
    const customPart: any = custom[statusCode] || {};
    const location = urlItem.url;
    if (location && statusCode === 301) {
        customPart.location = location; // TODO
    }
    const status = setProtocolStatus(statusCode);
    let fullItem: any = {};
    if (fullResponse) {
        // if (content) {
        fullItem.content = content ? `${content}` : ''; // force trim
        fullItem.success = statusCode > 0 && statusCode < 400;
        fullItem.time = 23; // mock time
        fullItem.status = status.status;
        // }
    }
    const item: HTTPStatusBase = {
        ...status,
        ...customPart,
        ...base,
    };
    return fullResponse ? { header: item, ...fullItem } : item;
};

const base = {
    contentType: 'text/html; charset=UTF-8',
    connection: 'keep-alive',
    server: 'nginx/1.14.1',
    date: 'Fri, 29 Mar 2024 21:28:51 GMT',
};
const validBase = {
    xFrameOptions: 'SAMEORIGIN',
    strictTransportSecurity: 'max-age=31536000;',
    referrerPolicy: 'no-referrer-when-downgrade',
};
const custom: { [key: number]: any } = {
    200: {
        contentLength: '76980',
        lastModified: 'Mon, 18 Mar 2024 08:34:52 GMT',
        etag: '"65f7fcac-12cb4"',
        acceptRanges: 'bytes',
        ...validBase,
    },
    301: {
        contentLength: '185',
        // location: `https://www.${domain}/`,
        ...validBase,
    },
    404: {
        contentLength: '41739',
        etag: '"6595577a-a30b"',
    },
    500: {
        contentLength: '0',
    },
};

/**
 * 🎯 get the response for a domain and statuscode
 * @param {string} domain ➡️ The domain to get the response for.
 * @param {number} statusCode ➡️ The status code to get the response for. (optional)
 * @returns {string} 📤 The full http response.
 */
export const getRESPONSE = (domain: string, statusCode?: number): string => {
    const item = _httpItem(domain, undefined, statusCode);
    // if no CurlItem create one
    const curlItem = {
        header: item.header ? item.header : (item as HTTPStatusBase),
        content: item.content ? item.content : '',
        success: item.success ? item.success : false,
        status: item.status ? item.status : '0',
        time: item.time ? item.time : 0,
    } as CurlItem;
    return getResponseFromObject(curlItem);
};

export const DOMAIN_STATUS: { [key: string]: number } = {
    [DOMAIN_200]: 200,
    [DOMAIN_301]: 301,
    [DOMAIN_301_2]: 301,
    [DOMAIN_404]: 404,
    [DOMAIN_500]: 500,
    [DOMAIN_UNKNOWN]: 0,
};

/**
 * 🎯 get the spy for an command
 * @param {$MOCK_VALUE} result ➡️ The mock value to return. (optional)
 * @param {number} version ➡️ The version of the mock to use. Default is 1.
 * @returns {jest.SpyInstance} 📤 The spy instance.
 */
export const spyOnCommand = (
    result: $MOCK_VALUE = undefined,
    version: number = 1
) => {
    return jest
        .spyOn(cmd, 'command')
        .mockImplementation((curl: string): string => {
            if (version === 1) {
                return result !== undefined
                    ? result
                    : getMockedResponse(curl, version);
            } else {
                return getMockedResponse(
                    curl,
                    version,
                    result !== undefined ? result : ''
                );
            }
        });
};

/**
 * 🎯 check if timeout is defined
 * @param {string} curl ➡️ The curl command. //TODO
 * @returns {boolean} 📤 Whether a timeout is defined.
 */
export const hasTimeout = (curl: string | undefined): boolean => {
    if (!curl) return false;
    const timeout = curl.match(/-m\s+(\d+\.\d+?)/);
    if (timeout && parseFloat(timeout[1]) < 0.01) {
        return true;
    }
    return false;
};
// export const getNextUrl = (url: string): string => {

/**
 * 🎯 get header of an response string.
 * @param {string} domain ➡️ The domain to get the header for.
 * @param {OPTS} opts ➡️ The options object. (optional)
 * @returns {string} 📤 The http header.
 */
export const _header = (domain: string, opts: OPTS = {}): string => {
    if (!hasTimeout(opts?.request)) {
        return getRESPONSE(domain);
    }
    return getRESPONSE(domain, 0);
};

/**
 * 🎯 get full response string
 * @param {string} domain ➡️ The domain to get the response for.
 * @param {number} statusCode ➡️ The status code to get the response for.
 * @param {string} content ➡️ The content to append.
 * @returns {string} 📤 The full http response.
 */
export const _response = (
    domain: string,
    statusCode: number,
    content: string
): string => {
    const mockResult = `${getRESPONSE(domain, statusCode)}

                        ${content}`; // force trim
    return mockResult;
};
