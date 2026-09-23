// external dependencies
import { getHostname, getUrlID } from '@robert.tools/uri';
import * as cmd from '@robert.tools/cmd';
import { LOG } from '@robert.tools/log';
import { getProp } from '@robert.tools/utils';
import { getCurlData } from '@robert.tools/curl';

// internal dependencies
import type { URL_ITEMS } from './spy.d';
import type { STATUS_CODES } from '../mock/mock.d';
import type { CurlItem, HTTP } from '../index.d';
import { setProtocolStatus } from '../mock/mock';

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

export const _BASE = { contentType, connection, server, date };

/**
 * Creates a spy on the `cmd.command` function and mocks its implementation to return the specified result.
 * @param result ➡️ The mock value to return. (optional)
 * @returns {jest.SpyInstance} 📤 The spy instance.
 */
export const spyOnCommand = (result: string = '') => {
    return jest.spyOn(cmd, 'command').mockImplementation((): string => {
        return result;
    });
};
export const spyOnURLs = (results: URL_ITEMS) => {
    return jest
        .spyOn(cmd, 'command')
        .mockImplementation((request: string): string => {
            // TODO: refactor und auslagern
            const forwards = results?.forwards || {};
            const urlID = getUrlID(request);
            const domainID = getHostname(urlID);
            const orders = results?.orders || {};
            const order = orders?.[domainID] || [];
            const data = getCurlData(request);
            let finalUrlID = urlID;
            if (data.data?.forwarding) {
                const lastOrder = order[order.length - 1];
                if (lastOrder && forwards[lastOrder]) {
                    finalUrlID = lastOrder;
                }
            }
            // const hostname = getHostname(urlID);
            const result = forwards?.[finalUrlID];
            if (!result) {
                LOG.FAIL(`No mock result for URL ID: ${finalUrlID}`);
                return forwards['fallback'] || '<invalid>';
            }
            return result;
        });
};

const EXT_BASE = {
    acceptRanges,
    xFrameOptions,
    strictTransportSecurity,
    referrerPolicy,
};

export const custom: { [key: number]: any } = {
    200: {
        contentLength: '7698',
        lastModified: 'Mon, 18 Mar 2024 08:34:52 GMT',
        etag: '"65f7fcac-12cb4"', // TODO: kelin
        ...EXT_BASE,
    },
    301: {
        contentLength: '185',
        // location: `https://www.${domain}/`,
        ...EXT_BASE,
    },
    404: {
        contentLength: '1500',
        // Etag: '"6595577a-a30b"', // TODO: kelin
    },
    500: {
        contentLength: '0',
    },
};

export const DOMAIN_200 = 'domain-200.de';
export const DOMAIN_301 = 'domain-301.de';
export const DOMAIN_301_2 = 'domain-301-2.de';
export const DOMAIN_404 = 'domain-404.de';
export const DOMAIN_500 = 'domain-500.de';
const DOMAIN_UNKNOWN = 'domain-unknown.de';
export const DOMAIN_STATUS_0 = 'domain-status-0.de';

export const STATUSCODES: STATUS_CODES = {
    200: { text: 'OK', domains: [DOMAIN_200] },
    301: { text: 'Moved Permanently', domains: [DOMAIN_301, DOMAIN_301_2] },
    404: { text: 'Not Found', domains: [DOMAIN_404] },
    500: { text: 'Internal Server Error', domains: [DOMAIN_500] },
    0: { text: 'unknown', domains: [DOMAIN_UNKNOWN] },
};
// TODO: _httpItem
export const _httpItem2 = (alt: any = {}, config = {}): CurlItem => {
    const newStatusCode = getProp(alt, 'status', 0);
    const content = getProp(alt, 'content', undefined);
    const location = getProp(alt, 'location', undefined);
    const defaultItem = { contentLength: '0' };
    const customPart: any = custom[newStatusCode] || defaultItem;
    const locationPart: any = {};
    if (location && newStatusCode === 301) {
        locationPart['location'] = location;
    }

    const status = setProtocolStatus(newStatusCode);
    let item: any = {};
    item.content = content ? `${content}` : ''; // force trim
    const header: HTTP = {
        ...status,
        ...customPart,
        ...locationPart,
        ..._BASE,
        ...(getProp(config, 'ext', false) ? EXT_BASE : {}),
    };
    const result = { ...header, ...item };
    return result;
};
