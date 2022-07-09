import { SendLogHandler } from '../../common/log/SendLogHandler.mjs';
import needle from 'needle';
import 'tslib';
import '../../common/log/contracts.mjs';
import '../../common/log/delay.mjs';
import '../../common/log/helpers.mjs';
import '../../common/log/spark-md5.cjs';
import '../../common/log/LogHandler.mjs';

class SendLogHandlerNode extends SendLogHandler {
    sendLog(logUrl, message) {
        return new Promise((resolve, reject) => {
            needle.post(logUrl, message, {
                json: true,
                compressed: true,
                timeout: 20000,
                headers: {
                    'X-HASH': message.Hash,
                    'X-TOKEN': message.Token,
                },
            }, (err, response) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({
                    statusCode: response.statusCode,
                });
            });
        });
    }
}

export { SendLogHandlerNode };
