import {
  ActionMode, ILogEvent,
  ILogEventParams,
  ILogger, ILogHandler, ILogHandlers,
  ISubscriber,
  IUnsubscribe,
  LogLevel, TAppState,
} from './contracts'
import {LogEvent, TLogMessage} from './LogEvent'
import {catchEvalErrors} from './intercept/interceptEval'

// region Logger

export class Logger<HandlersNames extends string|number> implements ILogger<HandlersNames> {
  handlers: ILogHandlers<HandlersNames>
  minTimeBetweenEqualEvents: number = 120000
  filter: (logEvent: ILogEvent<HandlersNames>) => boolean
  private readonly _logEventsTime: {
    [key: string]: number,
  } = {}

  // region init

  appName: string
  appVersion: string
  appState: TAppState
  private _initialized: boolean

  protected _init({
    appName,
    appVersion,
    handlers,
    filter,
    appState,
    interceptEval: _interceptEval,
  }: {
    appName: string,
    appVersion: string,
    handlers: Array<ILogHandler<HandlersNames>>,
    filter?: (logEvent: ILogEvent<HandlersNames>) => boolean,
    appState?: TAppState,
    /** Use this only with strict mode */
    interceptEval?: false,
  }) {
    if (this._initialized) {
      this.error('Logger already initialized')
      return
    }
    this._initialized = true

    this.appName = appName
    this.appVersion = appVersion

    const handlersObject: ILogHandlers<HandlersNames> = {} as any
    for (let i = 0, len = handlers.length; i < len; i++) {
      const handler = handlers[i]
      if (handler) {
        handlersObject[handler.name] = handler
        handler.init()
      }
    }
    this.handlers = handlersObject

    this.filter = filter
    this.appState = appState

    if (_interceptEval) {
      catchEvalErrors((...args: any[]) => {
        this.error(...args)
      })
    }

    const logEvent: ILogEventParams<HandlersNames> = {
      level           : LogLevel.Info,
      messagesOrErrors: `Start App: ${appName} v${appVersion}`,
      handlersModes   : {
        _all: ActionMode.Always,
      } as any,
    }

    this.log(logEvent)
  }

  // endregion

  // region log interface

  debug(...messagesOrErrors: TLogMessage[]) {
    this.log({
      level: LogLevel.Debug,
      messagesOrErrors,
    })
  }

  info(...messagesOrErrors: TLogMessage[]) {
    this.log({
      level: LogLevel.Info,
      messagesOrErrors,
    })
  }

  action(...messagesOrErrors: TLogMessage[]) {
    this.log({
      level: LogLevel.Action,
      messagesOrErrors,
    })
  }

  warn(...messagesOrErrors: TLogMessage[]) {
    this.log({
      level: LogLevel.Warning,
      messagesOrErrors,
    })
  }

  error(...messagesOrErrors: TLogMessage[]) {
    this.log({
      level: LogLevel.Error,
      messagesOrErrors,
    })
  }

  log(level: LogLevel, ...messagesOrErrors: TLogMessage[])
  log(logEvent: ILogEventParams<HandlersNames>)
  log(logEventOrLevel: ILogEventParams<HandlersNames> | LogLevel, ...messagesOrErrors: TLogMessage[]) {
    if (logEventOrLevel != null && typeof logEventOrLevel === 'object') {
      this._log(logEventOrLevel instanceof LogEvent
        ? logEventOrLevel
        : this.createLogEvent(logEventOrLevel))
    }
    else {
      this._log(this.createLogEvent({
        level: logEventOrLevel as LogLevel,
        messagesOrErrors,
      }))
    }
  }

  // endregion

  // region log handlers

  private createLogEvent(params: ILogEventParams<HandlersNames>): ILogEvent<HandlersNames> {
    (params as any).appState = {
      appName   : this.appName,
      appVersion: this.appVersion,
      ...this.appState,
    }
    return new LogEvent(params)
  }

  private _log(logEvent: ILogEvent<HandlersNames>) {
    const {filter} = this
    if (filter && !filter(logEvent)) {
      return
    }

    const {_logEventsTime} = this
    const time = _logEventsTime[logEvent.bodyString]
    if (time != null && time + this.minTimeBetweenEqualEvents > logEvent.time.getTime()) {
      return
    }
    _logEventsTime[logEvent.bodyString] = logEvent.time.getTime()

    const {handlers} = this
    for (const key in handlers) {
      if (Object.prototype.hasOwnProperty.call(handlers, key)) {
        const handler = handlers[key]
        if (handler) {
          handler.enqueueLog(logEvent)
        }
      }
    }
  }

  // endregion

  // region log event

  private readonly _subscribers: Array<ISubscriber<HandlersNames>> = []
  subscribe(subscriber: ISubscriber<HandlersNames>): IUnsubscribe {
    this._subscribers.push(subscriber)
    return () => {
      const index = this._subscribers.indexOf(subscriber)
      if (index >= 0) {
        this._subscribers.splice(index, 1)
      }
    }
  }

  async onLog(logEvent: ILogEvent<HandlersNames>): Promise<void> {
    if (this._subscribers.length) {
      for (let i = 0; i < this._subscribers.length; i++) {
        const subscriber = this._subscribers[i]
        try {
          await subscriber(logEvent)
        }
        catch (error) {
          this._subscribers.splice(i, 1)
          this.log(new LogEvent({
            level           : LogLevel.Error,
            messagesOrErrors: [`onLog() error in ${subscriber}`, error],
          }))
        }
      }
    }
  }

  // endregion
}

// endregion
