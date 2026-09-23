export type FORWARD_MOCKS = {
    [key: string]: string;
};
export type ORDERS = {
    [key: string]: string[];
};
export type URL_ITEMS = {
    forwards: FORWARD_MOCKS;
    orders: {
        [key: string]: string[];
    };
    fallback?: string;
};
