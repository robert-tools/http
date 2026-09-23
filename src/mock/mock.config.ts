import type { FORWARD_MOCKS, ORDERS, URL_ITEMS } from '../spy/spy.d';
import { _httpItem2 } from '../spy/spy';
import type { FORWARD_ITEMS, HEADER_SHORT, STATUS_CODES } from './mock.d';
import { _http, formatResponse } from './mock';

export const MOCK_TIME = 23;

// base
export const server = 'nginx/1.14.1';
export const contentType = 'text/html; charset=UTF-8';
export const protocol = 'http';
export const protocolVersion = '1.1';
export const DEFAULT_DATE = 'Mon, 18 Mar 1970 08:34:52 GMT';
const connection = 'keep-alive';
const date = DEFAULT_DATE;
const referrerPolicy = 'no-referrer-when-downgrade';
const strictTransportSecurity = 'max-age=31536000;';
const xFrameOptions = 'SAMEORIGIN';
const acceptRanges = 'bytes';
export const etag = '"65f7fcac-12cb4"';
export const lastModified = 'Mon, 18 Mar 2024 08:34:52 GMT';
export const contentLength = '7698';

export const _BASE = { contentType, connection, server, date };
export const _EXT_BASE = {
    acceptRanges,
    xFrameOptions,
    strictTransportSecurity,
    referrerPolicy,
};

export const DOMAIN_200 = 'domain-200.de';
export const DOMAIN_301 = 'domain-301.de';
export const DOMAIN_301_2 = 'domain-301-2.de';
export const DOMAIN_404 = 'domain-404.de';
export const DOMAIN_500 = 'domain-500.de';
export const DOMAIN_UNKNOWN = 'domain-unknown.de';
export const DOMAIN_STATUS_0 = 'domain-status-0.de';

export const FORWARDS: FORWARD_ITEMS = {
    [DOMAIN_200]: {
        status: 200,
        order: [
            `${DOMAIN_200}`,
            `www.${DOMAIN_200}`,
            `http://${DOMAIN_200}`,
            `https://${DOMAIN_200}`,
            `https://www.${DOMAIN_200}`,
            `https://www.${DOMAIN_200}/`,
        ],
        httpItems: {
            'HTTP/1.1 200 OK': undefined,
            contentLength,
            etag: '"65f7fcac-12cb4"',
            lastModified,
            ..._BASE,
            ..._EXT_BASE,
        },
    },
    [DOMAIN_301]: {
        status: 301,
        order: [
            `${DOMAIN_301}`,
            `http://${DOMAIN_301}`,
            `https://${DOMAIN_301}`,
            `https://www.${DOMAIN_301}`,
            `https://www.${DOMAIN_301}/`,
        ],
        httpItems: {
            'HTTP/1.1 301 Moved Permanently': undefined,
            contentLength: '185',
            Location: `https://www.${DOMAIN_301}/`,
            ..._BASE,
            ..._EXT_BASE,
        },
    },
    [DOMAIN_404]: {
        status: 404,
        order: [
            `${DOMAIN_404}`,
            `http://${DOMAIN_404}`,
            `https://${DOMAIN_404}`,
            `https://www.${DOMAIN_404}`,
            `https://www.${DOMAIN_404}/`,
        ],
        httpItems: {
            'HTTP/1.1 404 Not Found': undefined,
            contentLength: '1500',
            ..._BASE,
        },
    },
    [DOMAIN_STATUS_0]: {
        status: 0,
        order: [
            `${DOMAIN_STATUS_0}`,
            // `http://${DOMAIN_STATUS_0}`,
            // `https://${DOMAIN_STATUS_0}`,
            // `https://www.${DOMAIN_STATUS_0}`,
            // `https://www.${DOMAIN_STATUS_0}/`,
        ],
        httpItems: {
            'HTTP/1.1 0 unknown': undefined,
            contentLength: '0',
            ..._BASE,
        },
    },
    [DOMAIN_UNKNOWN]: {
        status: 0,
        order: [
            `${DOMAIN_UNKNOWN}`,
            // `http://${DOMAIN_UNKNOWN}`,
            // `https://${DOMAIN_UNKNOWN}`,
            // `https://www.${DOMAIN_UNKNOWN}`,
            // `https://www.${DOMAIN_UNKNOWN}/`,
        ],
        httpItems: {},
    },
};

export const STATUSCODES: STATUS_CODES = {
    200: { text: 'OK', domains: [DOMAIN_200] },
    301: { text: 'Moved Permanently', domains: [DOMAIN_301, DOMAIN_301_2] },
    404: { text: 'Not Found', domains: [DOMAIN_404] },
    500: { text: 'Internal Server Error', domains: [DOMAIN_500] },
    0: { text: 'unknown', domains: [DOMAIN_UNKNOWN] },
};

export const CONTENT_301 =
    '<html><body><h1>301 Moved Permanently</h1></body></html>';
export const CONTENT_404 = '<html><body><h1>404 Not Found</h1></body></html>';
export const HTTP_UNKNOWN_HOST = `curl: (6) Could not resolve host:`;

const domains = Object.keys(FORWARDS);
export const getForwards = (newContent: string): URL_ITEMS => {
    const orders: ORDERS = {};
    const FORWARD_HTTP: FORWARD_MOCKS = {};
    for (const domain of domains) {
        const item = FORWARDS[domain];
        const order = item.order;
        orders[domain] = order;
        for (const forward of order) {
            const current = forward;
            const index = order.indexOf(forward);
            const nextIndex = index + 1;
            const next = order[nextIndex] || order[order.length - 1];
            const isFinalStatusCode = current === next;
            const newStatusCode = isFinalStatusCode ? item.status : 301;
            const location = next;
            let content = '';
            let ext: boolean = false;
            switch (newStatusCode) {
                case 301:
                    ext = true;
                    content = CONTENT_301;
                    break;
                case 200:
                    content = newContent;
                    ext = true;
                    break;
                case 404:
                    content = CONTENT_404;
                    break;
                default:
                    // handle other status codes if needed
                    break;
            }
            const header: HEADER_SHORT = {
                status: newStatusCode,
                ...(location ? { location } : {}),
                content,
            };
            const httpItem = _httpItem2(header, { ext });
            FORWARD_HTTP[current] = formatResponse(httpItem);
        }
    }
    FORWARD_HTTP['fallback'] = formatResponse({ status: 404 });
    const item = _http(200, { content: '<svg>' });
    const SVG_RESPONSE = formatResponse(item.header, { content: item.content });
    FORWARD_HTTP['https://api.github.com/icons/icon.svg'] = SVG_RESPONSE;
    FORWARD_HTTP['https://api.gitlab.com/icons/icon.svg'] = SVG_RESPONSE;
    FORWARD_HTTP['invalid-http'] = `${HTTP_UNKNOWN_HOST} invalid-http`;

    return {
        forwards: FORWARD_HTTP,
        orders,
    };
};
