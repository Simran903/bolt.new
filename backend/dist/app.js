"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const template_1 = __importDefault(require("./routes/template"));
const chat_1 = __importDefault(require("./routes/chat"));
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)({
    origin: [/^http:\/\/localhost:\d+$/],
    credentials: true,
}));
exports.app.use(express_1.default.json());
exports.app.use("/template", template_1.default);
exports.app.use("/chat", chat_1.default);
