import { ILogEventParams } from '../../common/log/contracts';
export interface IRemoteLogger {
    setFileName(value: string): any;
    send(...logEvents: Array<ILogEventParams<any>>): any;
}
