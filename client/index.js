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

const client = new sumProto.SumService(
  "localhost:8080",
  grpcLibrary.credentials.createInsecure()
);

const request = {
  num_1: 1,
  num_2: 2,
};

client.Sum(request, (error, response) => {
  if (!error) {
    console.log(`Server response: ${response.sum_result}`);
  } else {
    console.error(error);
  }
});
