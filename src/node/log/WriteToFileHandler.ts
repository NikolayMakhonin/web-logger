import {ILogEvent, ILogger, LogLevel} from '../../common/log/contracts'
import {LogHandler} from '../../common/log/LogHandler'
import fsp from 'fs/promises'
import path from 'path'

async function autoCutLogFile(filePath: string, maxSize: number, cutToSize: number) {
  const stat = await fsp.stat(filePath).catch(() => null)
  if (!stat?.isFile || stat.size < maxSize) {
    return
  }

  const content = await fsp.readFile(filePath, {encoding: 'utf8'})
  if (content.length < cutToSize) {
    return
  }

  await fsp.writeFile(
    filePath,
    content.substring(content.length - cutToSize),
    {encoding: 'utf8'},
  )
}

export class WriteToFileHandler extends LogHandler<'writeToFile'> {
  logDir: string
  logFileName: string

  constructor(logger: ILogger<any>, allowLogLevels: LogLevel, logDir: string, logFileName: string) {
    super({
      name: 'writeToFile',
      logger,
      allowLogLevels,
    })
    this.logDir = logDir
    this.logFileName = logFileName
  }

  get logFilePath(): string {
    return path.resolve(this.logDir, this.logFileName)
  }

  protected async handleLog(logEvents: Array<ILogEvent<any>>) {
    const logText = logEvents.map(logEvent => `\r\n\r\n[${
      this._logger.appVersion
    }][${
      logEvent.dateString
    }][${
      this._logger.appName
    }][${
      LogLevel[logEvent.level]
    }]: ${
      logEvent.bodyString
    }`).join('')

    const {logFilePath} = this
    const dirOutput = path.dirname(logFilePath)
    await fsp.mkdir(dirOutput, {recursive: true})
    await fsp.appendFile(logFilePath, logText)
    await autoCutLogFile(logFilePath, 1000000, 500000)
  }
}
