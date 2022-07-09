import {ILogEventParams, ILogHandlersModes, LogLevel} from '../../common/log/contracts'

export interface IRemoteLogger {
  setFileName(value: string)

  send(...logEvents: Array<ILogEventParams<any>>)
}
