// 📦 external dependencies
import { LOG } from '@robert.tools/log';
import { convert2HeaderCase } from '@robert.tools/convert';
import { getProp, sortASC } from '@robert.tools/utils';
import { NUM, URI } from '@robert.tools/typings';
import { getHostname } from '@robert.tools/uri';

// 📦 internal dependencies
import { hasTimeout, toHTTP } from '../utils/utils';
// ⚙️ config
import { custom } from '../spy/spy';
import {
    _BASE,
    _EXT_BASE,
    FORWARDS,
    protocol,
    protocolVersion,
    STATUSCODES,
} from './mock.config';
// 🧩 types
import type { CurlItem, HTTP_OPTS, HTTP, OPTS, RAW } from './../index.d';
import type {
    FORWARD_ITEMS,
    HEADER_SHORT,
    NEXT_URL,
    PROTOCOL_STATUS,
} from './mock.d';

/**
 * 🎯 set the protocol status object
 * @param {number} code ➡️ The status code to set.
 * @returns {PROTOCOL_STATUS} 📤 The protocol status object.
 */
export const setProtocolStatus = (code: number): PROTOCOL_STATUS => {
    const statusMessage: string = STATUSCODES[`${code}`]?.text || 'unknown';
    const status: NUM = `${code}` as NUM;
    let result: PROTOCOL_STATUS = {
        protocol,
        protocolVersion,
        status,
        statusMessage,
    };
    return result;
};

/**
 * 🎯 get next url in the forwarding order
 * @param {string} url ➡️ The current url.
 * @param {FORWARD_ITEMS} forwards ➡️ The forwarding items configuration.
 * @param {HTTP_OPTS} opts ➡️ The options object. (optional)
 * @return {NEXT_URL} 📤 next url item
 */
export const getNextUrl = (
    url: string,
    forwards: FORWARD_ITEMS,
    opts: HTTP_OPTS = {}
): NEXT_URL => {
    const isForwarded = getProp(opts, 'forwarding', false);
    const urlID = getHostname(url);
    const item = forwards[urlID];
    // const item = FORWARDS[urlID];
    let statusCode = item ? item.status : 0;
    const order = item ? item.order : [];
    const max = order.length - 1;
    const index = isForwarded ? max : order.indexOf(url);
    const indexMax = order.length - 1;
    const isLast = index === indexMax;
    if (index > -1) {
        if (index === indexMax) {
            const nextUrl = order[index];
            // last item
            return { url: nextUrl, statusCode, isLast };
        } else {
            const nextIndex = index + 1;
            const nextUrl = order[nextIndex];
            if (nextUrl) {
                return { url: nextUrl, statusCode: 301, isLast };
            }
        }
    }
    return { url, statusCode, isLast };
};

// TODO: content, statuscode als {alt }
/**
 * 🎯 get the httpItem
 * @param {URI} url ➡️ The url to get the item for.
 * @param {HEADER_SHORT} alt ➡️ overwrite header information. (optional)
 * @param {HTTP_OPTS} opts ➡️ The options object. (optional)
 * @returns {CurlItem} 📤 The http item or full response. // TODO: fix
 */
export const _httpItem = (
    url: URI,
    alt: HEADER_SHORT = {},
    opts: HTTP_OPTS = {}
): CurlItem => {
    const newStatusCode = getProp(alt, 'status');
    const content = getProp(alt, 'content');
    const urlItem = getNextUrl(url, FORWARDS, opts);
    const isLast = urlItem.isLast;
    let statusCode = newStatusCode || urlItem.statusCode;
    const defaultItem = { contentLength: '0' };
    const customPart: any = custom[statusCode] || defaultItem;
    const locationPart: any = {};
    const location = urlItem.url;
    if (statusCode === 301) {
        if (isLast === true) {
            statusCode = 200;
            locationPart['lastLocation'] = url;
        } else if (location !== url) {
            locationPart['location'] = urlItem.url;
            locationPart['lastLocation'] = url;
        }
    } else if (opts.forwarding === true && location !== url) {
        locationPart['lastLocation'] = url;
    } else if (!opts.forwarding && location !== url) {
        locationPart['lastLocation'] = url;
    }
    // if (location && newStatusCode === 301) {
    //     locationPart['location'] = location;
    // }

    const status = setProtocolStatus(statusCode);
    let item: any = {};
    item.content = content ? `${content}` : ''; // force trim
    item.success = statusCode > 0 && statusCode < 400;
    item.time = 23; // mock time
    item.status = status.status;
    const hasExt = statusCode > 0 && statusCode < 400;
    const header: HTTP = {
        ...status,
        ...customPart,
        ...locationPart,
        ...(hasExt ? _EXT_BASE : {}),
        ..._BASE,
    };
    if (opts.noLastLocation && header.hasOwnProperty('lastLocation')) {
        delete header['lastLocation'];
    }
    const result = { header, ...item };
    return result;
};
/**
 * 🎯 shortcut to get the header part of a CurlItem
 * @param {string} url ➡️ The url to get the item for.
 * @param {HEADER_SHORT} alt ➡️ overwrite header information. (optional)
 * @param {HTTP_OPTS} opts ➡️ The options object. (optional)
 * @returns {HTTP} 📤 The header part of the curl item.
 */
