import {ISendLogMessage, SendLogHandler} from '../../common/log/SendLogHandler'
import needle from 'needle'

export class SendLogHandlerNode extends SendLogHandler {
  protected sendLog(logUrl: string, message: ISendLogMessage): Promise<{
    statusCode: number,
  }> {
    return new Promise((resolve, reject) => {
      needle.post(
        logUrl,
        message,
        {
          json      : true,
          compressed: true,
          timeout   : 20000,
          headers   : {
            'X-HASH' : message.Hash,
            'X-TOKEN': message.Token,
          },
        },
        (err, response) => {
          if (err) {
            reject(err)
            return
          }

          resolve({
            statusCode: response.statusCode,
          })
        },
      )
    })
  }
}
