// needed as workaround since Banyun does not detect Google Apps Script Environment as "node" and throws unknown runtime environment - it looks for a process.versions global object to determine it is Node so adding one thats just the number 777
process.versions.node = true;

const bunyan = require("bunyan");

const loggingConfig = require("../config/logging.json");

const logLevel = process.env.LOG_LEVEL || "info";



function MyRawStream() {}
MyRawStream.prototype.write = function (rec) {
    console.log('[%s] %s: %s',
        rec.time.toISOString(),
        bunyan.nameFromLevel[rec.level],
        rec.msg);
}


// main logger
const log = bunyan.createLogger({
  "name": "alasql-gas-engine",
    streams: [
        {
            level: 'info',
            stream: new MyRawStream(),
            type: 'raw'
        }
    ]
});

module.exports = log;