export const _headerItem = (
    url: string,
    alt: HEADER_SHORT = {},
    opts: HTTP_OPTS = {}
): HTTP => {
    const item: CurlItem = _httpItem(url, alt, opts);
    if (opts.noLastLocation && item.header.hasOwnProperty('lastLocation')) {
        delete item.header['lastLocation'];
    }
    return item.header;
};

/**
 * 🎯 create a http response from a curl object
 * @param {CurlItem} curlObject ➡️ The curl response object.
 * @returns {RAW} 📤 The full http response.
 */
export const getResponseFromObject = (curlObject: CurlItem): RAW => {
    const content = curlObject.content ? `${curlObject.content}` : '';
    let result: string = `\n`;
    if (!curlObject || Object.keys(curlObject).length === 0) {
        LOG.FAIL(JSON.stringify(curlObject));
        return toHTTP(result);
    }
    const spaces = '        ';
    const spacesBefore = '';
    const listProtocol = [
        'protocol',
        'protocolversion',
        'status',
        'statusmessage',
    ];
    const FILTERED = ['lastLocation'];
    const header: HTTP = getProp(curlObject, 'header', {});
    const status = header.status;
    result += `${spacesBefore}${header.protocol.toUpperCase()}/${header.protocolVersion} ${status} ${header.statusMessage}\r\n`;
    const headerKeys = sortASC(Object.keys(header)).filter(
        (key) => FILTERED.indexOf(key) === -1
    );
    for (const key of headerKeys) {
        if (listProtocol.indexOf(key.toLowerCase()) !== -1) {
            continue;
        }
        const headerItem = (header as Record<string, unknown>)[key];
        if (headerItem) {
            result += `${spacesBefore}${convert2HeaderCase(key)}: ${headerItem}\r\n`;
        }
    }
    const final = content
        ? `${result}${spaces}\r\n\r\n${content}\n`
        : `${result}${spaces}\n`;
    return toHTTP(final);
};

/**
 * 🎯 get the response for a domain and statuscode
 * @param {URI} domain ➡️ The domain to get the response for.
 * @param {HEADER_SHORT} alt ➡️ Overwrite header information. (optional)
 * @param {HTTP_OPTS} opts ➡️ The options object. (optional)
 * @returns {RAW} 📤 The full http response.
 */
export const getRESPONSE = (
    domain: URI,
    alt: HEADER_SHORT = {},
    opts: HTTP_OPTS = {}
): RAW => {
    const item = _httpItem(domain, alt, opts);
    return toHTTP(getResponseFromObject(item));
};

/**
 * 🎯 get full response string
 * @param {URI} domain ➡️ The domain to get the response for.
 * @param {HEADER_SHORT} alt ➡️ Overwrite header information. (optional)
 * @param {HTTP_OPTS} opts ➡️ The options object. (optional)
 * @returns {string} 📤 The full http response.
 */
export const _response = (
    domain: URI,
    // alt: HEADER_SHORT = {},
    status: number,
    content: string,
    opts: HTTP_OPTS = {}
): string => {
    // const content = getProp(alt, 'content');
    const mockResult = `${getRESPONSE(domain, { status }, opts)}

            ${content}`; // force trim
    //                ${content}`; // force trim
    return mockResult;
};

/**
 * 🎯 get  a sample header of an response string.
 * @param {string} domain ➡️ The domain to get the header for.
 * @param {OPTS} opts ➡️ The options object. (optional)
 * @returns {RAW} 📤 The http header.
 */
