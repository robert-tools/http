import { FORWARD_ELEMENTS, STATUS_CODES } from './index.mocks.d';

/**
 * ⚙️ config for HTTP
 * @module backend/_shared/HTTP
 * @version 0.0.2
 * @date 2025-09-18
 * @lastModified 2025-10-13
 * @license MIT
 * @author Robert Willemelis <github.com/willi84>
 */
export const STANDARD_CURL_TIMEOUT: number = 0.4;
export const CURL_CONFIG_STATUS = `-m ${STANDARD_CURL_TIMEOUT} --silent`;

export const DOUBLE_REGEX =
    /(ac|co|com|edu|gov|gob|gouv|id|lg|ltd|me|mil|net|nhs|nom|or|org|plc|res|school)\.[a-z]{2}/i;

export const DOMAIN_200 = 'domain-200.de';
export const DOMAIN_301 = 'domain-301.de';
export const DOMAIN_301_2 = 'domain-301-2.de';
export const DOMAIN_404 = 'domain-404.de';
export const DOMAIN_500 = 'domain-500.de';
export const DOMAIN_UNKNOWN = 'domain-unknown.de';

export const STATUSCODES: STATUS_CODES = {
    200: { text: 'OK', domains: [DOMAIN_200] },
    301: { text: 'Moved Permanently', domains: [DOMAIN_301, DOMAIN_301_2] },
    404: { text: 'Not Found', domains: [DOMAIN_404] },
    500: { text: 'Internal Server Error', domains: [DOMAIN_500] },
    0: { text: 'unknown', domains: [DOMAIN_UNKNOWN] },
};
export const FORWARDS: FORWARD_ELEMENTS = {
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
    },
    // [DOMAIN_UNKNOWN]: {
    //     status: 0,
    //     order: [
    //         `${DOMAIN_UNKNOWN}`,
    //         // `http://${DOMAIN_UNKNOWN}`,
    //         // `https://${DOMAIN_UNKNOWN}`,
    //         // `https://www.${DOMAIN_UNKNOWN}`,
    //         // `https://www.${DOMAIN_UNKNOWN}/`,
    //     ],
    // },
};
