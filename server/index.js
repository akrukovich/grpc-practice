const protoLoader = require("@grpc/proto-loader");
const grpcLibrary = require("@grpc/grpc-js");
const { join } = require("path");
const { setTimeout } = require("node:timers/promises");

const sumProto = grpcLibrary.loadPackageDefinition(
  protoLoader.loadSync(join(__dirname, "../proto/sum.proto"), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  })
).sum;

function getServer() {
  const server = new grpcLibrary.Server();
  server.addService(sumProto.SumService.service, {
    Sum(call, callback) {
      const { num_1, num_2 } = call.request;
      callback(null, { sum_result: num_1 + num_2 });
    },

    async PushEachNumber(call) {
      const { num_1, num_2 } = call.request;
      const sum = num_1 + num_2;

      for (let i = 1; i <= sum; i++) {
        await setTimeout(i * 1000);
        call.write({ num: i });
      }

      call.end();
    },

    async longSum(call, callback) {
      let sum = 0;
      call.on("data", (req) => {
        const { num_1, num_2 } = req;
        sum += num_1 + num_2;
      });

      call.on("end", () => {
        callback(null, { sum_result: sum });
      });
    },

    LongSumSeq(call) {
      call.on("data", (request) => {
        const { num_1, num_2 } = request;
        const sum_result = num_1 + num_2;
        call.write({ sum_result });
      });

      call.on("end", () => call.end());
    },
  });

  return server;
}
const routeServer = getServer();
routeServer.bindAsync(
  "localhost:8080",
  grpcLibrary.ServerCredentials.createInsecure(),
  () => {
    routeServer.start();
  }
);
