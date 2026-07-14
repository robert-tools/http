export type STATUS_CODES = {
    [key: number]: { text: string; domains: string[] };
};
type HttpStatusString = `${number} ${string}`;

export type PROTOCOL_STATUS = {
    status: NumericString;
    statusMessage: string;
    protocol: string;
    protocolVersion: string;
};
export type MOCKED_RESPONSES_TYPE = {
    [key: string]: { [key: string]: string };
};
export type FORWARD_ELEMENTS = {
    [key: string]: { status: number; order: string[] };
};
export type NEXT_URL = {
    url: string;
    statusCode: number;
};