export const _header = (domain: string, opts: OPTS = {}): RAW => {
    if (!hasTimeout(opts?.request)) {
        return toHTTP(getRESPONSE(domain));
    }
    return toHTTP(getRESPONSE(domain, { status: 0 })); // TODO: why
};

const getItemByStatus = (FORWARDS: FORWARD_ITEMS, status: number) => {
    return Object.values(FORWARDS).filter((f) => f.status === status)[0];
};

// shortcut
export const _raw = (
    status: number,
    alt: HEADER_SHORT = {},
    config: any = {}
): RAW => {
    const defaultItem = getItemByStatus(FORWARDS, 0);
    const item = getItemByStatus(FORWARDS, status) || defaultItem;
    return formatResponse(item.httpItems, alt, config);
};

const HTTP_OPTIONS = [
    'contentLength',
    'status',
    'location',
    'lastLocation',
    'ext',
    'etag',
    'lastModified',
];
const BASE_OPTIONS = ['content', 'status', 'success', 'time'];

const BASE_FILTERED = ['ext'];
const createOpts = (alt: any, options: string[], filtered: string[] = []) => {
    const result: Record<string, unknown> = {};
    for (const opt of options) {
        if (filtered.includes(opt)) continue;
        const value = getProp(alt, opt);
        if (value !== undefined) {
            result[opt] = value;
        }
    }
    return result;
};

// shortcut
export const _http = (status: number, alt: any = {}) => {
    // httpOpts
    const httpOpts: OPTS = createOpts(alt, HTTP_OPTIONS, BASE_FILTERED);
    const baseOpts: OPTS = createOpts(alt, BASE_OPTIONS);
    const hasExt = status > 0 && status < 400;
    return {
        header: {
            contentLength: '0',
            ..._BASE,
            ...(hasExt ? _EXT_BASE : {}),
            ...setProtocolStatus(status),
            ...httpOpts,
        },
        content: '',
        success: hasExt,
        time: expect.any(Number),
        ...baseOpts,
        status: `${status}`,
    };
};
export const _head = (status: number, alt: any = {}) => {
    const http = _http(status, alt);
    return http.header;
};
/**
 * 🎯 formats a json to a http string
 * @param {any} item ➡️ The json object to format.
 * @param {any} alt ➡️ object with alternative values (optional)
 * @param {any} config ➡️ object with configuration options (optional)
 * @returns {RAW} 📤 The formatted http string.
 */
export const formatResponse = (
    item: any,
    alt: any = {},
    config: any = {}
): RAW => {
    const content =
        getProp(item, 'content', undefined) ||
        getProp(alt, 'content', undefined); // why alt or item content?
    let result: RAW = '\nHTTP/\r\n';
    const format = config?.format || 'default';
    // const before = '\n';
    let end = '';
    const TAB = '        ';
    let seperator: string = '';
    switch (format) {
        case 'other':
            seperator = `${TAB}\n\n\n${TAB}${TAB}${TAB}`;
            break;
        case 'response':
            seperator = `${TAB}\n\n\n            `;
            break;
        default:
            end = '\n';
            seperator = `${TAB}\r\n\r\n`;
    }
    // result += before;
    const sortedKeys = sortASC(Object.keys(item));
    for (const KEY of sortedKeys) {
        const value = item[KEY];
        const isHttpKey = KEY.indexOf('HTTP/') !== -1;
        if (isHttpKey) {
            result = result.replace('HTTP/', KEY) as RAW;
        }
        const key = KEY.toLowerCase();
        if (['content'].includes(key)) {
            continue;
        }
        const finalValue = alt.hasOwnProperty(KEY) ? alt[KEY] : value;
        const hasValue =
            finalValue !== undefined &&
            finalValue !== null &&
            finalValue !== '';
        const val = hasValue ? `: ${finalValue}` : '';
        let Key = KEY;
        // lower keys to headerCase [optimization to reduce LOC]  key-foo => Key-Foo
        if (Key[0] !== Key[0].toUpperCase()) {
            Key = convert2HeaderCase(Key);
        }
        // const sepValue = '        ';
        const sepValue = '';
        if (!isHttpKey) {
            result += `${sepValue}${Key}${val}\r\n`;
        }
    }
    if (content) {
        result += `${seperator}${content}${end}`;
    } else {
        result += `${TAB}\n`;
    }
    return toHTTP(result);
};
