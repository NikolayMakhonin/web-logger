import {ILogEvent, ILogEventParams, ILogger, LogLevel} from '../../common/log/contracts'
import {LogHandler} from '../../common/log/LogHandler'
import {IRemoteLogger} from './IRemoteLogger'
import {globalScope} from 'src/common/log/globalScope'

export class SendToRemoteHandler extends LogHandler<'sendToRemote'> {
  constructor(logger: ILogger<any>, allowLogLevels: LogLevel, logFileName: string) {
    super({
      name: 'sendToRemote',
      logger,
      allowLogLevels,
    })
    this._logFileName = logFileName
  }

  private _logFileName: string
  get logFileName(): string {
    return this._logFileName
  }

  set logFileName(value: string) {
    this._logFileName = value
    console.log(`logFileName = ${this._logFileName}`)
    if (typeof globalScope.remoteLogger === 'object') {
      (globalScope.remoteLogger as IRemoteLogger).setFileName(value)
    }
  }

  protected async handleLog(logEvents: Array<ILogEvent<any>>) {
    const remoteLogger: IRemoteLogger = typeof globalScope.remoteLogger === 'object'
      ? globalScope.remoteLogger
      : null

    if (!remoteLogger) {
      return
    }

    const sendLogEvents: Array<ILogEventParams<any>> = logEvents

    await remoteLogger.send(...sendLogEvents)
  }
}
