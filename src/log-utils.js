// needed as workaround since Banyun does not detect Google Apps Script Environment as "node" and throws unknown runtime environment - it looks for a process.versions global object to determine it is Node so adding one thats just the number 777
process.versions.node = true;

const bunyan = require("bunyan");

const logLevel = process.env.LOG_LEVEL || "trace";

function RawStreamConsoleToMatchDefaultBunyanFormat() {}
function RawStreamLoggerToMatchDefaultBunyanFormat() {}

/**
 * attempting to match the default format of Banyun - only reason I needed to create a custom raw stream is because of Webpack/GAS incompatibilities with trying to use streams (see Banyun docs)
 */
RawStreamConsoleToMatchDefaultBunyanFormat.prototype.write = function (rec) {
    console.log(JSON.stringify({"name":rec.name, "hostname":rec.hostname, "pid": rec.pid, level: rec.level, "msg":rec.msg, "time":rec.time, "v":rec.v}));
},

RawStreamLoggerToMatchDefaultBunyanFormat.prototype.write = function (rec) {
  if (typeof Logger === "object") {
    Logger.log(JSON.stringify({"name":rec.name, "hostname":rec.hostname, "pid": rec.pid, level: rec.level, "msg":rec.msg, "time":rec.time, "v":rec.v}));
  }
}

// main logger - output to stackdriver (GAS) and console (C9 mocha tests, etc)
const log = bunyan.createLogger({
  "name": "alasql-gas-engine",
    streams: [
        {
            level: logLevel,
            stream: new RawStreamConsoleToMatchDefaultBunyanFormat(),
            type: 'raw'
        },
        {
            level: "info",
            stream: new RawStreamLoggerToMatchDefaultBunyanFormat(),
            type: 'raw'
        }        
    ]
});


module.exports = log;




// MyRawStream.prototype.write = function (rec) {
//     console.log('[%s] %s: %s',
//         rec.time.toISOString(),
//         bunyan.nameFromLevel[rec.level],
//         rec.msg);
// }

