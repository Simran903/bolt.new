"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
exports.client = new sdk_1.default({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
