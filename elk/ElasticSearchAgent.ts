import { UpdateRequest } from '@elastic/elasticsearch/lib/api/types';
import * as http from 'http';
import { Client } from '@elastic/elasticsearch';
import { config } from 'dotenv';

config();

const esClient = new Client({
  node: process.env.ELASTIC_HOST,
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  },
  tls: {
    ca: process.env.ELASTIC_TLS_CRT,
    rejectUnauthorized: false,
  },
});

const updateQueue: UpdateRequest[] = new Array<UpdateRequest>();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pushQueue(updateRequest: UpdateRequest) {
  updateQueue.push(updateRequest);
}

function shiftQueue(): UpdateRequest {
  return updateQueue.shift();
}

async function main() {
  const server = http.createServer();

  server.on('request', (req, res) => {
    let data = [];

    req.on('readable', () => {
      const stream = req.read();
      if (stream) {
        data += stream;
      }
    });

    req.on('end', () => {
      const updateReq: UpdateRequest = JSON.parse(data.toString());
      pushQueue(updateReq);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(
        JSON.stringify({
          status: 0,
        }),
      );
      res.end();
    });
  });

  server.listen(3100, '127.0.0.1');
  console.log('ElasticSearch Agent Service up.. (127.0.0.1:3100)');

  while (true) {
    while (updateQueue.length) {
      // console.log('Queue : ', updateQueue.length);
      await esClient.update(shiftQueue());
    }
    await delay(500);
    // console.log('Queue : ', updateQueue.length);
  }
}

main().catch((err) => {
  console.log('ERROR: ', err);
});
