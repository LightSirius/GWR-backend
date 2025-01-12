"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var http = __importStar(require("http"));
var elasticsearch_1 = require("@elastic/elasticsearch");
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var esClient = new elasticsearch_1.Client({
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
var updateQueue = new Array();
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function pushQueue(updateRequest) {
    updateQueue.push(updateRequest);
}
function shiftQueue() {
    return updateQueue.shift();
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var server;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    server = http.createServer();
                    server.on('request', function (req, res) {
                        var data = [];
                        req.on('readable', function () {
                            var stream = req.read();
                            if (stream) {
                                data += stream;
                            }
                        });
                        req.on('end', function () {
                            var updateReq = JSON.parse(data.toString());
                            pushQueue(updateReq);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.write(JSON.stringify({
                                status: 0,
                            }));
                            res.end();
                        });
                    });
                    server.listen(3100, '127.0.0.1');
                    console.log('ElasticSearch Agent Service up.. (127.0.0.1:3100)');
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 6];
                    _a.label = 2;
                case 2:
                    if (!updateQueue.length) return [3 /*break*/, 4];
                    // console.log('Queue : ', updateQueue.length);
                    return [4 /*yield*/, esClient.update(shiftQueue())];
                case 3:
                    // console.log('Queue : ', updateQueue.length);
                    _a.sent();
                    return [3 /*break*/, 2];
                case 4: return [4 /*yield*/, delay(500)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
main().catch(function (err) {
    console.log('ERROR: ', err);
});
