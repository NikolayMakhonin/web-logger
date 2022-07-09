import parseUserAgent from 'ua-parser-js';
export { parseUserAgent };
export declare function parseSystemInfo(userAgentStr: string): Promise<{
    device: any;
    os: string;
}>;
