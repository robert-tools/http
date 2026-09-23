export type STATUS_CODES = {
    [key: number]: { text: string; domains: string[] };
};
type HTTP_ITEMS = {
    [key: string]: string | undefined;
};

export type FORWARD_ITEMS = {
    [key: string]: { status: number; order: string[]; httpItems: HTTP_ITEMS };
};
export type PROTOCOL_STATUS = {
    status: NUM;
    statusMessage: string;
    protocol: string;
    protocolVersion: string;
    lastLocation?: URI;
};
export type NEXT_URL = {
    url: string;
    statusCode: number;
    isLast: boolean;
};
export type BASE_HEADER_OPTS = {
    date?: string;
    contentLength?: string;
    etag?: string;
    lastModified?: string;
    status?: number;
    ext?: boolean;
};
export type BASE_OPTS = {
    content?: string;
    status?: string;
    success?: boolean;
    time?: number;
};
export type HEADER_SHORT = {
    status?: number; // ex ohne ?
    content?: string; // ex ohne ?
    location?: string;
};
