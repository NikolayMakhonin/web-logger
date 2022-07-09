import {CombineLogHandlers} from '../../common/log/CombineLogHandlers'
import {ILogEvent, LogLevel, TAppState} from '../../common/log/contracts'
import {EmitEventHandler} from '../../common/log/EmitEventHandler'
import {catchUnhandledErrors} from '../../common/log/intercept/catchUnhandledErrors'
import {Logger} from '../../common/log/Logger'
import {WriteToConsoleHandler} from '../../common/log/WriteToConsoleHandler'
import {SendLogHandlerBrowser} from './SendLogHandlerBrowser'
import {SendToRemoteHandler} from './SendToRemoteHandler'

type HandlersNames = 'writeToConsole' | 'sendToRemote' | 'sendLog' | 'emitEvent'

export class LoggerBrowser extends Logger<HandlersNames> {
  public init({
    appName,
    appVersion,
    logUrls,
    logFileName,
    sendToRemoteLevels = LogLevel.Any,
    writeToConsoleLevels = LogLevel.Any,
    sendLogLevels = LogLevel.Fatal | LogLevel.Error | LogLevel.Warning | LogLevel.UserError | LogLevel.UserWarning,
    emitEventLevels = LogLevel.Any,
    filter,
    appState,
    interceptEval,
  }: {
		appName: string,
		appVersion: string,
		logUrls: string[],
		logFileName: string,
		sendToRemoteLevels?: LogLevel,
		writeToConsoleLevels?: LogLevel,
		sendLogLevels?: LogLevel,
		emitEventLevels?: LogLevel,
		filter?: (logEvent: ILogEvent<HandlersNames>) => boolean,
		appState?: TAppState,
		/** Use this only with strict mode */
		interceptEval?: false,
	}) {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const {unsubscribeUnhandledErrors} = window
      if (unsubscribeUnhandledErrors) {
        // @ts-ignore
        window.unsubscribeUnhandledErrors = null
        unsubscribeUnhandledErrors()
      }
    }

    catchUnhandledErrors((...args) => {
      this.error(...args)
    })

    super._init({
      appName,
      appVersion,
      handlers: [
        new WriteToConsoleHandler(this, writeToConsoleLevels),
        logUrls && logUrls.length && new CombineLogHandlers(this,
          ...logUrls.map(logUrl => new SendLogHandlerBrowser(this, sendLogLevels, logUrl))),
        new EmitEventHandler(this, emitEventLevels),
        new SendToRemoteHandler(this, sendToRemoteLevels, logFileName),
      ],
      filter,
      appState,
    })
  }
}

export const logger = new LoggerBrowser()
