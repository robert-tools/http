// 📦 external dependencies
import { URI } from '@robert.tools/typings';
import { getProp, toType } from '@robert.tools/utils';
import { LOG } from '@robert.tools/log';
import type { CURL_OPTS } from '@robert.tools/curl';
import { convert2CamelCase, convert2KeyValue } from '@robert.tools/convert';

// 📦 internal dependencies

// ⚙️ config
import { BASE_HTTP_OPTS as OPTS, MOCK_TIME } from '../index.config';
import { DEFAULT_HTTP } from './utils.config';

// 🧩 types
import type { HEADER_CONTENT } from './utils.d';
import type { CurlItem, HTTP, HTTP_OPTS, RAW } from './../index.d';
import { _http } from '@robert.tools/testing';

/**
 * 🎯 check if timeout is defined
 * @param {string} curl ➡️ The curl command. //TODO
 * @returns {boolean} 📤 Whether a timeout is defined.
 */
export const hasTimeout = (curl: string | undefined): boolean => {
    if (!curl) return false;
    const timeout = curl.match(/-m\s+([^\s]+)/);
    const num = timeout ? timeout[1] : undefined;
    const isNumber = num && !isNaN(parseFloat(num));
    const isfloat = isNumber && !num.toString().includes('_'); // is valid float, not 1_0
    if (timeout && isfloat) {
        return true;
    }
    return false;
};

/**
 * 🎯 sets the last location of an HTTP item if applicable.
 * @param {HTTP} item ➡️ The HTTP item object.
 * @param {URI} url ➡️ The current URL.
 * @param {HTTP_OPTS} opts ➡️ The HTTP options object.
 */
export const setLastLocation = (item: HTTP, url: URI, opts: HTTP_OPTS) => {
    const location = item['location'];
    if (location && location !== url && !opts.noLastLocation) {
        item['lastLocation'] = url;
    }
};

/**
 * 🎯 Splits the raw HTTP response into header and content.
 * @param {string} raw ➡️ The raw HTTP response string.
 * @returns {HEADER_CONTENT} 📤 The split header and content.
 */
export const splitHeaderAndContent = (raw: string): HEADER_CONTENT => {
    const hasHTTP = /^\n?HTTP\//.test(raw);
    let data = raw.replace(/^\n/, ''); // remove first empty line if exists
    const splitted = data.split(/\r?\n\r?\n/); // TODO: mehrer \n\n\n
    const headerString = splitted[0].replace(/\r?\n$/, '');
    const header = hasHTTP ? <RAW>toType(headerString) : DEFAULT_HTTP;
    const contentItem = splitted.slice(1).join('\n');
    const content = hasHTTP ? contentItem : data;
    return {
        header,
        content: content.trim(), // TODO: mehrer \n\n
    };
};

/**
 * 🎯
 * @param {HTTP_OPTS} options ➡️ The HTTP options object.
 * @returns {CURL_OPTS} 📤 The corresponding curl options object.
 */
export const getCurlOpts = (options: HTTP_OPTS = OPTS) => {
    const { forwarding, ua, method, token } = options;
    const curlOpts: CURL_OPTS = {
        header: {
            ...(ua ? { ua } : {}),
            ...(token ? { token } : {}),
        },
        ...(method ? { method } : {}),
        ...(forwarding ? { data: JSON.stringify({ forwarding }) } : {}),
    };
    return curlOpts;
};

/**
 * 🎯 Get the default HTTP response object.
 * @param {number} start ➡️ The start time in milliseconds.
 * @param {boolean} isMock ➡️ Flag indicating if this is a mock response.
 * @returns {CurlItem} 📤 The default HTTP response object.
 */
export const getDefaultResponse = (start: number, isMock = false): CurlItem => {
    const time = isMock ? MOCK_TIME : new Date().getTime() - start;
    return _http(0, { success: false, time });
};

/**
 * 🎯 Determines if the HTTP response status indicates success.
 * @param {string} status ➡️ The HTTP response status code as a string.
 * @param {any} opts ➡️ Optional parameters, including `isDev` and `url`.
 * @returns {boolean} 📤 True if the status code indicates success.
 */
export const getSuccess = (status: string, opts: any = {}): boolean => {
    const isDev = getProp(opts, 'isDev', false);
    const url = getProp(opts, 'url', '<no-url>');
    if (status === '0') {
        LOG.WARN(`no status code found. set to 0`);
    }
    const code = parseInt(status, 10) || 0;
    const success = code >= 200 && code < 400;
    if (isDev) {
        const type = success ? 'OK' : 'INFO';
        LOG[type](`Response: ${url}: ${status}`);
    }
    return success;
};

/**
 * 🎯 get minimal http item
 * @param {RAW} raw ➡️ The raw HTTP header string.
 * @param {HTTP_OPTS} opts ➡️ Optional configuration object containing forwarding, timeout, debug, and method.
 * @returns {HTTP} 📤 The parsed HTTP status object.
 */
export const getHttpFromHeader = (raw: RAW, opts: HTTP_OPTS = OPTS): HTTP => {
    const httpItem: any = {};
    const lines = raw.split('\n');
    let stop = false;
    lines.forEach((line: string) => {
        const item = convert2KeyValue(line.trim());
        const key = convert2CamelCase(item.key);

        // stop at body ([header '\r' body])
        if (line === '\r' || stop === true) { // cause split \n
            stop = true;
        } else if (key.indexOf('http/') === 0) {
            const version = key.split('/')[1];
            const status = item.value.split(' ')[0];
            const message = item.value.replace(status, '').trim();
            httpItem.protocol = 'http';
            httpItem.protocolVersion = version;
            httpItem.status = status;
            httpItem.statusMessage = message;
        } else if (key.trim() !== '') {
            // avoid empty key
            httpItem[`${key}`] = item.value;
        }
    });
    if (httpItem.status === undefined) {
        httpItem.status = '0';
        if (opts.showLog === true) {
            LOG.WARN('no status code found. set to 0');
            LOG.DEBUG(raw);
        }
    }
    return httpItem;
};
