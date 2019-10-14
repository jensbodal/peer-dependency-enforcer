"use strict";
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
        while (_) try {
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var parser_1 = require("@babel/parser");
var types_1 = require("@babel/types");
var fs_1 = require("fs");
var util_1 = require("util");
var utils_1 = require("@/utils");
var readFileAsync = util_1.promisify(fs_1.readFile);
var moduleBlockRegex = /((?:import.+?from\s+)(".*?")[;\)]?)/;
var getRequiredModules = function (expression) {
    var e_1, _a;
    var args = expression.arguments;
    var imports = [];
    if (args.length > 1) {
        utils_1.logger.debug('Require statement found with multiple arguments');
        utils_1.logger.verbose(args.map(function (arg) { return arg.value; }));
        return [];
    }
    try {
        for (var args_1 = __values(args), args_1_1 = args_1.next(); !args_1_1.done; args_1_1 = args_1.next()) {
            var arg = args_1_1.value;
            if (types_1.isLiteral(arg) && !types_1.isNullLiteral(arg) && !types_1.isRegExpLiteral(arg) && !types_1.isTemplateLiteral(arg)) {
                if (typeof arg.value === 'string') {
                    imports.push(arg.value);
                }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (args_1_1 && !args_1_1.done && (_a = args_1.return)) _a.call(args_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return imports;
};
var parseModulesBabel = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var blob, fileContents, fileAST, body, modulez;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, readFileAsync(filePath)];
            case 1:
                blob = _a.sent();
                fileContents = blob.toString();
                try {
                    fileAST = parser_1.parse(fileContents, {
                        allowImportExportEverywhere: true,
                        plugins: ['importMeta', 'estree', 'dynamicImport', 'jsx', 'typescript'],
                    });
                    body = fileAST.program.body;
                    modulez = body.reduce(function (acc, statement) {
                        if (types_1.isImportDeclaration(statement)) {
                            acc.push(statement.source.value);
                        }
                        else if (types_1.isExpressionStatement(statement) && types_1.isCallExpression(statement.expression)) {
                            acc.push.apply(acc, __spread(getRequiredModules(statement.expression)));
                        }
                        return acc;
                    }, []);
                    return [2, modulez];
                }
                catch (e) {
                    return [2, []];
                }
                return [2];
        }
    });
}); };
var parseModules = function (filePath, ignorePrefix) {
    if (ignorePrefix === void 0) { ignorePrefix = []; }
    return __awaiter(void 0, void 0, void 0, function () {
        var blob, fileContents, fileContentsOneLine, modules, fileContentsRemainder, _loop_1, state_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    utils_1.logger.debug(filePath);
                    if (process.env.parseBabel) {
                        return [2, parseModulesBabel(filePath)];
                    }
                    return [4, readFileAsync(filePath)];
                case 1:
                    blob = _a.sent();
                    fileContents = blob.toString();
                    fileContentsOneLine = fileContents.replace(/\r?\n|\r/g, '').replace(/'/g, '"');
                    modules = [];
                    fileContentsRemainder = fileContentsOneLine;
                    _loop_1 = function () {
                        var matches = fileContentsRemainder.match(moduleBlockRegex);
                        if (matches && matches.length === 3) {
                            var importStatement = matches[1];
                            var moduleName_1 = matches[2];
                            fileContentsRemainder = fileContentsRemainder.replace(importStatement, '');
                            if (!ignorePrefix.some(function (prefix) { return moduleName_1.startsWith("\"" + prefix); })) {
                                modules.push(moduleName_1.replace(/"/g, ''));
                            }
                        }
                        else {
                            return "break";
                        }
                    };
                    while (true) {
                        state_1 = _loop_1();
                        if (state_1 === "break")
                            break;
                    }
                    return [2, modules];
            }
        });
    });
};
exports.parseModules = parseModules;
