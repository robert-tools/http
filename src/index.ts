/**
 * 🎯 A utility class for http handling
 * @module backend/_shared/HTTP
 * @example getResponse('https://www.domain.de');
 * @version 2.0.1
 * @date 2026-09-23
 * @license MIT
 * @author Robert Willemelis <github.com/willi84>
 */

// external dependencies
import { LOG } from '@robert.tools/log';
import { command } from '@robert.tools/cmd';
import { getProp } from '@robert.tools/utils';
import { NUM, URI } from '@robert.tools/typings';
import { curl } from '@robert.tools/curl';

// internal dependencies
import { BASE_HTTP_OPTS as OPTS, STANDARD_CURL_TIMEOUT } from './index.config';
import {
    getCurlOpts,
    getDefaultResponse,
    getHttpFromHeader,
    getSuccess,
    isHTTP,
    setLastLocation,
    splitHeaderAndContent,
} from './utils/utils';

// types
import type { CurlItem, HTTP_OPTS, HTTP } from './index.d';
import type { HEADER_CONTENT } from './utils/utils.d';

/**
 * 🎯 get the time of connecting to an url
 * @param {URI} url ➡️ The URL to connect to.
 * @returns {string} 📤 The connection time in seconds as a string.
 */
export const getConnectionTime = (url: URI): NUM => {
    // return just time
    const cmd = `curl -o /dev/null -s -w '%{time_total}\\n' ${url}`;
    return command(`${cmd}`);
};

/**
 * 🎯 get http status value from specified url
 * @param {string} url ➡️ The URL to check.
 * @param {HTTP_OPTS} [opts] ➡️ Optional configuration object containing forwarding, timeout, debug, and method.
 * @returns {NUM} 📤 The HTTP status code as a string.
 */
export const getHttpStatusValue = (url: URI, opts: HTTP_OPTS = OPTS): NUM => {
    // const opts = { ...options }; // needs copy
    const httpItem = getHttpItem(url, opts);
    if (httpItem['maxRedirectsReached']) {
        LOG.FAIL(`max redirects reached for ${url}`);
    }
    return httpItem['status'];
};

/**
 * 🎯 get base http item for url (wrapper of getResponse)
 * @param {string} url ➡️ The URL to check.
 * @param {HTTP_OPTS} [opts] ➡️ Optional configuration object containing timeout, debug, and method.
 * @returns {HeaderItem} 📤 The parsed HTTP status object.
//  * @returns {HTTP} 📤 The parsed HTTP status object.
 */
export const getHttpBase = (url: URI, opts: HTTP_OPTS = OPTS): HTTP => {
    return getResponse(url, opts).header;
};

/**
 * 🎯 get base http item for url with forwarding
 * @todo refactor with getHttpBase and getResponse
 * @todo forwarding and timeout as optional paramaters
 * @param {URI} url ➡️ The URL to check.
 * @param {HTTP_OPTS} opts ➡️ Optional configuration object containing forwarding, timeout, debug, and method.
 * @returns {HTTP} 📤 The parsed HTTP status object.
 */
export const getHttpItem = (url: URI, opts: HTTP_OPTS = OPTS): HTTP => {
    const initialUrl = url;
    const maxRedirects = getProp(opts, 'maxRedirects', 5);
    let redirects = 0;
    let httpItem: HTTP = {} as HTTP;
    let forwarding = getProp(opts, 'forwarding', false); // no reference on options!
    let oldUrl = url;
    if (forwarding) {
        while (forwarding) {
            redirects += 1;
            httpItem = getResponse(url, opts).header;
            // httpItem = getHttpBase(url, opts);
            if (httpItem['location'] === oldUrl) {
                forwarding = false;
                httpItem['initialUrl'] = initialUrl; // TODO: testing
                httpItem['lastLocation'] = url; // TODO: testing
                httpItem['redirects'] = `${redirects}`;
                return httpItem;
            } else if (redirects > maxRedirects) {
                httpItem['maxRedirectsReached'] = 'true';
                httpItem['lastStatus'] = httpItem['status'];
                httpItem['status'] = '0';
                httpItem['redirects'] = `${redirects}`;
                httpItem['lastLocation'] = url;
                httpItem['initialUrl'] = initialUrl;
                LOG.FAIL(`max redirects reached for ${url}`);
                return httpItem;
            } else {
                // TODO: check valid url
                const location = httpItem['location'];
                if (location) {
                    oldUrl = url;
                    // httpItem['lastLocation'] = url;
                    url = location;
                } else {
                    forwarding = false;
                    httpItem['initialUrl'] = initialUrl; // TODO: testing
                    httpItem['lastLocation'] = url; // TODO: testing
                    httpItem['redirects'] = `${redirects}`;
                    return httpItem;
                }
            }
        }
    } else {
        httpItem = getResponse(url, opts).header;
        // httpItem = getHttpBase(url, opts);
        if (oldUrl !== url) httpItem['lastLocation'] = url; // TODO: testen
    }
    return httpItem;
};

/**
 * 🎯 get full response for url
 * @todo refactor with getHttpItem
 * @param {string} url ➡️ The URL to fetch.
 * @param {HTTP_OPTS} options ➡️ Optional settings (e.g., token, isDev).
 * @returns {CurlItem} 📤 The response object containing header, content, status, success, and time.
 */
export const getResponse = (url: URI, options: HTTP_OPTS = OPTS): CurlItem => {
    const start = new Date().getTime();
    const isGithubApi = url.indexOf('api.github.com') !== -1;
    const isMock = getProp(options, 'isMock', false);
    if (isGithubApi && !options.token) {
        LOG.FAIL('Please set a GITHUB_TOKEN in the environment variables.');
        return getDefaultResponse(start, isMock); // fallback
    }

    const defaultOptions = {
        timeout: getProp(options, 'timeout', STANDARD_CURL_TIMEOUT),
        silent: true,
    };
    const allOptions = { ...defaultOptions, ...options };
    const curlOpts = getCurlOpts(allOptions);
    const time = isMock ? 23 : new Date().getTime() - start;
    const rawData = curl(url, curlOpts); // run commmand
    // break if no valid HTTP response is received
    if (!isHTTP(rawData)) {
        LOG.FAIL(`Invalid HTTP response: ${rawData}`);
        return getDefaultResponse(start, isMock); // fallback
    }
    const item: HEADER_CONTENT = splitHeaderAndContent(rawData);
    const httpItem = getHttpFromHeader(item.header, options);
    const status = getProp(httpItem, 'status', '0');
    setLastLocation(httpItem, url, options);
    return {
        header: httpItem,
        content: item.content,
        status,
        success: getSuccess(status, { ...options, url }),
        time,
    };
};

// API
export const isHttp = isHTTP;
