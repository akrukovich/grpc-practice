const protoLoader = require("@grpc/proto-loader");
const grpcLibrary = require("@grpc/grpc-js");
const { join } = require("path");

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
