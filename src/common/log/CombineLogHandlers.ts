import {ILogEvent, ILogger, ILogHandler, LogLevel} from './contracts'
import {LogHandler} from './LogHandler'

export class CombineLogHandlers<Name extends string | number> implements ILogHandler<Name> {
  logHandlers: Array<LogHandler<Name>>
  name: Name
  allowLogLevels: LogLevel
  disabled: boolean

  constructor(logger: ILogger<any>, ...logHandlers: Array<LogHandler<Name>>) {
    this.name = logHandlers[0].name
    this.logHandlers = logHandlers
    this.allowLogLevels = LogLevel.Any
  }

  init() {
    for (let i = 0, len = this.logHandlers.length; i < len; i++) {
      this.logHandlers[i].init()
    }
  }

  enqueueLog(logEvent: ILogEvent<Name>) {
    for (let i = 0, len = this.logHandlers.length; i < len; i++) {
      this.logHandlers[i].enqueueLog(logEvent)
    }
  }
}
