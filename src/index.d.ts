/**
 * 🧩 types for HTTP
 * @module backend/_shared/HTTP
 * @version 2.0.1
 * @date 2026-09-23
 * @lastModified 2026-10-15
 * @license MIT
 * @author Robert Willemelis <github.com/willi84>
 */

export type MOCKED_URL = { [key: string]: string };
export type MOCKED_RESPONSE = { [key: string]: string };

export type HTTP_OPTS = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    timeout?: number; // in seconds as string
    ua?: string; // user agent string
    acceptHeader?: string; // additional curl type options
    type?: 'json' | 'html' | 'text' | 'xml';
    forwarding?: boolean; // whether to follow redirects
    token?: string; // auth token
    isDev?: boolean; // development mode
    showLog?: boolean; // whether to show logs or not
    noLastLocation?: boolean; // whether to ignore the last location in headers
    isMock?: boolean; // whether to use some mock data
    data?: any;
};

export type HTTP = {
    protocol: string;
    protocolVersion: string;
    status: string;
    statusMessage: string;
    server: string;
    date: string;
    contentType: string;
    location?: URI; // next location
    lastLocation?: URI; // the last location in headers
    // Define other common properties here
    [key: string]: string;
};
export type CurlItem = {
    header: HTTP;
    // header: HTTPStatusBase | {}; // TODO: delete
    content: string;
    status: string;
    success: boolean;
    time?: number; // Optional, for performance measurement
};

export type HTTPStatusBase = {
    protocol: string;
    protocolVersion: string;
    status: string;
    statusMessage: string;
    server: string;
    date: string;
    contentType: string;
    // Define other common properties here
    [key: string]: string;
};

// export type HTTP_OBJECTS = {
//     [key: string]: HTTP_BASE;
// };
export type OPTS = {
    [key: string]: any;
};
// test for object but not includes array // TODO: unsused
export type PlainObject<T = unknown> = Record<string, T> & {
    [n: number]: never;
};

// mock responses
type HTTPResponse = `HTTP${string}`;

export type RAW = HTTPResponse | `\n${HTTPResponse}` | `\r\n${HTTPResponse}`;
export type PARAM = StringLike<`${string}`>;
