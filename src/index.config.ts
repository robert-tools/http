/**
 * ⚙️ config for HTTP
 * @module backend/_shared/HTTP
 * @version 2.0.3
 * @date 2026-10-06
 * @lastModified 2025-10-13
 * @license MIT
 * @author Robert Willemelis <github.com/willi84>
 */

import type { MOCK_CONFIG } from './index.d';

export const STANDARD_CURL_TIMEOUT: number = 0.4;
export const BASE_HTTP_OPTS = { forwarding: false, showLog: false };
// export const DEFAULT_UA = '-H "User-Agent: nodejs" ';

export const DOMAIN_200 = 'domain-200.de';
export const DOMAIN_301 = 'domain-301.de';
export const DOMAIN_301_2 = 'domain-301-2.de';
export const DOMAIN_404 = 'domain-404.de';
export const DOMAIN_500 = 'domain-500.de';
export const DOMAIN_UNKNOWN = 'domain-unknown.de';
export const DOMAIN_STATUS_0 = 'domain-status-0.de';
export const SVG_GITHUB = 'https://api.github.com/icons/icon.svg';
export const SVG_GITLAB = 'https://api.gitlab.com/icons/icon.svg';
export const NO_HOST = 'no-host-found';
export const INVALID_HTTP = 'invalid-http';

export const HTTP_UNKNOWN_HOST = `curl: (6) Could not resolve host:`;

const content = 'some get response content';
export const mockConfig: MOCK_CONFIG = {
    [DOMAIN_200]: {
        content,
        order: [
            `${DOMAIN_200}`,
            `www.${DOMAIN_200}`,
            `http://${DOMAIN_200}`,
            `https://${DOMAIN_200}`,
            `https://www.${DOMAIN_200}`,
            `https://www.${DOMAIN_200}/`,
        ],
        status: 200,
    },
    [DOMAIN_301]: {
        // content,
        order: [
            `${DOMAIN_301}`,
            `www.${DOMAIN_301}`,
            `http://${DOMAIN_301}`,
            `https://${DOMAIN_301}`,
            `https://www.${DOMAIN_301}`,
            `https://www.${DOMAIN_301}/`,
        ],
        status: 301,
    },
    [DOMAIN_404]: {
        // content,
        order: [
            `${DOMAIN_404}`,
            `www.${DOMAIN_404}`,
            `http://${DOMAIN_404}`,
            `https://${DOMAIN_404}`,
            `https://www.${DOMAIN_404}`,
            `https://www.${DOMAIN_404}/`,
        ],
        status: 404,
    },
    [DOMAIN_STATUS_0]: {
        // content,
        order: [
            `${DOMAIN_STATUS_0}`,
            // `www.${DOMAIN_STATUS_0}`,
            // `http://${DOMAIN_STATUS_0}`,
            // `https://${DOMAIN_STATUS_0}`,
            // `https://www.${DOMAIN_STATUS_0}`,
            // `https://www.${DOMAIN_STATUS_0}/`,
        ],
        status: 0,
    },
    [SVG_GITHUB]: {
        content: '<svg>',
        status: 200,
    },
    [SVG_GITLAB]: {
        content: '<svg>',
        status: 200,
    },
    [NO_HOST]: {
        content:
            'curl: (7) Failed to connect to localhost port 3000 after 0 ms: Connection refused',
        status: 0,
    },
    fallback: {
        status: 404,
    },
    [INVALID_HTTP]: {
        content: `${HTTP_UNKNOWN_HOST} ${INVALID_HTTP}`,
        status: 0,
    },
};

export const CONTENT_301 =
    '<html><body><h1>301 Moved Permanently</h1></body></html>';
// export const HTTP_UNKNOWN_HOST = `curl: (6) Could not resolve host:`;

export const etag = '"65f7fcac-12cb4"';
export const lastModified = 'Mon, 18 Mar 2024 08:34:52 GMT';
export const MOCK_TIME = 23;
