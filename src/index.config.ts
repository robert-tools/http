/**
 * ⚙️ config for HTTP
 * @module backend/_shared/HTTP
 * @version 2.0.1
 * @date 2026-09-23
 * @lastModified 2025-10-13
 * @license MIT
 * @author Robert Willemelis <github.com/willi84>
 */

export const STANDARD_CURL_TIMEOUT: number = 0.4;
export const BASE_HTTP_OPTS = { forwarding: false, showLog: false };
export const DEFAULT_UA = '-H "User-Agent: nodejs" ';
