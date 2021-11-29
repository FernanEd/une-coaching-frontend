var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/@sveltejs/kit/dist/install-fetch.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
async function* toIterator(parts, clone2 = true) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else if (ArrayBuffer.isView(part)) {
      if (clone2) {
        let position = part.byteOffset;
        const end = part.byteOffset + part.byteLength;
        while (position !== end) {
          const size = Math.min(end - position, POOL_SIZE);
          const chunk = part.buffer.slice(position, position + size);
          position += chunk.byteLength;
          yield new Uint8Array(chunk);
        }
      } else {
        yield part;
      }
    } else {
      let position = 0;
      while (position !== part.size) {
        const chunk = part.slice(position, Math.min(part.size, position + POOL_SIZE));
        const buffer = await chunk.arrayBuffer();
        position += buffer.byteLength;
        yield new Uint8Array(buffer);
      }
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    length += isBlob(value) ? value.size : Buffer.byteLength(String(value));
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = import_stream.default.Readable.from(body.stream());
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const error3 = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(error3);
        throw error3;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error3) {
    const error_ = error3 instanceof FetchBaseError ? error3 : new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error3.message}`, "system", error3);
    throw error_;
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error3) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error3.message}`, "system", error3);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index, array) => {
    if (index % 2 === 0) {
      result.push(array.slice(index, index + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error3 = new AbortError("The operation was aborted.");
      reject(error3);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error3);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error3);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (error3) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${error3.message}`, "system", error3));
      finalize();
    });
    fixResponseChunkedTransferBadEnding(request_, (error3) => {
      response.body.destroy(error3);
    });
    if (process.version < "v14") {
      request_.on("socket", (s2) => {
        let endedWithEventsCount;
        s2.prependListener("end", () => {
          endedWithEventsCount = s2._eventsCount;
        });
        s2.prependListener("close", (hadError) => {
          if (response && endedWithEventsCount < s2._eventsCount && !hadError) {
            const error3 = new Error("Premature close");
            error3.code = "ERR_STREAM_PREMATURE_CLOSE";
            response.body.emit("error", error3);
          }
        });
      });
    }
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              headers.set("Location", locationURL);
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
          default:
            return reject(new TypeError(`Redirect option '${request.redirect}' is not a valid value of RequestRedirect`));
        }
      }
      if (signal) {
        response_.once("end", () => {
          signal.removeEventListener("abort", abortAndFinalize);
        });
      }
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), reject);
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), reject);
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), reject);
        raw.once("data", (chunk) => {
          body = (chunk[0] & 15) === 8 ? (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), reject) : (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), reject);
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), reject);
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
function fixResponseChunkedTransferBadEnding(request, errorCallback) {
  const LAST_CHUNK = Buffer.from("0\r\n\r\n");
  let isChunkedTransfer = false;
  let properLastChunkReceived = false;
  let previousChunk;
  request.on("response", (response) => {
    const { headers } = response;
    isChunkedTransfer = headers["transfer-encoding"] === "chunked" && !headers["content-length"];
  });
  request.on("socket", (socket) => {
    const onSocketClose = () => {
      if (isChunkedTransfer && !properLastChunkReceived) {
        const error3 = new Error("Premature close");
        error3.code = "ERR_STREAM_PREMATURE_CLOSE";
        errorCallback(error3);
      }
    };
    socket.prependListener("close", onSocketClose);
    request.on("abort", () => {
      socket.removeListener("close", onSocketClose);
    });
    socket.on("data", (buf) => {
      properLastChunkReceived = Buffer.compare(buf.slice(-5), LAST_CHUNK) === 0;
      if (!properLastChunkReceived && previousChunk) {
        properLastChunkReceived = Buffer.compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 && Buffer.compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0;
      }
      previousChunk = buf;
    });
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, commonjsGlobal, src, dataUriToBuffer$1, ponyfill_es2018, POOL_SIZE$1, POOL_SIZE, _Blob, Blob2, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ponyfill_es2018 = { exports: {} };
    (function(module2, exports) {
      (function(global2, factory) {
        factory(exports);
      })(commonjsGlobal, function(exports2) {
        const SymbolPolyfill = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol : (description) => `Symbol(${description})`;
        function noop2() {
          return void 0;
        }
        function getGlobals() {
          if (typeof self !== "undefined") {
            return self;
          } else if (typeof window !== "undefined") {
            return window;
          } else if (typeof commonjsGlobal !== "undefined") {
            return commonjsGlobal;
          }
          return void 0;
        }
        const globals = getGlobals();
        function typeIsObject(x) {
          return typeof x === "object" && x !== null || typeof x === "function";
        }
        const rethrowAssertionErrorRejection = noop2;
        const originalPromise = Promise;
        const originalPromiseThen = Promise.prototype.then;
        const originalPromiseResolve = Promise.resolve.bind(originalPromise);
        const originalPromiseReject = Promise.reject.bind(originalPromise);
        function newPromise(executor) {
          return new originalPromise(executor);
        }
        function promiseResolvedWith(value) {
          return originalPromiseResolve(value);
        }
        function promiseRejectedWith(reason) {
          return originalPromiseReject(reason);
        }
        function PerformPromiseThen(promise, onFulfilled, onRejected) {
          return originalPromiseThen.call(promise, onFulfilled, onRejected);
        }
        function uponPromise(promise, onFulfilled, onRejected) {
          PerformPromiseThen(PerformPromiseThen(promise, onFulfilled, onRejected), void 0, rethrowAssertionErrorRejection);
        }
        function uponFulfillment(promise, onFulfilled) {
          uponPromise(promise, onFulfilled);
        }
        function uponRejection(promise, onRejected) {
          uponPromise(promise, void 0, onRejected);
        }
        function transformPromiseWith(promise, fulfillmentHandler, rejectionHandler) {
          return PerformPromiseThen(promise, fulfillmentHandler, rejectionHandler);
        }
        function setPromiseIsHandledToTrue(promise) {
          PerformPromiseThen(promise, void 0, rethrowAssertionErrorRejection);
        }
        const queueMicrotask = (() => {
          const globalQueueMicrotask = globals && globals.queueMicrotask;
          if (typeof globalQueueMicrotask === "function") {
            return globalQueueMicrotask;
          }
          const resolvedPromise = promiseResolvedWith(void 0);
          return (fn) => PerformPromiseThen(resolvedPromise, fn);
        })();
        function reflectCall(F, V, args) {
          if (typeof F !== "function") {
            throw new TypeError("Argument is not a function");
          }
          return Function.prototype.apply.call(F, V, args);
        }
        function promiseCall(F, V, args) {
          try {
            return promiseResolvedWith(reflectCall(F, V, args));
          } catch (value) {
            return promiseRejectedWith(value);
          }
        }
        const QUEUE_MAX_ARRAY_SIZE = 16384;
        class SimpleQueue {
          constructor() {
            this._cursor = 0;
            this._size = 0;
            this._front = {
              _elements: [],
              _next: void 0
            };
            this._back = this._front;
            this._cursor = 0;
            this._size = 0;
          }
          get length() {
            return this._size;
          }
          push(element) {
            const oldBack = this._back;
            let newBack = oldBack;
            if (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1) {
              newBack = {
                _elements: [],
                _next: void 0
              };
            }
            oldBack._elements.push(element);
            if (newBack !== oldBack) {
              this._back = newBack;
              oldBack._next = newBack;
            }
            ++this._size;
          }
          shift() {
            const oldFront = this._front;
            let newFront = oldFront;
            const oldCursor = this._cursor;
            let newCursor = oldCursor + 1;
            const elements = oldFront._elements;
            const element = elements[oldCursor];
            if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
              newFront = oldFront._next;
              newCursor = 0;
            }
            --this._size;
            this._cursor = newCursor;
            if (oldFront !== newFront) {
              this._front = newFront;
            }
            elements[oldCursor] = void 0;
            return element;
          }
          forEach(callback) {
            let i = this._cursor;
            let node = this._front;
            let elements = node._elements;
            while (i !== elements.length || node._next !== void 0) {
              if (i === elements.length) {
                node = node._next;
                elements = node._elements;
                i = 0;
                if (elements.length === 0) {
                  break;
                }
              }
              callback(elements[i]);
              ++i;
            }
          }
          peek() {
            const front = this._front;
            const cursor = this._cursor;
            return front._elements[cursor];
          }
        }
        function ReadableStreamReaderGenericInitialize(reader, stream) {
          reader._ownerReadableStream = stream;
          stream._reader = reader;
          if (stream._state === "readable") {
            defaultReaderClosedPromiseInitialize(reader);
          } else if (stream._state === "closed") {
            defaultReaderClosedPromiseInitializeAsResolved(reader);
          } else {
            defaultReaderClosedPromiseInitializeAsRejected(reader, stream._storedError);
          }
        }
        function ReadableStreamReaderGenericCancel(reader, reason) {
          const stream = reader._ownerReadableStream;
          return ReadableStreamCancel(stream, reason);
        }
        function ReadableStreamReaderGenericRelease(reader) {
          if (reader._ownerReadableStream._state === "readable") {
            defaultReaderClosedPromiseReject(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
          } else {
            defaultReaderClosedPromiseResetToRejected(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
          }
          reader._ownerReadableStream._reader = void 0;
          reader._ownerReadableStream = void 0;
        }
        function readerLockException(name) {
          return new TypeError("Cannot " + name + " a stream using a released reader");
        }
        function defaultReaderClosedPromiseInitialize(reader) {
          reader._closedPromise = newPromise((resolve2, reject) => {
            reader._closedPromise_resolve = resolve2;
            reader._closedPromise_reject = reject;
          });
        }
        function defaultReaderClosedPromiseInitializeAsRejected(reader, reason) {
          defaultReaderClosedPromiseInitialize(reader);
          defaultReaderClosedPromiseReject(reader, reason);
        }
        function defaultReaderClosedPromiseInitializeAsResolved(reader) {
          defaultReaderClosedPromiseInitialize(reader);
          defaultReaderClosedPromiseResolve(reader);
        }
        function defaultReaderClosedPromiseReject(reader, reason) {
          if (reader._closedPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(reader._closedPromise);
          reader._closedPromise_reject(reason);
          reader._closedPromise_resolve = void 0;
          reader._closedPromise_reject = void 0;
        }
        function defaultReaderClosedPromiseResetToRejected(reader, reason) {
          defaultReaderClosedPromiseInitializeAsRejected(reader, reason);
        }
        function defaultReaderClosedPromiseResolve(reader) {
          if (reader._closedPromise_resolve === void 0) {
            return;
          }
          reader._closedPromise_resolve(void 0);
          reader._closedPromise_resolve = void 0;
          reader._closedPromise_reject = void 0;
        }
        const AbortSteps = SymbolPolyfill("[[AbortSteps]]");
        const ErrorSteps = SymbolPolyfill("[[ErrorSteps]]");
        const CancelSteps = SymbolPolyfill("[[CancelSteps]]");
        const PullSteps = SymbolPolyfill("[[PullSteps]]");
        const NumberIsFinite = Number.isFinite || function(x) {
          return typeof x === "number" && isFinite(x);
        };
        const MathTrunc = Math.trunc || function(v) {
          return v < 0 ? Math.ceil(v) : Math.floor(v);
        };
        function isDictionary(x) {
          return typeof x === "object" || typeof x === "function";
        }
        function assertDictionary(obj, context) {
          if (obj !== void 0 && !isDictionary(obj)) {
            throw new TypeError(`${context} is not an object.`);
          }
        }
        function assertFunction(x, context) {
          if (typeof x !== "function") {
            throw new TypeError(`${context} is not a function.`);
          }
        }
        function isObject(x) {
          return typeof x === "object" && x !== null || typeof x === "function";
        }
        function assertObject(x, context) {
          if (!isObject(x)) {
            throw new TypeError(`${context} is not an object.`);
          }
        }
        function assertRequiredArgument(x, position, context) {
          if (x === void 0) {
            throw new TypeError(`Parameter ${position} is required in '${context}'.`);
          }
        }
        function assertRequiredField(x, field, context) {
          if (x === void 0) {
            throw new TypeError(`${field} is required in '${context}'.`);
          }
        }
        function convertUnrestrictedDouble(value) {
          return Number(value);
        }
        function censorNegativeZero(x) {
          return x === 0 ? 0 : x;
        }
        function integerPart(x) {
          return censorNegativeZero(MathTrunc(x));
        }
        function convertUnsignedLongLongWithEnforceRange(value, context) {
          const lowerBound = 0;
          const upperBound = Number.MAX_SAFE_INTEGER;
          let x = Number(value);
          x = censorNegativeZero(x);
          if (!NumberIsFinite(x)) {
            throw new TypeError(`${context} is not a finite number`);
          }
          x = integerPart(x);
          if (x < lowerBound || x > upperBound) {
            throw new TypeError(`${context} is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`);
          }
          if (!NumberIsFinite(x) || x === 0) {
            return 0;
          }
          return x;
        }
        function assertReadableStream(x, context) {
          if (!IsReadableStream(x)) {
            throw new TypeError(`${context} is not a ReadableStream.`);
          }
        }
        function AcquireReadableStreamDefaultReader(stream) {
          return new ReadableStreamDefaultReader(stream);
        }
        function ReadableStreamAddReadRequest(stream, readRequest) {
          stream._reader._readRequests.push(readRequest);
        }
        function ReadableStreamFulfillReadRequest(stream, chunk, done) {
          const reader = stream._reader;
          const readRequest = reader._readRequests.shift();
          if (done) {
            readRequest._closeSteps();
          } else {
            readRequest._chunkSteps(chunk);
          }
        }
        function ReadableStreamGetNumReadRequests(stream) {
          return stream._reader._readRequests.length;
        }
        function ReadableStreamHasDefaultReader(stream) {
          const reader = stream._reader;
          if (reader === void 0) {
            return false;
          }
          if (!IsReadableStreamDefaultReader(reader)) {
            return false;
          }
          return true;
        }
        class ReadableStreamDefaultReader {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "ReadableStreamDefaultReader");
            assertReadableStream(stream, "First parameter");
            if (IsReadableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive reading by another reader");
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readRequests = new SimpleQueue();
          }
          get closed() {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          cancel(reason = void 0) {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("cancel"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("cancel"));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
          }
          read() {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("read"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("read from"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readRequest = {
              _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
              _closeSteps: () => resolvePromise({ value: void 0, done: true }),
              _errorSteps: (e) => rejectPromise(e)
            };
            ReadableStreamDefaultReaderRead(this, readRequest);
            return promise;
          }
          releaseLock() {
            if (!IsReadableStreamDefaultReader(this)) {
              throw defaultReaderBrandCheckException("releaseLock");
            }
            if (this._ownerReadableStream === void 0) {
              return;
            }
            if (this._readRequests.length > 0) {
              throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
            }
            ReadableStreamReaderGenericRelease(this);
          }
        }
        Object.defineProperties(ReadableStreamDefaultReader.prototype, {
          cancel: { enumerable: true },
          read: { enumerable: true },
          releaseLock: { enumerable: true },
          closed: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamDefaultReader.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamDefaultReader",
            configurable: true
          });
        }
        function IsReadableStreamDefaultReader(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readRequests")) {
            return false;
          }
          return x instanceof ReadableStreamDefaultReader;
        }
        function ReadableStreamDefaultReaderRead(reader, readRequest) {
          const stream = reader._ownerReadableStream;
          stream._disturbed = true;
          if (stream._state === "closed") {
            readRequest._closeSteps();
          } else if (stream._state === "errored") {
            readRequest._errorSteps(stream._storedError);
          } else {
            stream._readableStreamController[PullSteps](readRequest);
          }
        }
        function defaultReaderBrandCheckException(name) {
          return new TypeError(`ReadableStreamDefaultReader.prototype.${name} can only be used on a ReadableStreamDefaultReader`);
        }
        const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {
        }).prototype);
        class ReadableStreamAsyncIteratorImpl {
          constructor(reader, preventCancel) {
            this._ongoingPromise = void 0;
            this._isFinished = false;
            this._reader = reader;
            this._preventCancel = preventCancel;
          }
          next() {
            const nextSteps = () => this._nextSteps();
            this._ongoingPromise = this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, nextSteps, nextSteps) : nextSteps();
            return this._ongoingPromise;
          }
          return(value) {
            const returnSteps = () => this._returnSteps(value);
            return this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, returnSteps, returnSteps) : returnSteps();
          }
          _nextSteps() {
            if (this._isFinished) {
              return Promise.resolve({ value: void 0, done: true });
            }
            const reader = this._reader;
            if (reader._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("iterate"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readRequest = {
              _chunkSteps: (chunk) => {
                this._ongoingPromise = void 0;
                queueMicrotask(() => resolvePromise({ value: chunk, done: false }));
              },
              _closeSteps: () => {
                this._ongoingPromise = void 0;
                this._isFinished = true;
                ReadableStreamReaderGenericRelease(reader);
                resolvePromise({ value: void 0, done: true });
              },
              _errorSteps: (reason) => {
                this._ongoingPromise = void 0;
                this._isFinished = true;
                ReadableStreamReaderGenericRelease(reader);
                rejectPromise(reason);
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promise;
          }
          _returnSteps(value) {
            if (this._isFinished) {
              return Promise.resolve({ value, done: true });
            }
            this._isFinished = true;
            const reader = this._reader;
            if (reader._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("finish iterating"));
            }
            if (!this._preventCancel) {
              const result = ReadableStreamReaderGenericCancel(reader, value);
              ReadableStreamReaderGenericRelease(reader);
              return transformPromiseWith(result, () => ({ value, done: true }));
            }
            ReadableStreamReaderGenericRelease(reader);
            return promiseResolvedWith({ value, done: true });
          }
        }
        const ReadableStreamAsyncIteratorPrototype = {
          next() {
            if (!IsReadableStreamAsyncIterator(this)) {
              return promiseRejectedWith(streamAsyncIteratorBrandCheckException("next"));
            }
            return this._asyncIteratorImpl.next();
          },
          return(value) {
            if (!IsReadableStreamAsyncIterator(this)) {
              return promiseRejectedWith(streamAsyncIteratorBrandCheckException("return"));
            }
            return this._asyncIteratorImpl.return(value);
          }
        };
        if (AsyncIteratorPrototype !== void 0) {
          Object.setPrototypeOf(ReadableStreamAsyncIteratorPrototype, AsyncIteratorPrototype);
        }
        function AcquireReadableStreamAsyncIterator(stream, preventCancel) {
          const reader = AcquireReadableStreamDefaultReader(stream);
          const impl = new ReadableStreamAsyncIteratorImpl(reader, preventCancel);
          const iterator = Object.create(ReadableStreamAsyncIteratorPrototype);
          iterator._asyncIteratorImpl = impl;
          return iterator;
        }
        function IsReadableStreamAsyncIterator(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_asyncIteratorImpl")) {
            return false;
          }
          try {
            return x._asyncIteratorImpl instanceof ReadableStreamAsyncIteratorImpl;
          } catch (_a) {
            return false;
          }
        }
        function streamAsyncIteratorBrandCheckException(name) {
          return new TypeError(`ReadableStreamAsyncIterator.${name} can only be used on a ReadableSteamAsyncIterator`);
        }
        const NumberIsNaN = Number.isNaN || function(x) {
          return x !== x;
        };
        function CreateArrayFromList(elements) {
          return elements.slice();
        }
        function CopyDataBlockBytes(dest, destOffset, src2, srcOffset, n) {
          new Uint8Array(dest).set(new Uint8Array(src2, srcOffset, n), destOffset);
        }
        function TransferArrayBuffer(O) {
          return O;
        }
        function IsDetachedBuffer(O) {
          return false;
        }
        function ArrayBufferSlice(buffer, begin, end) {
          if (buffer.slice) {
            return buffer.slice(begin, end);
          }
          const length = end - begin;
          const slice = new ArrayBuffer(length);
          CopyDataBlockBytes(slice, 0, buffer, begin, length);
          return slice;
        }
        function IsNonNegativeNumber(v) {
          if (typeof v !== "number") {
            return false;
          }
          if (NumberIsNaN(v)) {
            return false;
          }
          if (v < 0) {
            return false;
          }
          return true;
        }
        function CloneAsUint8Array(O) {
          const buffer = ArrayBufferSlice(O.buffer, O.byteOffset, O.byteOffset + O.byteLength);
          return new Uint8Array(buffer);
        }
        function DequeueValue(container) {
          const pair = container._queue.shift();
          container._queueTotalSize -= pair.size;
          if (container._queueTotalSize < 0) {
            container._queueTotalSize = 0;
          }
          return pair.value;
        }
        function EnqueueValueWithSize(container, value, size) {
          if (!IsNonNegativeNumber(size) || size === Infinity) {
            throw new RangeError("Size must be a finite, non-NaN, non-negative number.");
          }
          container._queue.push({ value, size });
          container._queueTotalSize += size;
        }
        function PeekQueueValue(container) {
          const pair = container._queue.peek();
          return pair.value;
        }
        function ResetQueue(container) {
          container._queue = new SimpleQueue();
          container._queueTotalSize = 0;
        }
        class ReadableStreamBYOBRequest {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get view() {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("view");
            }
            return this._view;
          }
          respond(bytesWritten) {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("respond");
            }
            assertRequiredArgument(bytesWritten, 1, "respond");
            bytesWritten = convertUnsignedLongLongWithEnforceRange(bytesWritten, "First parameter");
            if (this._associatedReadableByteStreamController === void 0) {
              throw new TypeError("This BYOB request has been invalidated");
            }
            if (IsDetachedBuffer(this._view.buffer))
              ;
            ReadableByteStreamControllerRespond(this._associatedReadableByteStreamController, bytesWritten);
          }
          respondWithNewView(view) {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("respondWithNewView");
            }
            assertRequiredArgument(view, 1, "respondWithNewView");
            if (!ArrayBuffer.isView(view)) {
              throw new TypeError("You can only respond with array buffer views");
            }
            if (this._associatedReadableByteStreamController === void 0) {
              throw new TypeError("This BYOB request has been invalidated");
            }
            if (IsDetachedBuffer(view.buffer))
              ;
            ReadableByteStreamControllerRespondWithNewView(this._associatedReadableByteStreamController, view);
          }
        }
        Object.defineProperties(ReadableStreamBYOBRequest.prototype, {
          respond: { enumerable: true },
          respondWithNewView: { enumerable: true },
          view: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamBYOBRequest.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamBYOBRequest",
            configurable: true
          });
        }
        class ReadableByteStreamController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get byobRequest() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("byobRequest");
            }
            return ReadableByteStreamControllerGetBYOBRequest(this);
          }
          get desiredSize() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("desiredSize");
            }
            return ReadableByteStreamControllerGetDesiredSize(this);
          }
          close() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("close");
            }
            if (this._closeRequested) {
              throw new TypeError("The stream has already been closed; do not close it again!");
            }
            const state = this._controlledReadableByteStream._state;
            if (state !== "readable") {
              throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be closed`);
            }
            ReadableByteStreamControllerClose(this);
          }
          enqueue(chunk) {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("enqueue");
            }
            assertRequiredArgument(chunk, 1, "enqueue");
            if (!ArrayBuffer.isView(chunk)) {
              throw new TypeError("chunk must be an array buffer view");
            }
            if (chunk.byteLength === 0) {
              throw new TypeError("chunk must have non-zero byteLength");
            }
            if (chunk.buffer.byteLength === 0) {
              throw new TypeError(`chunk's buffer must have non-zero byteLength`);
            }
            if (this._closeRequested) {
              throw new TypeError("stream is closed or draining");
            }
            const state = this._controlledReadableByteStream._state;
            if (state !== "readable") {
              throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be enqueued to`);
            }
            ReadableByteStreamControllerEnqueue(this, chunk);
          }
          error(e = void 0) {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("error");
            }
            ReadableByteStreamControllerError(this, e);
          }
          [CancelSteps](reason) {
            ReadableByteStreamControllerClearPendingPullIntos(this);
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableByteStreamControllerClearAlgorithms(this);
            return result;
          }
          [PullSteps](readRequest) {
            const stream = this._controlledReadableByteStream;
            if (this._queueTotalSize > 0) {
              const entry = this._queue.shift();
              this._queueTotalSize -= entry.byteLength;
              ReadableByteStreamControllerHandleQueueDrain(this);
              const view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);
              readRequest._chunkSteps(view);
              return;
            }
            const autoAllocateChunkSize = this._autoAllocateChunkSize;
            if (autoAllocateChunkSize !== void 0) {
              let buffer;
              try {
                buffer = new ArrayBuffer(autoAllocateChunkSize);
              } catch (bufferE) {
                readRequest._errorSteps(bufferE);
                return;
              }
              const pullIntoDescriptor = {
                buffer,
                bufferByteLength: autoAllocateChunkSize,
                byteOffset: 0,
                byteLength: autoAllocateChunkSize,
                bytesFilled: 0,
                elementSize: 1,
                viewConstructor: Uint8Array,
                readerType: "default"
              };
              this._pendingPullIntos.push(pullIntoDescriptor);
            }
            ReadableStreamAddReadRequest(stream, readRequest);
            ReadableByteStreamControllerCallPullIfNeeded(this);
          }
        }
        Object.defineProperties(ReadableByteStreamController.prototype, {
          close: { enumerable: true },
          enqueue: { enumerable: true },
          error: { enumerable: true },
          byobRequest: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableByteStreamController.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableByteStreamController",
            configurable: true
          });
        }
        function IsReadableByteStreamController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableByteStream")) {
            return false;
          }
          return x instanceof ReadableByteStreamController;
        }
        function IsReadableStreamBYOBRequest(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_associatedReadableByteStreamController")) {
            return false;
          }
          return x instanceof ReadableStreamBYOBRequest;
        }
        function ReadableByteStreamControllerCallPullIfNeeded(controller) {
          const shouldPull = ReadableByteStreamControllerShouldCallPull(controller);
          if (!shouldPull) {
            return;
          }
          if (controller._pulling) {
            controller._pullAgain = true;
            return;
          }
          controller._pulling = true;
          const pullPromise = controller._pullAlgorithm();
          uponPromise(pullPromise, () => {
            controller._pulling = false;
            if (controller._pullAgain) {
              controller._pullAgain = false;
              ReadableByteStreamControllerCallPullIfNeeded(controller);
            }
          }, (e) => {
            ReadableByteStreamControllerError(controller, e);
          });
        }
        function ReadableByteStreamControllerClearPendingPullIntos(controller) {
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          controller._pendingPullIntos = new SimpleQueue();
        }
        function ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
          let done = false;
          if (stream._state === "closed") {
            done = true;
          }
          const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
          if (pullIntoDescriptor.readerType === "default") {
            ReadableStreamFulfillReadRequest(stream, filledView, done);
          } else {
            ReadableStreamFulfillReadIntoRequest(stream, filledView, done);
          }
        }
        function ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
          const bytesFilled = pullIntoDescriptor.bytesFilled;
          const elementSize = pullIntoDescriptor.elementSize;
          return new pullIntoDescriptor.viewConstructor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, bytesFilled / elementSize);
        }
        function ReadableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
          controller._queue.push({ buffer, byteOffset, byteLength });
          controller._queueTotalSize += byteLength;
        }
        function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
          const elementSize = pullIntoDescriptor.elementSize;
          const currentAlignedBytes = pullIntoDescriptor.bytesFilled - pullIntoDescriptor.bytesFilled % elementSize;
          const maxBytesToCopy = Math.min(controller._queueTotalSize, pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled);
          const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;
          const maxAlignedBytes = maxBytesFilled - maxBytesFilled % elementSize;
          let totalBytesToCopyRemaining = maxBytesToCopy;
          let ready = false;
          if (maxAlignedBytes > currentAlignedBytes) {
            totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;
            ready = true;
          }
          const queue = controller._queue;
          while (totalBytesToCopyRemaining > 0) {
            const headOfQueue = queue.peek();
            const bytesToCopy = Math.min(totalBytesToCopyRemaining, headOfQueue.byteLength);
            const destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            CopyDataBlockBytes(pullIntoDescriptor.buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);
            if (headOfQueue.byteLength === bytesToCopy) {
              queue.shift();
            } else {
              headOfQueue.byteOffset += bytesToCopy;
              headOfQueue.byteLength -= bytesToCopy;
            }
            controller._queueTotalSize -= bytesToCopy;
            ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);
            totalBytesToCopyRemaining -= bytesToCopy;
          }
          return ready;
        }
        function ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, pullIntoDescriptor) {
          pullIntoDescriptor.bytesFilled += size;
        }
        function ReadableByteStreamControllerHandleQueueDrain(controller) {
          if (controller._queueTotalSize === 0 && controller._closeRequested) {
            ReadableByteStreamControllerClearAlgorithms(controller);
            ReadableStreamClose(controller._controlledReadableByteStream);
          } else {
            ReadableByteStreamControllerCallPullIfNeeded(controller);
          }
        }
        function ReadableByteStreamControllerInvalidateBYOBRequest(controller) {
          if (controller._byobRequest === null) {
            return;
          }
          controller._byobRequest._associatedReadableByteStreamController = void 0;
          controller._byobRequest._view = null;
          controller._byobRequest = null;
        }
        function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
          while (controller._pendingPullIntos.length > 0) {
            if (controller._queueTotalSize === 0) {
              return;
            }
            const pullIntoDescriptor = controller._pendingPullIntos.peek();
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
              ReadableByteStreamControllerShiftPendingPullInto(controller);
              ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
            }
          }
        }
        function ReadableByteStreamControllerPullInto(controller, view, readIntoRequest) {
          const stream = controller._controlledReadableByteStream;
          let elementSize = 1;
          if (view.constructor !== DataView) {
            elementSize = view.constructor.BYTES_PER_ELEMENT;
          }
          const ctor = view.constructor;
          const buffer = TransferArrayBuffer(view.buffer);
          const pullIntoDescriptor = {
            buffer,
            bufferByteLength: buffer.byteLength,
            byteOffset: view.byteOffset,
            byteLength: view.byteLength,
            bytesFilled: 0,
            elementSize,
            viewConstructor: ctor,
            readerType: "byob"
          };
          if (controller._pendingPullIntos.length > 0) {
            controller._pendingPullIntos.push(pullIntoDescriptor);
            ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
            return;
          }
          if (stream._state === "closed") {
            const emptyView = new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);
            readIntoRequest._closeSteps(emptyView);
            return;
          }
          if (controller._queueTotalSize > 0) {
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
              const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
              ReadableByteStreamControllerHandleQueueDrain(controller);
              readIntoRequest._chunkSteps(filledView);
              return;
            }
            if (controller._closeRequested) {
              const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
              ReadableByteStreamControllerError(controller, e);
              readIntoRequest._errorSteps(e);
              return;
            }
          }
          controller._pendingPullIntos.push(pullIntoDescriptor);
          ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor) {
          const stream = controller._controlledReadableByteStream;
          if (ReadableStreamHasBYOBReader(stream)) {
            while (ReadableStreamGetNumReadIntoRequests(stream) > 0) {
              const pullIntoDescriptor = ReadableByteStreamControllerShiftPendingPullInto(controller);
              ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
            }
          }
        }
        function ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, pullIntoDescriptor) {
          ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);
          if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize) {
            return;
          }
          ReadableByteStreamControllerShiftPendingPullInto(controller);
          const remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
          if (remainderSize > 0) {
            const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            const remainder = ArrayBufferSlice(pullIntoDescriptor.buffer, end - remainderSize, end);
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, remainder.byteLength);
          }
          pullIntoDescriptor.bytesFilled -= remainderSize;
          ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
          ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
        }
        function ReadableByteStreamControllerRespondInternal(controller, bytesWritten) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            ReadableByteStreamControllerRespondInClosedState(controller);
          } else {
            ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, firstDescriptor);
          }
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerShiftPendingPullInto(controller) {
          const descriptor = controller._pendingPullIntos.shift();
          return descriptor;
        }
        function ReadableByteStreamControllerShouldCallPull(controller) {
          const stream = controller._controlledReadableByteStream;
          if (stream._state !== "readable") {
            return false;
          }
          if (controller._closeRequested) {
            return false;
          }
          if (!controller._started) {
            return false;
          }
          if (ReadableStreamHasDefaultReader(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            return true;
          }
          if (ReadableStreamHasBYOBReader(stream) && ReadableStreamGetNumReadIntoRequests(stream) > 0) {
            return true;
          }
          const desiredSize = ReadableByteStreamControllerGetDesiredSize(controller);
          if (desiredSize > 0) {
            return true;
          }
          return false;
        }
        function ReadableByteStreamControllerClearAlgorithms(controller) {
          controller._pullAlgorithm = void 0;
          controller._cancelAlgorithm = void 0;
        }
        function ReadableByteStreamControllerClose(controller) {
          const stream = controller._controlledReadableByteStream;
          if (controller._closeRequested || stream._state !== "readable") {
            return;
          }
          if (controller._queueTotalSize > 0) {
            controller._closeRequested = true;
            return;
          }
          if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (firstPendingPullInto.bytesFilled > 0) {
              const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
              ReadableByteStreamControllerError(controller, e);
              throw e;
            }
          }
          ReadableByteStreamControllerClearAlgorithms(controller);
          ReadableStreamClose(stream);
        }
        function ReadableByteStreamControllerEnqueue(controller, chunk) {
          const stream = controller._controlledReadableByteStream;
          if (controller._closeRequested || stream._state !== "readable") {
            return;
          }
          const buffer = chunk.buffer;
          const byteOffset = chunk.byteOffset;
          const byteLength = chunk.byteLength;
          const transferredBuffer = TransferArrayBuffer(buffer);
          if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (IsDetachedBuffer(firstPendingPullInto.buffer))
              ;
            firstPendingPullInto.buffer = TransferArrayBuffer(firstPendingPullInto.buffer);
          }
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          if (ReadableStreamHasDefaultReader(stream)) {
            if (ReadableStreamGetNumReadRequests(stream) === 0) {
              ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            } else {
              const transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);
              ReadableStreamFulfillReadRequest(stream, transferredView, false);
            }
          } else if (ReadableStreamHasBYOBReader(stream)) {
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
          } else {
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
          }
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerError(controller, e) {
          const stream = controller._controlledReadableByteStream;
          if (stream._state !== "readable") {
            return;
          }
          ReadableByteStreamControllerClearPendingPullIntos(controller);
          ResetQueue(controller);
          ReadableByteStreamControllerClearAlgorithms(controller);
          ReadableStreamError(stream, e);
        }
        function ReadableByteStreamControllerGetBYOBRequest(controller) {
          if (controller._byobRequest === null && controller._pendingPullIntos.length > 0) {
            const firstDescriptor = controller._pendingPullIntos.peek();
            const view = new Uint8Array(firstDescriptor.buffer, firstDescriptor.byteOffset + firstDescriptor.bytesFilled, firstDescriptor.byteLength - firstDescriptor.bytesFilled);
            const byobRequest = Object.create(ReadableStreamBYOBRequest.prototype);
            SetUpReadableStreamBYOBRequest(byobRequest, controller, view);
            controller._byobRequest = byobRequest;
          }
          return controller._byobRequest;
        }
        function ReadableByteStreamControllerGetDesiredSize(controller) {
          const state = controller._controlledReadableByteStream._state;
          if (state === "errored") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function ReadableByteStreamControllerRespond(controller, bytesWritten) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            if (bytesWritten !== 0) {
              throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream");
            }
          } else {
            if (bytesWritten === 0) {
              throw new TypeError("bytesWritten must be greater than 0 when calling respond() on a readable stream");
            }
            if (firstDescriptor.bytesFilled + bytesWritten > firstDescriptor.byteLength) {
              throw new RangeError("bytesWritten out of range");
            }
          }
          firstDescriptor.buffer = TransferArrayBuffer(firstDescriptor.buffer);
          ReadableByteStreamControllerRespondInternal(controller, bytesWritten);
        }
        function ReadableByteStreamControllerRespondWithNewView(controller, view) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            if (view.byteLength !== 0) {
              throw new TypeError("The view's length must be 0 when calling respondWithNewView() on a closed stream");
            }
          } else {
            if (view.byteLength === 0) {
              throw new TypeError("The view's length must be greater than 0 when calling respondWithNewView() on a readable stream");
            }
          }
          if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== view.byteOffset) {
            throw new RangeError("The region specified by view does not match byobRequest");
          }
          if (firstDescriptor.bufferByteLength !== view.buffer.byteLength) {
            throw new RangeError("The buffer of view has different capacity than byobRequest");
          }
          if (firstDescriptor.bytesFilled + view.byteLength > firstDescriptor.byteLength) {
            throw new RangeError("The region specified by view is larger than byobRequest");
          }
          firstDescriptor.buffer = TransferArrayBuffer(view.buffer);
          ReadableByteStreamControllerRespondInternal(controller, view.byteLength);
        }
        function SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize) {
          controller._controlledReadableByteStream = stream;
          controller._pullAgain = false;
          controller._pulling = false;
          controller._byobRequest = null;
          controller._queue = controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._closeRequested = false;
          controller._started = false;
          controller._strategyHWM = highWaterMark;
          controller._pullAlgorithm = pullAlgorithm;
          controller._cancelAlgorithm = cancelAlgorithm;
          controller._autoAllocateChunkSize = autoAllocateChunkSize;
          controller._pendingPullIntos = new SimpleQueue();
          stream._readableStreamController = controller;
          const startResult = startAlgorithm();
          uponPromise(promiseResolvedWith(startResult), () => {
            controller._started = true;
            ReadableByteStreamControllerCallPullIfNeeded(controller);
          }, (r) => {
            ReadableByteStreamControllerError(controller, r);
          });
        }
        function SetUpReadableByteStreamControllerFromUnderlyingSource(stream, underlyingByteSource, highWaterMark) {
          const controller = Object.create(ReadableByteStreamController.prototype);
          let startAlgorithm = () => void 0;
          let pullAlgorithm = () => promiseResolvedWith(void 0);
          let cancelAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingByteSource.start !== void 0) {
            startAlgorithm = () => underlyingByteSource.start(controller);
          }
          if (underlyingByteSource.pull !== void 0) {
            pullAlgorithm = () => underlyingByteSource.pull(controller);
          }
          if (underlyingByteSource.cancel !== void 0) {
            cancelAlgorithm = (reason) => underlyingByteSource.cancel(reason);
          }
          const autoAllocateChunkSize = underlyingByteSource.autoAllocateChunkSize;
          if (autoAllocateChunkSize === 0) {
            throw new TypeError("autoAllocateChunkSize must be greater than 0");
          }
          SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize);
        }
        function SetUpReadableStreamBYOBRequest(request, controller, view) {
          request._associatedReadableByteStreamController = controller;
          request._view = view;
        }
        function byobRequestBrandCheckException(name) {
          return new TypeError(`ReadableStreamBYOBRequest.prototype.${name} can only be used on a ReadableStreamBYOBRequest`);
        }
        function byteStreamControllerBrandCheckException(name) {
          return new TypeError(`ReadableByteStreamController.prototype.${name} can only be used on a ReadableByteStreamController`);
        }
        function AcquireReadableStreamBYOBReader(stream) {
          return new ReadableStreamBYOBReader(stream);
        }
        function ReadableStreamAddReadIntoRequest(stream, readIntoRequest) {
          stream._reader._readIntoRequests.push(readIntoRequest);
        }
        function ReadableStreamFulfillReadIntoRequest(stream, chunk, done) {
          const reader = stream._reader;
          const readIntoRequest = reader._readIntoRequests.shift();
          if (done) {
            readIntoRequest._closeSteps(chunk);
          } else {
            readIntoRequest._chunkSteps(chunk);
          }
        }
        function ReadableStreamGetNumReadIntoRequests(stream) {
          return stream._reader._readIntoRequests.length;
        }
        function ReadableStreamHasBYOBReader(stream) {
          const reader = stream._reader;
          if (reader === void 0) {
            return false;
          }
          if (!IsReadableStreamBYOBReader(reader)) {
            return false;
          }
          return true;
        }
        class ReadableStreamBYOBReader {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "ReadableStreamBYOBReader");
            assertReadableStream(stream, "First parameter");
            if (IsReadableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive reading by another reader");
            }
            if (!IsReadableByteStreamController(stream._readableStreamController)) {
              throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readIntoRequests = new SimpleQueue();
          }
          get closed() {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          cancel(reason = void 0) {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("cancel"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("cancel"));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
          }
          read(view) {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("read"));
            }
            if (!ArrayBuffer.isView(view)) {
              return promiseRejectedWith(new TypeError("view must be an array buffer view"));
            }
            if (view.byteLength === 0) {
              return promiseRejectedWith(new TypeError("view must have non-zero byteLength"));
            }
            if (view.buffer.byteLength === 0) {
              return promiseRejectedWith(new TypeError(`view's buffer must have non-zero byteLength`));
            }
            if (IsDetachedBuffer(view.buffer))
              ;
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("read from"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readIntoRequest = {
              _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
              _closeSteps: (chunk) => resolvePromise({ value: chunk, done: true }),
              _errorSteps: (e) => rejectPromise(e)
            };
            ReadableStreamBYOBReaderRead(this, view, readIntoRequest);
            return promise;
          }
          releaseLock() {
            if (!IsReadableStreamBYOBReader(this)) {
              throw byobReaderBrandCheckException("releaseLock");
            }
            if (this._ownerReadableStream === void 0) {
              return;
            }
            if (this._readIntoRequests.length > 0) {
              throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
            }
            ReadableStreamReaderGenericRelease(this);
          }
        }
        Object.defineProperties(ReadableStreamBYOBReader.prototype, {
          cancel: { enumerable: true },
          read: { enumerable: true },
          releaseLock: { enumerable: true },
          closed: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamBYOBReader.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamBYOBReader",
            configurable: true
          });
        }
        function IsReadableStreamBYOBReader(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readIntoRequests")) {
            return false;
          }
          return x instanceof ReadableStreamBYOBReader;
        }
        function ReadableStreamBYOBReaderRead(reader, view, readIntoRequest) {
          const stream = reader._ownerReadableStream;
          stream._disturbed = true;
          if (stream._state === "errored") {
            readIntoRequest._errorSteps(stream._storedError);
          } else {
            ReadableByteStreamControllerPullInto(stream._readableStreamController, view, readIntoRequest);
          }
        }
        function byobReaderBrandCheckException(name) {
          return new TypeError(`ReadableStreamBYOBReader.prototype.${name} can only be used on a ReadableStreamBYOBReader`);
        }
        function ExtractHighWaterMark(strategy, defaultHWM) {
          const { highWaterMark } = strategy;
          if (highWaterMark === void 0) {
            return defaultHWM;
          }
          if (NumberIsNaN(highWaterMark) || highWaterMark < 0) {
            throw new RangeError("Invalid highWaterMark");
          }
          return highWaterMark;
        }
        function ExtractSizeAlgorithm(strategy) {
          const { size } = strategy;
          if (!size) {
            return () => 1;
          }
          return size;
        }
        function convertQueuingStrategy(init2, context) {
          assertDictionary(init2, context);
          const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
          const size = init2 === null || init2 === void 0 ? void 0 : init2.size;
          return {
            highWaterMark: highWaterMark === void 0 ? void 0 : convertUnrestrictedDouble(highWaterMark),
            size: size === void 0 ? void 0 : convertQueuingStrategySize(size, `${context} has member 'size' that`)
          };
        }
        function convertQueuingStrategySize(fn, context) {
          assertFunction(fn, context);
          return (chunk) => convertUnrestrictedDouble(fn(chunk));
        }
        function convertUnderlyingSink(original, context) {
          assertDictionary(original, context);
          const abort = original === null || original === void 0 ? void 0 : original.abort;
          const close = original === null || original === void 0 ? void 0 : original.close;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const type = original === null || original === void 0 ? void 0 : original.type;
          const write = original === null || original === void 0 ? void 0 : original.write;
          return {
            abort: abort === void 0 ? void 0 : convertUnderlyingSinkAbortCallback(abort, original, `${context} has member 'abort' that`),
            close: close === void 0 ? void 0 : convertUnderlyingSinkCloseCallback(close, original, `${context} has member 'close' that`),
            start: start === void 0 ? void 0 : convertUnderlyingSinkStartCallback(start, original, `${context} has member 'start' that`),
            write: write === void 0 ? void 0 : convertUnderlyingSinkWriteCallback(write, original, `${context} has member 'write' that`),
            type
          };
        }
        function convertUnderlyingSinkAbortCallback(fn, original, context) {
          assertFunction(fn, context);
          return (reason) => promiseCall(fn, original, [reason]);
        }
        function convertUnderlyingSinkCloseCallback(fn, original, context) {
          assertFunction(fn, context);
          return () => promiseCall(fn, original, []);
        }
        function convertUnderlyingSinkStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertUnderlyingSinkWriteCallback(fn, original, context) {
          assertFunction(fn, context);
          return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
        }
        function assertWritableStream(x, context) {
          if (!IsWritableStream(x)) {
            throw new TypeError(`${context} is not a WritableStream.`);
          }
        }
        function isAbortSignal2(value) {
          if (typeof value !== "object" || value === null) {
            return false;
          }
          try {
            return typeof value.aborted === "boolean";
          } catch (_a) {
            return false;
          }
        }
        const supportsAbortController = typeof AbortController === "function";
        function createAbortController() {
          if (supportsAbortController) {
            return new AbortController();
          }
          return void 0;
        }
        class WritableStream {
          constructor(rawUnderlyingSink = {}, rawStrategy = {}) {
            if (rawUnderlyingSink === void 0) {
              rawUnderlyingSink = null;
            } else {
              assertObject(rawUnderlyingSink, "First parameter");
            }
            const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
            const underlyingSink = convertUnderlyingSink(rawUnderlyingSink, "First parameter");
            InitializeWritableStream(this);
            const type = underlyingSink.type;
            if (type !== void 0) {
              throw new RangeError("Invalid type is specified");
            }
            const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
            const highWaterMark = ExtractHighWaterMark(strategy, 1);
            SetUpWritableStreamDefaultControllerFromUnderlyingSink(this, underlyingSink, highWaterMark, sizeAlgorithm);
          }
          get locked() {
            if (!IsWritableStream(this)) {
              throw streamBrandCheckException$2("locked");
            }
            return IsWritableStreamLocked(this);
          }
          abort(reason = void 0) {
            if (!IsWritableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$2("abort"));
            }
            if (IsWritableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot abort a stream that already has a writer"));
            }
            return WritableStreamAbort(this, reason);
          }
          close() {
            if (!IsWritableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$2("close"));
            }
            if (IsWritableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot close a stream that already has a writer"));
            }
            if (WritableStreamCloseQueuedOrInFlight(this)) {
              return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
            }
            return WritableStreamClose(this);
          }
          getWriter() {
            if (!IsWritableStream(this)) {
              throw streamBrandCheckException$2("getWriter");
            }
            return AcquireWritableStreamDefaultWriter(this);
          }
        }
        Object.defineProperties(WritableStream.prototype, {
          abort: { enumerable: true },
          close: { enumerable: true },
          getWriter: { enumerable: true },
          locked: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStream.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStream",
            configurable: true
          });
        }
        function AcquireWritableStreamDefaultWriter(stream) {
          return new WritableStreamDefaultWriter(stream);
        }
        function CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
          const stream = Object.create(WritableStream.prototype);
          InitializeWritableStream(stream);
          const controller = Object.create(WritableStreamDefaultController.prototype);
          SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
          return stream;
        }
        function InitializeWritableStream(stream) {
          stream._state = "writable";
          stream._storedError = void 0;
          stream._writer = void 0;
          stream._writableStreamController = void 0;
          stream._writeRequests = new SimpleQueue();
          stream._inFlightWriteRequest = void 0;
          stream._closeRequest = void 0;
          stream._inFlightCloseRequest = void 0;
          stream._pendingAbortRequest = void 0;
          stream._backpressure = false;
        }
        function IsWritableStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_writableStreamController")) {
            return false;
          }
          return x instanceof WritableStream;
        }
        function IsWritableStreamLocked(stream) {
          if (stream._writer === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamAbort(stream, reason) {
          var _a;
          if (stream._state === "closed" || stream._state === "errored") {
            return promiseResolvedWith(void 0);
          }
          stream._writableStreamController._abortReason = reason;
          (_a = stream._writableStreamController._abortController) === null || _a === void 0 ? void 0 : _a.abort();
          const state = stream._state;
          if (state === "closed" || state === "errored") {
            return promiseResolvedWith(void 0);
          }
          if (stream._pendingAbortRequest !== void 0) {
            return stream._pendingAbortRequest._promise;
          }
          let wasAlreadyErroring = false;
          if (state === "erroring") {
            wasAlreadyErroring = true;
            reason = void 0;
          }
          const promise = newPromise((resolve2, reject) => {
            stream._pendingAbortRequest = {
              _promise: void 0,
              _resolve: resolve2,
              _reject: reject,
              _reason: reason,
              _wasAlreadyErroring: wasAlreadyErroring
            };
          });
          stream._pendingAbortRequest._promise = promise;
          if (!wasAlreadyErroring) {
            WritableStreamStartErroring(stream, reason);
          }
          return promise;
        }
        function WritableStreamClose(stream) {
          const state = stream._state;
          if (state === "closed" || state === "errored") {
            return promiseRejectedWith(new TypeError(`The stream (in ${state} state) is not in the writable state and cannot be closed`));
          }
          const promise = newPromise((resolve2, reject) => {
            const closeRequest = {
              _resolve: resolve2,
              _reject: reject
            };
            stream._closeRequest = closeRequest;
          });
          const writer = stream._writer;
          if (writer !== void 0 && stream._backpressure && state === "writable") {
            defaultWriterReadyPromiseResolve(writer);
          }
          WritableStreamDefaultControllerClose(stream._writableStreamController);
          return promise;
        }
        function WritableStreamAddWriteRequest(stream) {
          const promise = newPromise((resolve2, reject) => {
            const writeRequest = {
              _resolve: resolve2,
              _reject: reject
            };
            stream._writeRequests.push(writeRequest);
          });
          return promise;
        }
        function WritableStreamDealWithRejection(stream, error3) {
          const state = stream._state;
          if (state === "writable") {
            WritableStreamStartErroring(stream, error3);
            return;
          }
          WritableStreamFinishErroring(stream);
        }
        function WritableStreamStartErroring(stream, reason) {
          const controller = stream._writableStreamController;
          stream._state = "erroring";
          stream._storedError = reason;
          const writer = stream._writer;
          if (writer !== void 0) {
            WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, reason);
          }
          if (!WritableStreamHasOperationMarkedInFlight(stream) && controller._started) {
            WritableStreamFinishErroring(stream);
          }
        }
        function WritableStreamFinishErroring(stream) {
          stream._state = "errored";
          stream._writableStreamController[ErrorSteps]();
          const storedError = stream._storedError;
          stream._writeRequests.forEach((writeRequest) => {
            writeRequest._reject(storedError);
          });
          stream._writeRequests = new SimpleQueue();
          if (stream._pendingAbortRequest === void 0) {
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
          }
          const abortRequest = stream._pendingAbortRequest;
          stream._pendingAbortRequest = void 0;
          if (abortRequest._wasAlreadyErroring) {
            abortRequest._reject(storedError);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
          }
          const promise = stream._writableStreamController[AbortSteps](abortRequest._reason);
          uponPromise(promise, () => {
            abortRequest._resolve();
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
          }, (reason) => {
            abortRequest._reject(reason);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
          });
        }
        function WritableStreamFinishInFlightWrite(stream) {
          stream._inFlightWriteRequest._resolve(void 0);
          stream._inFlightWriteRequest = void 0;
        }
        function WritableStreamFinishInFlightWriteWithError(stream, error3) {
          stream._inFlightWriteRequest._reject(error3);
          stream._inFlightWriteRequest = void 0;
          WritableStreamDealWithRejection(stream, error3);
        }
        function WritableStreamFinishInFlightClose(stream) {
          stream._inFlightCloseRequest._resolve(void 0);
          stream._inFlightCloseRequest = void 0;
          const state = stream._state;
          if (state === "erroring") {
            stream._storedError = void 0;
            if (stream._pendingAbortRequest !== void 0) {
              stream._pendingAbortRequest._resolve();
              stream._pendingAbortRequest = void 0;
            }
          }
          stream._state = "closed";
          const writer = stream._writer;
          if (writer !== void 0) {
            defaultWriterClosedPromiseResolve(writer);
          }
        }
        function WritableStreamFinishInFlightCloseWithError(stream, error3) {
          stream._inFlightCloseRequest._reject(error3);
          stream._inFlightCloseRequest = void 0;
          if (stream._pendingAbortRequest !== void 0) {
            stream._pendingAbortRequest._reject(error3);
            stream._pendingAbortRequest = void 0;
          }
          WritableStreamDealWithRejection(stream, error3);
        }
        function WritableStreamCloseQueuedOrInFlight(stream) {
          if (stream._closeRequest === void 0 && stream._inFlightCloseRequest === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamHasOperationMarkedInFlight(stream) {
          if (stream._inFlightWriteRequest === void 0 && stream._inFlightCloseRequest === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamMarkCloseRequestInFlight(stream) {
          stream._inFlightCloseRequest = stream._closeRequest;
          stream._closeRequest = void 0;
        }
        function WritableStreamMarkFirstWriteRequestInFlight(stream) {
          stream._inFlightWriteRequest = stream._writeRequests.shift();
        }
        function WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream) {
          if (stream._closeRequest !== void 0) {
            stream._closeRequest._reject(stream._storedError);
            stream._closeRequest = void 0;
          }
          const writer = stream._writer;
          if (writer !== void 0) {
            defaultWriterClosedPromiseReject(writer, stream._storedError);
          }
        }
        function WritableStreamUpdateBackpressure(stream, backpressure) {
          const writer = stream._writer;
          if (writer !== void 0 && backpressure !== stream._backpressure) {
            if (backpressure) {
              defaultWriterReadyPromiseReset(writer);
            } else {
              defaultWriterReadyPromiseResolve(writer);
            }
          }
          stream._backpressure = backpressure;
        }
        class WritableStreamDefaultWriter {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "WritableStreamDefaultWriter");
            assertWritableStream(stream, "First parameter");
            if (IsWritableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive writing by another writer");
            }
            this._ownerWritableStream = stream;
            stream._writer = this;
            const state = stream._state;
            if (state === "writable") {
              if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._backpressure) {
                defaultWriterReadyPromiseInitialize(this);
              } else {
                defaultWriterReadyPromiseInitializeAsResolved(this);
              }
              defaultWriterClosedPromiseInitialize(this);
            } else if (state === "erroring") {
              defaultWriterReadyPromiseInitializeAsRejected(this, stream._storedError);
              defaultWriterClosedPromiseInitialize(this);
            } else if (state === "closed") {
              defaultWriterReadyPromiseInitializeAsResolved(this);
              defaultWriterClosedPromiseInitializeAsResolved(this);
            } else {
              const storedError = stream._storedError;
              defaultWriterReadyPromiseInitializeAsRejected(this, storedError);
              defaultWriterClosedPromiseInitializeAsRejected(this, storedError);
            }
          }
          get closed() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          get desiredSize() {
            if (!IsWritableStreamDefaultWriter(this)) {
              throw defaultWriterBrandCheckException("desiredSize");
            }
            if (this._ownerWritableStream === void 0) {
              throw defaultWriterLockException("desiredSize");
            }
            return WritableStreamDefaultWriterGetDesiredSize(this);
          }
          get ready() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("ready"));
            }
            return this._readyPromise;
          }
          abort(reason = void 0) {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("abort"));
            }
            if (this._ownerWritableStream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("abort"));
            }
            return WritableStreamDefaultWriterAbort(this, reason);
          }
          close() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("close"));
            }
            const stream = this._ownerWritableStream;
            if (stream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("close"));
            }
            if (WritableStreamCloseQueuedOrInFlight(stream)) {
              return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
            }
            return WritableStreamDefaultWriterClose(this);
          }
          releaseLock() {
            if (!IsWritableStreamDefaultWriter(this)) {
              throw defaultWriterBrandCheckException("releaseLock");
            }
            const stream = this._ownerWritableStream;
            if (stream === void 0) {
              return;
            }
            WritableStreamDefaultWriterRelease(this);
          }
          write(chunk = void 0) {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("write"));
            }
            if (this._ownerWritableStream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("write to"));
            }
            return WritableStreamDefaultWriterWrite(this, chunk);
          }
        }
        Object.defineProperties(WritableStreamDefaultWriter.prototype, {
          abort: { enumerable: true },
          close: { enumerable: true },
          releaseLock: { enumerable: true },
          write: { enumerable: true },
          closed: { enumerable: true },
          desiredSize: { enumerable: true },
          ready: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStreamDefaultWriter.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStreamDefaultWriter",
            configurable: true
          });
        }
        function IsWritableStreamDefaultWriter(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_ownerWritableStream")) {
            return false;
          }
          return x instanceof WritableStreamDefaultWriter;
        }
        function WritableStreamDefaultWriterAbort(writer, reason) {
          const stream = writer._ownerWritableStream;
          return WritableStreamAbort(stream, reason);
        }
        function WritableStreamDefaultWriterClose(writer) {
          const stream = writer._ownerWritableStream;
          return WritableStreamClose(stream);
        }
        function WritableStreamDefaultWriterCloseWithErrorPropagation(writer) {
          const stream = writer._ownerWritableStream;
          const state = stream._state;
          if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
            return promiseResolvedWith(void 0);
          }
          if (state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          return WritableStreamDefaultWriterClose(writer);
        }
        function WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, error3) {
          if (writer._closedPromiseState === "pending") {
            defaultWriterClosedPromiseReject(writer, error3);
          } else {
            defaultWriterClosedPromiseResetToRejected(writer, error3);
          }
        }
        function WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, error3) {
          if (writer._readyPromiseState === "pending") {
            defaultWriterReadyPromiseReject(writer, error3);
          } else {
            defaultWriterReadyPromiseResetToRejected(writer, error3);
          }
        }
        function WritableStreamDefaultWriterGetDesiredSize(writer) {
          const stream = writer._ownerWritableStream;
          const state = stream._state;
          if (state === "errored" || state === "erroring") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return WritableStreamDefaultControllerGetDesiredSize(stream._writableStreamController);
        }
        function WritableStreamDefaultWriterRelease(writer) {
          const stream = writer._ownerWritableStream;
          const releasedError = new TypeError(`Writer was released and can no longer be used to monitor the stream's closedness`);
          WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, releasedError);
          WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, releasedError);
          stream._writer = void 0;
          writer._ownerWritableStream = void 0;
        }
        function WritableStreamDefaultWriterWrite(writer, chunk) {
          const stream = writer._ownerWritableStream;
          const controller = stream._writableStreamController;
          const chunkSize = WritableStreamDefaultControllerGetChunkSize(controller, chunk);
          if (stream !== writer._ownerWritableStream) {
            return promiseRejectedWith(defaultWriterLockException("write to"));
          }
          const state = stream._state;
          if (state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
            return promiseRejectedWith(new TypeError("The stream is closing or closed and cannot be written to"));
          }
          if (state === "erroring") {
            return promiseRejectedWith(stream._storedError);
          }
          const promise = WritableStreamAddWriteRequest(stream);
          WritableStreamDefaultControllerWrite(controller, chunk, chunkSize);
          return promise;
        }
        const closeSentinel = {};
        class WritableStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get abortReason() {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("abortReason");
            }
            return this._abortReason;
          }
          get signal() {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("signal");
            }
            if (this._abortController === void 0) {
              throw new TypeError("WritableStreamDefaultController.prototype.signal is not supported");
            }
            return this._abortController.signal;
          }
          error(e = void 0) {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("error");
            }
            const state = this._controlledWritableStream._state;
            if (state !== "writable") {
              return;
            }
            WritableStreamDefaultControllerError(this, e);
          }
          [AbortSteps](reason) {
            const result = this._abortAlgorithm(reason);
            WritableStreamDefaultControllerClearAlgorithms(this);
            return result;
          }
          [ErrorSteps]() {
            ResetQueue(this);
          }
        }
        Object.defineProperties(WritableStreamDefaultController.prototype, {
          error: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStreamDefaultController",
            configurable: true
          });
        }
        function IsWritableStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledWritableStream")) {
            return false;
          }
          return x instanceof WritableStreamDefaultController;
        }
        function SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm) {
          controller._controlledWritableStream = stream;
          stream._writableStreamController = controller;
          controller._queue = void 0;
          controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._abortReason = void 0;
          controller._abortController = createAbortController();
          controller._started = false;
          controller._strategySizeAlgorithm = sizeAlgorithm;
          controller._strategyHWM = highWaterMark;
          controller._writeAlgorithm = writeAlgorithm;
          controller._closeAlgorithm = closeAlgorithm;
          controller._abortAlgorithm = abortAlgorithm;
          const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
          WritableStreamUpdateBackpressure(stream, backpressure);
          const startResult = startAlgorithm();
          const startPromise = promiseResolvedWith(startResult);
          uponPromise(startPromise, () => {
            controller._started = true;
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
          }, (r) => {
            controller._started = true;
            WritableStreamDealWithRejection(stream, r);
          });
        }
        function SetUpWritableStreamDefaultControllerFromUnderlyingSink(stream, underlyingSink, highWaterMark, sizeAlgorithm) {
          const controller = Object.create(WritableStreamDefaultController.prototype);
          let startAlgorithm = () => void 0;
          let writeAlgorithm = () => promiseResolvedWith(void 0);
          let closeAlgorithm = () => promiseResolvedWith(void 0);
          let abortAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingSink.start !== void 0) {
            startAlgorithm = () => underlyingSink.start(controller);
          }
          if (underlyingSink.write !== void 0) {
            writeAlgorithm = (chunk) => underlyingSink.write(chunk, controller);
          }
          if (underlyingSink.close !== void 0) {
            closeAlgorithm = () => underlyingSink.close();
          }
          if (underlyingSink.abort !== void 0) {
            abortAlgorithm = (reason) => underlyingSink.abort(reason);
          }
          SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
        }
        function WritableStreamDefaultControllerClearAlgorithms(controller) {
          controller._writeAlgorithm = void 0;
          controller._closeAlgorithm = void 0;
          controller._abortAlgorithm = void 0;
          controller._strategySizeAlgorithm = void 0;
        }
        function WritableStreamDefaultControllerClose(controller) {
          EnqueueValueWithSize(controller, closeSentinel, 0);
          WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }
        function WritableStreamDefaultControllerGetChunkSize(controller, chunk) {
          try {
            return controller._strategySizeAlgorithm(chunk);
          } catch (chunkSizeE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, chunkSizeE);
            return 1;
          }
        }
        function WritableStreamDefaultControllerGetDesiredSize(controller) {
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function WritableStreamDefaultControllerWrite(controller, chunk, chunkSize) {
          try {
            EnqueueValueWithSize(controller, chunk, chunkSize);
          } catch (enqueueE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, enqueueE);
            return;
          }
          const stream = controller._controlledWritableStream;
          if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._state === "writable") {
            const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
            WritableStreamUpdateBackpressure(stream, backpressure);
          }
          WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }
        function WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller) {
          const stream = controller._controlledWritableStream;
          if (!controller._started) {
            return;
          }
          if (stream._inFlightWriteRequest !== void 0) {
            return;
          }
          const state = stream._state;
          if (state === "erroring") {
            WritableStreamFinishErroring(stream);
            return;
          }
          if (controller._queue.length === 0) {
            return;
          }
          const value = PeekQueueValue(controller);
          if (value === closeSentinel) {
            WritableStreamDefaultControllerProcessClose(controller);
          } else {
            WritableStreamDefaultControllerProcessWrite(controller, value);
          }
        }
        function WritableStreamDefaultControllerErrorIfNeeded(controller, error3) {
          if (controller._controlledWritableStream._state === "writable") {
            WritableStreamDefaultControllerError(controller, error3);
          }
        }
        function WritableStreamDefaultControllerProcessClose(controller) {
          const stream = controller._controlledWritableStream;
          WritableStreamMarkCloseRequestInFlight(stream);
          DequeueValue(controller);
          const sinkClosePromise = controller._closeAlgorithm();
          WritableStreamDefaultControllerClearAlgorithms(controller);
          uponPromise(sinkClosePromise, () => {
            WritableStreamFinishInFlightClose(stream);
          }, (reason) => {
            WritableStreamFinishInFlightCloseWithError(stream, reason);
          });
        }
        function WritableStreamDefaultControllerProcessWrite(controller, chunk) {
          const stream = controller._controlledWritableStream;
          WritableStreamMarkFirstWriteRequestInFlight(stream);
          const sinkWritePromise = controller._writeAlgorithm(chunk);
          uponPromise(sinkWritePromise, () => {
            WritableStreamFinishInFlightWrite(stream);
            const state = stream._state;
            DequeueValue(controller);
            if (!WritableStreamCloseQueuedOrInFlight(stream) && state === "writable") {
              const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
              WritableStreamUpdateBackpressure(stream, backpressure);
            }
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
          }, (reason) => {
            if (stream._state === "writable") {
              WritableStreamDefaultControllerClearAlgorithms(controller);
            }
            WritableStreamFinishInFlightWriteWithError(stream, reason);
          });
        }
        function WritableStreamDefaultControllerGetBackpressure(controller) {
          const desiredSize = WritableStreamDefaultControllerGetDesiredSize(controller);
          return desiredSize <= 0;
        }
        function WritableStreamDefaultControllerError(controller, error3) {
          const stream = controller._controlledWritableStream;
          WritableStreamDefaultControllerClearAlgorithms(controller);
          WritableStreamStartErroring(stream, error3);
        }
        function streamBrandCheckException$2(name) {
          return new TypeError(`WritableStream.prototype.${name} can only be used on a WritableStream`);
        }
        function defaultControllerBrandCheckException$2(name) {
          return new TypeError(`WritableStreamDefaultController.prototype.${name} can only be used on a WritableStreamDefaultController`);
        }
        function defaultWriterBrandCheckException(name) {
          return new TypeError(`WritableStreamDefaultWriter.prototype.${name} can only be used on a WritableStreamDefaultWriter`);
        }
        function defaultWriterLockException(name) {
          return new TypeError("Cannot " + name + " a stream using a released writer");
        }
        function defaultWriterClosedPromiseInitialize(writer) {
          writer._closedPromise = newPromise((resolve2, reject) => {
            writer._closedPromise_resolve = resolve2;
            writer._closedPromise_reject = reject;
            writer._closedPromiseState = "pending";
          });
        }
        function defaultWriterClosedPromiseInitializeAsRejected(writer, reason) {
          defaultWriterClosedPromiseInitialize(writer);
          defaultWriterClosedPromiseReject(writer, reason);
        }
        function defaultWriterClosedPromiseInitializeAsResolved(writer) {
          defaultWriterClosedPromiseInitialize(writer);
          defaultWriterClosedPromiseResolve(writer);
        }
        function defaultWriterClosedPromiseReject(writer, reason) {
          if (writer._closedPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(writer._closedPromise);
          writer._closedPromise_reject(reason);
          writer._closedPromise_resolve = void 0;
          writer._closedPromise_reject = void 0;
          writer._closedPromiseState = "rejected";
        }
        function defaultWriterClosedPromiseResetToRejected(writer, reason) {
          defaultWriterClosedPromiseInitializeAsRejected(writer, reason);
        }
        function defaultWriterClosedPromiseResolve(writer) {
          if (writer._closedPromise_resolve === void 0) {
            return;
          }
          writer._closedPromise_resolve(void 0);
          writer._closedPromise_resolve = void 0;
          writer._closedPromise_reject = void 0;
          writer._closedPromiseState = "resolved";
        }
        function defaultWriterReadyPromiseInitialize(writer) {
          writer._readyPromise = newPromise((resolve2, reject) => {
            writer._readyPromise_resolve = resolve2;
            writer._readyPromise_reject = reject;
          });
          writer._readyPromiseState = "pending";
        }
        function defaultWriterReadyPromiseInitializeAsRejected(writer, reason) {
          defaultWriterReadyPromiseInitialize(writer);
          defaultWriterReadyPromiseReject(writer, reason);
        }
        function defaultWriterReadyPromiseInitializeAsResolved(writer) {
          defaultWriterReadyPromiseInitialize(writer);
          defaultWriterReadyPromiseResolve(writer);
        }
        function defaultWriterReadyPromiseReject(writer, reason) {
          if (writer._readyPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(writer._readyPromise);
          writer._readyPromise_reject(reason);
          writer._readyPromise_resolve = void 0;
          writer._readyPromise_reject = void 0;
          writer._readyPromiseState = "rejected";
        }
        function defaultWriterReadyPromiseReset(writer) {
          defaultWriterReadyPromiseInitialize(writer);
        }
        function defaultWriterReadyPromiseResetToRejected(writer, reason) {
          defaultWriterReadyPromiseInitializeAsRejected(writer, reason);
        }
        function defaultWriterReadyPromiseResolve(writer) {
          if (writer._readyPromise_resolve === void 0) {
            return;
          }
          writer._readyPromise_resolve(void 0);
          writer._readyPromise_resolve = void 0;
          writer._readyPromise_reject = void 0;
          writer._readyPromiseState = "fulfilled";
        }
        const NativeDOMException = typeof DOMException !== "undefined" ? DOMException : void 0;
        function isDOMExceptionConstructor(ctor) {
          if (!(typeof ctor === "function" || typeof ctor === "object")) {
            return false;
          }
          try {
            new ctor();
            return true;
          } catch (_a) {
            return false;
          }
        }
        function createDOMExceptionPolyfill() {
          const ctor = function DOMException2(message, name) {
            this.message = message || "";
            this.name = name || "Error";
            if (Error.captureStackTrace) {
              Error.captureStackTrace(this, this.constructor);
            }
          };
          ctor.prototype = Object.create(Error.prototype);
          Object.defineProperty(ctor.prototype, "constructor", { value: ctor, writable: true, configurable: true });
          return ctor;
        }
        const DOMException$1 = isDOMExceptionConstructor(NativeDOMException) ? NativeDOMException : createDOMExceptionPolyfill();
        function ReadableStreamPipeTo(source, dest, preventClose, preventAbort, preventCancel, signal) {
          const reader = AcquireReadableStreamDefaultReader(source);
          const writer = AcquireWritableStreamDefaultWriter(dest);
          source._disturbed = true;
          let shuttingDown = false;
          let currentWrite = promiseResolvedWith(void 0);
          return newPromise((resolve2, reject) => {
            let abortAlgorithm;
            if (signal !== void 0) {
              abortAlgorithm = () => {
                const error3 = new DOMException$1("Aborted", "AbortError");
                const actions = [];
                if (!preventAbort) {
                  actions.push(() => {
                    if (dest._state === "writable") {
                      return WritableStreamAbort(dest, error3);
                    }
                    return promiseResolvedWith(void 0);
                  });
                }
                if (!preventCancel) {
                  actions.push(() => {
                    if (source._state === "readable") {
                      return ReadableStreamCancel(source, error3);
                    }
                    return promiseResolvedWith(void 0);
                  });
                }
                shutdownWithAction(() => Promise.all(actions.map((action) => action())), true, error3);
              };
              if (signal.aborted) {
                abortAlgorithm();
                return;
              }
              signal.addEventListener("abort", abortAlgorithm);
            }
            function pipeLoop() {
              return newPromise((resolveLoop, rejectLoop) => {
                function next(done) {
                  if (done) {
                    resolveLoop();
                  } else {
                    PerformPromiseThen(pipeStep(), next, rejectLoop);
                  }
                }
                next(false);
              });
            }
            function pipeStep() {
              if (shuttingDown) {
                return promiseResolvedWith(true);
              }
              return PerformPromiseThen(writer._readyPromise, () => {
                return newPromise((resolveRead, rejectRead) => {
                  ReadableStreamDefaultReaderRead(reader, {
                    _chunkSteps: (chunk) => {
                      currentWrite = PerformPromiseThen(WritableStreamDefaultWriterWrite(writer, chunk), void 0, noop2);
                      resolveRead(false);
                    },
                    _closeSteps: () => resolveRead(true),
                    _errorSteps: rejectRead
                  });
                });
              });
            }
            isOrBecomesErrored(source, reader._closedPromise, (storedError) => {
              if (!preventAbort) {
                shutdownWithAction(() => WritableStreamAbort(dest, storedError), true, storedError);
              } else {
                shutdown(true, storedError);
              }
            });
            isOrBecomesErrored(dest, writer._closedPromise, (storedError) => {
              if (!preventCancel) {
                shutdownWithAction(() => ReadableStreamCancel(source, storedError), true, storedError);
              } else {
                shutdown(true, storedError);
              }
            });
            isOrBecomesClosed(source, reader._closedPromise, () => {
              if (!preventClose) {
                shutdownWithAction(() => WritableStreamDefaultWriterCloseWithErrorPropagation(writer));
              } else {
                shutdown();
              }
            });
            if (WritableStreamCloseQueuedOrInFlight(dest) || dest._state === "closed") {
              const destClosed = new TypeError("the destination writable stream closed before all data could be piped to it");
              if (!preventCancel) {
                shutdownWithAction(() => ReadableStreamCancel(source, destClosed), true, destClosed);
              } else {
                shutdown(true, destClosed);
              }
            }
            setPromiseIsHandledToTrue(pipeLoop());
            function waitForWritesToFinish() {
              const oldCurrentWrite = currentWrite;
              return PerformPromiseThen(currentWrite, () => oldCurrentWrite !== currentWrite ? waitForWritesToFinish() : void 0);
            }
            function isOrBecomesErrored(stream, promise, action) {
              if (stream._state === "errored") {
                action(stream._storedError);
              } else {
                uponRejection(promise, action);
              }
            }
            function isOrBecomesClosed(stream, promise, action) {
              if (stream._state === "closed") {
                action();
              } else {
                uponFulfillment(promise, action);
              }
            }
            function shutdownWithAction(action, originalIsError, originalError) {
              if (shuttingDown) {
                return;
              }
              shuttingDown = true;
              if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
                uponFulfillment(waitForWritesToFinish(), doTheRest);
              } else {
                doTheRest();
              }
              function doTheRest() {
                uponPromise(action(), () => finalize(originalIsError, originalError), (newError) => finalize(true, newError));
              }
            }
            function shutdown(isError, error3) {
              if (shuttingDown) {
                return;
              }
              shuttingDown = true;
              if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
                uponFulfillment(waitForWritesToFinish(), () => finalize(isError, error3));
              } else {
                finalize(isError, error3);
              }
            }
            function finalize(isError, error3) {
              WritableStreamDefaultWriterRelease(writer);
              ReadableStreamReaderGenericRelease(reader);
              if (signal !== void 0) {
                signal.removeEventListener("abort", abortAlgorithm);
              }
              if (isError) {
                reject(error3);
              } else {
                resolve2(void 0);
              }
            }
          });
        }
        class ReadableStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get desiredSize() {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("desiredSize");
            }
            return ReadableStreamDefaultControllerGetDesiredSize(this);
          }
          close() {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("close");
            }
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
              throw new TypeError("The stream is not in a state that permits close");
            }
            ReadableStreamDefaultControllerClose(this);
          }
          enqueue(chunk = void 0) {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("enqueue");
            }
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
              throw new TypeError("The stream is not in a state that permits enqueue");
            }
            return ReadableStreamDefaultControllerEnqueue(this, chunk);
          }
          error(e = void 0) {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("error");
            }
            ReadableStreamDefaultControllerError(this, e);
          }
          [CancelSteps](reason) {
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableStreamDefaultControllerClearAlgorithms(this);
            return result;
          }
          [PullSteps](readRequest) {
            const stream = this._controlledReadableStream;
            if (this._queue.length > 0) {
              const chunk = DequeueValue(this);
              if (this._closeRequested && this._queue.length === 0) {
                ReadableStreamDefaultControllerClearAlgorithms(this);
                ReadableStreamClose(stream);
              } else {
                ReadableStreamDefaultControllerCallPullIfNeeded(this);
              }
              readRequest._chunkSteps(chunk);
            } else {
              ReadableStreamAddReadRequest(stream, readRequest);
              ReadableStreamDefaultControllerCallPullIfNeeded(this);
            }
          }
        }
        Object.defineProperties(ReadableStreamDefaultController.prototype, {
          close: { enumerable: true },
          enqueue: { enumerable: true },
          error: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamDefaultController",
            configurable: true
          });
        }
        function IsReadableStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledReadableStream")) {
            return false;
          }
          return x instanceof ReadableStreamDefaultController;
        }
        function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
          const shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);
          if (!shouldPull) {
            return;
          }
          if (controller._pulling) {
            controller._pullAgain = true;
            return;
          }
          controller._pulling = true;
          const pullPromise = controller._pullAlgorithm();
          uponPromise(pullPromise, () => {
            controller._pulling = false;
            if (controller._pullAgain) {
              controller._pullAgain = false;
              ReadableStreamDefaultControllerCallPullIfNeeded(controller);
            }
          }, (e) => {
            ReadableStreamDefaultControllerError(controller, e);
          });
        }
        function ReadableStreamDefaultControllerShouldCallPull(controller) {
          const stream = controller._controlledReadableStream;
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return false;
          }
          if (!controller._started) {
            return false;
          }
          if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            return true;
          }
          const desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);
          if (desiredSize > 0) {
            return true;
          }
          return false;
        }
        function ReadableStreamDefaultControllerClearAlgorithms(controller) {
          controller._pullAlgorithm = void 0;
          controller._cancelAlgorithm = void 0;
          controller._strategySizeAlgorithm = void 0;
        }
        function ReadableStreamDefaultControllerClose(controller) {
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return;
          }
          const stream = controller._controlledReadableStream;
          controller._closeRequested = true;
          if (controller._queue.length === 0) {
            ReadableStreamDefaultControllerClearAlgorithms(controller);
            ReadableStreamClose(stream);
          }
        }
        function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return;
          }
          const stream = controller._controlledReadableStream;
          if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            ReadableStreamFulfillReadRequest(stream, chunk, false);
          } else {
            let chunkSize;
            try {
              chunkSize = controller._strategySizeAlgorithm(chunk);
            } catch (chunkSizeE) {
              ReadableStreamDefaultControllerError(controller, chunkSizeE);
              throw chunkSizeE;
            }
            try {
              EnqueueValueWithSize(controller, chunk, chunkSize);
            } catch (enqueueE) {
              ReadableStreamDefaultControllerError(controller, enqueueE);
              throw enqueueE;
            }
          }
          ReadableStreamDefaultControllerCallPullIfNeeded(controller);
        }
        function ReadableStreamDefaultControllerError(controller, e) {
          const stream = controller._controlledReadableStream;
          if (stream._state !== "readable") {
            return;
          }
          ResetQueue(controller);
          ReadableStreamDefaultControllerClearAlgorithms(controller);
          ReadableStreamError(stream, e);
        }
        function ReadableStreamDefaultControllerGetDesiredSize(controller) {
          const state = controller._controlledReadableStream._state;
          if (state === "errored") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function ReadableStreamDefaultControllerHasBackpressure(controller) {
          if (ReadableStreamDefaultControllerShouldCallPull(controller)) {
            return false;
          }
          return true;
        }
        function ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) {
          const state = controller._controlledReadableStream._state;
          if (!controller._closeRequested && state === "readable") {
            return true;
          }
          return false;
        }
        function SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm) {
          controller._controlledReadableStream = stream;
          controller._queue = void 0;
          controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._started = false;
          controller._closeRequested = false;
          controller._pullAgain = false;
          controller._pulling = false;
          controller._strategySizeAlgorithm = sizeAlgorithm;
          controller._strategyHWM = highWaterMark;
          controller._pullAlgorithm = pullAlgorithm;
          controller._cancelAlgorithm = cancelAlgorithm;
          stream._readableStreamController = controller;
          const startResult = startAlgorithm();
          uponPromise(promiseResolvedWith(startResult), () => {
            controller._started = true;
            ReadableStreamDefaultControllerCallPullIfNeeded(controller);
          }, (r) => {
            ReadableStreamDefaultControllerError(controller, r);
          });
        }
        function SetUpReadableStreamDefaultControllerFromUnderlyingSource(stream, underlyingSource, highWaterMark, sizeAlgorithm) {
          const controller = Object.create(ReadableStreamDefaultController.prototype);
          let startAlgorithm = () => void 0;
          let pullAlgorithm = () => promiseResolvedWith(void 0);
          let cancelAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingSource.start !== void 0) {
            startAlgorithm = () => underlyingSource.start(controller);
          }
          if (underlyingSource.pull !== void 0) {
            pullAlgorithm = () => underlyingSource.pull(controller);
          }
          if (underlyingSource.cancel !== void 0) {
            cancelAlgorithm = (reason) => underlyingSource.cancel(reason);
          }
          SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
        }
        function defaultControllerBrandCheckException$1(name) {
          return new TypeError(`ReadableStreamDefaultController.prototype.${name} can only be used on a ReadableStreamDefaultController`);
        }
        function ReadableStreamTee(stream, cloneForBranch2) {
          if (IsReadableByteStreamController(stream._readableStreamController)) {
            return ReadableByteStreamTee(stream);
          }
          return ReadableStreamDefaultTee(stream);
        }
        function ReadableStreamDefaultTee(stream, cloneForBranch2) {
          const reader = AcquireReadableStreamDefaultReader(stream);
          let reading = false;
          let canceled1 = false;
          let canceled2 = false;
          let reason1;
          let reason2;
          let branch1;
          let branch2;
          let resolveCancelPromise;
          const cancelPromise = newPromise((resolve2) => {
            resolveCancelPromise = resolve2;
          });
          function pullAlgorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const readRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const chunk1 = chunk;
                  const chunk2 = chunk;
                  if (!canceled1) {
                    ReadableStreamDefaultControllerEnqueue(branch1._readableStreamController, chunk1);
                  }
                  if (!canceled2) {
                    ReadableStreamDefaultControllerEnqueue(branch2._readableStreamController, chunk2);
                  }
                });
              },
              _closeSteps: () => {
                reading = false;
                if (!canceled1) {
                  ReadableStreamDefaultControllerClose(branch1._readableStreamController);
                }
                if (!canceled2) {
                  ReadableStreamDefaultControllerClose(branch2._readableStreamController);
                }
                if (!canceled1 || !canceled2) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promiseResolvedWith(void 0);
          }
          function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function startAlgorithm() {
          }
          branch1 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel1Algorithm);
          branch2 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel2Algorithm);
          uponRejection(reader._closedPromise, (r) => {
            ReadableStreamDefaultControllerError(branch1._readableStreamController, r);
            ReadableStreamDefaultControllerError(branch2._readableStreamController, r);
            if (!canceled1 || !canceled2) {
              resolveCancelPromise(void 0);
            }
          });
          return [branch1, branch2];
        }
        function ReadableByteStreamTee(stream) {
          let reader = AcquireReadableStreamDefaultReader(stream);
          let reading = false;
          let canceled1 = false;
          let canceled2 = false;
          let reason1;
          let reason2;
          let branch1;
          let branch2;
          let resolveCancelPromise;
          const cancelPromise = newPromise((resolve2) => {
            resolveCancelPromise = resolve2;
          });
          function forwardReaderError(thisReader) {
            uponRejection(thisReader._closedPromise, (r) => {
              if (thisReader !== reader) {
                return;
              }
              ReadableByteStreamControllerError(branch1._readableStreamController, r);
              ReadableByteStreamControllerError(branch2._readableStreamController, r);
              if (!canceled1 || !canceled2) {
                resolveCancelPromise(void 0);
              }
            });
          }
          function pullWithDefaultReader() {
            if (IsReadableStreamBYOBReader(reader)) {
              ReadableStreamReaderGenericRelease(reader);
              reader = AcquireReadableStreamDefaultReader(stream);
              forwardReaderError(reader);
            }
            const readRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const chunk1 = chunk;
                  let chunk2 = chunk;
                  if (!canceled1 && !canceled2) {
                    try {
                      chunk2 = CloneAsUint8Array(chunk);
                    } catch (cloneE) {
                      ReadableByteStreamControllerError(branch1._readableStreamController, cloneE);
                      ReadableByteStreamControllerError(branch2._readableStreamController, cloneE);
                      resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                      return;
                    }
                  }
                  if (!canceled1) {
                    ReadableByteStreamControllerEnqueue(branch1._readableStreamController, chunk1);
                  }
                  if (!canceled2) {
                    ReadableByteStreamControllerEnqueue(branch2._readableStreamController, chunk2);
                  }
                });
              },
              _closeSteps: () => {
                reading = false;
                if (!canceled1) {
                  ReadableByteStreamControllerClose(branch1._readableStreamController);
                }
                if (!canceled2) {
                  ReadableByteStreamControllerClose(branch2._readableStreamController);
                }
                if (branch1._readableStreamController._pendingPullIntos.length > 0) {
                  ReadableByteStreamControllerRespond(branch1._readableStreamController, 0);
                }
                if (branch2._readableStreamController._pendingPullIntos.length > 0) {
                  ReadableByteStreamControllerRespond(branch2._readableStreamController, 0);
                }
                if (!canceled1 || !canceled2) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
          }
          function pullWithBYOBReader(view, forBranch2) {
            if (IsReadableStreamDefaultReader(reader)) {
              ReadableStreamReaderGenericRelease(reader);
              reader = AcquireReadableStreamBYOBReader(stream);
              forwardReaderError(reader);
            }
            const byobBranch = forBranch2 ? branch2 : branch1;
            const otherBranch = forBranch2 ? branch1 : branch2;
            const readIntoRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const byobCanceled = forBranch2 ? canceled2 : canceled1;
                  const otherCanceled = forBranch2 ? canceled1 : canceled2;
                  if (!otherCanceled) {
                    let clonedChunk;
                    try {
                      clonedChunk = CloneAsUint8Array(chunk);
                    } catch (cloneE) {
                      ReadableByteStreamControllerError(byobBranch._readableStreamController, cloneE);
                      ReadableByteStreamControllerError(otherBranch._readableStreamController, cloneE);
                      resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                      return;
                    }
                    if (!byobCanceled) {
                      ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                    }
                    ReadableByteStreamControllerEnqueue(otherBranch._readableStreamController, clonedChunk);
                  } else if (!byobCanceled) {
                    ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                  }
                });
              },
              _closeSteps: (chunk) => {
                reading = false;
                const byobCanceled = forBranch2 ? canceled2 : canceled1;
                const otherCanceled = forBranch2 ? canceled1 : canceled2;
                if (!byobCanceled) {
                  ReadableByteStreamControllerClose(byobBranch._readableStreamController);
                }
                if (!otherCanceled) {
                  ReadableByteStreamControllerClose(otherBranch._readableStreamController);
                }
                if (chunk !== void 0) {
                  if (!byobCanceled) {
                    ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                  }
                  if (!otherCanceled && otherBranch._readableStreamController._pendingPullIntos.length > 0) {
                    ReadableByteStreamControllerRespond(otherBranch._readableStreamController, 0);
                  }
                }
                if (!byobCanceled || !otherCanceled) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamBYOBReaderRead(reader, view, readIntoRequest);
          }
          function pull1Algorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch1._readableStreamController);
            if (byobRequest === null) {
              pullWithDefaultReader();
            } else {
              pullWithBYOBReader(byobRequest._view, false);
            }
            return promiseResolvedWith(void 0);
          }
          function pull2Algorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch2._readableStreamController);
            if (byobRequest === null) {
              pullWithDefaultReader();
            } else {
              pullWithBYOBReader(byobRequest._view, true);
            }
            return promiseResolvedWith(void 0);
          }
          function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function startAlgorithm() {
            return;
          }
          branch1 = CreateReadableByteStream(startAlgorithm, pull1Algorithm, cancel1Algorithm);
          branch2 = CreateReadableByteStream(startAlgorithm, pull2Algorithm, cancel2Algorithm);
          forwardReaderError(reader);
          return [branch1, branch2];
        }
        function convertUnderlyingDefaultOrByteSource(source, context) {
          assertDictionary(source, context);
          const original = source;
          const autoAllocateChunkSize = original === null || original === void 0 ? void 0 : original.autoAllocateChunkSize;
          const cancel = original === null || original === void 0 ? void 0 : original.cancel;
          const pull = original === null || original === void 0 ? void 0 : original.pull;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const type = original === null || original === void 0 ? void 0 : original.type;
          return {
            autoAllocateChunkSize: autoAllocateChunkSize === void 0 ? void 0 : convertUnsignedLongLongWithEnforceRange(autoAllocateChunkSize, `${context} has member 'autoAllocateChunkSize' that`),
            cancel: cancel === void 0 ? void 0 : convertUnderlyingSourceCancelCallback(cancel, original, `${context} has member 'cancel' that`),
            pull: pull === void 0 ? void 0 : convertUnderlyingSourcePullCallback(pull, original, `${context} has member 'pull' that`),
            start: start === void 0 ? void 0 : convertUnderlyingSourceStartCallback(start, original, `${context} has member 'start' that`),
            type: type === void 0 ? void 0 : convertReadableStreamType(type, `${context} has member 'type' that`)
          };
        }
        function convertUnderlyingSourceCancelCallback(fn, original, context) {
          assertFunction(fn, context);
          return (reason) => promiseCall(fn, original, [reason]);
        }
        function convertUnderlyingSourcePullCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => promiseCall(fn, original, [controller]);
        }
        function convertUnderlyingSourceStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertReadableStreamType(type, context) {
          type = `${type}`;
          if (type !== "bytes") {
            throw new TypeError(`${context} '${type}' is not a valid enumeration value for ReadableStreamType`);
          }
          return type;
        }
        function convertReaderOptions(options2, context) {
          assertDictionary(options2, context);
          const mode = options2 === null || options2 === void 0 ? void 0 : options2.mode;
          return {
            mode: mode === void 0 ? void 0 : convertReadableStreamReaderMode(mode, `${context} has member 'mode' that`)
          };
        }
        function convertReadableStreamReaderMode(mode, context) {
          mode = `${mode}`;
          if (mode !== "byob") {
            throw new TypeError(`${context} '${mode}' is not a valid enumeration value for ReadableStreamReaderMode`);
          }
          return mode;
        }
        function convertIteratorOptions(options2, context) {
          assertDictionary(options2, context);
          const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
          return { preventCancel: Boolean(preventCancel) };
        }
        function convertPipeOptions(options2, context) {
          assertDictionary(options2, context);
          const preventAbort = options2 === null || options2 === void 0 ? void 0 : options2.preventAbort;
          const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
          const preventClose = options2 === null || options2 === void 0 ? void 0 : options2.preventClose;
          const signal = options2 === null || options2 === void 0 ? void 0 : options2.signal;
          if (signal !== void 0) {
            assertAbortSignal(signal, `${context} has member 'signal' that`);
          }
          return {
            preventAbort: Boolean(preventAbort),
            preventCancel: Boolean(preventCancel),
            preventClose: Boolean(preventClose),
            signal
          };
        }
        function assertAbortSignal(signal, context) {
          if (!isAbortSignal2(signal)) {
            throw new TypeError(`${context} is not an AbortSignal.`);
          }
        }
        function convertReadableWritablePair(pair, context) {
          assertDictionary(pair, context);
          const readable2 = pair === null || pair === void 0 ? void 0 : pair.readable;
          assertRequiredField(readable2, "readable", "ReadableWritablePair");
          assertReadableStream(readable2, `${context} has member 'readable' that`);
          const writable3 = pair === null || pair === void 0 ? void 0 : pair.writable;
          assertRequiredField(writable3, "writable", "ReadableWritablePair");
          assertWritableStream(writable3, `${context} has member 'writable' that`);
          return { readable: readable2, writable: writable3 };
        }
        class ReadableStream2 {
          constructor(rawUnderlyingSource = {}, rawStrategy = {}) {
            if (rawUnderlyingSource === void 0) {
              rawUnderlyingSource = null;
            } else {
              assertObject(rawUnderlyingSource, "First parameter");
            }
            const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
            const underlyingSource = convertUnderlyingDefaultOrByteSource(rawUnderlyingSource, "First parameter");
            InitializeReadableStream(this);
            if (underlyingSource.type === "bytes") {
              if (strategy.size !== void 0) {
                throw new RangeError("The strategy for a byte stream cannot have a size function");
              }
              const highWaterMark = ExtractHighWaterMark(strategy, 0);
              SetUpReadableByteStreamControllerFromUnderlyingSource(this, underlyingSource, highWaterMark);
            } else {
              const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
              const highWaterMark = ExtractHighWaterMark(strategy, 1);
              SetUpReadableStreamDefaultControllerFromUnderlyingSource(this, underlyingSource, highWaterMark, sizeAlgorithm);
            }
          }
          get locked() {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("locked");
            }
            return IsReadableStreamLocked(this);
          }
          cancel(reason = void 0) {
            if (!IsReadableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$1("cancel"));
            }
            if (IsReadableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot cancel a stream that already has a reader"));
            }
            return ReadableStreamCancel(this, reason);
          }
          getReader(rawOptions = void 0) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("getReader");
            }
            const options2 = convertReaderOptions(rawOptions, "First parameter");
            if (options2.mode === void 0) {
              return AcquireReadableStreamDefaultReader(this);
            }
            return AcquireReadableStreamBYOBReader(this);
          }
          pipeThrough(rawTransform, rawOptions = {}) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("pipeThrough");
            }
            assertRequiredArgument(rawTransform, 1, "pipeThrough");
            const transform = convertReadableWritablePair(rawTransform, "First parameter");
            const options2 = convertPipeOptions(rawOptions, "Second parameter");
            if (IsReadableStreamLocked(this)) {
              throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream");
            }
            if (IsWritableStreamLocked(transform.writable)) {
              throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream");
            }
            const promise = ReadableStreamPipeTo(this, transform.writable, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
            setPromiseIsHandledToTrue(promise);
            return transform.readable;
          }
          pipeTo(destination, rawOptions = {}) {
            if (!IsReadableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$1("pipeTo"));
            }
            if (destination === void 0) {
              return promiseRejectedWith(`Parameter 1 is required in 'pipeTo'.`);
            }
            if (!IsWritableStream(destination)) {
              return promiseRejectedWith(new TypeError(`ReadableStream.prototype.pipeTo's first argument must be a WritableStream`));
            }
            let options2;
            try {
              options2 = convertPipeOptions(rawOptions, "Second parameter");
            } catch (e) {
              return promiseRejectedWith(e);
            }
            if (IsReadableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream"));
            }
            if (IsWritableStreamLocked(destination)) {
              return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream"));
            }
            return ReadableStreamPipeTo(this, destination, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
          }
          tee() {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("tee");
            }
            const branches = ReadableStreamTee(this);
            return CreateArrayFromList(branches);
          }
          values(rawOptions = void 0) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("values");
            }
            const options2 = convertIteratorOptions(rawOptions, "First parameter");
            return AcquireReadableStreamAsyncIterator(this, options2.preventCancel);
          }
        }
        Object.defineProperties(ReadableStream2.prototype, {
          cancel: { enumerable: true },
          getReader: { enumerable: true },
          pipeThrough: { enumerable: true },
          pipeTo: { enumerable: true },
          tee: { enumerable: true },
          values: { enumerable: true },
          locked: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStream",
            configurable: true
          });
        }
        if (typeof SymbolPolyfill.asyncIterator === "symbol") {
          Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.asyncIterator, {
            value: ReadableStream2.prototype.values,
            writable: true,
            configurable: true
          });
        }
        function CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
          const stream = Object.create(ReadableStream2.prototype);
          InitializeReadableStream(stream);
          const controller = Object.create(ReadableStreamDefaultController.prototype);
          SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
          return stream;
        }
        function CreateReadableByteStream(startAlgorithm, pullAlgorithm, cancelAlgorithm) {
          const stream = Object.create(ReadableStream2.prototype);
          InitializeReadableStream(stream);
          const controller = Object.create(ReadableByteStreamController.prototype);
          SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, 0, void 0);
          return stream;
        }
        function InitializeReadableStream(stream) {
          stream._state = "readable";
          stream._reader = void 0;
          stream._storedError = void 0;
          stream._disturbed = false;
        }
        function IsReadableStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_readableStreamController")) {
            return false;
          }
          return x instanceof ReadableStream2;
        }
        function IsReadableStreamLocked(stream) {
          if (stream._reader === void 0) {
            return false;
          }
          return true;
        }
        function ReadableStreamCancel(stream, reason) {
          stream._disturbed = true;
          if (stream._state === "closed") {
            return promiseResolvedWith(void 0);
          }
          if (stream._state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          ReadableStreamClose(stream);
          const reader = stream._reader;
          if (reader !== void 0 && IsReadableStreamBYOBReader(reader)) {
            reader._readIntoRequests.forEach((readIntoRequest) => {
              readIntoRequest._closeSteps(void 0);
            });
            reader._readIntoRequests = new SimpleQueue();
          }
          const sourceCancelPromise = stream._readableStreamController[CancelSteps](reason);
          return transformPromiseWith(sourceCancelPromise, noop2);
        }
        function ReadableStreamClose(stream) {
          stream._state = "closed";
          const reader = stream._reader;
          if (reader === void 0) {
            return;
          }
          defaultReaderClosedPromiseResolve(reader);
          if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach((readRequest) => {
              readRequest._closeSteps();
            });
            reader._readRequests = new SimpleQueue();
          }
        }
        function ReadableStreamError(stream, e) {
          stream._state = "errored";
          stream._storedError = e;
          const reader = stream._reader;
          if (reader === void 0) {
            return;
          }
          defaultReaderClosedPromiseReject(reader, e);
          if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach((readRequest) => {
              readRequest._errorSteps(e);
            });
            reader._readRequests = new SimpleQueue();
          } else {
            reader._readIntoRequests.forEach((readIntoRequest) => {
              readIntoRequest._errorSteps(e);
            });
            reader._readIntoRequests = new SimpleQueue();
          }
        }
        function streamBrandCheckException$1(name) {
          return new TypeError(`ReadableStream.prototype.${name} can only be used on a ReadableStream`);
        }
        function convertQueuingStrategyInit(init2, context) {
          assertDictionary(init2, context);
          const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
          assertRequiredField(highWaterMark, "highWaterMark", "QueuingStrategyInit");
          return {
            highWaterMark: convertUnrestrictedDouble(highWaterMark)
          };
        }
        const byteLengthSizeFunction = (chunk) => {
          return chunk.byteLength;
        };
        Object.defineProperty(byteLengthSizeFunction, "name", {
          value: "size",
          configurable: true
        });
        class ByteLengthQueuingStrategy {
          constructor(options2) {
            assertRequiredArgument(options2, 1, "ByteLengthQueuingStrategy");
            options2 = convertQueuingStrategyInit(options2, "First parameter");
            this._byteLengthQueuingStrategyHighWaterMark = options2.highWaterMark;
          }
          get highWaterMark() {
            if (!IsByteLengthQueuingStrategy(this)) {
              throw byteLengthBrandCheckException("highWaterMark");
            }
            return this._byteLengthQueuingStrategyHighWaterMark;
          }
          get size() {
            if (!IsByteLengthQueuingStrategy(this)) {
              throw byteLengthBrandCheckException("size");
            }
            return byteLengthSizeFunction;
          }
        }
        Object.defineProperties(ByteLengthQueuingStrategy.prototype, {
          highWaterMark: { enumerable: true },
          size: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ByteLengthQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
            value: "ByteLengthQueuingStrategy",
            configurable: true
          });
        }
        function byteLengthBrandCheckException(name) {
          return new TypeError(`ByteLengthQueuingStrategy.prototype.${name} can only be used on a ByteLengthQueuingStrategy`);
        }
        function IsByteLengthQueuingStrategy(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_byteLengthQueuingStrategyHighWaterMark")) {
            return false;
          }
          return x instanceof ByteLengthQueuingStrategy;
        }
        const countSizeFunction = () => {
          return 1;
        };
        Object.defineProperty(countSizeFunction, "name", {
          value: "size",
          configurable: true
        });
        class CountQueuingStrategy {
          constructor(options2) {
            assertRequiredArgument(options2, 1, "CountQueuingStrategy");
            options2 = convertQueuingStrategyInit(options2, "First parameter");
            this._countQueuingStrategyHighWaterMark = options2.highWaterMark;
          }
          get highWaterMark() {
            if (!IsCountQueuingStrategy(this)) {
              throw countBrandCheckException("highWaterMark");
            }
            return this._countQueuingStrategyHighWaterMark;
          }
          get size() {
            if (!IsCountQueuingStrategy(this)) {
              throw countBrandCheckException("size");
            }
            return countSizeFunction;
          }
        }
        Object.defineProperties(CountQueuingStrategy.prototype, {
          highWaterMark: { enumerable: true },
          size: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(CountQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
            value: "CountQueuingStrategy",
            configurable: true
          });
        }
        function countBrandCheckException(name) {
          return new TypeError(`CountQueuingStrategy.prototype.${name} can only be used on a CountQueuingStrategy`);
        }
        function IsCountQueuingStrategy(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_countQueuingStrategyHighWaterMark")) {
            return false;
          }
          return x instanceof CountQueuingStrategy;
        }
        function convertTransformer(original, context) {
          assertDictionary(original, context);
          const flush = original === null || original === void 0 ? void 0 : original.flush;
          const readableType = original === null || original === void 0 ? void 0 : original.readableType;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const transform = original === null || original === void 0 ? void 0 : original.transform;
          const writableType = original === null || original === void 0 ? void 0 : original.writableType;
          return {
            flush: flush === void 0 ? void 0 : convertTransformerFlushCallback(flush, original, `${context} has member 'flush' that`),
            readableType,
            start: start === void 0 ? void 0 : convertTransformerStartCallback(start, original, `${context} has member 'start' that`),
            transform: transform === void 0 ? void 0 : convertTransformerTransformCallback(transform, original, `${context} has member 'transform' that`),
            writableType
          };
        }
        function convertTransformerFlushCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => promiseCall(fn, original, [controller]);
        }
        function convertTransformerStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertTransformerTransformCallback(fn, original, context) {
          assertFunction(fn, context);
          return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
        }
        class TransformStream {
          constructor(rawTransformer = {}, rawWritableStrategy = {}, rawReadableStrategy = {}) {
            if (rawTransformer === void 0) {
              rawTransformer = null;
            }
            const writableStrategy = convertQueuingStrategy(rawWritableStrategy, "Second parameter");
            const readableStrategy = convertQueuingStrategy(rawReadableStrategy, "Third parameter");
            const transformer = convertTransformer(rawTransformer, "First parameter");
            if (transformer.readableType !== void 0) {
              throw new RangeError("Invalid readableType specified");
            }
            if (transformer.writableType !== void 0) {
              throw new RangeError("Invalid writableType specified");
            }
            const readableHighWaterMark = ExtractHighWaterMark(readableStrategy, 0);
            const readableSizeAlgorithm = ExtractSizeAlgorithm(readableStrategy);
            const writableHighWaterMark = ExtractHighWaterMark(writableStrategy, 1);
            const writableSizeAlgorithm = ExtractSizeAlgorithm(writableStrategy);
            let startPromise_resolve;
            const startPromise = newPromise((resolve2) => {
              startPromise_resolve = resolve2;
            });
            InitializeTransformStream(this, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
            SetUpTransformStreamDefaultControllerFromTransformer(this, transformer);
            if (transformer.start !== void 0) {
              startPromise_resolve(transformer.start(this._transformStreamController));
            } else {
              startPromise_resolve(void 0);
            }
          }
          get readable() {
            if (!IsTransformStream(this)) {
              throw streamBrandCheckException("readable");
            }
            return this._readable;
          }
          get writable() {
            if (!IsTransformStream(this)) {
              throw streamBrandCheckException("writable");
            }
            return this._writable;
          }
        }
        Object.defineProperties(TransformStream.prototype, {
          readable: { enumerable: true },
          writable: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(TransformStream.prototype, SymbolPolyfill.toStringTag, {
            value: "TransformStream",
            configurable: true
          });
        }
        function InitializeTransformStream(stream, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
          function startAlgorithm() {
            return startPromise;
          }
          function writeAlgorithm(chunk) {
            return TransformStreamDefaultSinkWriteAlgorithm(stream, chunk);
          }
          function abortAlgorithm(reason) {
            return TransformStreamDefaultSinkAbortAlgorithm(stream, reason);
          }
          function closeAlgorithm() {
            return TransformStreamDefaultSinkCloseAlgorithm(stream);
          }
          stream._writable = CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, writableHighWaterMark, writableSizeAlgorithm);
          function pullAlgorithm() {
            return TransformStreamDefaultSourcePullAlgorithm(stream);
          }
          function cancelAlgorithm(reason) {
            TransformStreamErrorWritableAndUnblockWrite(stream, reason);
            return promiseResolvedWith(void 0);
          }
          stream._readable = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
          stream._backpressure = void 0;
          stream._backpressureChangePromise = void 0;
          stream._backpressureChangePromise_resolve = void 0;
          TransformStreamSetBackpressure(stream, true);
          stream._transformStreamController = void 0;
        }
        function IsTransformStream(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_transformStreamController")) {
            return false;
          }
          return x instanceof TransformStream;
        }
        function TransformStreamError(stream, e) {
          ReadableStreamDefaultControllerError(stream._readable._readableStreamController, e);
          TransformStreamErrorWritableAndUnblockWrite(stream, e);
        }
        function TransformStreamErrorWritableAndUnblockWrite(stream, e) {
          TransformStreamDefaultControllerClearAlgorithms(stream._transformStreamController);
          WritableStreamDefaultControllerErrorIfNeeded(stream._writable._writableStreamController, e);
          if (stream._backpressure) {
            TransformStreamSetBackpressure(stream, false);
          }
        }
        function TransformStreamSetBackpressure(stream, backpressure) {
          if (stream._backpressureChangePromise !== void 0) {
            stream._backpressureChangePromise_resolve();
          }
          stream._backpressureChangePromise = newPromise((resolve2) => {
            stream._backpressureChangePromise_resolve = resolve2;
          });
          stream._backpressure = backpressure;
        }
        class TransformStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get desiredSize() {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("desiredSize");
            }
            const readableController = this._controlledTransformStream._readable._readableStreamController;
            return ReadableStreamDefaultControllerGetDesiredSize(readableController);
          }
          enqueue(chunk = void 0) {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("enqueue");
            }
            TransformStreamDefaultControllerEnqueue(this, chunk);
          }
          error(reason = void 0) {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("error");
            }
            TransformStreamDefaultControllerError(this, reason);
          }
          terminate() {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("terminate");
            }
            TransformStreamDefaultControllerTerminate(this);
          }
        }
        Object.defineProperties(TransformStreamDefaultController.prototype, {
          enqueue: { enumerable: true },
          error: { enumerable: true },
          terminate: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(TransformStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "TransformStreamDefaultController",
            configurable: true
          });
        }
        function IsTransformStreamDefaultController(x) {
          if (!typeIsObject(x)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x, "_controlledTransformStream")) {
            return false;
          }
          return x instanceof TransformStreamDefaultController;
        }
        function SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm) {
          controller._controlledTransformStream = stream;
          stream._transformStreamController = controller;
          controller._transformAlgorithm = transformAlgorithm;
          controller._flushAlgorithm = flushAlgorithm;
        }
        function SetUpTransformStreamDefaultControllerFromTransformer(stream, transformer) {
          const controller = Object.create(TransformStreamDefaultController.prototype);
          let transformAlgorithm = (chunk) => {
            try {
              TransformStreamDefaultControllerEnqueue(controller, chunk);
              return promiseResolvedWith(void 0);
            } catch (transformResultE) {
              return promiseRejectedWith(transformResultE);
            }
          };
          let flushAlgorithm = () => promiseResolvedWith(void 0);
          if (transformer.transform !== void 0) {
            transformAlgorithm = (chunk) => transformer.transform(chunk, controller);
          }
          if (transformer.flush !== void 0) {
            flushAlgorithm = () => transformer.flush(controller);
          }
          SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm);
        }
        function TransformStreamDefaultControllerClearAlgorithms(controller) {
          controller._transformAlgorithm = void 0;
          controller._flushAlgorithm = void 0;
        }
        function TransformStreamDefaultControllerEnqueue(controller, chunk) {
          const stream = controller._controlledTransformStream;
          const readableController = stream._readable._readableStreamController;
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController)) {
            throw new TypeError("Readable side is not in a state that permits enqueue");
          }
          try {
            ReadableStreamDefaultControllerEnqueue(readableController, chunk);
          } catch (e) {
            TransformStreamErrorWritableAndUnblockWrite(stream, e);
            throw stream._readable._storedError;
          }
          const backpressure = ReadableStreamDefaultControllerHasBackpressure(readableController);
          if (backpressure !== stream._backpressure) {
            TransformStreamSetBackpressure(stream, true);
          }
        }
        function TransformStreamDefaultControllerError(controller, e) {
          TransformStreamError(controller._controlledTransformStream, e);
        }
        function TransformStreamDefaultControllerPerformTransform(controller, chunk) {
          const transformPromise = controller._transformAlgorithm(chunk);
          return transformPromiseWith(transformPromise, void 0, (r) => {
            TransformStreamError(controller._controlledTransformStream, r);
            throw r;
          });
        }
        function TransformStreamDefaultControllerTerminate(controller) {
          const stream = controller._controlledTransformStream;
          const readableController = stream._readable._readableStreamController;
          ReadableStreamDefaultControllerClose(readableController);
          const error3 = new TypeError("TransformStream terminated");
          TransformStreamErrorWritableAndUnblockWrite(stream, error3);
        }
        function TransformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
          const controller = stream._transformStreamController;
          if (stream._backpressure) {
            const backpressureChangePromise = stream._backpressureChangePromise;
            return transformPromiseWith(backpressureChangePromise, () => {
              const writable3 = stream._writable;
              const state = writable3._state;
              if (state === "erroring") {
                throw writable3._storedError;
              }
              return TransformStreamDefaultControllerPerformTransform(controller, chunk);
            });
          }
          return TransformStreamDefaultControllerPerformTransform(controller, chunk);
        }
        function TransformStreamDefaultSinkAbortAlgorithm(stream, reason) {
          TransformStreamError(stream, reason);
          return promiseResolvedWith(void 0);
        }
        function TransformStreamDefaultSinkCloseAlgorithm(stream) {
          const readable2 = stream._readable;
          const controller = stream._transformStreamController;
          const flushPromise = controller._flushAlgorithm();
          TransformStreamDefaultControllerClearAlgorithms(controller);
          return transformPromiseWith(flushPromise, () => {
            if (readable2._state === "errored") {
              throw readable2._storedError;
            }
            ReadableStreamDefaultControllerClose(readable2._readableStreamController);
          }, (r) => {
            TransformStreamError(stream, r);
            throw readable2._storedError;
          });
        }
        function TransformStreamDefaultSourcePullAlgorithm(stream) {
          TransformStreamSetBackpressure(stream, false);
          return stream._backpressureChangePromise;
        }
        function defaultControllerBrandCheckException(name) {
          return new TypeError(`TransformStreamDefaultController.prototype.${name} can only be used on a TransformStreamDefaultController`);
        }
        function streamBrandCheckException(name) {
          return new TypeError(`TransformStream.prototype.${name} can only be used on a TransformStream`);
        }
        exports2.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
        exports2.CountQueuingStrategy = CountQueuingStrategy;
        exports2.ReadableByteStreamController = ReadableByteStreamController;
        exports2.ReadableStream = ReadableStream2;
        exports2.ReadableStreamBYOBReader = ReadableStreamBYOBReader;
        exports2.ReadableStreamBYOBRequest = ReadableStreamBYOBRequest;
        exports2.ReadableStreamDefaultController = ReadableStreamDefaultController;
        exports2.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
        exports2.TransformStream = TransformStream;
        exports2.TransformStreamDefaultController = TransformStreamDefaultController;
        exports2.WritableStream = WritableStream;
        exports2.WritableStreamDefaultController = WritableStreamDefaultController;
        exports2.WritableStreamDefaultWriter = WritableStreamDefaultWriter;
        Object.defineProperty(exports2, "__esModule", { value: true });
      });
    })(ponyfill_es2018, ponyfill_es2018.exports);
    POOL_SIZE$1 = 65536;
    if (!globalThis.ReadableStream) {
      try {
        const process2 = require("node:process");
        const { emitWarning } = process2;
        try {
          process2.emitWarning = () => {
          };
          Object.assign(globalThis, require("node:stream/web"));
          process2.emitWarning = emitWarning;
        } catch (error3) {
          process2.emitWarning = emitWarning;
          throw error3;
        }
      } catch (error3) {
        Object.assign(globalThis, ponyfill_es2018.exports);
      }
    }
    try {
      const { Blob: Blob3 } = require("buffer");
      if (Blob3 && !Blob3.prototype.stream) {
        Blob3.prototype.stream = function name(params) {
          let position = 0;
          const blob = this;
          return new ReadableStream({
            type: "bytes",
            async pull(ctrl) {
              const chunk = blob.slice(position, Math.min(blob.size, position + POOL_SIZE$1));
              const buffer = await chunk.arrayBuffer();
              position += buffer.byteLength;
              ctrl.enqueue(new Uint8Array(buffer));
              if (position === blob.size) {
                ctrl.close();
              }
            }
          });
        };
      }
    } catch (error3) {
    }
    POOL_SIZE = 65536;
    _Blob = class Blob {
      #parts = [];
      #type = "";
      #size = 0;
      constructor(blobParts = [], options2 = {}) {
        if (typeof blobParts !== "object" || blobParts === null) {
          throw new TypeError("Failed to construct 'Blob': The provided value cannot be converted to a sequence.");
        }
        if (typeof blobParts[Symbol.iterator] !== "function") {
          throw new TypeError("Failed to construct 'Blob': The object must have a callable @@iterator property.");
        }
        if (typeof options2 !== "object" && typeof options2 !== "function") {
          throw new TypeError("Failed to construct 'Blob': parameter 2 cannot convert to dictionary.");
        }
        if (options2 === null)
          options2 = {};
        const encoder = new TextEncoder();
        for (const element of blobParts) {
          let part;
          if (ArrayBuffer.isView(element)) {
            part = new Uint8Array(element.buffer.slice(element.byteOffset, element.byteOffset + element.byteLength));
          } else if (element instanceof ArrayBuffer) {
            part = new Uint8Array(element.slice(0));
          } else if (element instanceof Blob) {
            part = element;
          } else {
            part = encoder.encode(element);
          }
          this.#size += ArrayBuffer.isView(part) ? part.byteLength : part.size;
          this.#parts.push(part);
        }
        const type = options2.type === void 0 ? "" : String(options2.type);
        this.#type = /^[\x20-\x7E]*$/.test(type) ? type : "";
      }
      get size() {
        return this.#size;
      }
      get type() {
        return this.#type;
      }
      async text() {
        const decoder = new TextDecoder();
        let str = "";
        for await (const part of toIterator(this.#parts, false)) {
          str += decoder.decode(part, { stream: true });
        }
        str += decoder.decode();
        return str;
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of toIterator(this.#parts, false)) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        const it = toIterator(this.#parts, true);
        return new globalThis.ReadableStream({
          type: "bytes",
          async pull(ctrl) {
            const chunk = await it.next();
            chunk.done ? ctrl.close() : ctrl.enqueue(chunk.value);
          },
          async cancel() {
            await it.return();
          }
        });
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = this.#parts;
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          if (added >= span) {
            break;
          }
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            let chunk;
            if (ArrayBuffer.isView(part)) {
              chunk = part.subarray(relativeStart, Math.min(size2, relativeEnd));
              added += chunk.byteLength;
            } else {
              chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
              added += chunk.size;
            }
            relativeEnd -= size2;
            blobParts.push(chunk);
            relativeStart = 0;
          }
        }
        const blob = new Blob([], { type: String(type).toLowerCase() });
        blob.#size = span;
        blob.#parts = blobParts;
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.constructor === "function" && (typeof object.stream === "function" || typeof object.arrayBuffer === "function") && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    };
    Object.defineProperties(_Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    Blob2 = _Blob;
    Blob$1 = Blob2;
    FetchBaseError = class extends Error {
      constructor(message, type) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
      }
      get name() {
        return this.constructor.name;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && (object[NAME] === "AbortSignal" || object[NAME] === "EventTarget");
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body === null) {
          body = null;
        } else if (isURLSearchParameters(body)) {
          body = Buffer.from(body.toString());
        } else if (isBlob(body))
          ;
        else if (Buffer.isBuffer(body))
          ;
        else if (import_util.types.isAnyArrayBuffer(body)) {
          body = Buffer.from(body);
        } else if (ArrayBuffer.isView(body)) {
          body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        } else if (body instanceof import_stream.default)
          ;
        else if (isFormData(body)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body = import_stream.default.Readable.from(formDataIterator(body, boundary));
        } else {
          body = Buffer.from(String(body));
        }
        this[INTERNALS$2] = {
          body,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body instanceof import_stream.default) {
          body.on("error", (error_) => {
            const error3 = error_ instanceof FetchBaseError ? error_ : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, "system", error_);
            this[INTERNALS$2].error = error3;
          });
        }
      }
      get body() {
        return this[INTERNALS$2].body;
      }
      get bodyUsed() {
        return this[INTERNALS$2].disturbed;
      }
      async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
      }
      async blob() {
        const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
        const buf = await this.buffer();
        return new Blob$1([buf], {
          type: ct
        });
      }
      async json() {
        const buffer = await consumeBody(this);
        return JSON.parse(buffer.toString());
      }
      async text() {
        const buffer = await consumeBody(this);
        return buffer.toString();
      }
      buffer() {
        return consumeBody(this);
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    clone = (instance, highWaterMark) => {
      let p1;
      let p2;
      let { body } = instance;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS$2].body = p1;
        body = p2;
      }
      return body;
    };
    extractContentType = (body, request) => {
      if (body === null) {
        return null;
      }
      if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body)) {
        return body.type || null;
      }
      if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
        return null;
      }
      if (body && typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      }
      if (isFormData(body)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body } = request;
      if (body === null) {
        return 0;
      }
      if (isBlob(body)) {
        return body.size;
      }
      if (Buffer.isBuffer(body)) {
        return body.length;
      }
      if (body && typeof body.getLengthSync === "function") {
        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
      }
      if (isFormData(body)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body }) => {
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        import_stream.default.Readable.from(body.stream()).pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const error3 = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(error3, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw error3;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const error3 = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(error3, "code", { value: "ERR_INVALID_CHAR" });
        throw error3;
      }
    };
    Headers = class extends URLSearchParams {
      constructor(init2) {
        let result = [];
        if (init2 instanceof Headers) {
          const raw = init2.raw();
          for (const [name, values] of Object.entries(raw)) {
            result.push(...values.map((value) => [name, value]));
          }
        } else if (init2 == null)
          ;
        else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
          const method = init2[Symbol.iterator];
          if (method == null) {
            result.push(...Object.entries(init2));
          } else {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            result = [...init2].map((pair) => {
              if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
                throw new TypeError("Each header pair must be an iterable object");
              }
              return [...pair];
            }).map((pair) => {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              return [...pair];
            });
          }
        } else {
          throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        }
        result = result.length > 0 ? result.map(([name, value]) => {
          validateHeaderName(name);
          validateHeaderValue(name, String(value));
          return [String(name).toLowerCase(), String(value)];
        }) : void 0;
        super(result);
        return new Proxy(this, {
          get(target, p, receiver) {
            switch (p) {
              case "append":
              case "set":
                return (name, value) => {
                  validateHeaderName(name);
                  validateHeaderValue(name, String(value));
                  return URLSearchParams.prototype[p].call(target, String(name).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name) => {
                  validateHeaderName(name);
                  return URLSearchParams.prototype[p].call(target, String(name).toLowerCase());
                };
              case "keys":
                return () => {
                  target.sort();
                  return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                };
              default:
                return Reflect.get(target, p, receiver);
            }
          }
        });
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
      toString() {
        return Object.prototype.toString.call(this);
      }
      get(name) {
        const values = this.getAll(name);
        if (values.length === 0) {
          return null;
        }
        let value = values.join(", ");
        if (/^content-encoding$/i.test(name)) {
          value = value.toLowerCase();
        }
        return value;
      }
      forEach(callback, thisArg = void 0) {
        for (const name of this.keys()) {
          Reflect.apply(callback, thisArg, [this.get(name), name, this]);
        }
      }
      *values() {
        for (const name of this.keys()) {
          yield this.get(name);
        }
      }
      *entries() {
        for (const name of this.keys()) {
          yield [name, this.get(name)];
        }
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      raw() {
        return [...this.keys()].reduce((result, key) => {
          result[key] = this.getAll(key);
          return result;
        }, {});
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return [...this.keys()].reduce((result, key) => {
          const values = this.getAll(key);
          if (key === "host") {
            result[key] = values[0];
          } else {
            result[key] = values.length > 1 ? values : values[0];
          }
          return result;
        }, {});
      }
    };
    Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
      result[property] = { enumerable: true };
      return result;
    }, {}));
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body = null, options2 = {}) {
        super(body, options2);
        const status = options2.status != null ? options2.status : 200;
        const headers = new Headers(options2.headers);
        if (body !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          type: "default",
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get type() {
        return this[INTERNALS$1].type;
      }
      get url() {
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      get highWaterMark() {
        return this[INTERNALS$1].highWaterMark;
      }
      clone() {
        return new Response(clone(this, this.highWaterMark), {
          type: this.type,
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected,
          size: this.size
        });
      }
      static redirect(url, status = 302) {
        if (!isRedirect(status)) {
          throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
          headers: {
            location: new URL(url).toString()
          },
          status
        });
      }
      static error() {
        const response = new Response(null, { status: 0, statusText: "" });
        response[INTERNALS$1].type = "error";
        return response;
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      type: { enumerable: true },
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
      constructor(input, init2 = {}) {
        let parsedURL;
        if (isRequest(input)) {
          parsedURL = new URL(input.url);
        } else {
          parsedURL = new URL(input);
          input = {};
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
        super(inputBody, {
          size: init2.size || input.size || 0
        });
        const headers = new Headers(init2.headers || input.headers || {});
        if (inputBody !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(inputBody, this);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init2) {
          signal = init2.signal;
        }
        if (signal != null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal or EventTarget");
        }
        this[INTERNALS] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
        this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
        this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
      }
      get method() {
        return this[INTERNALS].method;
      }
      get url() {
        return (0, import_url.format)(this[INTERNALS].parsedURL);
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get redirect() {
        return this[INTERNALS].redirect;
      }
      get signal() {
        return this[INTERNALS].signal;
      }
      clone() {
        return new Request(this);
      }
      get [Symbol.toStringTag]() {
        return "Request";
      }
    };
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    getNodeRequestOptions = (request) => {
      const { parsedURL } = request[INTERNALS];
      const headers = new Headers(request[INTERNALS].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      let contentLengthValue = null;
      if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body !== null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate,br");
      }
      let { agent } = request;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      const search = getSearch(parsedURL);
      const requestOptions = {
        path: parsedURL.pathname + search,
        pathname: parsedURL.pathname,
        hostname: parsedURL.hostname,
        protocol: parsedURL.protocol,
        port: parsedURL.port,
        hash: parsedURL.hash,
        search: parsedURL.search,
        query: parsedURL.query,
        href: parsedURL.href,
        method: request.method,
        headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
      };
      return requestOptions;
    };
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/@sveltejs/adapter-netlify/files/shims.js
var init_shims = __esm({
  "node_modules/@sveltejs/adapter-netlify/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/cookie/index.js
var require_cookie = __commonJS({
  "node_modules/cookie/index.js"(exports) {
    init_shims();
    "use strict";
    exports.parse = parse;
    exports.serialize = serialize;
    var decode = decodeURIComponent;
    var encode = encodeURIComponent;
    var pairSplitRegExp = /; */;
    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
    function parse(str, options2) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var opt = options2 || {};
      var pairs = str.split(pairSplitRegExp);
      var dec = opt.decode || decode;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var eq_idx = pair.indexOf("=");
        if (eq_idx < 0) {
          continue;
        }
        var key = pair.substr(0, eq_idx).trim();
        var val = pair.substr(++eq_idx, pair.length).trim();
        if (val[0] == '"') {
          val = val.slice(1, -1);
        }
        if (obj[key] == void 0) {
          obj[key] = tryDecode(val, dec);
        }
      }
      return obj;
    }
    function serialize(name, val, options2) {
      var opt = options2 || {};
      var enc = opt.encode || encode;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!fieldContentRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (opt.maxAge != null) {
        var maxAge = opt.maxAge - 0;
        if (isNaN(maxAge) || !isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + Math.floor(maxAge);
      }
      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        if (typeof opt.expires.toUTCString !== "function") {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + opt.expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e) {
        return str;
      }
    }
  }
});

// .svelte-kit/output/server/chunks/stores-bc5c9a0c.js
var getStores, page, error, session;
var init_stores_bc5c9a0c = __esm({
  ".svelte-kit/output/server/chunks/stores-bc5c9a0c.js"() {
    init_shims();
    init_app_648d86f1();
    getStores = () => {
      const stores = getContext("__svelte__");
      return {
        page: {
          subscribe: stores.page.subscribe
        },
        navigating: {
          subscribe: stores.navigating.subscribe
        },
        get preloading() {
          console.error("stores.preloading is deprecated; use stores.navigating instead");
          return {
            subscribe: stores.navigating.subscribe
          };
        },
        session: stores.session
      };
    };
    page = {
      subscribe(fn) {
        const store = getStores().page;
        return store.subscribe(fn);
      }
    };
    error = (verb) => {
      throw new Error(`Can only ${verb} session store in browser`);
    };
    session = {
      subscribe(fn) {
        const store = getStores().session;
        return store.subscribe(fn);
      },
      set: () => error("set"),
      update: () => error("update")
    };
  }
});

// .svelte-kit/output/server/chunks/loadingSpinner-a3f71e99.js
var LoadingSpinner;
var init_loadingSpinner_a3f71e99 = __esm({
  ".svelte-kit/output/server/chunks/loadingSpinner-a3f71e99.js"() {
    init_shims();
    init_app_648d86f1();
    LoadingSpinner = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `<svg class="${"animate-spin -ml-1 mr-3 h-20 w-20 text-accent"}" xmlns="${"http://www.w3.org/2000/svg"}" fill="${"none"}" viewBox="${"0 0 24 24"}"><circle class="${"opacity-25"}" cx="${"12"}" cy="${"12"}" r="${"10"}" stroke="${"currentColor"}" stroke-width="${"4"}"></circle><path class="${"opacity-75"}" fill="${"currentColor"}" d="${"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"}"></path></svg>`;
    });
  }
});

// .svelte-kit/output/server/chunks/index-91f839fc.js
function readable(value, start) {
  return {
    subscribe: writable(value, start).subscribe
  };
}
function writable(value, start = noop) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function derived(stores, fn, initial_value) {
  const single = !Array.isArray(stores);
  const stores_array = single ? [stores] : stores;
  const auto = fn.length < 2;
  return readable(initial_value, (set) => {
    let inited = false;
    const values = [];
    let pending = 0;
    let cleanup = noop;
    const sync = () => {
      if (pending) {
        return;
      }
      cleanup();
      const result = fn(single ? values[0] : values, set);
      if (auto) {
        set(result);
      } else {
        cleanup = is_function(result) ? result : noop;
      }
    };
    const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
      values[i] = value;
      pending &= ~(1 << i);
      if (inited) {
        sync();
      }
    }, () => {
      pending |= 1 << i;
    }));
    inited = true;
    sync();
    return function stop() {
      run_all(unsubscribers);
      cleanup();
    };
  });
}
var subscriber_queue;
var init_index_91f839fc = __esm({
  ".svelte-kit/output/server/chunks/index-91f839fc.js"() {
    init_shims();
    init_app_648d86f1();
    subscriber_queue = [];
  }
});

// .svelte-kit/output/server/chunks/prompts-dc3f6318.js
var prompts;
var init_prompts_dc3f6318 = __esm({
  ".svelte-kit/output/server/chunks/prompts-dc3f6318.js"() {
    init_shims();
    init_index_91f839fc();
    prompts = (() => {
      let store = writable();
      const showPrompt = (params) => {
        store.set({
          onAccept: () => {
          },
          onCancel: () => {
          },
          type: "neutral",
          ...params
        });
      };
      const closePrompt = () => store.set(void 0);
      return {
        subscribe: store.subscribe,
        showPrompt,
        closePrompt
      };
    })();
  }
});

// .svelte-kit/output/server/chunks/toasts-62f37240.js
var toasts;
var init_toasts_62f37240 = __esm({
  ".svelte-kit/output/server/chunks/toasts-62f37240.js"() {
    init_shims();
    init_index_91f839fc();
    toasts = (() => {
      let id = 0;
      let store = writable([]);
      const addToast = (type, content, duration = 3e3) => {
        id++;
        let newID = id;
        store.update((prev) => [
          ...prev,
          {
            id: newID,
            type,
            content
          }
        ]);
        setTimeout(() => {
          store.update((prev) => prev.filter((t) => t.id != newID));
        }, duration);
      };
      return {
        subscribe: store.subscribe,
        addToast,
        success: (msg = "Operaci\xF3n realizada con exito") => addToast("success", msg),
        error: (msg = "Ha sucedido un error. No se ha podido realizar la operaci\xF3n") => addToast("danger", msg, 5e3)
      };
    })();
  }
});

// .svelte-kit/output/server/chunks/toastArea-b7785619.js
var css$1, IconBase, MdWarning, css, PromptArea, ToastArea;
var init_toastArea_b7785619 = __esm({
  ".svelte-kit/output/server/chunks/toastArea-b7785619.js"() {
    init_shims();
    init_app_648d86f1();
    init_prompts_dc3f6318();
    init_toasts_62f37240();
    css$1 = {
      code: "svg.svelte-heylkm{stroke:currentColor;fill:currentColor;stroke-width:0;height:auto;max-height:100%;width:100%}",
      map: null
    };
    IconBase = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { title = null } = $$props;
      let { viewBox } = $$props;
      if ($$props.title === void 0 && $$bindings.title && title !== void 0)
        $$bindings.title(title);
      if ($$props.viewBox === void 0 && $$bindings.viewBox && viewBox !== void 0)
        $$bindings.viewBox(viewBox);
      $$result.css.add(css$1);
      return `<svg xmlns="${"http://www.w3.org/2000/svg"}"${add_attribute("viewBox", viewBox, 0)} class="${"svelte-heylkm"}">${title ? `<title>${escape(title)}</title>` : ``}${slots.default ? slots.default({}) : ``}</svg>`;
    });
    MdWarning = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `${validate_component(IconBase, "IconBase").$$render($$result, Object.assign({ viewBox: "0 0 24 24" }, $$props), {}, {
        default: () => `<path d="${"M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"}"></path>`
      })}`;
    });
    css = {
      code: ".modal-bg.svelte-q89qy6{align-items:center;background:#00000088;bottom:0;display:flex;justify-content:center;left:0;position:fixed;right:0;top:0;z-index:10}.modal.svelte-q89qy6{--tw-bg-opacity:1;--tw-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05);background-color:rgba(255,255,255,var(--tw-bg-opacity));border-radius:.25rem;box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow);margin-top:-8rem;max-height:70vh;max-width:32rem;min-width:24rem;overflow:auto;width:100vw}.modal-body.svelte-q89qy6{align-items:center;display:flex;gap:2rem;padding:1rem}.modal.danger.svelte-q89qy6{--tw-border-opacity:1;border-color:rgba(206,47,85,var(--tw-border-opacity));border-width:2px}",
      map: null
    };
    PromptArea = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $prompts, $$unsubscribe_prompts;
      $$unsubscribe_prompts = subscribe(prompts, (value) => $prompts = value);
      $$result.css.add(css);
      $$unsubscribe_prompts();
      return `${$prompts ? `<div class="${"modal-bg svelte-q89qy6"}"><div class="${[
        "modal svelte-q89qy6",
        ($prompts.type == "success" ? "success" : "") + " " + ($prompts.type == "neutral" ? "neutral" : "") + " " + ($prompts.type == "danger" ? "danger" : "")
      ].join(" ").trim()}"><div class="${"modal-body svelte-q89qy6"}">${$prompts.type == "danger" ? `<div class="${"w-20 text-status-danger flex-shrink-0"}">${validate_component(MdWarning, "WarningIcon").$$render($$result, {}, {}, {})}</div>` : ``}

				<p class="${"text-lg font-bold flex-1"}">${escape($prompts.message)}</p></div>

			<footer class="${escape(null_to_empty(`p-4 bg-neutral-100 flex gap-8 ${$prompts.type == "danger" ? "flex-row-reverse justify-start" : "justify-end"}`)) + " svelte-q89qy6"}"><button${add_attribute("class", $prompts.type == "danger" ? "btn primary" : "link", 0)}>Cancelar</button>
				<button${add_attribute("class", $prompts.type == "danger" ? "link" : "btn primary", 0)}>Aceptar</button></footer></div></div>` : ``}`;
    });
    ToastArea = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $toasts, $$unsubscribe_toasts;
      $$unsubscribe_toasts = subscribe(toasts, (value) => $toasts = value);
      $$unsubscribe_toasts();
      return `<div id="${"toasts-area"}" class="${"fixed right-4 bottom-4 flex flex-col justify-end items-end gap-4 z-20"}">${each($toasts, (toast) => `<div class="${[
        "text-white p-4 rounded shadow animate-fade-in z-50",
        (toast.type == "success" ? "bg-status-success" : "") + " " + (toast.type == "danger" ? "bg-status-danger" : "") + " " + (toast.type == "neutral" ? "bg-neutral-500" : "")
      ].join(" ").trim()}">${escape(toast.content)}
		</div>`)}</div>`;
    });
  }
});

// .svelte-kit/output/server/chunks/index-9d95a6a7.js
function makeDBStore(route) {
  let store = writable([]);
  let crud = getCRUD(store, route);
  return {
    ...store,
    ...crud
  };
}
var serverURL, getFakeID, ApiError, getCRUD, db_usuarios, db_docentes, db_coaches, db_instructores, db_administrativos, db_coordinadores, db_docentesEnCoaches, db_jornadas, db_cursosEnJornada, db_asistentesEnCurso, db_invitacionesCurso, db_registrosCompetencias, db_registrosCursos, db_registrosDiplomados, db_cursos, db_diplomados, db_competencias, db_tiposCompetencias;
var init_index_9d95a6a7 = __esm({
  ".svelte-kit/output/server/chunks/index-9d95a6a7.js"() {
    init_shims();
    init_index_91f839fc();
    init_app_648d86f1();
    serverURL = "https://pacific-brushlands-15935.herokuapp.com";
    getFakeID = (() => {
      let currentID = 0.1;
      return () => {
        let lastID = currentID;
        currentID++;
        return lastID;
      };
    })();
    ApiError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "ApiError";
      }
    };
    getCRUD = (store, route) => {
      const findItem = (id) => {
        return get_store_value(store).find((item) => item.id == id);
      };
      const getItems = async () => {
        console.log("called");
        try {
          let res = await fetch(`${serverURL}/api/${route}`, {
            credentials: "include"
          });
          let data = await res.json();
          if (!res.ok)
            throw new ApiError(data.error);
          store.set(data);
          return data;
        } catch (e) {
          console.log(e);
        }
      };
      const callOnce = (fn) => {
        let hasBeenCalled = false;
        return async () => {
          if (!hasBeenCalled) {
            try {
              hasBeenCalled = true;
              await fn();
            } catch (e) {
              hasBeenCalled = false;
            }
          }
        };
      };
      const addItem = async (itemContents) => {
        let fakeItemID = getFakeID();
        let fakeNewItem = {
          id: fakeItemID,
          ...itemContents
        };
        store.update((prev) => [...prev, fakeNewItem]);
        try {
          let res = await fetch(`${serverURL}/api/${route}`, {
            credentials: "include",
            headers: {
              "Content-type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(itemContents)
          });
          let data = await res.json();
          if (!res.ok)
            throw new ApiError(data.error);
          store.update((prev) => prev.map((item) => item.id == fakeItemID ? data : item));
          return data;
        } catch (e) {
          store.update((prev) => prev.filter((item) => item.id != fakeItemID));
          throw e;
        }
      };
      const updateItem = async (id, itemContents) => {
        let oldItem = findItem(id);
        store.update((prev) => prev.map((item) => item.id == id ? { ...item, ...itemContents } : item));
        try {
          let res = await fetch(`${serverURL}/api/${route}/${id}`, {
            credentials: "include",
            headers: {
              "Content-type": "application/json"
            },
            method: "PUT",
            body: JSON.stringify(itemContents)
          });
          let data = await res.json();
          if (!res.ok)
            throw new ApiError(data.error);
          return data;
        } catch (e) {
          store.update((prev) => prev.map((item) => item.id == id ? oldItem || item : item));
          throw e;
        }
      };
      const deleteItem = async (id) => {
        let oldStore = get_store_value(store);
        store.update((prev) => prev.filter((item) => item.id != id));
        try {
          let res = await fetch(`${serverURL}/api/${route}/${id}`, {
            credentials: "include",
            method: "DELETE"
          });
          let data = await res.json();
          if (!res.ok)
            throw new ApiError(data.error);
          return data;
        } catch (e) {
          store.set(oldStore);
          throw e;
        }
      };
      return {
        getItems: callOnce(getItems),
        findItem,
        addItem,
        updateItem,
        deleteItem
      };
    };
    db_usuarios = makeDBStore("usuarios");
    db_docentes = makeDBStore("docentes");
    db_coaches = makeDBStore("coaches");
    db_instructores = makeDBStore("instructores");
    db_administrativos = makeDBStore("administrativos");
    db_coordinadores = makeDBStore("coordinadores");
    db_docentesEnCoaches = makeDBStore("docentesEnCoaches");
    db_jornadas = makeDBStore("jornadas");
    db_cursosEnJornada = makeDBStore("cursosEnJornada");
    db_asistentesEnCurso = makeDBStore("asistentesEnCurso");
    makeDBStore("reportes");
    db_invitacionesCurso = makeDBStore("invitacionesCursos");
    db_registrosCompetencias = makeDBStore("registrosCompetencias");
    db_registrosCursos = makeDBStore("registrosCursos");
    db_registrosDiplomados = makeDBStore("registrosDiplomados");
    db_cursos = makeDBStore("cursos");
    db_diplomados = makeDBStore("diplomados");
    db_competencias = makeDBStore("competencias");
    db_tiposCompetencias = makeDBStore("tiposCompetencias");
  }
});

// .svelte-kit/output/server/chunks/__layout-753ddf4d.js
var layout_753ddf4d_exports = {};
__export(layout_753ddf4d_exports, {
  default: () => _layout,
  load: () => load
});
async function load({ page: page2, fetch: fetch2, session: session2, stuff }) {
  const goLogin = { status: 302, redirect: "/login" };
  const goThrough = { status: 200 };
  const goIndex = { status: 302, redirect: "/" };
  if (page2.path == "/login")
    return goThrough;
  if (!session2.isLoggedIn)
    return goLogin;
  let portal = page2.path.split("/").filter((p) => p)[0];
  if (portal == "docente" || portal == "coordinador" || portal == "instructor" || portal == "coach" || portal == "administrativo") {
    if (!session2.roles.includes(portal))
      return goIndex;
  }
  return goThrough;
}
var import_cookie, _layout;
var init_layout_753ddf4d = __esm({
  ".svelte-kit/output/server/chunks/__layout-753ddf4d.js"() {
    init_shims();
    init_app_648d86f1();
    init_stores_bc5c9a0c();
    init_loadingSpinner_a3f71e99();
    init_toastArea_b7785619();
    init_index_9d95a6a7();
    import_cookie = __toModule(require_cookie());
    init_prompts_dc3f6318();
    init_index_91f839fc();
    init_toasts_62f37240();
    _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $session, $$unsubscribe_session;
      $$unsubscribe_session = subscribe(session, (value) => $session = value);
      let { loading = true } = $$props;
      if ($$props.loading === void 0 && $$bindings.loading && loading !== void 0)
        $$bindings.loading(loading);
      $$unsubscribe_session();
      return `${$$result.head += `${$$result.title = `<title>UNE Coaching</title>`, ""}`, ""}

${$session.isLoggedIn ? `${loading ? `<div class="${"w-screen h-screen flex justify-center items-center flex-col gap-8"}"><p class="${"text-accent"}">Cargando el portal...</p>
			${validate_component(LoadingSpinner, "LoadingSpinner").$$render($$result, {}, {}, {})}</div>` : `${slots.default ? slots.default({}) : ``}`}` : `${slots.login ? slots.login({}) : ``}`}

${validate_component(ToastArea, "ToastArea").$$render($$result, {}, {}, {})}
${validate_component(PromptArea, "PromptArea").$$render($$result, {}, {}, {})}`;
    });
  }
});

// .svelte-kit/output/server/chunks/error-d8b9c7da.js
var error_d8b9c7da_exports = {};
__export(error_d8b9c7da_exports, {
  default: () => Error2,
  load: () => load2
});
function load2({ error: error3, status }) {
  return { props: { error: error3, status } };
}
var import_cookie2, Error2;
var init_error_d8b9c7da = __esm({
  ".svelte-kit/output/server/chunks/error-d8b9c7da.js"() {
    init_shims();
    init_app_648d86f1();
    import_cookie2 = __toModule(require_cookie());
    Error2 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { status } = $$props;
      let { error: error3 } = $$props;
      if ($$props.status === void 0 && $$bindings.status && status !== void 0)
        $$bindings.status(status);
      if ($$props.error === void 0 && $$bindings.error && error3 !== void 0)
        $$bindings.error(error3);
      return `<h1>${escape(status)}</h1>

<pre>${escape(error3.message)}</pre>



${error3.frame ? `<pre>${escape(error3.frame)}</pre>` : ``}
${error3.stack ? `<pre>${escape(error3.stack)}</pre>` : ``}`;
    });
  }
});

// .svelte-kit/output/server/chunks/logoutButton-fc8dccce.js
var LogoutButton;
var init_logoutButton_fc8dccce = __esm({
  ".svelte-kit/output/server/chunks/logoutButton-fc8dccce.js"() {
    init_shims();
    init_app_648d86f1();
    LogoutButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `<button class="${"btn bg-white"}">Cerrar sesi\xF3n </button>`;
    });
  }
});

// .svelte-kit/output/server/chunks/capitalizeString-bffa0771.js
var capitalizeString;
var init_capitalizeString_bffa0771 = __esm({
  ".svelte-kit/output/server/chunks/capitalizeString-bffa0771.js"() {
    init_shims();
    capitalizeString = (word) => word[0].toUpperCase() + word.substr(1);
  }
});

// .svelte-kit/output/server/chunks/index-34e5a335.js
var index_34e5a335_exports = {};
__export(index_34e5a335_exports, {
  default: () => Routes
});
var import_cookie3, Routes;
var init_index_34e5a335 = __esm({
  ".svelte-kit/output/server/chunks/index-34e5a335.js"() {
    init_shims();
    init_app_648d86f1();
    init_stores_bc5c9a0c();
    init_logoutButton_fc8dccce();
    init_capitalizeString_bffa0771();
    import_cookie3 = __toModule(require_cookie());
    Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $session, $$unsubscribe_session;
      $$unsubscribe_session = subscribe(session, (value) => $session = value);
      $$unsubscribe_session();
      return `<section class="${"absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center bg-white gap-8 p-4 "}"><div class="${"w-full max-w-lg flex flex-col gap-8"}"><div><p class="${"text-3xl font-bold text-text-1"}">Bienvenido ${escape($session.user.nombre)}
				${escape($session.user.apellido_paterno)}
				${escape($session.user.apellido_materno)}</p>
			<p>Este es el portal principal, aqui puedes acceder a tus roles.</p></div>

		${$session.roles.length == 0 ? `<div><p class="${"text-text-4 font-bold"}">Oops! parece que no tienes roles asignados
				</p>
				<p>Comunicate con el coordinador del \xE1rea</p></div>` : `<div><p class="${"label"}">Selecciona un rol para ir a su portal</p>

				${each($session.roles, (role) => `<p class="${"my-4"}"><a${add_attribute("href", role, 0)}>${escape(capitalizeString(role))}</a>
					</p>`)}</div>`}

		${validate_component(LogoutButton, "LogoutButton").$$render($$result, {}, {}, {})}</div>
</section>`;
    });
  }
});

// .svelte-kit/output/server/chunks/useModal-0f7e070e.js
var useModal;
var init_useModal_0f7e070e = __esm({
  ".svelte-kit/output/server/chunks/useModal-0f7e070e.js"() {
    init_shims();
    init_index_91f839fc();
    useModal = () => {
      let store = writable(false);
      return {
        ...store,
        closeModal() {
          store.set(false);
        },
        openModal() {
          store.set(true);
        },
        toggleModal() {
          store.update((state) => !state);
        }
      };
    };
  }
});

// .svelte-kit/output/server/chunks/mobileLayout-e45d2d82.js
var css2, MobileLayout;
var init_mobileLayout_e45d2d82 = __esm({
  ".svelte-kit/output/server/chunks/mobileLayout-e45d2d82.js"() {
    init_shims();
    init_app_648d86f1();
    init_stores_bc5c9a0c();
    init_useModal_0f7e070e();
    init_logoutButton_fc8dccce();
    css2 = {
      code: ".menu-bg.svelte-q1q317{background:#00000040}#logo.svelte-q1q317{width:100px}aside.svelte-q1q317{width:250px}.menu-icon.svelte-q1q317{fill:#fff;height:40px;left:1rem;position:absolute;top:50%;transform:translateY(-50%);width:40px;z-index:0}.notch.svelte-q1q317{background:#00000040}.container.svelte-q1q317{margin-left:auto;margin-right:auto;max-width:28rem}.tab.svelte-q1q317{--tw-bg-opacity:1;--tw-text-opacity:1;align-items:center;background-color:rgba(234,234,234,var(--tw-bg-opacity));color:rgba(136,136,136,var(--tw-text-opacity));display:flex;flex:1 1 0%;font-weight:700;justify-content:center;padding:.5rem;text-align:center}.selected.svelte-q1q317{--tw-border-opacity:1;--tw-bg-opacity:1;--tw-text-opacity:1;background-color:rgba(255,255,255,var(--tw-bg-opacity));border-bottom-width:4px;border-color:rgba(70,118,211,var(--tw-border-opacity));color:rgba(70,118,211,var(--tw-text-opacity))}",
      map: null
    };
    MobileLayout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $menuModal, $$unsubscribe_menuModal;
      let $session, $$unsubscribe_session;
      let $page, $$unsubscribe_page;
      $$unsubscribe_session = subscribe(session, (value) => $session = value);
      $$unsubscribe_page = subscribe(page, (value) => $page = value);
      let { bgColor = "bg-une-red" } = $$props;
      let { layoutHeading } = $$props;
      let { tabs } = $$props;
      const TABS = tabs.map((t) => {
        let key = Object.keys(t)[0];
        return { title: key, path: t[key] };
      });
      const menuModal = useModal();
      $$unsubscribe_menuModal = subscribe(menuModal, (value) => $menuModal = value);
      if ($$props.bgColor === void 0 && $$bindings.bgColor && bgColor !== void 0)
        $$bindings.bgColor(bgColor);
      if ($$props.layoutHeading === void 0 && $$bindings.layoutHeading && layoutHeading !== void 0)
        $$bindings.layoutHeading(layoutHeading);
      if ($$props.tabs === void 0 && $$bindings.tabs && tabs !== void 0)
        $$bindings.tabs(tabs);
      if ($$props.TABS === void 0 && $$bindings.TABS && TABS !== void 0)
        $$bindings.TABS(TABS);
      $$result.css.add(css2);
      $$unsubscribe_menuModal();
      $$unsubscribe_session();
      $$unsubscribe_page();
      return `${$menuModal ? `<section class="${"fixed menu-bg w-screen h-screen z-10 svelte-q1q317"}"><aside class="${escape(bgColor) + " fixed left-0 top-0 bottom-0 py-8 px-4 flex flex-col gap-20 svelte-q1q317"}"><section class="${"flex flex-col gap-4 items-center text-center"}"><section class="${"flex flex-col gap-4 items-center"}"><img class="${"object-contain svelte-q1q317"}" src="${"../../../static/une white logo.png"}" alt="${"Une logo"}" id="${"logo"}"></section>
				<p class="${"text-gray-100"}">Conectado como ${escape($session.user.nombre)}
					${escape($session.user.apellido_paterno)}
					${escape($session.user.apellido_materno)}</p>
				${validate_component(LogoutButton, "LogoutButton").$$render($$result, {}, {}, {})}</section>

			<nav class="${"flex flex-col gap-4"}"><p class="${"leyenda text-gray-300 text-sm"}">ENLACES</p>
				<a href="${"/"}" class="${"text-white font-bold"}">Men\xFA principal</a>
				<a href="${"/newpassword"}" class="${"text-white font-bold"}">Cambiar contrase\xF1a</a></nav></aside></section>` : ``}

<header><section class="${escape(null_to_empty(bgColor)) + " svelte-q1q317"}"><div class="${"notch h-4 svelte-q1q317"}"></div>
		<div class="${"container relative text-2xl font-bold text-white p-4 text-center svelte-q1q317"}"><svg class="${"menu-icon svelte-q1q317"}" xmlns="${"http://www.w3.org/2000/svg"}" height="${"24px"}" viewBox="${"0 0 24 24"}" width="${"24px"}" fill="${"#000000"}"><path d="${"M0 0h24v24H0V0z"}" fill="${"none"}"></path><path d="${"M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"}"></path></svg>
			${escape(layoutHeading)}</div></section>

	<nav class="${"container flex justify-center svelte-q1q317"}">${each(TABS, (tab, i) => `<a${add_attribute("href", tab.path, 0)} class="${["tab svelte-q1q317", $page.path == tab.path ? "selected" : ""].join(" ").trim()}">${escape(tab.title)}</a>`)}</nav></header>
<main class="${"max-w-md mx-auto px-4 py-8"}">${`<div class="${"mb-8 p-4 bg-neutral-100 rounded flex flex-col gap-4 items-center text-center "}"><p>S\xED es la primera vez que ingresas, cambia tu contrase\xF1a para proteger tu
				cuenta.
			</p>
			<p>Para cambiarla accede desde el men\xFA o da clic <a href="${"/newpassword"}">aqu\xED</a>.
			</p>
			<button class="${"btn primary"}">Entendido, no volver a mostrar</button></div>`}
	${slots.default ? slots.default({}) : ``}
</main>`;
    });
  }
});

// .svelte-kit/output/server/chunks/__layout-0e5aaf68.js
var layout_0e5aaf68_exports = {};
__export(layout_0e5aaf68_exports, {
  default: () => _layout2
});
var import_cookie4, _layout2;
var init_layout_0e5aaf68 = __esm({
  ".svelte-kit/output/server/chunks/__layout-0e5aaf68.js"() {
    init_shims();
    init_app_648d86f1();
    init_mobileLayout_e45d2d82();
    import_cookie4 = __toModule(require_cookie());
    init_stores_bc5c9a0c();
    init_useModal_0f7e070e();
    init_index_91f839fc();
    init_logoutButton_fc8dccce();
    _layout2 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `${validate_component(MobileLayout, "MobileLayout").$$render($$result, {
        layoutHeading: "Portal Administrativo",
        bgColor: "bg-une-purple",
        tabs: [{ Reporte: "/administrativo" }]
      }, {}, {
        default: () => `${slots.default ? slots.default({}) : ``}`
      })}`;
    });
  }
});

// .svelte-kit/output/server/chunks/index-062dcc89.js
var index_062dcc89_exports = {};
__export(index_062dcc89_exports, {
  default: () => Administrativo
});
var import_cookie5, Administrativo;
var init_index_062dcc89 = __esm({
  ".svelte-kit/output/server/chunks/index-062dcc89.js"() {
    init_shims();
    init_app_648d86f1();
    import_cookie5 = __toModule(require_cookie());
    Administrativo = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `<p>hola</p>`;
    });
  }
});

// .svelte-kit/output/server/chunks/__layout-e34548b7.js
var layout_e34548b7_exports = {};
__export(layout_e34548b7_exports, {
  default: () => _layout3
});
var import_cookie6, css3, _layout3;
var init_layout_e34548b7 = __esm({
  ".svelte-kit/output/server/chunks/__layout-e34548b7.js"() {
    init_shims();
    init_app_648d86f1();
    init_stores_bc5c9a0c();
    init_logoutButton_fc8dccce();
    import_cookie6 = __toModule(require_cookie());
    css3 = {
      code: "#logo.svelte-1tc6c2v{width:100px}aside.svelte-1tc6c2v{width:250px}main.svelte-1tc6c2v{margin-left:250px}",
      map: null
    };
    _layout3 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $session, $$unsubscribe_session;
      let $page, $$unsubscribe_page;
      $$unsubscribe_session = subscribe(session, (value) => $session = value);
      $$unsubscribe_page = subscribe(page, (value) => $page = value);
      $$result.css.add(css3);
      $$unsubscribe_session();
      $$unsubscribe_page();
      return `<aside class="${"bg-une-red fixed left-0 top-0 bottom-0 py-8 px-4 flex flex-col gap-20 svelte-1tc6c2v"}"><section class="${"flex flex-col gap-4 items-center text-center"}"><h1 class="${"text-white font-bold text-xl"}">Portal Coordinador</h1>
		<p class="${"text-gray-100"}">Conectado como ${escape($session.user.nombre)}
			${escape($session.user.apellido_paterno)}
			${escape($session.user.apellido_materno)}</p>
		${validate_component(LogoutButton, "LogoutButton").$$render($$result, {}, {}, {})}</section>

	<section class="${"flex flex-col gap-8 mb-auto"}"><nav><p class="${"leyenda text-gray-300 text-sm"}">ENLACES</p>
			<ul class="${"flex flex-col gap-4 font-bold"}"><li><a class="${"text-white"}" href="${"/"}">Men\xFA principal</a></li>
				<li><a href="${"/newpassword"}" class="${"text-white"}">Cambiar contrase\xF1a</a></li></ul></nav>

		<nav><p class="${"leyenda text-gray-300 text-sm"}">PANELES</p>
			<ul class="${"flex flex-col gap-4 font-bold"}"><li><a class="${[
        "text-white",
        $page.path.includes("/coordinador/gestion-usuarios") ? "text-neutral-300" : ""
      ].join(" ").trim()}" href="${"/coordinador/gestion-usuarios"}">Gestionar usuarios</a></li>
				<li><a class="${[
        "text-white",
        $page.path.includes("/coordinador/gestion-jornadas") ? "text-neutral-300" : ""
      ].join(" ").trim()}" href="${"/coordinador/gestion-jornadas"}">Gestionar Jornadas</a></li>
				<li><a class="${[
        "text-white",
        $page.path.includes("/coordinador/coordinar-coaches") ? "text-neutral-300" : ""
      ].join(" ").trim()}" href="${"/coordinador/coordinar-coaches"}">Coordinaci\xF3n de Coaches</a></li>
				<li><a class="${[
        "text-white",
        $page.path.includes("/coordinador/estructurar-diplomados-competencias") ? "text-neutral-300" : ""
      ].join(" ").trim()}" href="${"/coordinador/estructurar-diplomados-competencias"}">Estructurar Diplomados, Cursos y Competencias</a></li>
				<li><a class="${[
        "text-white",
        $page.path.includes("/coordinador/gestion-registros") ? "text-neutral-300" : ""
      ].join(" ").trim()}" href="${"/coordinador/gestion-registros"}">Registros de acreditaciones</a></li></ul></nav></section>

	<section class="${"flex flex-col gap-4 items-center"}"><img class="${"object-contain svelte-1tc6c2v"}" src="${"../../../static/une white logo.png"}" alt="${"Une logo"}" id="${"logo"}"></section></aside>

<main class="${"py-8 px-4 svelte-1tc6c2v"}">${slots.default ? slots.default({}) : ``}
</main>`;
    });
  }
});

// .svelte-kit/output/server/chunks/navigation-0a4806ec.js
function guard(name) {
  return () => {
    throw new Error(`Cannot call ${name}(...) on the server`);
  };
}
var goto;
var init_navigation_0a4806ec = __esm({
  ".svelte-kit/output/server/chunks/navigation-0a4806ec.js"() {
    init_shims();
    goto = guard("goto");
  }
});

// .svelte-kit/output/server/chunks/index-9e9716a5.js
var index_9e9716a5_exports = {};
__export(index_9e9716a5_exports, {
  default: () => Coordinador
});
var import_cookie7, Coordinador;
var init_index_9e9716a5 = __esm({
  ".svelte-kit/output/server/chunks/index-9e9716a5.js"() {
    init_shims();
    init_app_648d86f1();
    init_navigation_0a4806ec();
    import_cookie7 = __toModule(require_cookie());
    Coordinador = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      goto("coordinador/gestion-jornadas");
      return ``;
    });
  }
});

// .svelte-kit/output/server/chunks/__layout-99075d10.js
var layout_99075d10_exports = {};
__export(layout_99075d10_exports, {
  default: () => _layout4
});
var import_cookie8, _layout4;
var init_layout_99075d10 = __esm({
  ".svelte-kit/output/server/chunks/__layout-99075d10.js"() {
    init_shims();
    init_app_648d86f1();
    init_stores_bc5c9a0c();
    import_cookie8 = __toModule(require_cookie());
    _layout4 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $page, $$unsubscribe_page;
      $$unsubscribe_page = subscribe(page, (value) => $page = value);
      $$unsubscribe_page();
      return `<p class="${"label"}">Ver tabla</p>
<div class="${"flex gap-4"}"><a href="${"/coordinador/estructurar-diplomados-competencias/cursos"}" class="${[
        "link",
        $page.path == "/coordinador/estructurar-diplomados-competencias/cursos" ? "primary" : ""
      ].join(" ").trim()}">Cursos</a>
	/
	<a href="${"/coordinador/estructurar-diplomados-competencias/competencias"}" class="${[
        "link",
        $page.path == "/coordinador/estructurar-diplomados-competencias/competencias" ? "primary" : ""
      ].join(" ").trim()}">Competencias</a></div>

<hr class="${"my-4 border-none"}">

${slots.default ? slots.default({}) : ``}`;
    });
  }
});

// .svelte-kit/output/server/chunks/index-a5c764ad.js
var index_a5c764ad_exports = {};
__export(index_a5c764ad_exports, {
  default: () => Estructurar_diplomados_competencias
});
var import_cookie9, Estructurar_diplomados_competencias;
var init_index_a5c764ad = __esm({
  ".svelte-kit/output/server/chunks/index-a5c764ad.js"() {
    init_shims();
    init_app_648d86f1();
    init_navigation_0a4806ec();
    import_cookie9 = __toModule(require_cookie());
    Estructurar_diplomados_competencias = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      goto("/coordinador/estructurar-diplomados-competencias/cursos");
      return ``;
    });
  }
});

// .svelte-kit/output/server/chunks/modal-8e58b549.js
var css4, Modal;
var init_modal_8e58b549 = __esm({
  ".svelte-kit/output/server/chunks/modal-8e58b549.js"() {
    init_shims();
    init_app_648d86f1();
    css4 = {
      code: ".modal-bg.svelte-d8kk8b{align-items:center;background:#00000088;bottom:0;display:flex;justify-content:center;left:0;position:fixed;right:0;top:0;z-index:10}.modal.svelte-d8kk8b{--tw-bg-opacity:1;--tw-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05);background-color:rgba(255,255,255,var(--tw-bg-opacity));border-radius:.25rem;box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow);margin-top:-8rem;max-height:70vh;min-width:24rem;overflow:auto;padding:1rem}.modal-header.svelte-d8kk8b{display:flex;justify-content:flex-end}",
      map: null
    };
    Modal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { isPopUp = false } = $$props;
      let { handleClose } = $$props;
      if ($$props.isPopUp === void 0 && $$bindings.isPopUp && isPopUp !== void 0)
        $$bindings.isPopUp(isPopUp);
      if ($$props.handleClose === void 0 && $$bindings.handleClose && handleClose !== void 0)
        $$bindings.handleClose(handleClose);
      $$result.css.add(css4);
      return `<div class="${"modal-bg svelte-d8kk8b"}"><div class="${"modal svelte-d8kk8b"}">${!isPopUp ? `<header class="${"modal-header svelte-d8kk8b"}"><button class="${"font-bold text-text-4"}">Cerrar ventana</button></header>
			<hr class="${"my-4 border-none"}">` : ``}
		${slots.default ? slots.default({}) : ``}</div>
</div>`;
    });
  }
});

// .svelte-kit/output/server/chunks/competenciasConTipo-85cbff0e.js
var competenciasConTipo;
var init_competenciasConTipo_85cbff0e = __esm({
  ".svelte-kit/output/server/chunks/competenciasConTipo-85cbff0e.js"() {
    init_shims();
    init_index_91f839fc();
    init_index_9d95a6a7();
    competenciasConTipo = derived([db_competencias, db_tiposCompetencias], ([competencias, tipoCompetencias]) => competencias.map((c) => {
      const tipoDeLaCompetencia = tipoCompetencias.find((t) => t.id == c.id_tipo);
      return {
        ...c,
        tipo: tipoDeLaCompetencia
      };
    }));
  }
});

// .svelte-kit/output/server/chunks/makeArraySearchable-f17ce08a.js
var parseAccents, makeArraySearchable;
var init_makeArraySearchable_f17ce08a = __esm({
  ".svelte-kit/output/server/chunks/makeArraySearchable-f17ce08a.js"() {
    init_shims();
    parseAccents = (word) => word.replace("\xE1", "a").replace("\xE9", "e").replace("\xED", "i").replace("\xF3", "o").replace("\xFA", "u");
    makeArraySearchable = (array, searchFields, searchText) => searchText ? array.filter((elem) => {
      let fieldText = parseAccents(searchFields.reduce((str, field) => str += elem[field] + " ", ""));
      let searchWords = searchText.split(/\s/);
      return searchWords.every((word) => fieldText.match(new RegExp(parseAccents(word), "i")));
    }) : array;
  }
});

// .svelte-kit/output/server/chunks/index-fb667e80.js
var index_fb667e80_exports = {};
__export(index_fb667e80_exports, {
  default: () => Competencias
});
var import_cookie10, CompetenciaForm, GestionTiposCompetencia, Competencias;
var init_index_fb667e80 = __esm({
  ".svelte-kit/output/server/chunks/index-fb667e80.js"() {
    init_shims();
    init_app_648d86f1();
    init_modal_8e58b549();
    init_index_9d95a6a7();
    init_competenciasConTipo_85cbff0e();
    init_prompts_dc3f6318();
    init_toasts_62f37240();
    init_useModal_0f7e070e();
    init_makeArraySearchable_f17ce08a();
    import_cookie10 = __toModule(require_cookie());
    init_index_91f839fc();
    CompetenciaForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $db_tiposCompetencias, $$unsubscribe_db_tiposCompetencias;
      $$unsubscribe_db_tiposCompetencias = subscribe(db_tiposCompetencias, (value) => $db_tiposCompetencias = value);
      let { editingCompetenciaID = void 0 } = $$props;
      let { form = { nombre: void 0, id_tipo: void 0 } } = $$props;
      let { selectedTipoID = null } = $$props;
      if ($$props.editingCompetenciaID === void 0 && $$bindings.editingCompetenciaID && editingCompetenciaID !== void 0)
        $$bindings.editingCompetenciaID(editingCompetenciaID);
      if ($$props.form === void 0 && $$bindings.form && form !== void 0)
        $$bindings.form(form);
      if ($$props.selectedTipoID === void 0 && $$bindings.selectedTipoID && selectedTipoID !== void 0)
        $$bindings.selectedTipoID(selectedTipoID);
      $$unsubscribe_db_tiposCompetencias();
      return `<form class="${"flex flex-col max-w-xl w-screen gap-4"}"><header class="${"flex justify-between"}"><h2 class="${"heading"}">Competencia</h2>
		${editingCompetenciaID ? `<button class="${"btn primary"}">Editar competencia</button>` : `<button class="${"btn primary"}">Guardar competencia</button>`}</header>

	<div><p class="${"label"}">Nombre de la competencia</p>
		<input type="${"text"}" class="${"w-full"}" required${add_attribute("value", form.nombre, 0)}></div>

	<div><p class="${"label"}">Tipo de la competencia</p>
		<select class="${"w-full"}"><option${add_attribute("value", null, 0)}>Sin tipo</option>${each($db_tiposCompetencias, (tipoCompetencia) => `<option${add_attribute("value", tipoCompetencia.id, 0)}>${escape(tipoCompetencia.nombre)}</option>`)}</select></div></form>`;
    });
    GestionTiposCompetencia = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $db_tiposCompetencias, $$unsubscribe_db_tiposCompetencias;
      $$unsubscribe_db_tiposCompetencias = subscribe(db_tiposCompetencias, (value) => $db_tiposCompetencias = value);
      let form = { nombre: void 0 };
      $$unsubscribe_db_tiposCompetencias();
      return `<form class="${"flex flex-col gap-4 w-screen max-w-xl"}"><header class="${"flex justify-between flex-wrap"}"><h2 class="${"heading"}">Tipos de competencias</h2>
		${`<button class="${"btn primary"}">Agregar tipo </button>`}</header>

	<label class="${"w-full"}"><p class="${"label"}">Nombre del tipo de competencia</p>
		<input type="${"text"}" class="${"w-full"}" required${add_attribute("value", form.nombre, 0)}></label></form>

<hr class="${"my-4 border-none"}">

${$db_tiposCompetencias.length == 0 ? `<p>No hay tipos de competencias a\xFAn.</p>` : `<table class="${"table-fixed table shadow-lg w-full max-w-xl"}"><thead><tr><th>Tipo de competencia</th>
				<th>...</th></tr></thead>
		<tbody class="${"max-h-60 overflow-auto"}">${each($db_tiposCompetencias, (tipoCompetencia) => `<tr><td>${escape(tipoCompetencia.nombre)}</td>
					<td><span class="${"flex gap-8 justify-center"}"><button class="${"font-bold text-accent"}">Editar tipo</button>
							<button class="${"font-bold text-text-4"}">Eliminar tipo</button>
						</span></td>
				</tr>`)}</tbody></table>`}`;
    });
    Competencias = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $competenciasConTipo, $$unsubscribe_competenciasConTipo;
      let $agregarCompetenciaModal, $$unsubscribe_agregarCompetenciaModal;
      let $editarCompetenciaModal, $$unsubscribe_editarCompetenciaModal;
      let $gestionarTiposCompetenciaModal, $$unsubscribe_gestionarTiposCompetenciaModal;
      $$unsubscribe_competenciasConTipo = subscribe(competenciasConTipo, (value) => $competenciasConTipo = value);
      let agregarCompetenciaModal = useModal();
      $$unsubscribe_agregarCompetenciaModal = subscribe(agregarCompetenciaModal, (value) => $agregarCompetenciaModal = value);
      let editarCompetenciaModal = useModal();
      $$unsubscribe_editarCompetenciaModal = subscribe(editarCompetenciaModal, (value) => $editarCompetenciaModal = value);
      let gestionarTiposCompetenciaModal = useModal();
      $$unsubscribe_gestionarTiposCompetenciaModal = subscribe(gestionarTiposCompetenciaModal, (value) => $gestionarTiposCompetenciaModal = value);
      let editingCompetenciaID;
      let editingCompetencia;
      let filterText;
      editingCompetencia = $competenciasConTipo.find((c) => c.id == editingCompetenciaID);
      $$unsubscribe_competenciasConTipo();
      $$unsubscribe_agregarCompetenciaModal();
      $$unsubscribe_editarCompetenciaModal();
      $$unsubscribe_gestionarTiposCompetenciaModal();
      return `${$agregarCompetenciaModal ? `${validate_component(Modal, "Modal").$$render($$result, {
        handleClose: agregarCompetenciaModal.closeModal
      }, {}, {
        default: () => `${validate_component(CompetenciaForm, "CompetenciaForm").$$render($$result, {}, {}, {})}`
      })}` : ``}

${$editarCompetenciaModal ? `${validate_component(Modal, "Modal").$$render($$result, {
        handleClose: editarCompetenciaModal.closeModal
      }, {}, {
        default: () => `${validate_component(CompetenciaForm, "CompetenciaForm").$$render($$result, {
          editingCompetenciaID: editingCompetencia?.id,
          form: {
            nombre: editingCompetencia?.nombre,
            id_tipo: editingCompetencia?.id_tipo
          },
          selectedTipoID: editingCompetencia?.id_tipo
        }, {}, {})}`
      })}` : ``}

${$gestionarTiposCompetenciaModal ? `${validate_component(Modal, "Modal").$$render($$result, {
        handleClose: gestionarTiposCompetenciaModal.closeModal
      }, {}, {
        default: () => `${validate_component(GestionTiposCompetencia, "GestionTiposCompetencia").$$render($$result, {}, {}, {})}`
      })}` : ``}

<header class="${"flex justify-between flex-wrap"}"><h2 class="${"heading"}">Tabla de Competencias</h2>
	<span class="${"flex gap-8 items-center"}"><button class="${"link primary"}">Gestionar tipos de competencias</button>
		<button class="${"btn primary"}">Agregar competencias
		</button></span></header>

<hr class="${"my-4 border-none"}">

<p class="${"label"}">Buscar competencia</p>
<input type="${"text"}"${add_attribute("value", filterText, 0)}>

<hr class="${"my-4 border-none"}">

${$competenciasConTipo.length == 0 ? `<p>No hay competencias registradas a\xFAn.</p>` : `<table id="${"table-diplomados"}" class="${"table-fixed table shadow-lg w-full"}"><thead><tr><th>Competencia</th>
				<th>Tipo</th>
				<th>...</th></tr></thead>
		<tbody class="${""}">${each(makeArraySearchable($competenciasConTipo, ["nombre"], filterText), (competencia) => `<tr><td>${escape(competencia.nombre)}</td>
					<td>${competencia.tipo ? `${escape(competencia.tipo.nombre)}` : `<p class="${"text text-text-4"}">Sin tipo</p>`}</td>
					<td><span class="${"flex gap-8 justify-center"}"><button class="${"link primary"}">Editar competencia</button>
							<button class="${"link"}">Eliminar competencia</button>
						</span></td>
				</tr>`)}</tbody></table>`}`;
    });
  }
});

// .svelte-kit/output/server/chunks/cursosConDiplomado-92710756.js
var cursosConDiplomado;
var init_cursosConDiplomado_92710756 = __esm({
  ".svelte-kit/output/server/chunks/cursosConDiplomado-92710756.js"() {
    init_shims();
    init_index_91f839fc();
    init_index_9d95a6a7();
    cursosConDiplomado = derived([db_cursos, db_diplomados], ([cursos, diplomados]) => cursos.map((c) => {
      const diplomadoDelCurso = diplomados.find((d) => d.id == c.id_diplomado);
      return {
        ...c,
        diplomado: diplomadoDelCurso
      };
    }));
  }
});

// .svelte-kit/output/server/chunks/index-33d0aa71.js
var index_33d0aa71_exports = {};
__export(index_33d0aa71_exports, {
  default: () => Cursos
});
var import_cookie11, CursoForm, GestionDiplomados, Cursos;
var init_index_33d0aa71 = __esm({
  ".svelte-kit/output/server/chunks/index-33d0aa71.js"() {
    init_shims();
    init_app_648d86f1();
    init_modal_8e58b549();
    init_index_9d95a6a7();
    init_cursosConDiplomado_92710756();
    init_prompts_dc3f6318();
    init_toasts_62f37240();
    init_useModal_0f7e070e();
    init_makeArraySearchable_f17ce08a();
    import_cookie11 = __toModule(require_cookie());
    init_index_91f839fc();
    CursoForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $db_diplomados, $$unsubscribe_db_diplomados;
      $$unsubscribe_db_diplomados = subscribe(db_diplomados, (value) => $db_diplomados = value);
      let { editingCursoID = void 0 } = $$props;
      let { form = {
        nombre: void 0,
        id_diplomado: void 0
      } } = $$props;
      let { selectedDiplomadoID = null } = $$props;
      if ($$props.editingCursoID === void 0 && $$bindings.editingCursoID && editingCursoID !== void 0)
        $$bindings.editingCursoID(editingCursoID);
      if ($$props.form === void 0 && $$bindings.form && form !== void 0)
        $$bindings.form(form);
      if ($$props.selectedDiplomadoID === void 0 && $$bindings.selectedDiplomadoID && selectedDiplomadoID !== void 0)
        $$bindings.selectedDiplomadoID(selectedDiplomadoID);
      $$unsubscribe_db_diplomados();
      return `<form class="${"flex flex-col max-w-xl w-screen gap-4"}"><header class="${"flex justify-between"}"><h2 class="${"heading"}">Curso</h2>
		${editingCursoID ? `<button class="${"btn primary"}">Editar curso</button>` : `<button class="${"btn primary"}">Guardar curso</button>`}</header>

	<div><p class="${"label"}">Nombre del curso</p>
		<input type="${"text"}" class="${"w-full"}" required${add_attribute("value", form.nombre, 0)}></div>

	<div><p class="${"label"}">Diplomado del curso</p>
		<select class="${"w-full"}"><option${add_attribute("value", null, 0)}>Sin diplomado</option>${each($db_diplomados, (diplomado) => `<option${add_attribute("value", diplomado.id, 0)}>${escape(diplomado.nombre)}</option>`)}</select></div></form>`;
    });
    GestionDiplomados = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $db_diplomados, $$unsubscribe_db_diplomados;
      $$unsubscribe_db_diplomados = subscribe(db_diplomados, (value) => $db_diplomados = value);
      let form = { nombre: void 0 };
      $$unsubscribe_db_diplomados();
      return `<form class="${"flex flex-col gap-4 w-screen max-w-xl"}"><header class="${"flex justify-between flex-wrap"}"><h2 class="${"heading"}">Diplomados</h2>
		${`<button class="${"btn primary"}">Agregar diplomado</button>`}</header>

	<label class="${"w-full"}"><p class="${"label"}">Nombre del diplomado</p>
		<input type="${"text"}" class="${"w-full"}" required${add_attribute("value", form.nombre, 0)}></label></form>

<hr class="${"my-4 border-none"}">

${$db_diplomados.length == 0 ? `<p>No hay diplomados a\xFAn.</p>` : `<table class="${"table-fixed table shadow-lg w-full max-w-xl"}"><thead><tr><th>Tipo de competencia</th>
				<th>...</th></tr></thead>
		<tbody class="${"max-h-60 overflow-auto"}">${each($db_diplomados, (diplomado) => `<tr><td>${escape(diplomado.nombre)}</td>
					<td><span class="${"flex gap-8 justify-center"}"><button class="${"font-bold text-accent"}">Editar diplomado</button>
							<button class="${"font-bold text-text-4"}">Eliminar diplomado</button>
						</span></td>
				</tr>`)}</tbody></table>`}`;
    });
    Cursos = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $cursosConDiplomado, $$unsubscribe_cursosConDiplomado;
      let $agregarCursoModal, $$unsubscribe_agregarCursoModal;
      let $editarCursoModal, $$unsubscribe_editarCursoModal;
      let $gestionarTiposCompetenciaModal, $$unsubscribe_gestionarTiposCompetenciaModal;
      $$unsubscribe_cursosConDiplomado = subscribe(cursosConDiplomado, (value) => $cursosConDiplomado = value);
      let agregarCursoModal = useModal();
      $$unsubscribe_agregarCursoModal = subscribe(agregarCursoModal, (value) => $agregarCursoModal = value);
      let editarCursoModal = useModal();
      $$unsubscribe_editarCursoModal = subscribe(editarCursoModal, (value) => $editarCursoModal = value);
      let gestionarTiposCompetenciaModal = useModal();
      $$unsubscribe_gestionarTiposCompetenciaModal = subscribe(gestionarTiposCompetenciaModal, (value) => $gestionarTiposCompetenciaModal = value);
      let editingCursoID;
      let editingCurso;
      let filterText;
      editingCurso = $cursosConDiplomado.find((c) => c.id == editingCursoID);
      $$unsubscribe_cursosConDiplomado();
      $$unsubscribe_agregarCursoModal();
      $$unsubscribe_editarCursoModal();
      $$unsubscribe_gestionarTiposCompetenciaModal();
      return `${$agregarCursoModal ? `${validate_component(Modal, "Modal").$$render($$result, {
        handleClose: agregarCursoModal.closeModal
      }, {}, {
        default: () => `${validate_component(CursoForm, "CursoForm").$$render($$result, {}, {}, {})}`
      })}` : ``}

${$editarCursoModal ? `${validate_component(Modal, "Modal").$$render($$result, { handleClose: editarCursoModal.closeModal }, {}, {
        default: () => `${validate_component(CursoForm, "CursoForm").$$render($$result, {
          editingCursoID: editingCurso?.id,
          form: {
            nombre: editingCurso?.nombre,
            id_diplomado: editingCurso?.id_diplomado
          },
          selectedDiplomadoID: editingCurso?.id_diplomado
        }, {}, {})}`
      })}` : ``}

${$gestionarTiposCompetenciaModal ? `${validate_component(Modal, "Modal").$$render($$result, {
        handleClose: gestionarTiposCompetenciaModal.closeModal
      }, {}, {
        default: () => `${validate_component(GestionDiplomados, "GestionDiplomados").$$render($$result, {}, {}, {})}`
      })}` : ``}

<header class="${"flex justify-between flex-wrap"}"><h2 class="${"heading"}">Tabla de Cursos</h2>
	<span class="${"flex gap-8 items-center"}"><button class="${"link primary"}">Gestionar Diplomados</button>
		<button class="${"btn primary"}">Agregar cursos
		</button></span></header>

<hr class="${"my-4 border-none"}">

<p class="${"label"}">Buscar un curso</p>
<input type="${"text"}"${add_attribute("value", filterText, 0)}>

<hr class="${"my-4 border-none"}">

${$cursosConDiplomado.length == 0 ? `<p>No hay cursos registrados a\xFAn.</p>` : `<table id="${"table-diplomados"}" class="${"table-fixed table shadow-lg w-full"}"><thead><tr><th>Curso</th>
				<th>Diplomado al que pertenece</th>
				<th>...</th></tr></thead>
		<tbody class="${""}">${each(makeArraySearchable($cursosConDiplomado, ["nombre"], filterText), (curso) => `<tr><td>${escape(curso.nombre)}</td>
					<td>${curso.diplomado ? `${escape(curso.diplomado.nombre)}` : `<p class="${"text text-text-4"}">Este curso no pertenece a ning\xFAn diplomado
							</p>`}</td>
					<td><span class="${"flex gap-8 justify-center"}"><button class="${"link primary"}">Editar curso</button>
							<button class="${"link"}">Eliminar curso</button>
						</span></td>
				</tr>`)}</tbody></table>`}`;
    });
  }
});

// .svelte-kit/output/server/chunks/coachesComoUsuario-f500f2a9.js
var coachesComoUsuarios;
var init_coachesComoUsuario_f500f2a9 = __esm({
  ".svelte-kit/output/server/chunks/coachesComoUsuario-f500f2a9.js"() {
    init_shims();
    init_index_91f839fc();
    init_index_9d95a6a7();
    coachesComoUsuarios = derived([db_usuarios, db_coaches], ([usuarios, coaches]) => coaches.map((c) => {
      const usuario = usuarios.find((u) => u.id == c.id_usuario);
      if (!usuario)
        return;
      return {
        ...usuario,
        id_coach: c.id
      };
    }).filter((c) => c != void 0));
  }
});

// .svelte-kit/output/server/chunks/docentesComoUsuario-dbf52d99.js
var docentesComoUsuarios;
var init_docentesComoUsuario_dbf52d99 = __esm({
  ".svelte-kit/output/server/chunks/docentesComoUsuario-dbf52d99.js"() {
    init_shims();
    init_index_91f839fc();
    init_index_9d95a6a7();
    docentesComoUsuarios = derived([db_usuarios, db_docentes], ([usuarios, docentes]) => docentes.map((c) => {
      const usuario = usuarios.find((u) => u.id == c.id_usuario);
      if (!usuario)
        return;
      return {
        ...usuario,
        id_docente: c.id
      };
    }).filter((c) => c != void 0));
  }
});

// .svelte-kit/output/server/chunks/index-d5283307.js
var index_d5283307_exports = {};
__export(index_d5283307_exports, {
  default: () => Coordinar_coaches
});
var import_cookie12, coachesConDocentes, GestionarDocentesEnCoaches, ListaDocentesAsignadosACoach, Coordinar_coaches;
var init_index_d5283307 = __esm({
  ".svelte-kit/output/server/chunks/index-d5283307.js"() {
    init_shims();
    init_app_648d86f1();
    init_modal_8e58b549();
    init_index_91f839fc();
    init_index_9d95a6a7();
    init_coachesComoUsuario_f500f2a9();
    init_docentesComoUsuario_dbf52d99();
    init_useModal_0f7e070e();
    init_makeArraySearchable_f17ce08a();
    init_toasts_62f37240();
    import_cookie12 = __toModule(require_cookie());
    coachesConDocentes = derived([coachesComoUsuarios, docentesComoUsuarios, db_docentesEnCoaches], ([coaches, docentes, docentesEnCoaches]) => coaches.map((c) => {
      const docentesEnEsteCoach = docentesEnCoaches.filter((r) => r.id_coach == c.id_coach);
      return {
        ...c,
        docentes: docentesEnEsteCoach.map((r) => {
          const docente = docentes.find((d) => d.id_docente == r.id_docente);
          if (!docente)
            return;
          return {
            ...docente,
            id_docenteEnCoach: r.id
          };
        }).filter((r) => r != void 0)
      };
    }));
    GestionarDocentesEnCoaches = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $docentesComoUsuarios, $$unsubscribe_docentesComoUsuarios;
      $$unsubscribe_docentesComoUsuarios = subscribe(docentesComoUsuarios, (value) => $docentesComoUsuarios = value);
      let filterText;
      let { coachID } = $$props;
      let { coachUserID } = $$props;
      let { docentesSeleccionados = [] } = $$props;
      let { docentesEnCoach = [] } = $$props;
      if ($$props.coachID === void 0 && $$bindings.coachID && coachID !== void 0)
        $$bindings.coachID(coachID);
      if ($$props.coachUserID === void 0 && $$bindings.coachUserID && coachUserID !== void 0)
        $$bindings.coachUserID(coachUserID);
      if ($$props.docentesSeleccionados === void 0 && $$bindings.docentesSeleccionados && docentesSeleccionados !== void 0)
        $$bindings.docentesSeleccionados(docentesSeleccionados);
      if ($$props.docentesEnCoach === void 0 && $$bindings.docentesEnCoach && docentesEnCoach !== void 0)
        $$bindings.docentesEnCoach(docentesEnCoach);
      $$unsubscribe_docentesComoUsuarios();
      return `<form class="${"flex flex-col max-w-xl w-screen gap-4"}">${$docentesComoUsuarios.length == 0 ? `<p>No hay docentes a\xFAn</p>` : `<header class="${"flex justify-between"}"><h2 class="${"heading"}">Coach</h2>
			<button class="${"btn primary"}">Asignar docentes a coach </button></header>

		<div><p class="${"label"}">Filtrar docentes</p>
			<input type="${"text"}"${add_attribute("value", filterText, 0)}></div>

		<p class="${"label"}">Selecciona docentes</p>
		<div class="${"flex flex-col gap-1 max-h-60 overflow-auto"}">${each(makeArraySearchable($docentesComoUsuarios.filter((d) => d.id != coachUserID), ["nombre", "apellido_paterno", "apellido_materno"], filterText), (docente) => `<label class="${"flex gap-2 items-center"}"><input type="${"checkbox"}"${add_attribute("value", docente.id_docente, 0)}${~docentesSeleccionados.indexOf(docente.id_docente) ? add_attribute("checked", true, 1) : ""}>
					${escape(docente.nombre)}
					${escape(docente.apellido_paterno)}
					${escape(docente.apellido_materno)}
				</label>`)}</div>`}</form>`;
    });
    ListaDocentesAsignadosACoach = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { docentes } = $$props;
      let filterText = "";
      if ($$props.docentes === void 0 && $$bindings.docentes && docentes !== void 0)
        $$bindings.docentes(docentes);
      return `<h2 class="${"heading"}">Lista de docentes</h2>

<hr class="${"my-2 border-none"}">

<div class="${"ml-auto"}"><p class="${"label"}">Buscar docente</p>
	<input type="${"text"}"${add_attribute("value", filterText, 0)}></div>

<hr class="${"mb-4 border-none"}">

${docentes ? `${docentes.length == 0 ? `<p class="${"text-text-4"}">Sin docentes asignados.</p>` : `<div class="${"flex flex-col gap-2"}">${each(makeArraySearchable(docentes, ["nombre", "apellido_paterno", "apellido_materno"], filterText), (docente) => `<div class="${"p-2 bg-neutral-100 rounded"}"><p class="${"label"}">${escape(docente.matricula)}</p>
					<p>${escape(docente.nombre)}
						${escape(docente.apellido_paterno)}
						${escape(docente.apellido_materno)}</p>
				</div>`)}</div>`}` : ``}`;
    });
    Coordinar_coaches = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $coachesConDocentes, $$unsubscribe_coachesConDocentes;
      let $gestionarDocentes, $$unsubscribe_gestionarDocentes;
      let $docentesAsignadosModal, $$unsubscribe_docentesAsignadosModal;
      $$unsubscribe_coachesConDocentes = subscribe(coachesConDocentes, (value) => $coachesConDocentes = value);
      let filterText;
      let editingCoachID;
      let editingCoach;
      let gestionarDocentes = useModal();
      $$unsubscribe_gestionarDocentes = subscribe(gestionarDocentes, (value) => $gestionarDocentes = value);
      let docentesAsignadosModal = useModal();
      $$unsubscribe_docentesAsignadosModal = subscribe(docentesAsignadosModal, (value) => $docentesAsignadosModal = value);
      let listaDocentesAsignados = [];
      editingCoach = $coachesConDocentes.find((c) => c.id_coach == editingCoachID);
      $$unsubscribe_coachesConDocentes();
      $$unsubscribe_gestionarDocentes();
      $$unsubscribe_docentesAsignadosModal();
      return `${$gestionarDocentes ? `${validate_component(Modal, "Modal").$$render($$result, {
        handleClose: gestionarDocentes.closeModal
      }, {}, {
        default: () => `${validate_component(GestionarDocentesEnCoaches, "GestionarDocentesEnCoaches").$$render($$result, {
          coachUserID: editingCoach?.id,
          coachID: editingCoach?.id_coach,
          docentesEnCoach: editingCoach?.docentes,
          docentesSeleccionados: editingCoach?.docentes.map((docente) => docente.id_docente)
        }, {}, {})}`
      })}` : ``}

${$docentesAsignadosModal ? `${validate_component(Modal, "Modal").$$render($$result, {
        handleClose: docentesAsignadosModal.closeModal
      }, {}, {
        default: () => `${validate_component(ListaDocentesAsignadosACoach, "ListaDocentesAsignadosACoach").$$render($$result, { docentes: listaDocentesAsignados }, {}, {})}`
      })}` : ``}

<h2 class="${"text-2xl font-bold"}">Coordinaci\xF3n de Coaches</h2>

<hr class="${"my-4 border-none"}">

<p class="${"leyenda text-text-4 text-xs"}">Buscar coach</p>
<input type="${"text"}"${add_attribute("value", filterText, 0)}>

<hr class="${"my-4 border-none"}">

<table id="${"table"}" class="${"table-fixed shadow-lg w-full"}"><thead><tr><th>Coach</th>
			<th>Docentes asignados</th>
			<th>...</th></tr></thead>
	<tbody class="${""}">${each(makeArraySearchable($coachesConDocentes, ["nombre", "apellido_paterno", "apellido_materno"], filterText), (coach) => `<tr><td><p>${escape(coach.nombre)}
						${escape(coach.apellido_paterno)}
						${escape(coach.apellido_materno)}
					</p></td>
				<td>${coach.docentes.length == 0 ? `<p class="${"text text-text-4"}">Sin docentes asignados</p>` : `<p>${escape(coach.docentes.length == 1 ? `${coach.docentes.length} docente asignado` : `${coach.docentes.length} docentes asignados`)}</p>
						<button class="${"link primary"}">Ver docentes asignados</button>`}</td>
				<td><span class="${"flex gap-8 justify-center"}"><button class="${"link primary"}">Gestionar docentes</button>
					</span></td>
			</tr>`)}</tbody></table>`;
    });
  }
});

// node_modules/dayjs/dayjs.min.js
var require_dayjs_min = __commonJS({
  "node_modules/dayjs/dayjs.min.js"(exports, module2) {
    init_shims();
    !function(t, e) {
      typeof exports == "object" && typeof module2 != "undefined" ? module2.exports = e() : typeof define == "function" && define.amd ? define(e) : (t = typeof globalThis != "undefined" ? globalThis : t || self).dayjs = e();
    }(exports, function() {
      "use strict";
      var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s2 = "minute", u = "hour", a = "day", o = "week", f = "month", h = "quarter", c = "year", d = "date", $ = "Invalid Date", l = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_") }, m = function(t2, e2, n2) {
        var r2 = String(t2);
        return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
      }, g = { s: m, z: function(t2) {
        var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
        return (e2 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
      }, m: function t2(e2, n2) {
        if (e2.date() < n2.date())
          return -t2(n2, e2);
        var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, f), s3 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s3 ? -1 : 1), f);
        return +(-(r2 + (n2 - i2) / (s3 ? i2 - u2 : u2 - i2)) || 0);
      }, a: function(t2) {
        return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
      }, p: function(t2) {
        return { M: f, y: c, w: o, d: a, D: d, h: u, m: s2, s: i, ms: r, Q: h }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
      }, u: function(t2) {
        return t2 === void 0;
      } }, D = "en", v = {};
      v[D] = M;
      var p = function(t2) {
        return t2 instanceof _;
      }, S = function(t2, e2, n2) {
        var r2;
        if (!t2)
          return D;
        if (typeof t2 == "string")
          v[t2] && (r2 = t2), e2 && (v[t2] = e2, r2 = t2);
        else {
          var i2 = t2.name;
          v[i2] = t2, r2 = i2;
        }
        return !n2 && r2 && (D = r2), r2 || !n2 && D;
      }, w = function(t2, e2) {
        if (p(t2))
          return t2.clone();
        var n2 = typeof e2 == "object" ? e2 : {};
        return n2.date = t2, n2.args = arguments, new _(n2);
      }, O = g;
      O.l = S, O.i = p, O.w = function(t2, e2) {
        return w(t2, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
      };
      var _ = function() {
        function M2(t2) {
          this.$L = S(t2.locale, null, true), this.parse(t2);
        }
        var m2 = M2.prototype;
        return m2.parse = function(t2) {
          this.$d = function(t3) {
            var e2 = t3.date, n2 = t3.utc;
            if (e2 === null)
              return new Date(NaN);
            if (O.u(e2))
              return new Date();
            if (e2 instanceof Date)
              return new Date(e2);
            if (typeof e2 == "string" && !/Z$/i.test(e2)) {
              var r2 = e2.match(l);
              if (r2) {
                var i2 = r2[2] - 1 || 0, s3 = (r2[7] || "0").substring(0, 3);
                return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s3)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s3);
              }
            }
            return new Date(e2);
          }(t2), this.$x = t2.x || {}, this.init();
        }, m2.init = function() {
          var t2 = this.$d;
          this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
        }, m2.$utils = function() {
          return O;
        }, m2.isValid = function() {
          return !(this.$d.toString() === $);
        }, m2.isSame = function(t2, e2) {
          var n2 = w(t2);
          return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
        }, m2.isAfter = function(t2, e2) {
          return w(t2) < this.startOf(e2);
        }, m2.isBefore = function(t2, e2) {
          return this.endOf(e2) < w(t2);
        }, m2.$g = function(t2, e2, n2) {
          return O.u(t2) ? this[e2] : this.set(n2, t2);
        }, m2.unix = function() {
          return Math.floor(this.valueOf() / 1e3);
        }, m2.valueOf = function() {
          return this.$d.getTime();
        }, m2.startOf = function(t2, e2) {
          var n2 = this, r2 = !!O.u(e2) || e2, h2 = O.p(t2), $2 = function(t3, e3) {
            var i2 = O.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
            return r2 ? i2 : i2.endOf(a);
          }, l2 = function(t3, e3) {
            return O.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
          }, y2 = this.$W, M3 = this.$M, m3 = this.$D, g2 = "set" + (this.$u ? "UTC" : "");
          switch (h2) {
            case c:
              return r2 ? $2(1, 0) : $2(31, 11);
            case f:
              return r2 ? $2(1, M3) : $2(0, M3 + 1);
            case o:
              var D2 = this.$locale().weekStart || 0, v2 = (y2 < D2 ? y2 + 7 : y2) - D2;
              return $2(r2 ? m3 - v2 : m3 + (6 - v2), M3);
            case a:
            case d:
              return l2(g2 + "Hours", 0);
            case u:
              return l2(g2 + "Minutes", 1);
            case s2:
              return l2(g2 + "Seconds", 2);
            case i:
              return l2(g2 + "Milliseconds", 3);
            default:
              return this.clone();
          }
        }, m2.endOf = function(t2) {
          return this.startOf(t2, false);
        }, m2.$set = function(t2, e2) {
          var n2, o2 = O.p(t2), h2 = "set" + (this.$u ? "UTC" : ""), $2 = (n2 = {}, n2[a] = h2 + "Date", n2[d] = h2 + "Date", n2[f] = h2 + "Month", n2[c] = h2 + "FullYear", n2[u] = h2 + "Hours", n2[s2] = h2 + "Minutes", n2[i] = h2 + "Seconds", n2[r] = h2 + "Milliseconds", n2)[o2], l2 = o2 === a ? this.$D + (e2 - this.$W) : e2;
          if (o2 === f || o2 === c) {
            var y2 = this.clone().set(d, 1);
            y2.$d[$2](l2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
          } else
            $2 && this.$d[$2](l2);
          return this.init(), this;
        }, m2.set = function(t2, e2) {
          return this.clone().$set(t2, e2);
        }, m2.get = function(t2) {
          return this[O.p(t2)]();
        }, m2.add = function(r2, h2) {
          var d2, $2 = this;
          r2 = Number(r2);
          var l2 = O.p(h2), y2 = function(t2) {
            var e2 = w($2);
            return O.w(e2.date(e2.date() + Math.round(t2 * r2)), $2);
          };
          if (l2 === f)
            return this.set(f, this.$M + r2);
          if (l2 === c)
            return this.set(c, this.$y + r2);
          if (l2 === a)
            return y2(1);
          if (l2 === o)
            return y2(7);
          var M3 = (d2 = {}, d2[s2] = e, d2[u] = n, d2[i] = t, d2)[l2] || 1, m3 = this.$d.getTime() + r2 * M3;
          return O.w(m3, this);
        }, m2.subtract = function(t2, e2) {
          return this.add(-1 * t2, e2);
        }, m2.format = function(t2) {
          var e2 = this, n2 = this.$locale();
          if (!this.isValid())
            return n2.invalidDate || $;
          var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = O.z(this), s3 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, f2 = n2.months, h2 = function(t3, n3, i3, s4) {
            return t3 && (t3[n3] || t3(e2, r2)) || i3[n3].substr(0, s4);
          }, c2 = function(t3) {
            return O.s(s3 % 12 || 12, t3, "0");
          }, d2 = n2.meridiem || function(t3, e3, n3) {
            var r3 = t3 < 12 ? "AM" : "PM";
            return n3 ? r3.toLowerCase() : r3;
          }, l2 = { YY: String(this.$y).slice(-2), YYYY: this.$y, M: a2 + 1, MM: O.s(a2 + 1, 2, "0"), MMM: h2(n2.monthsShort, a2, f2, 3), MMMM: h2(f2, a2), D: this.$D, DD: O.s(this.$D, 2, "0"), d: String(this.$W), dd: h2(n2.weekdaysMin, this.$W, o2, 2), ddd: h2(n2.weekdaysShort, this.$W, o2, 3), dddd: o2[this.$W], H: String(s3), HH: O.s(s3, 2, "0"), h: c2(1), hh: c2(2), a: d2(s3, u2, true), A: d2(s3, u2, false), m: String(u2), mm: O.s(u2, 2, "0"), s: String(this.$s), ss: O.s(this.$s, 2, "0"), SSS: O.s(this.$ms, 3, "0"), Z: i2 };
          return r2.replace(y, function(t3, e3) {
            return e3 || l2[t3] || i2.replace(":", "");
          });
        }, m2.utcOffset = function() {
          return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, m2.diff = function(r2, d2, $2) {
          var l2, y2 = O.p(d2), M3 = w(r2), m3 = (M3.utcOffset() - this.utcOffset()) * e, g2 = this - M3, D2 = O.m(this, M3);
          return D2 = (l2 = {}, l2[c] = D2 / 12, l2[f] = D2, l2[h] = D2 / 3, l2[o] = (g2 - m3) / 6048e5, l2[a] = (g2 - m3) / 864e5, l2[u] = g2 / n, l2[s2] = g2 / e, l2[i] = g2 / t, l2)[y2] || g2, $2 ? D2 : O.a(D2);
        }, m2.daysInMonth = function() {
          return this.endOf(f).$D;
        }, m2.$locale = function() {
          return v[this.$L];
        }, m2.locale = function(t2, e2) {
          if (!t2)
            return this.$L;
          var n2 = this.clone(), r2 = S(t2, e2, true);
          return r2 && (n2.$L = r2), n2;
        }, m2.clone = function() {
          return O.w(this.$d, this);
        }, m2.toDate = function() {
          return new Date(this.valueOf());
        }, m2.toJSON = function() {
          return this.isValid() ? this.toISOString() : null;
        }, m2.toISOString = function() {
          return this.$d.toISOString();
        }, m2.toString = function() {
          return this.$d.toUTCString();
        }, M2;
      }(), b = _.prototype;
      return w.prototype = b, [["$ms", r], ["$s", i], ["$m", s2], ["$H", u], ["$W", a], ["$M", f], ["$y", c], ["$D", d]].forEach(function(t2) {
        b[t2[1]] = function(e2) {
          return this.$g(e2, t2[0], t2[1]);
        };
      }), w.extend = function(t2, e2) {
        return t2.$i || (t2(e2, _, w), t2.$i = true), w;
      }, w.locale = S, w.isDayjs = p, w.unix = function(t2) {
        return w(1e3 * t2);
      }, w.en = v[D], w.Ls = v, w.p = {}, w;
    });
  }
});

// .svelte-kit/output/server/chunks/formatDate-799184b4.js
var import_dayjs, SearchableInput, formatDate;
var init_formatDate_799184b4 = __esm({
  ".svelte-kit/output/server/chunks/formatDate-799184b4.js"() {
    init_shims();
    init_app_648d86f1();
    import_dayjs = __toModule(require_dayjs_min());
    SearchableInput = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { selected = null } = $$props;
      let { listToSearch } = $$props;
      let { searchFields } = $$props;
      let { isRequired = false } = $$props;
      let { valueKey = "id" } = $$props;
      let { displayRelative = false } = $$props;
      let filterText = selected ? searchFields.map((f) => {
        let foundItem = listToSearch.find((item) => item[valueKey] == selected);
        if (foundItem)
          return foundItem[f];
      }).join(" ") : void 0;
      if ($$props.selected === void 0 && $$bindings.selected && selected !== void 0)
        $$bindings.selected(selected);
      if ($$props.listToSearch === void 0 && $$bindings.listToSearch && listToSearch !== void 0)
        $$bindings.listToSearch(listToSearch);
      if ($$props.searchFields === void 0 && $$bindings.searchFields && searchFields !== void 0)
        $$bindings.searchFields(searchFields);
      if ($$props.isRequired === void 0 && $$bindings.isRequired && isRequired !== void 0)
        $$bindings.isRequired(isRequired);
      if ($$props.valueKey === void 0 && $$bindings.valueKey && valueKey !== void 0)
        $$bindings.valueKey(valueKey);
      if ($$props.displayRelative === void 0 && $$bindings.displayRelative && displayRelative !== void 0)
        $$bindings.displayRelative(displayRelative);
      return `<div class="${"relative h-[34px]"}"><select class="${"absolute opacity-0"}" ${isRequired ? "required" : ""}${add_attribute("value", selected ? 1 : void 0, 0)}${add_attribute("tabindex", -1, 0)}><option value="${""}"></option><option${add_attribute("value", 1, 0)}></option></select>

	<input class="${["w-full absolute border ", selected ? "bg-neutral-200" : ""].join(" ").trim()}" placeholder="${"Escriba para buscar..."}" type="${"search"}"${add_attribute("value", filterText, 0)}></div>


${``}
`;
    });
    formatDate = (date, short = false) => (0, import_dayjs.default)(date).format(short ? "DD/MM/YYYY" : "DD/MM/YYYY [a las] hh:mm a");
  }
});

// .svelte-kit/output/server/chunks/usuariosConRoles-0654214b.js
var usuariosConRoles;
var init_usuariosConRoles_0654214b = __esm({
  ".svelte-kit/output/server/chunks/usuariosConRoles-0654214b.js"() {
    init_shims();
    init_index_91f839fc();
    init_index_9d95a6a7();
    usuariosConRoles = derived([
      db_usuarios,
      db_docentes,
      db_coaches,
      db_instructores,
      db_coordinadores,
      db_administrativos
    ], ([
      usuarios,
      docentes,
      coaches,
      instructores,
      coordinadores,
      administrativos
    ]) => usuarios.map((u) => {
      let foundRoles = [];
      let docente = docentes.find((a) => a.id_usuario == u.id);
      let coach = coaches.find((a) => a.id_usuario == u.id);
      let instructor = instructores.find((a) => a.id_usuario == u.id);
      let coordinador = coordinadores.find((a) => a.id_usuario == u.id);
      let administrativo = administrativos.find((a) => a.id_usuario == u.id);
      if (docente)
        foundRoles.push({
          id: docente.id,
          rol: "docente"
        });
      if (coach)
        foundRoles.push({
          id: coach.id,
          rol: "coach"
        });
      if (instructor)
        foundRoles.push({
          id: instructor.id,
          rol: "instructor"
        });
      if (coordinador)
        foundRoles.push({
          id: coordinador.id,
          rol: "coordinador"
        });
      if (administrativo)
        foundRoles.push({
          id: administrativo.id,
          rol: "administrativo"
        });
      return {
        ...u,
        roles: foundRoles
      };
    }));
  }
});

// .svelte-kit/output/server/chunks/index-388a53b1.js
var index_388a53b1_exports = {};
__export(index_388a53b1_exports, {
  default: () => Gestion_registros
});
var import_dayjs2, import_cookie13, coordinadoresComoUsuario, registrosCompetenciaConAcreditor, registrosCursoConAcreditor, registrosDiplomadoConAcreditor, registrosAcreditaciones, RegistroForm, Gestion_registros;
var init_index_388a53b1 = __esm({
  ".svelte-kit/output/server/chunks/index-388a53b1.js"() {
    init_shims();
    init_app_648d86f1();
    init_modal_8e58b549();
    init_index_9d95a6a7();
    init_index_91f839fc();
    init_docentesComoUsuario_dbf52d99();
    init_competenciasConTipo_85cbff0e();
    init_cursosConDiplomado_92710756();
    init_prompts_dc3f6318();
    init_useModal_0f7e070e();
    init_stores_bc5c9a0c();
    init_formatDate_799184b4();
    init_usuariosConRoles_0654214b();
    init_toasts_62f37240();
    import_dayjs2 = __toModule(require_dayjs_min());
    import_cookie13 = __toModule(require_cookie());
    coordinadoresComoUsuario = derived([db_usuarios, db_coordinadores], ([usuarios, coordinadores]) => coordinadores.map((c) => {
      const usuario = usuarios.find((u) => u.id == c.id_usuario);
      if (!usuario)
        return;
      return {
        ...usuario,
        id_coordinador: c.id
      };
    }).filter((c) => c != void 0));
    registrosCompetenciaConAcreditor = derived([
      db_registrosCompetencias,
      competenciasConTipo,
      docentesComoUsuarios,
      coordinadoresComoUsuario
    ], ([registrosDiplomados, competencias, docentes, coordinadores]) => registrosDiplomados.map((r) => {
      let competenciaDelRegistro = competencias.find((c) => c.id == r.id_competencia);
      let acreditorDelRegistro = docentes.find((d) => d.id_docente == r.id_acreditor);
      let expeditorDelRegistro = coordinadores.find((c) => c.id == r.id_expeditor);
      if (!(competenciaDelRegistro && acreditorDelRegistro && expeditorDelRegistro))
        return;
      return {
        ...r,
        competencia: competenciaDelRegistro,
        acreditor: acreditorDelRegistro,
        expeditor: expeditorDelRegistro
      };
    }).filter((r) => r != void 0));
    registrosCursoConAcreditor = derived([
      db_registrosCursos,
      cursosConDiplomado,
      docentesComoUsuarios,
      coordinadoresComoUsuario
    ], ([registrosCursos, cursos, docentes, coordinadores]) => registrosCursos.map((r) => {
      let cursoDelRegistro = cursos.find((c) => c.id == r.id_curso);
      let acreditorDelRegistro = docentes.find((d) => d.id_docente == r.id_acreditor);
      let expeditorDelRegistro = coordinadores.find((c) => c.id == r.id_expeditor);
      if (!(cursoDelRegistro && acreditorDelRegistro && expeditorDelRegistro))
        return;
      return {
        ...r,
        curso: cursoDelRegistro,
        acreditor: acreditorDelRegistro,
        expeditor: expeditorDelRegistro
      };
    }).filter((r) => r != void 0));
    registrosDiplomadoConAcreditor = derived([
      db_registrosDiplomados,
      db_diplomados,
      docentesComoUsuarios,
      coordinadoresComoUsuario
    ], ([registrosDiplomados, diplomados, docentes, coordinadores]) => registrosDiplomados.map((r) => {
      let diplomadoDelRegistro = diplomados.find((d) => d.id == r.id_diplomado);
      let acreditorDelRegistro = docentes.find((d) => d.id_docente == r.id_acreditor);
      let expeditorDelRegistro = coordinadores.find((c) => c.id == r.id_expeditor);
      if (!(diplomadoDelRegistro && acreditorDelRegistro && expeditorDelRegistro))
        return;
      return {
        ...r,
        diplomado: diplomadoDelRegistro,
        acreditor: acreditorDelRegistro,
        expeditor: expeditorDelRegistro
      };
    }).filter((r) => r != void 0));
    registrosAcreditaciones = derived([
      registrosCursoConAcreditor,
      registrosCompetenciaConAcreditor,
      registrosDiplomadoConAcreditor
    ], ([cursos, competencias, diplomados]) => [
      ...cursos.map((c) => ({ ...c, tipo: "curso" })),
      ...competencias.map((c) => ({ ...c, tipo: "competencia" })),
      ...diplomados.map((d) => ({ ...d, tipo: "diplomado" }))
    ]);
    RegistroForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $session, $$unsubscribe_session;
      let $db_coordinadores, $$unsubscribe_db_coordinadores;
      let $docentesComoUsuarios, $$unsubscribe_docentesComoUsuarios;
      let $$unsubscribe_db_cursos;
      let $$unsubscribe_db_diplomados;
      let $$unsubscribe_db_competencias;
      $$unsubscribe_session = subscribe(session, (value) => $session = value);
      $$unsubscribe_db_coordinadores = subscribe(db_coordinadores, (value) => $db_coordinadores = value);
      $$unsubscribe_docentesComoUsuarios = subscribe(docentesComoUsuarios, (value) => $docentesComoUsuarios = value);
      $$unsubscribe_db_cursos = subscribe(db_cursos, (value) => value);
      $$unsubscribe_db_diplomados = subscribe(db_diplomados, (value) => value);
      $$unsubscribe_db_competencias = subscribe(db_competencias, (value) => value);
      let docenteSeleccionado;
      let $$settled;
      let $$rendered;
      do {
        $$settled = true;
        $db_coordinadores.find((c) => c.id == $session.user.id)?.id;
        $$rendered = `<form class="${"flex flex-col max-w-xl w-screen gap-4"}"><header class="${"flex justify-between"}"><h2 class="${"heading"}">Acreditaci\xF3n</h2>
		${`<button class="${"btn primary"}">Guardar Acreditaci\xF3n</button>`}</header>

	<div class="${"input-group"}"><p class="${"label"}">Selecciona un acreditor</p>
		${validate_component(SearchableInput, "SearchableInput").$$render($$result, {
          listToSearch: $docentesComoUsuarios,
          searchFields: ["nombre", "apellido_paterno", "apellido_materno"],
          valueKey: "id_docente",
          isRequired: true,
          selected: docenteSeleccionado
        }, {
          selected: ($$value) => {
            docenteSeleccionado = $$value;
            $$settled = false;
          }
        }, {})}</div>

	<div><p class="${"label"}">Tipo de acreditacion</p>
		<select required><option${add_attribute("value", void 0, 0)} disabled>Selecciona uno</option><option value="${"curso"}">Curso</option><option value="${"diplomado"}">Diplomado</option><option value="${"competencia"}">Competencia</option></select></div>

	<div class="${"input-group"}">${`${`${``}`}`}</div></form>`;
      } while (!$$settled);
      $$unsubscribe_session();
      $$unsubscribe_db_coordinadores();
      $$unsubscribe_docentesComoUsuarios();
      $$unsubscribe_db_cursos();
      $$unsubscribe_db_diplomados();
      $$unsubscribe_db_competencias();
      return $$rendered;
    });
    Gestion_registros = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $agregarRegistroForm, $$unsubscribe_agregarRegistroForm;
      let $editarRegistroForm, $$unsubscribe_editarRegistroForm;
      let $registrosAcreditaciones, $$unsubscribe_registrosAcreditaciones;
      $$unsubscribe_registrosAcreditaciones = subscribe(registrosAcreditaciones, (value) => $registrosAcreditaciones = value);
      let filterText;
      let filterFunction;
      let filterGroupFunction;
      let filterGroup = [];
      let orderFunction;
      const agregarRegistroForm = useModal();
      $$unsubscribe_agregarRegistroForm = subscribe(agregarRegistroForm, (value) => $agregarRegistroForm = value);
      const editarRegistroForm = useModal();
      $$unsubscribe_editarRegistroForm = subscribe(editarRegistroForm, (value) => $editarRegistroForm = value);
      {
        if (filterGroup.length > 0) {
          filterGroupFunction = (registro) => filterGroup.includes(registro.tipo);
        } else {
          filterGroupFunction = (registro) => true;
        }
      }
      {
        {
          {
            orderFunction = (a, b) => (0, import_dayjs2.default)(a.fecha_expedicion).isAfter(b.fecha_expedicion) ? -1 : 1;
          }
        }
      }
      {
        {
          {
            filterFunction = (r) => true;
          }
        }
      }
      $$unsubscribe_agregarRegistroForm();
      $$unsubscribe_editarRegistroForm();
      $$unsubscribe_registrosAcreditaciones();
      return `${$agregarRegistroForm ? `${validate_component(Modal, "Modal").$$render($$result, {
        handleClose: agregarRegistroForm.closeModal
      }, {}, {
        default: () => `${validate_component(RegistroForm, "RegistroForm").$$render($$result, {}, {}, {})}`
      })}` : ``}

${$editarRegistroForm ? `${validate_component(Modal, "Modal").$$render($$result, {
        handleClose: editarRegistroForm.closeModal
      }, {}, {
        default: () => `${validate_component(RegistroForm, "RegistroForm").$$render($$result, {}, {}, {})}`
      })}` : ``}

<header class="${"flex justify-between flex-wrap"}"><h2 class="${"heading"}">Registros de acreditaciones</h2>
	<button class="${"btn primary"}">Agregar registros
	</button></header>

<hr class="${"my-4 border-none"}">

<p class="${"label"}">Buscar usuario en los registros</p>
<input type="${"text"}"${add_attribute("value", filterText, 0)}>

<hr class="${"my-4 border-none"}">

<div class="${"flex justify-between"}"><div><p class="${"label"}">Filtrar registros por</p>
		<div class="${"flex gap-4 flex-wrap"}"><label class="${"flex gap-1 items-center"}"><input type="${"checkbox"}" value="${"curso"}"${~filterGroup.indexOf("curso") ? add_attribute("checked", true, 1) : ""}>
				Cursos
			</label>
			<label class="${"flex gap-1 items-center"}"><input type="${"checkbox"}" value="${"diplomado"}"${~filterGroup.indexOf("diplomado") ? add_attribute("checked", true, 1) : ""}>
				Diplomados
			</label>
			<label class="${"flex gap-1 items-center"}"><input type="${"checkbox"}" value="${"competencia"}"${~filterGroup.indexOf("competencia") ? add_attribute("checked", true, 1) : ""}>
				Competencias
			</label></div></div>
	<div><p class="${"label"}">Ordenar por</p>
		<div class="${"flex gap-8"}"><button class="${["link", "primary"].join(" ").trim()}">M\xE1s recientes</button>
			/
			<button class="${["link", ""].join(" ").trim()}">M\xE1s antiguas</button></div></div></div>

<hr class="${"my-4 border-none"}">

<table id="${"table"}" class="${"table-fixed table shadow-lg w-full"}"><thead><tr><th>Acreditaci\xF3n</th>
			<th>Acreditor</th>
			<th>Expeditor</th>
			<th class="${"w-48"}">Fecha de expedici\xF3n</th>
			<th>...</th></tr></thead>
	<tbody class="${""}">${each($registrosAcreditaciones.sort(orderFunction).filter(filterFunction).filter(filterGroupFunction), (registro, i) => `<tr><td>${registro.tipo == "curso" ? `<p class="${"label"}">Curso - ${escape(registro.curso.diplomado?.nombre || "sin diplomado")}</p>
						<p>${escape(registro.curso.nombre)}</p>` : `${registro.tipo == "diplomado" ? `<p class="${"label"}">Diplomado</p>
						<p>${escape(registro.diplomado.nombre)}</p>` : `${registro.tipo == "competencia" ? `<p class="${"label"}">Competencia - ${escape(registro.competencia.tipo?.nombre || "sin tipo")}</p>
						<p>Competencia ${escape(registro.competencia.nombre)}</p>` : ``}`}`}</td>
				<td>${escape(registro.acreditor.nombre)}
					${escape(registro.acreditor.apellido_paterno)}
					${escape(registro.acreditor.apellido_materno)}</td>
				<td>${escape(registro.expeditor.nombre)}
					${escape(registro.expeditor.apellido_paterno)}
					${escape(registro.expeditor.apellido_materno)}</td>
				<td>${escape(formatDate(registro.fecha_expedicion))}</td>
				<td><span class="${"flex gap-8 justify-center"}"><button class="${"link"}">Eliminar registro</button>
					</span></td>
			</tr>`)}</tbody></table>`;
    });
  }
});

// .svelte-kit/output/server/chunks/cursosEnJornadaConInstructorConCurso-cb560969.js
var instructoresComoUsuario, cursosEnJornadaConInstructorConCurso;
var init_cursosEnJornadaConInstructorConCurso_cb560969 = __esm({
  ".svelte-kit/output/server/chunks/cursosEnJornadaConInstructorConCurso-cb560969.js"() {
    init_shims();
    init_index_9d95a6a7();
    init_index_91f839fc();
    init_cursosConDiplomado_92710756();
    instructoresComoUsuario = derived([db_usuarios, db_instructores], ([usuarios, instructores]) => instructores.map((c) => {
      const usuario = usuarios.find((u) => u.id == c.id_usuario);
      if (!usuario)
        return;
      return {
        ...usuario,
        id_instructor: c.id
      };
    }).filter((c) => c != void 0));
    cursosEnJornadaConInstructorConCurso = derived([
      db_cursosEnJornada,
      db_jornadas,
      cursosConDiplomado,
      instructoresComoUsuario
    ], ([cursosEnJornada, jornadas, cursos, instructores]) => cursosEnJornada.map((cJ) => {
      let jornadaDelCursoEnJornada = jornadas.find((j) => j.id == cJ.id_jornada);
      let cursoDelCursoEnJornada = cursos.find((c) => c.id == cJ.id_curso);
      let instructorDelCursoEnJornada = instructores.find((i) => i.id_instructor == cJ.id_instructor);
      if (!(jornadaDelCursoEnJornada && cursoDelCursoEnJornada))
        return;
      return {
        ...cJ,
        curso: cursoDelCursoEnJornada,
        instructor: instructorDelCursoEnJornada,
        jornada: jornadaDelCursoEnJornada
      };
    }).filter((cJ) => cJ != void 0));
  }
});

// .svelte-kit/output/server/chunks/asistentesEnCursoConfirmados-099159a6.js
var asistentesEnCursoConfirmados;
var init_asistentesEnCursoConfirmados_099159a6 = __esm({
  ".svelte-kit/output/server/chunks/asistentesEnCursoConfirmados-099159a6.js"() {
    init_shims();
    init_index_91f839fc();
    init_docentesComoUsuario_dbf52d99();
    init_index_9d95a6a7();
    asistentesEnCursoConfirmados = derived([db_asistentesEnCurso, docentesComoUsuarios], ([asistentes, docentes]) => asistentes.map((a) => {
      const docenteAsistente = docentes.find((d) => d.id_docente == a.id_docente);
      if (!docenteAsistente)
        return;
      return {
        ...a,
        docente: docenteAsistente
      };
    }).filter((a) => a != void 0));
  }
});

// .svelte-kit/output/server/chunks/cursosEnJornadaConAsistentes-c73643ab.js
var cursosEnJornadaConAsistentes;
var init_cursosEnJornadaConAsistentes_c73643ab = __esm({
  ".svelte-kit/output/server/chunks/cursosEnJornadaConAsistentes-c73643ab.js"() {
    init_shims();
    init_index_91f839fc();
    init_cursosEnJornadaConInstructorConCurso_cb560969();
    init_docentesComoUsuario_dbf52d99();
    init_asistentesEnCursoConfirmados_099159a6();
    cursosEnJornadaConAsistentes = derived([cursosEnJornadaConInstructorConCurso, asistentesEnCursoConfirmados], ([cursosJornada, asistentes]) => cursosJornada.map((cJ) => {
      return {
        ...cJ,
        asistentes: asistentes.filter((a) => a.id_cursojornada == cJ.id)
      };
    }));
  }
});

// .svelte-kit/output/server/chunks/index-520f7598.js
var index_520f7598_exports = {};
__export(index_520f7598_exports, {
  default: () => Gestion_jornadas
});
var import_dayjs3, import_cookie14, CursoJornadaForm, format2, DateInput, GestionJornadas, jornadaSeleccionada, ListaAsistentes, Gestion_jornadas;
var init_index_520f7598 = __esm({
  ".svelte-kit/output/server/chunks/index-520f7598.js"() {
    init_shims();
    init_app_648d86f1();
    init_modal_8e58b549();
    init_index_9d95a6a7();
    init_cursosEnJornadaConAsistentes_c73643ab();
    init_prompts_dc3f6318();
    init_toasts_62f37240();
    init_useModal_0f7e070e();
    init_formatDate_799184b4();
    init_competenciasConTipo_85cbff0e();
    init_cursosConDiplomado_92710756();
    init_docentesComoUsuario_dbf52d99();
    init_cursosEnJornadaConInstructorConCurso_cb560969();
    init_usuariosConRoles_0654214b();
    import_dayjs3 = __toModule(require_dayjs_min());
    init_index_91f839fc();
    init_makeArraySearchable_f17ce08a();
    import_cookie14 = __toModule(require_cookie());
    init_asistentesEnCursoConfirmados_099159a6();
    CursoJornadaForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $cursosConDiplomado, $$unsubscribe_cursosConDiplomado;
      let $instructoresComoUsuario, $$unsubscribe_instructoresComoUsuario;
      $$unsubscribe_cursosConDiplomado = subscribe(cursosConDiplomado, (value) => $cursosConDiplomado = value);
      $$unsubscribe_instructoresComoUsuario = subscribe(instructoresComoUsuario, (value) => $instructoresComoUsuario = value);
      let { editingCursoJornada = void 0 } = $$props;
      let { jornadaPertenecienteID } = $$props;
      let { instructorSeleccionado = null } = $$props;
      let { estadoDelCurso = 0 } = $$props;
      let { form = {
        cupo_maximo: void 0,
        id_curso: void 0
      } } = $$props;
      if ($$props.editingCursoJornada === void 0 && $$bindings.editingCursoJornada && editingCursoJornada !== void 0)
        $$bindings.editingCursoJornada(editingCursoJornada);
      if ($$props.jornadaPertenecienteID === void 0 && $$bindings.jornadaPertenecienteID && jornadaPertenecienteID !== void 0)
        $$bindings.jornadaPertenecienteID(jornadaPertenecienteID);
      if ($$props.instructorSeleccionado === void 0 && $$bindings.instructorSeleccionado && instructorSeleccionado !== void 0)
        $$bindings.instructorSeleccionado(instructorSeleccionado);
      if ($$props.estadoDelCurso === void 0 && $$bindings.estadoDelCurso && estadoDelCurso !== void 0)
        $$bindings.estadoDelCurso(estadoDelCurso);
      if ($$props.form === void 0 && $$bindings.form && form !== void 0)
        $$bindings.form(form);
      let $$settled;
      let $$rendered;
      do {
        $$settled = true;
        $$rendered = `<form class="${"flex flex-col max-w-xl w-screen gap-4"}"><header class="${"flex justify-between"}"><h2 class="${"heading"}">Curso</h2>
		${editingCursoJornada ? `<button class="${"btn primary"}">Editar curso</button>` : `<button class="${"btn primary"}">Guardar curso</button>`}</header>

	${editingCursoJornada ? `<div><p class="${"label"}">Estado del curso</p>
			<div class="${"flex gap-8"}"><label class="${"flex gap-2 items-center"}"><input type="${"radio"}"${add_attribute("value", 0, 0)} required${estadoDelCurso === 0 ? add_attribute("checked", true, 1) : ""}>
					En progreso
				</label>
				<label class="${"flex gap-2 items-center"}"><input type="${"radio"}"${add_attribute("value", 1, 0)} required${estadoDelCurso === 1 ? add_attribute("checked", true, 1) : ""}>
					Cerrado
				</label></div></div>` : ``}

	<div class="${"input-group"}"><p class="${"label"}">Cupo del curso</p>
		<input type="${"number"}" required min="${"1"}"${add_attribute("value", form.cupo_maximo, 0)}></div>

	<div class="${"input-group"}"><p class="${"label"}">Selecciona un curso</p>
		${validate_component(SearchableInput, "SearchableInput").$$render($$result, {
          listToSearch: $cursosConDiplomado,
          searchFields: ["nombre"],
          valueKey: "id",
          isRequired: true,
          selected: form.id_curso
        }, {
          selected: ($$value) => {
            form.id_curso = $$value;
            $$settled = false;
          }
        }, {})}</div>

	<div class="${"input-group"}"><p class="${"label"}">Selecciona un instructor (opcional)</p>
		${validate_component(SearchableInput, "SearchableInput").$$render($$result, {
          listToSearch: $instructoresComoUsuario,
          searchFields: ["nombre", "apellido_paterno", "apellido_materno"],
          valueKey: "id_instructor",
          selected: instructorSeleccionado
        }, {
          selected: ($$value) => {
            instructorSeleccionado = $$value;
            $$settled = false;
          }
        }, {})}</div></form>`;
      } while (!$$settled);
      $$unsubscribe_cursosConDiplomado();
      $$unsubscribe_instructoresComoUsuario();
      return $$rendered;
    });
    format2 = "YYYY-MM-DD";
    DateInput = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { date = void 0 } = $$props;
      let { required } = $$props;
      let internal;
      const input = (x) => internal = date ? (0, import_dayjs3.default)(x).format(format2) : "";
      const output = (x) => date = (0, import_dayjs3.default)(x, format2).toDate();
      if ($$props.date === void 0 && $$bindings.date && date !== void 0)
        $$bindings.date(date);
      if ($$props.required === void 0 && $$bindings.required && required !== void 0)
        $$bindings.required(required);
      {
        input(date);
      }
      {
        output(internal);
      }
      return `<input type="${"date"}" ${required ? "required" : ""}${add_attribute("value", internal, 0)}>`;
    });
    GestionJornadas = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $db_jornadas, $$unsubscribe_db_jornadas;
      $$unsubscribe_db_jornadas = subscribe(db_jornadas, (value) => $db_jornadas = value);
      let form = {
        titulo: void 0,
        fecha_inicio: void 0,
        fecha_fin: void 0,
        fecha_inscripcion_inicio: void 0,
        fecha_inscripcion_fin: void 0
      };
      let $$settled;
      let $$rendered;
      do {
        $$settled = true;
        $$rendered = `<form class="${"flex flex-col max-w-2xl w-screen gap-4 "}"><header class="${"flex justify-between flex-wrap"}"><h2 class="${"heading"}">Jornadas</h2>
		${`<button class="${"btn primary"}">Agregar jornada</button>`}</header>

	<div class="${"input-group"}"><p class="${"label"}">Titulo de la jornada</p>
		<input type="${"text"}" class="${"w-full"}" required${add_attribute("value", form.titulo, 0)}></div>

	<div class="${"form-row"}"><div class="${"input-group"}"><p class="${"label"}">Fecha de inicio de la jornada</p>
			${validate_component(DateInput, "DateInput").$$render($$result, { required: true, date: form.fecha_inicio }, {
          date: ($$value) => {
            form.fecha_inicio = $$value;
            $$settled = false;
          }
        }, {})}</div>
		<div class="${"input-group"}"><p class="${"label"}">Fecha de cierre de la jornada</p>
			${validate_component(DateInput, "DateInput").$$render($$result, { required: true, date: form.fecha_fin }, {
          date: ($$value) => {
            form.fecha_fin = $$value;
            $$settled = false;
          }
        }, {})}</div></div>

	<div class="${"form-row"}"><div class="${"input-group"}"><p class="${"label"}">Fecha de inicio de inscripciones</p>
			${validate_component(DateInput, "DateInput").$$render($$result, {
          required: true,
          date: form.fecha_inscripcion_inicio
        }, {
          date: ($$value) => {
            form.fecha_inscripcion_inicio = $$value;
            $$settled = false;
          }
        }, {})}</div>
		<div class="${"input-group"}"><p class="${"label"}">Fecha de cierre de inscripciones</p>
			${validate_component(DateInput, "DateInput").$$render($$result, {
          required: true,
          date: form.fecha_inscripcion_fin
        }, {
          date: ($$value) => {
            form.fecha_inscripcion_fin = $$value;
            $$settled = false;
          }
        }, {})}</div></div></form>

<hr class="${"my-4 border-none"}">

${$db_jornadas.length == 0 ? `<p>No hay jornadas registradas a\xFAn.</p>` : `<table class="${"table-fixed table shadow-lg max-w-2xl w-screen"}"><thead><tr><th>Jornada</th>
				<th>Periodo</th>
				<th>Inscripciones</th>
				<th>...</th></tr></thead>
		<tbody class="${"max-h-60 overflow-auto"}">${each($db_jornadas, (jornada) => `<tr><td>${escape(jornada.titulo)}</td>
					<td><p>Inicio: ${escape(formatDate(jornada.fecha_inicio, true))}</p>
						<p>Fin: ${escape(formatDate(jornada.fecha_fin, true))}</p></td>
					<td><p>Inicio: ${escape(formatDate(jornada.fecha_inscripcion_inicio, true))}</p>
						<p>Fin: ${escape(formatDate(jornada.fecha_inscripcion_fin, true))}
						</p></td>
					<td><span class="${"flex gap-8 justify-center"}"><button class="${"font-bold text-accent"}">Editar jornada</button>
							<button class="${"font-bold text-text-4"}">Eliminar jornada</button>
						</span></td>
				</tr>`)}</tbody></table>`}`;
      } while (!$$settled);
      $$unsubscribe_db_jornadas();
      return $$rendered;
    });
    jornadaSeleccionada = writable();
    ListaAsistentes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { asistentes } = $$props;
      let filterText = "";
      if ($$props.asistentes === void 0 && $$bindings.asistentes && asistentes !== void 0)
        $$bindings.asistentes(asistentes);
      return `<h2 class="${"heading"}">Lista de asistentes</h2>

<hr class="${"my-2 border-none"}">

<div class="${"ml-auto"}"><p class="${"label"}">Buscar docente</p>
	<input type="${"text"}"${add_attribute("value", filterText, 0)}></div>

<hr class="${"mb-4 border-none"}">

${asistentes ? `${asistentes.length == 0 ? `<p class="${"text-text-4"}">No hay asistentes a\xFAn.</p>` : `<div class="${"flex flex-col gap-2"}">${each(makeArraySearchable(asistentes.map(({ aprobado, cursado, docente }) => ({ ...docente, cursado, aprobado })), ["nombre", "apellido_paterno", "apellido_materno"], filterText), (asistente) => `<div class="${"p-2 bg-neutral-100 rounded"}">${asistente.cursado ? `<p class="${[
        "label",
        (asistente.aprobado ? "text-status-success" : "") + " " + (!asistente.aprobado ? "text-status-danger" : "")
      ].join(" ").trim()}">${escape(asistente.aprobado ? "Aprobado" : "Reprobado")}
						</p>` : ``}
					<p>${escape(asistente.nombre)}
						${escape(asistente.apellido_paterno)}
						${escape(asistente.apellido_materno)}</p>
				</div>`)}</div>`}` : ``}`;
    });
    Gestion_jornadas = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $cursosEnJornadaConAsistentes, $$unsubscribe_cursosEnJornadaConAsistentes;
      let $db_cursosEnJornada, $$unsubscribe_db_cursosEnJornada;
      let $db_jornadas, $$unsubscribe_db_jornadas;
      let $jornadaSeleccionada, $$unsubscribe_jornadaSeleccionada;
      let $gestionJornadasModal, $$unsubscribe_gestionJornadasModal;
      let $agregarCursoJornadaModal, $$unsubscribe_agregarCursoJornadaModal;
      let $editarCursoJornadaModal, $$unsubscribe_editarCursoJornadaModal;
      let $asistentesModal, $$unsubscribe_asistentesModal;
      $$unsubscribe_cursosEnJornadaConAsistentes = subscribe(cursosEnJornadaConAsistentes, (value) => $cursosEnJornadaConAsistentes = value);
      $$unsubscribe_db_cursosEnJornada = subscribe(db_cursosEnJornada, (value) => $db_cursosEnJornada = value);
      $$unsubscribe_db_jornadas = subscribe(db_jornadas, (value) => $db_jornadas = value);
      $$unsubscribe_jornadaSeleccionada = subscribe(jornadaSeleccionada, (value) => $jornadaSeleccionada = value);
      let currentJornadaID;
      let currentJornada;
      let currentCursoEnJornadaID;
      let currentCursoEnJornada;
      let gestionJornadasModal = useModal();
      $$unsubscribe_gestionJornadasModal = subscribe(gestionJornadasModal, (value) => $gestionJornadasModal = value);
      let agregarCursoJornadaModal = useModal();
      $$unsubscribe_agregarCursoJornadaModal = subscribe(agregarCursoJornadaModal, (value) => $agregarCursoJornadaModal = value);
      let editarCursoJornadaModal = useModal();
      $$unsubscribe_editarCursoJornadaModal = subscribe(editarCursoJornadaModal, (value) => $editarCursoJornadaModal = value);
      let asistentesModal = useModal();
      $$unsubscribe_asistentesModal = subscribe(asistentesModal, (value) => $asistentesModal = value);
      let cursosJornada;
      let listaAsistentes = [];
      currentJornadaID = $jornadaSeleccionada;
      currentJornada = $db_jornadas.find((j) => j.id == currentJornadaID);
      currentCursoEnJornada = $db_cursosEnJornada.find((cJ) => cJ.id == currentCursoEnJornadaID);
      cursosJornada = $cursosEnJornadaConAsistentes.filter((cJ) => cJ.id_jornada == currentJornadaID);
      $$unsubscribe_cursosEnJornadaConAsistentes();
      $$unsubscribe_db_cursosEnJornada();
      $$unsubscribe_db_jornadas();
      $$unsubscribe_jornadaSeleccionada();
      $$unsubscribe_gestionJornadasModal();
      $$unsubscribe_agregarCursoJornadaModal();
      $$unsubscribe_editarCursoJornadaModal();
      $$unsubscribe_asistentesModal();
      return `${$gestionJornadasModal ? `${validate_component(Modal, "Modal").$$render($$result, {
        handleClose: gestionJornadasModal.closeModal
      }, {}, {
        default: () => `${validate_component(GestionJornadas, "GestionJornadas").$$render($$result, {}, {}, {})}`
      })}` : ``}

${$agregarCursoJornadaModal ? `${validate_component(Modal, "Modal").$$render($$result, {
        handleClose: agregarCursoJornadaModal.closeModal
      }, {}, {
        default: () => `${validate_component(CursoJornadaForm, "CursoJornadaForm").$$render($$result, {
          jornadaPertenecienteID: currentJornada?.id
        }, {}, {})}`
      })}` : ``}

${$editarCursoJornadaModal ? `${validate_component(Modal, "Modal").$$render($$result, {
        handleClose: editarCursoJornadaModal.closeModal
      }, {}, {
        default: () => `${validate_component(CursoJornadaForm, "CursoJornadaForm").$$render($$result, {
          jornadaPertenecienteID: currentJornada?.id,
          instructorSeleccionado: currentCursoEnJornada?.id_instructor,
          editingCursoJornada: currentCursoEnJornada,
          estadoDelCurso: currentCursoEnJornada?.estado,
          form: {
            cupo_maximo: currentCursoEnJornada?.cupo_maximo,
            id_curso: currentCursoEnJornada?.id_curso
          }
        }, {}, {})}`
      })}` : ``}

${$asistentesModal ? `${validate_component(Modal, "Modal").$$render($$result, { handleClose: asistentesModal.closeModal }, {}, {
        default: () => `${validate_component(ListaAsistentes, "ListaAsistentes").$$render($$result, { asistentes: listaAsistentes }, {}, {})}`
      })}` : ``}

<header class="${"flex justify-between flex-wrap"}"><h2 class="${"heading"}">${currentJornada ? `Jornada: ${escape(currentJornada.titulo)}` : `Jornadas`}</h2>
	<span class="${"flex gap-8 items-center"}"><button class="${"link primary"}">Gestionar jornadas</button>
		${currentJornada ? `<button class="${"btn primary"}">Agregar curso
			</button>` : ``}</span></header>

<hr class="${"my-4 border-none"}">

<p class="${"label"}">Selecciona una jornada</p>
<select><option${add_attribute("value", void 0, 0)} disabled>Sin seleccionar</option>${each($db_jornadas, (jornada) => `<option${add_attribute("value", jornada.id, 0)}>${escape(jornada.titulo)}</option>`)}</select>

<hr class="${"my-4 border-none"}">

${currentJornada ? `<span class="${"flex gap-8"}"><div><p class="${"label"}">Periodo de la jornada</p>
			<p>${escape(formatDate(currentJornada.fecha_inicio, true))} - ${escape(formatDate(currentJornada.fecha_fin, true))}</p></div>
		<div><p class="${"label"}">Periodo de inscripciones</p>
			<p>${escape(formatDate(currentJornada.fecha_inscripcion_inicio, true))} - ${escape(formatDate(currentJornada.fecha_inscripcion_fin, true))}</p></div></span>

	<hr class="${"my-4 border-none"}">` : ``}

${!currentJornada ? `<p>No hay jornada seleccionada a\xFAn.</p>` : `${cursosJornada ? `${cursosJornada.length == 0 ? `<p>No hay cursos en esta jornada a\xFAn. Agrege uno.</p>` : `<table id="${"table"}" class="${"table-fixed table shadow-lg w-full"}"><thead><tr><th>Curso</th>
					<th>Estado</th>
					<th>Instructor del curso</th>
					<th>Participantes</th>
					<th>...</th></tr></thead>
			<tbody class="${""}">${each(cursosJornada.filter((cJ) => cJ.id_jornada == currentJornadaID), (cursoJornada) => `<tr><td>${escape(cursoJornada.curso.nombre)}</td>
						<td><p class="${["font-bold", cursoJornada.estado == 1 ? "text-status-danger" : ""].join(" ").trim()}">${escape(cursoJornada.estado == 0 ? "En progreso" : cursoJornada.estado == 1 ? "Cerrado" : "...")}
							</p></td>
						<td>${cursoJornada.instructor ? `<p>${escape(cursoJornada.instructor.nombre)}
									${escape(cursoJornada.instructor.apellido_paterno)}
									${escape(cursoJornada.instructor.apellido_materno)}
								</p>` : `<p class="${"text-text-4"}">Sin instructor asignado a\xFAn</p>`}</td>
						<td><p>Inscritos: ${escape(cursoJornada.asistentes.length)}/${escape(cursoJornada.cupo_maximo)}</p>
							<p><button class="${"link primary"}">${cursoJornada.estado == 0 ? `Ver asistentes` : `${cursoJornada.estado == 1 ? `Ver resultados` : ``}`}</button>
							</p></td>
						<td><span class="${"flex gap-8 justify-center"}"><button class="${"font-bold text-accent"}">Editar curso</button>
								<button class="${"font-bold text-text-4"}">Eliminar curso</button>
							</span></td>
					</tr>`)}</tbody></table>`}` : ``}`}`;
    });
  }
});

// .svelte-kit/output/server/chunks/index-812c53f9.js
var getAcreditacionesParaDocente, Diplomados, AcreditacionesDocente;
var init_index_812c53f9 = __esm({
  ".svelte-kit/output/server/chunks/index-812c53f9.js"() {
    init_shims();
    init_app_648d86f1();
    init_index_9d95a6a7();
    init_index_91f839fc();
    init_competenciasConTipo_85cbff0e();
    init_cursosConDiplomado_92710756();
    init_docentesComoUsuario_dbf52d99();
    init_asistentesEnCursoConfirmados_099159a6();
    init_cursosEnJornadaConInstructorConCurso_cb560969();
    init_useModal_0f7e070e();
    getAcreditacionesParaDocente = (docenteID) => docenteID ? derived([
      cursosConDiplomado,
      db_diplomados,
      competenciasConTipo,
      db_registrosCursos,
      db_registrosDiplomados,
      db_registrosCompetencias,
      asistentesEnCursoConfirmados,
      cursosEnJornadaConInstructorConCurso,
      docentesComoUsuarios
    ], ([
      cursos,
      diplomados,
      competencias,
      registrosCursos,
      registrosDiplomados,
      registrosCompetencias,
      asistentes,
      cursosEnJornada,
      docentes
    ]) => {
      const docente = docentes.find((d) => d.id_docente == docenteID);
      if (!docente)
        return;
      const cursosAcreditados = cursos.map((c) => {
        let cursosEnJornadaConEsteCurso = cursosEnJornada.filter((cJ) => cJ.curso.id == c.id);
        let asistenciaCursadaAprobadaExistente = asistentes.find((a) => cursosEnJornadaConEsteCurso.map((cJ) => cJ.id).includes(a.id_cursojornada) && a.id_docente == docenteID && a.aprobado && a.cursado);
        if (!asistenciaCursadaAprobadaExistente)
          return;
        let registroCursoExistente = registrosCursos.find((r) => r.id_acreditor == docenteID && r.id_curso == c.id);
        return {
          ...c,
          documento: registroCursoExistente?.documento
        };
      }).filter((c) => c != void 0);
      const diplomadosAcreditados = diplomados.map((d) => {
        let registroDiplomadoExistente = registrosDiplomados.find((r) => r.id_acreditor == docenteID && r.id_diplomado == d.id);
        if (!registroDiplomadoExistente)
          return;
        return {
          ...d,
          documento: registroDiplomadoExistente.documento == null ? void 0 : registroDiplomadoExistente.documento
        };
      }).filter((d) => d != void 0);
      const competenciasAcreditadas = competencias.map((c) => {
        let registroCompetenciaExistente = registrosCompetencias.find((r) => r.id_acreditor == docenteID && r.id_competencia == c.id);
        if (!registroCompetenciaExistente)
          return;
        return {
          ...c,
          documento: registroCompetenciaExistente.documento == null ? void 0 : registroCompetenciaExistente.documento
        };
      }).filter((c) => c != void 0);
      let acreditacionesDelDocente = {
        cursos: cursosAcreditados,
        diplomados: diplomadosAcreditados,
        competencias: competenciasAcreditadas
      };
      return acreditacionesDelDocente;
    }) : void 0;
    Diplomados = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $db_cursos, $$unsubscribe_db_cursos;
      let $cursosConDiplomado, $$unsubscribe_cursosConDiplomado;
      let $db_diplomados, $$unsubscribe_db_diplomados;
      let $cursosDeDiplomadoModal, $$unsubscribe_cursosDeDiplomadoModal;
      $$unsubscribe_db_cursos = subscribe(db_cursos, (value) => $db_cursos = value);
      $$unsubscribe_cursosConDiplomado = subscribe(cursosConDiplomado, (value) => $cursosConDiplomado = value);
      $$unsubscribe_db_diplomados = subscribe(db_diplomados, (value) => $db_diplomados = value);
      let { acreditaciones } = $$props;
      let diplomadosConCursos;
      let diplomadoAcreditado;
      let cursoAcreditado;
      let cursosDeDiplomadoModal = useModal();
      $$unsubscribe_cursosDeDiplomadoModal = subscribe(cursosDeDiplomadoModal, (value) => $cursosDeDiplomadoModal = value);
      let currentDiplomado;
      let cursosSinDiplomado;
      if ($$props.acreditaciones === void 0 && $$bindings.acreditaciones && acreditaciones !== void 0)
        $$bindings.acreditaciones(acreditaciones);
      diplomadosConCursos = $db_diplomados.map((d) => ({
        ...d,
        cursos: $cursosConDiplomado.filter((c) => c.id_diplomado == d.id)
      }));
      currentDiplomado = void 0;
      cursosSinDiplomado = $db_cursos.filter((c) => !c.id_diplomado);
      $$unsubscribe_db_cursos();
      $$unsubscribe_cursosConDiplomado();
      $$unsubscribe_db_diplomados();
      $$unsubscribe_cursosDeDiplomadoModal();
      return `${$cursosDeDiplomadoModal && currentDiplomado ? `<button class="${"link mb-4"}">\u2190 Volver atr\xE1s</button>

	<header class="${"w-screen max-w-sm"}"><h2 class="${"heading"}">Cursos de ${escape(currentDiplomado.nombre)}</h2>

		<section class="${"flex flex-col gap-8 mt-8"}">${each(currentDiplomado.cursos, (curso) => `<article class="${"rounded-2xl shadow-fix text-center p-4 flex flex-col gap-8"}"><div>${(cursoAcreditado = acreditaciones.cursos.find((c) => c.id == curso.id)) ? `${cursoAcreditado ? `<p class="${"label text-status-success"}">Acreditado</p>` : ``}` : `<p class="${"label"}">No acreditado</p>`}

						<p>${escape(curso.nombre)}</p>

						<p class="${"label"}">${curso.diplomado ? `${escape(curso.diplomado.nombre)}` : `Sin diplomado`}
						</p></div>

					${(cursoAcreditado = acreditaciones.cursos.find((c) => c.id == curso.id)) ? `${cursoAcreditado && cursoAcreditado.documento ? `<div class="${"flex gap-8 justify-center"}"><a${add_attribute("href", cursoAcreditado.documento, 0)} class="${"link primary"}">Ver documento</a>
							</div>` : ``}` : ``}
				</article>`)}</section></header>` : ``}

${!$cursosDeDiplomadoModal ? `<h2 class="${"heading"}">Diplomados</h2>
	${$db_diplomados.length == 0 ? `<p>No hay diplomados aun</p>` : `${diplomadosConCursos ? `<p class="${"label"}">${escape(acreditaciones.diplomados.length)} de
			${escape($db_diplomados.length)} completados
		</p>
		<section class="${"flex flex-col gap-8 mt-4 mb-8"}">${each(diplomadosConCursos, (diplomado) => `<article class="${"rounded-2xl shadow-fix text-center p-4 flex flex-col gap-8"}"><div>${(diplomadoAcreditado = acreditaciones.diplomados.find((d) => d.id == diplomado.id)) ? `${diplomadoAcreditado ? `<p class="${"label text-status-success"}">Acreditado</p>` : ``}` : `<p class="${"label"}">No acreditado</p>`}
						<p>${escape(diplomado.nombre)}</p>
						<p class="${"label"}">${escape(acreditaciones.cursos.filter((c) => c.id_diplomado == diplomado.id).length)} de ${escape(diplomado.cursos.length)} cursos completados
						</p></div>

					<div class="${"flex gap-8 justify-center"}"><button class="${"link primary"}">Ver cursos</button>
						${(diplomadoAcreditado = acreditaciones.diplomados.find((d) => d.id == diplomado.id)) ? `${diplomadoAcreditado && diplomadoAcreditado.documento ? `<a${add_attribute("href", diplomadoAcreditado.documento, 0)} class="${"link primary"}">Ver documento</a>` : ``}` : ``}</div>
				</article>`)}</section>` : ``}`}

	<hr class="${"border my-12"}">

	${cursosSinDiplomado && cursosSinDiplomado.length > 0 ? `<h2 class="${"heading"}">Cursos sin diplomado</h2>
		<p class="${"label"}">${escape(acreditaciones.cursos.filter((c) => !c.id_diplomado).length)} de ${escape(cursosSinDiplomado.length)}
			completados
		</p>

		<section class="${"flex flex-col gap-8 mt-4 mb-8"}">${each(cursosSinDiplomado, (curso) => `<article class="${"rounded-2xl shadow-fix text-center p-4 flex flex-col gap-8"}"><div>${(cursoAcreditado = acreditaciones.cursos.find((c) => c.id == curso.id)) ? `${cursoAcreditado ? `<p class="${"label text-status-success"}">Acreditado</p>` : ``}` : `<p class="${"label"}">No acreditado</p>`}

						<p>${escape(curso.nombre)}</p></div>

					${(cursoAcreditado = acreditaciones.cursos.find((c) => c.id == curso.id)) ? `${cursoAcreditado && cursoAcreditado.documento ? `<div class="${"flex gap-8 justify-center"}"><a${add_attribute("href", cursoAcreditado.documento, 0)} class="${"link primary"}">Ver documento</a>
							</div>` : ``}` : ``}
				</article>`)}</section>` : ``}` : ``}`;
    });
    AcreditacionesDocente = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $acreditaciones, $$unsubscribe_acreditaciones = noop, $$subscribe_acreditaciones = () => ($$unsubscribe_acreditaciones(), $$unsubscribe_acreditaciones = subscribe(acreditaciones, ($$value) => $acreditaciones = $$value), acreditaciones);
      let { docenteID } = $$props;
      let acreditaciones;
      if ($$props.docenteID === void 0 && $$bindings.docenteID && docenteID !== void 0)
        $$bindings.docenteID(docenteID);
      $$subscribe_acreditaciones(acreditaciones = docenteID ? getAcreditacionesParaDocente(docenteID) : void 0);
      $$unsubscribe_acreditaciones();
      return `${acreditaciones && $acreditaciones ? `

	<p class="${"label text-center"}">Ver</p>
	<span class="${"mb-4 flex justify-center gap-4"}"><button class="${["link", "primary"].join(" ").trim()}">Diplomados</button>/
		<button class="${["link", ""].join(" ").trim()}">Cursos</button>/
		<button class="${["link", ""].join(" ").trim()}">Competencias</button></span>

	${`${validate_component(Diplomados, "Diplomados").$$render($$result, { acreditaciones: $acreditaciones }, {}, {})}`}` : ``}`;
    });
  }
});

// .svelte-kit/output/server/chunks/index-eec71471.js
var index_eec71471_exports = {};
__export(index_eec71471_exports, {
  default: () => Gestion_usuarios
});
var import_cookie15, UsuarioForm, Gestion_usuarios;
var init_index_eec71471 = __esm({
  ".svelte-kit/output/server/chunks/index-eec71471.js"() {
    init_shims();
    init_app_648d86f1();
    init_stores_bc5c9a0c();
    init_index_812c53f9();
    init_modal_8e58b549();
    init_index_9d95a6a7();
    init_usuariosConRoles_0654214b();
    init_prompts_dc3f6318();
    init_toasts_62f37240();
    init_useModal_0f7e070e();
    init_capitalizeString_bffa0771();
    init_makeArraySearchable_f17ce08a();
    import_cookie15 = __toModule(require_cookie());
    init_index_91f839fc();
    init_competenciasConTipo_85cbff0e();
    init_cursosConDiplomado_92710756();
    init_docentesComoUsuario_dbf52d99();
    init_asistentesEnCursoConfirmados_099159a6();
    init_cursosEnJornadaConInstructorConCurso_cb560969();
    UsuarioForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $$unsubscribe_session;
      $$unsubscribe_session = subscribe(session, (value) => value);
      let { editingUsuario = void 0 } = $$props;
      let { form = {
        matricula: void 0,
        nombre: void 0,
        apellido_paterno: void 0,
        apellido_materno: void 0,
        correo: void 0,
        password: void 0
      } } = $$props;
      let { rolesSeleccionados = [] } = $$props;
      if ($$props.editingUsuario === void 0 && $$bindings.editingUsuario && editingUsuario !== void 0)
        $$bindings.editingUsuario(editingUsuario);
      if ($$props.form === void 0 && $$bindings.form && form !== void 0)
        $$bindings.form(form);
      if ($$props.rolesSeleccionados === void 0 && $$bindings.rolesSeleccionados && rolesSeleccionados !== void 0)
        $$bindings.rolesSeleccionados(rolesSeleccionados);
      $$unsubscribe_session();
      return `<form class="${"flex flex-col max-w-xl w-screen gap-4"}"><header class="${"flex justify-between"}"><h2 class="${"heading"}">Usuario</h2>
		<button class="${"btn primary"}">${editingUsuario ? `Editar usuario` : `Guardar usuario`}</button></header>

	<div class="${"input-group"}"><label class="${"label"}">Matricula</label>
		<input type="${"number"}" required${add_attribute("value", form.matricula, 0)}></div>

	<div class="${"input-group"}"><label class="${"label"}">Nombre(s)</label>
		<input type="${"text"}" required${add_attribute("value", form.nombre, 0)}></div>

	<div class="${"form-row"}"><div class="${"input-group"}"><label class="${"label"}">Apellido paterno</label>
			<input type="${"text"}" required${add_attribute("value", form.apellido_paterno, 0)}></div>

		<div class="${"input-group"}"><label class="${"label"}">Apellido materno</label>
			<input type="${"text"}" required${add_attribute("value", form.apellido_materno, 0)}></div></div>

	<div class="${"input-group"}"><label class="${"label"}">Correo</label>
		<input type="${"email"}" required${add_attribute("value", form.correo, 0)}></div>

	${!editingUsuario ? `<div class="${"input-group"}"><label class="${"label"}">Contrase\xF1a por defecto</label>
			<input type="${"text"}" required${add_attribute("value", form.password, 0)}>
			<p class="${"helper"}">El usuario podr\xE1 cambiar su contrase\xF1a una vez dentro
			</p></div>` : ``}

	<p class="${"label"}">Selecciona roles de usuario</p>
	<div class="${"flex flex-col gap-1 overflow-auto"}"><label class="${"flex gap-2 items-center"}"><input type="${"checkbox"}" value="${"docente"}"${~rolesSeleccionados.indexOf("docente") ? add_attribute("checked", true, 1) : ""}>
			Docente
		</label>
		<label class="${"flex gap-2 items-center"}"><input type="${"checkbox"}" value="${"coach"}"${~rolesSeleccionados.indexOf("coach") ? add_attribute("checked", true, 1) : ""}>
			Coach
		</label>
		<label class="${"flex gap-2 items-center"}"><input type="${"checkbox"}" value="${"instructor"}"${~rolesSeleccionados.indexOf("instructor") ? add_attribute("checked", true, 1) : ""}>
			Instructor
		</label>
		<label class="${"flex gap-2 items-center"}"><input type="${"checkbox"}" value="${"coordinador"}"${~rolesSeleccionados.indexOf("coordinador") ? add_attribute("checked", true, 1) : ""}>
			Coordinador
		</label>
		<label class="${"flex gap-2 items-center"}"><input type="${"checkbox"}" value="${"administrativo"}"${~rolesSeleccionados.indexOf("administrativo") ? add_attribute("checked", true, 1) : ""}>
			Administrativo
		</label></div></form>`;
    });
    Gestion_usuarios = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $usuariosConRoles, $$unsubscribe_usuariosConRoles;
      let $agregarUsuarioForm, $$unsubscribe_agregarUsuarioForm;
      let $editarUsuarioForm, $$unsubscribe_editarUsuarioForm;
      let $acreditacionesUsuarioModal, $$unsubscribe_acreditacionesUsuarioModal;
      let $session, $$unsubscribe_session;
      $$unsubscribe_usuariosConRoles = subscribe(usuariosConRoles, (value) => $usuariosConRoles = value);
      $$unsubscribe_session = subscribe(session, (value) => $session = value);
      let filterText;
      let filterFunction;
      let filterGroup = [];
      let editingUserID;
      let editingUser;
      const agregarUsuarioForm = useModal();
      $$unsubscribe_agregarUsuarioForm = subscribe(agregarUsuarioForm, (value) => $agregarUsuarioForm = value);
      const editarUsuarioForm = useModal();
      $$unsubscribe_editarUsuarioForm = subscribe(editarUsuarioForm, (value) => $editarUsuarioForm = value);
      let acreditacionesDocenteID;
      const acreditacionesUsuarioModal = useModal();
      $$unsubscribe_acreditacionesUsuarioModal = subscribe(acreditacionesUsuarioModal, (value) => $acreditacionesUsuarioModal = value);
      {
        if (filterGroup.length > 0) {
          filterFunction = (usuario) => usuario.roles.map(({ rol }) => rol).some((rol) => filterGroup.includes(rol));
        } else {
          filterFunction = (usuario) => true;
        }
      }
      editingUser = $usuariosConRoles.find((u) => u.id == editingUserID);
      $$unsubscribe_usuariosConRoles();
      $$unsubscribe_agregarUsuarioForm();
      $$unsubscribe_editarUsuarioForm();
      $$unsubscribe_acreditacionesUsuarioModal();
      $$unsubscribe_session();
      return `${$agregarUsuarioForm ? `${validate_component(Modal, "Modal").$$render($$result, {
        handleClose: agregarUsuarioForm.closeModal
      }, {}, {
        default: () => `${validate_component(UsuarioForm, "UsuarioForm").$$render($$result, {}, {}, {})}`
      })}` : ``}

${$editarUsuarioForm ? `${validate_component(Modal, "Modal").$$render($$result, {
        handleClose: editarUsuarioForm.closeModal
      }, {}, {
        default: () => `${validate_component(UsuarioForm, "UsuarioForm").$$render($$result, {
          editingUsuario: editingUser,
          form: {
            matricula: editingUser?.matricula,
            nombre: editingUser?.nombre,
            apellido_paterno: editingUser?.apellido_paterno,
            apellido_materno: editingUser?.apellido_materno,
            correo: editingUser?.correo,
            password: ""
          },
          rolesSeleccionados: editingUser?.roles.map(({ rol }) => rol)
        }, {}, {})}`
      })}` : ``}

${$acreditacionesUsuarioModal && acreditacionesDocenteID ? `${validate_component(Modal, "Modal").$$render($$result, {
        handleClose: acreditacionesUsuarioModal.closeModal
      }, {}, {
        default: () => `${validate_component(AcreditacionesDocente, "AcreditacionesDocente").$$render($$result, { docenteID: acreditacionesDocenteID }, {}, {})}`
      })}` : ``}

<header class="${"flex justify-between flex-wrap"}"><h2 class="${"heading"}">Usuarios en el sistema</h2>
	<button class="${"btn primary"}">Agregar usuarios
	</button></header>

<hr class="${"my-4 border-none"}">

<p class="${"label"}">Buscar usuario</p>
<input type="${"text"}"${add_attribute("value", filterText, 0)}>

<hr class="${"my-4 border-none"}">

<p class="${"label"}">Filtrar por</p>
<div class="${"flex gap-4 flex-wrap"}"><label class="${"flex gap-1 items-center"}"><input type="${"checkbox"}" value="${"docente"}"${~filterGroup.indexOf("docente") ? add_attribute("checked", true, 1) : ""}>
		Docentes
	</label>
	<label class="${"flex gap-1 items-center"}"><input type="${"checkbox"}" value="${"coach"}"${~filterGroup.indexOf("coach") ? add_attribute("checked", true, 1) : ""}>
		Coaches
	</label>
	<label class="${"flex gap-1 items-center"}"><input type="${"checkbox"}" value="${"instructor"}"${~filterGroup.indexOf("instructor") ? add_attribute("checked", true, 1) : ""}>
		Instructores
	</label>
	<label class="${"flex gap-1 items-center"}"><input type="${"checkbox"}" value="${"coordinador"}"${~filterGroup.indexOf("coordinador") ? add_attribute("checked", true, 1) : ""}>
		Coordinadores
	</label>
	<label class="${"flex gap-1 items-center"}"><input type="${"checkbox"}" value="${"administrativo"}"${~filterGroup.indexOf("administrativo") ? add_attribute("checked", true, 1) : ""}>
		Administrativo
	</label></div>

<hr class="${"my-4 border-none"}">

<table id="${"table"}" class="${"table-fixed table shadow-lg w-full"}"><thead><tr><th class="${"w-24"}">Matricula</th>
			<th>Nombre de usuario</th>
			<th>Correo</th>
			<th>Roles</th>
			<th>...</th></tr></thead>
	<tbody class="${""}">${each(makeArraySearchable($usuariosConRoles, ["matricula", "nombre", "apellido_paterno", "apellido_materno", "correo"], filterText).filter(filterFunction), (usuario) => `<tr><td><a href="${""}">${escape(usuario.matricula)}</a></td>
				<td><p>${escape(usuario.nombre)}
						${escape(usuario.apellido_paterno)}
						${escape(usuario.apellido_materno)}</p>
					${usuario.roles.map(({ rol }) => rol).includes("docente") ? `<p><button class="${"link primary"}">Ver acreditaciones de docente</button>
						</p>` : ``}</td>
				<td>${escape(usuario.correo)}</td>
				<td>${usuario.roles.length == 0 ? `<p class="${"text text-text-4"}">Sin roles asignados</p>` : `${escape(usuario.roles.map(({ rol }) => capitalizeString(rol)).join(", "))}`}</td>
				<td><span class="${"flex gap-8 justify-center"}"><button class="${"link primary"}">Editar usuario</button>
						${$session.user.id != usuario.id && !usuario.roles.map(({ rol }) => rol).includes("coordinador") ? `<button class="${"link"}">Eliminar usuario</button>` : ``}
					</span></td>
			</tr>`)}</tbody></table>`;
    });
  }
});

// .svelte-kit/output/server/chunks/newpassword-74616ea9.js
var newpassword_74616ea9_exports = {};
__export(newpassword_74616ea9_exports, {
  default: () => Newpassword
});
var import_cookie16, Newpassword;
var init_newpassword_74616ea9 = __esm({
  ".svelte-kit/output/server/chunks/newpassword-74616ea9.js"() {
    init_shims();
    init_app_648d86f1();
    init_stores_bc5c9a0c();
    init_index_9d95a6a7();
    init_toasts_62f37240();
    init_index_91f839fc();
    import_cookie16 = __toModule(require_cookie());
    Newpassword = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $$unsubscribe_session;
      let $errors, $$unsubscribe_errors;
      $$unsubscribe_session = subscribe(session, (value) => value);
      let errors = writable([]);
      $$unsubscribe_errors = subscribe(errors, (value) => $errors = value);
      let passwordInput;
      $$unsubscribe_session();
      $$unsubscribe_errors();
      return `<main class="${"absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center bg-une-red gap-8 "}"><section class="${"w-40"}"><img class="${"object-contain"}" src="${"../../../static/une white logo.png"}" alt="${"Une logo"}" id="${"logo"}"></section>
	<h1 class="${"text-4xl font-bold text-white"}">Sistema coaching</h1>

	<form class="${"shadow-lg bg-white p-4 rounded-md flex flex-col max-w-sm w-screen gap-4"}"><a href="${"/"}" class="${"link"}">Volver al men\xFA principal</a>
		<header><h2 class="${"heading"}">Cambiar contrase\xF1a</h2></header>

		<div class="${"input-group"}"><p class="${"label"}">Nueva Contrase\xF1a</p>
			<input type="${"password"}" required${add_attribute("value", passwordInput, 0)}></div>

		${each($errors, (error3, i) => `<p class="${"text-status-danger"}">${escape(error3)}
			</p>`)}

		<button class="${"btn primary flex justify-center items-center"}">${``}
			Cambiar a nueva contrase\xF1a</button></form>
	<div class="${"h-20"}"></div></main>`;
    });
  }
});

// .svelte-kit/output/server/chunks/__layout-12417190.js
var layout_12417190_exports = {};
__export(layout_12417190_exports, {
  default: () => _layout5
});
var import_cookie17, _layout5;
var init_layout_12417190 = __esm({
  ".svelte-kit/output/server/chunks/__layout-12417190.js"() {
    init_shims();
    init_app_648d86f1();
    init_mobileLayout_e45d2d82();
    import_cookie17 = __toModule(require_cookie());
    init_stores_bc5c9a0c();
    init_useModal_0f7e070e();
    init_index_91f839fc();
    init_logoutButton_fc8dccce();
    _layout5 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `${validate_component(MobileLayout, "MobileLayout").$$render($$result, {
        layoutHeading: "Portal Instructor",
        bgColor: "bg-une-green",
        tabs: [{ "Mis cursos": "/instructor/mis-cursos" }]
      }, {}, {
        default: () => `${slots.default ? slots.default({}) : ``}`
      })}`;
    });
  }
});

// .svelte-kit/output/server/chunks/index-10eab8e7.js
var index_10eab8e7_exports = {};
__export(index_10eab8e7_exports, {
  default: () => Instructor
});
var import_cookie18, Instructor;
var init_index_10eab8e7 = __esm({
  ".svelte-kit/output/server/chunks/index-10eab8e7.js"() {
    init_shims();
    init_app_648d86f1();
    init_navigation_0a4806ec();
    import_cookie18 = __toModule(require_cookie());
    Instructor = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      goto("instructor/mis-cursos");
      return ``;
    });
  }
});

// .svelte-kit/output/server/chunks/jornadaActual-3949e904.js
var import_dayjs4, jornadaActual;
var init_jornadaActual_3949e904 = __esm({
  ".svelte-kit/output/server/chunks/jornadaActual-3949e904.js"() {
    init_shims();
    init_index_91f839fc();
    import_dayjs4 = __toModule(require_dayjs_min());
    init_index_9d95a6a7();
    jornadaActual = derived([db_jornadas], ([jornadas]) => {
      if (jornadas.length == 0)
        return void 0;
      return jornadas.reduce((j1, j2) => {
        return (0, import_dayjs4.default)(j1.fecha_inicio).isAfter((0, import_dayjs4.default)(j2.fecha_inicio)) ? j1 : j2;
      }, jornadas[0]);
    });
  }
});

// .svelte-kit/output/server/chunks/index-81c96711.js
var index_81c96711_exports = {};
__export(index_81c96711_exports, {
  default: () => Mis_cursos
});
var import_cookie19, import_dayjs5, getCursosParaInstructor, AlumnoDetalles, CalificarAlumnos, EstatusCurso, Mis_cursos;
var init_index_81c96711 = __esm({
  ".svelte-kit/output/server/chunks/index-81c96711.js"() {
    init_shims();
    init_app_648d86f1();
    init_stores_bc5c9a0c();
    init_cursosEnJornadaConInstructorConCurso_cb560969();
    init_jornadaActual_3949e904();
    init_index_91f839fc();
    init_cursosEnJornadaConAsistentes_c73643ab();
    init_useModal_0f7e070e();
    init_index_9d95a6a7();
    init_toasts_62f37240();
    init_loadingSpinner_a3f71e99();
    init_modal_8e58b549();
    init_prompts_dc3f6318();
    import_cookie19 = __toModule(require_cookie());
    init_cursosConDiplomado_92710756();
    import_dayjs5 = __toModule(require_dayjs_min());
    init_docentesComoUsuario_dbf52d99();
    init_asistentesEnCursoConfirmados_099159a6();
    getCursosParaInstructor = (instructorID) => {
      const cursosDeLaJornadaActualParaInstructor = derived([cursosEnJornadaConAsistentes, jornadaActual], ([cursos, jornadaActual2]) => jornadaActual2 ? cursos.filter((c) => c.id_jornada == jornadaActual2.id && c.id_instructor == instructorID) : []);
      return cursosDeLaJornadaActualParaInstructor;
    };
    AlumnoDetalles = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { alumno } = $$props;
      let { estaAprobado = alumno.aprobado ? 1 : 0 } = $$props;
      if ($$props.alumno === void 0 && $$bindings.alumno && alumno !== void 0)
        $$bindings.alumno(alumno);
      if ($$props.estaAprobado === void 0 && $$bindings.estaAprobado && estaAprobado !== void 0)
        $$bindings.estaAprobado(estaAprobado);
      return `<article class="${"rounded-2xl shadow-fix text-center p-4 flex flex-col gap-4"}"><div><p class="${"label"}">Matricula: ${escape(alumno.docente.matricula)}</p>
		<p>${escape(alumno.docente.nombre)}
			${escape(alumno.docente.apellido_paterno)}
			${escape(alumno.docente.apellido_materno)}</p></div>

	<div><p class="${"label"}">Calificaci\xF3n</p>
		<div class="${"flex gap-8 justify-center"}"><label class="${"flex gap-2 items-center"}"><input type="${"radio"}"${add_attribute("value", 0, 0)} required${estaAprobado === 0 ? add_attribute("checked", true, 1) : ""}>
				Reprobado
			</label>
			<label class="${"flex gap-2 items-center"}"><input type="${"radio"}"${add_attribute("value", 1, 0)} required${estaAprobado === 1 ? add_attribute("checked", true, 1) : ""}>
				Aprobado
			</label></div></div></article>`;
    });
    CalificarAlumnos = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { alumnos } = $$props;
      if ($$props.alumnos === void 0 && $$bindings.alumnos && alumnos !== void 0)
        $$bindings.alumnos(alumnos);
      return `${alumnos ? `${alumnos.length == 0 ? `<p class="${"text-text-4"}">No hay alumnos inscritos en este curso a\xFAn.</p>` : `<p class="${"label"}">Tienes ${escape(alumnos.length)} alumnos</p>
		<section class="${"flex flex-col gap-8 mt-4"}">${each(alumnos, (alumno) => `${validate_component(AlumnoDetalles, "AlumnoDetalles").$$render($$result, { alumno }, {}, {})}`)}</section>`}` : ``}`;
    });
    EstatusCurso = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { cursoEnJornadaID } = $$props;
      let { alumnos = void 0 } = $$props;
      let { isCompleted } = $$props;
      let { loading = false } = $$props;
      if ($$props.cursoEnJornadaID === void 0 && $$bindings.cursoEnJornadaID && cursoEnJornadaID !== void 0)
        $$bindings.cursoEnJornadaID(cursoEnJornadaID);
      if ($$props.alumnos === void 0 && $$bindings.alumnos && alumnos !== void 0)
        $$bindings.alumnos(alumnos);
      if ($$props.isCompleted === void 0 && $$bindings.isCompleted && isCompleted !== void 0)
        $$bindings.isCompleted(isCompleted);
      if ($$props.loading === void 0 && $$bindings.loading && loading !== void 0)
        $$bindings.loading(loading);
      return `${loading ? `${validate_component(Modal, "Modal").$$render($$result, {
        isPopUp: true,
        handleClose: () => {
        }
      }, {}, {
        default: () => `<dib class="${"p-4 flex flex-col gap-8 justify-center items-center"}">Subiendo registros de docentes...
			${validate_component(LoadingSpinner, "LoadingSpinner").$$render($$result, {}, {}, {})}</dib>`
      })}` : ``}

<h2 class="${"heading mt-4"}">Estatus del curso</h2>

<section class="${"flex flex-col gap-8 mt-4"}"><article class="${"rounded-2xl shadow-fix text-center p-4 flex flex-col gap-4"}">${alumnos ? `<div><p class="${"label"}">Aprobados</p>

				<p>${escape(alumnos.filter((a) => a.aprobado).length)}</p></div>

			<div><p class="${"label"}">Reprobados</p>
				<p>${escape(alumnos.filter((a) => !a.aprobado).length)}</p></div>

			<div><p class="${"label"}">Porcentaje de aprobados</p>
				<p>${escape((alumnos.filter((a) => a.aprobado).length / (alumnos.length || 1) * 1e4 | 0) / 100)} %
				</p></div>` : ``}

		${isCompleted ? `<button class="${"link primary"}">Abrir curso</button>` : `<button class="${"btn primary"}">Marcar curso como completado</button>`}</article></section>`;
    });
    Mis_cursos = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $cursosJornada, $$unsubscribe_cursosJornada = noop, $$subscribe_cursosJornada = () => ($$unsubscribe_cursosJornada(), $$unsubscribe_cursosJornada = subscribe(cursosJornada, ($$value) => $cursosJornada = $$value), cursosJornada);
      let $session, $$unsubscribe_session;
      let $instructoresComoUsuario, $$unsubscribe_instructoresComoUsuario;
      let $calificarAlumnosModal, $$unsubscribe_calificarAlumnosModal;
      let $estatusCursoModal, $$unsubscribe_estatusCursoModal;
      let $jornadaActual, $$unsubscribe_jornadaActual;
      $$unsubscribe_session = subscribe(session, (value) => $session = value);
      $$unsubscribe_instructoresComoUsuario = subscribe(instructoresComoUsuario, (value) => $instructoresComoUsuario = value);
      $$unsubscribe_jornadaActual = subscribe(jornadaActual, (value) => $jornadaActual = value);
      let cursosJornada;
      let instructorID;
      let calificarAlumnosModal = useModal();
      $$unsubscribe_calificarAlumnosModal = subscribe(calificarAlumnosModal, (value) => $calificarAlumnosModal = value);
      let estatusCursoModal = useModal();
      $$unsubscribe_estatusCursoModal = subscribe(estatusCursoModal, (value) => $estatusCursoModal = value);
      let selectedCursoJornadaID;
      let selectedCursoJornada;
      instructorID = $instructoresComoUsuario.find((i) => i.id == $session.user.id)?.id_instructor;
      $$subscribe_cursosJornada(cursosJornada = instructorID ? getCursosParaInstructor(instructorID) : void 0);
      selectedCursoJornada = cursosJornada ? $cursosJornada.find((c) => c.id == selectedCursoJornadaID) : void 0;
      $$unsubscribe_cursosJornada();
      $$unsubscribe_session();
      $$unsubscribe_instructoresComoUsuario();
      $$unsubscribe_calificarAlumnosModal();
      $$unsubscribe_estatusCursoModal();
      $$unsubscribe_jornadaActual();
      return `${$calificarAlumnosModal ? `<button class="${"link mb-4"}">\u2190 Volver atr\xE1s</button>
	<h2 class="${"heading"}">Alumnos del curso ${escape(selectedCursoJornada?.curso.nombre)}</h2>
	${validate_component(CalificarAlumnos, "CalificarAlumnos").$$render($$result, {
        alumnos: selectedCursoJornada?.asistentes
      }, {}, {})}` : ``}

${$estatusCursoModal ? `<button class="${"link mb-4"}">\u2190 Volver atr\xE1s</button>
	${validate_component(EstatusCurso, "EstatusCurso").$$render($$result, {
        cursoEnJornadaID: selectedCursoJornada?.id,
        alumnos: selectedCursoJornada?.asistentes,
        isCompleted: selectedCursoJornada?.estado == 0 ? false : selectedCursoJornada?.estado == 1 ? true : false
      }, {}, {})}` : ``}

${cursosJornada && !$calificarAlumnosModal && !$estatusCursoModal ? `<h2 class="${"heading"}">Cursos (${escape($cursosJornada.length)})</h2>
	${$jornadaActual ? `<p class="${"label"}">De la jornada ${escape($jornadaActual.titulo)}</p>` : ``}

	<hr class="${"my-2 border-none"}">

	${$cursosJornada.length == 0 ? `<p>No tienes cursos en esta jornada a\xFAn.</p>` : `<section class="${"flex flex-col gap-8"}">${each($cursosJornada, (cursoJornada) => `<article class="${"rounded-2xl shadow-fix text-center p-4 flex flex-col gap-4"}"><p class="${["label", cursoJornada.estado == 1 ? "text-status-danger" : ""].join(" ").trim()}">${escape(cursoJornada.estado == 0 ? "En curso" : cursoJornada.estado == 1 ? "Cerrado" : "...")}</p>

					<div><p class="${"label"}">${cursoJornada.curso.diplomado ? `${escape(cursoJornada.curso.diplomado.nombre)}` : `Sin diplomado`}</p>
						<p>${escape(cursoJornada.curso.nombre)}</p></div>

					<div><p class="${"label"}">Alumnos</p>
						<p>${escape(cursoJornada.asistentes.length)} asistentes
						</p></div>

					<div class="${"flex gap-8 justify-center"}"><button class="${"link primary"}">Calificar alumnos</button>
						<button class="${"link primary"}">Gestionar curso</button></div>
				</article>`)}</section>`}` : ``}`;
    });
  }
});

// .svelte-kit/output/server/chunks/__layout-ab0d2b33.js
var layout_ab0d2b33_exports = {};
__export(layout_ab0d2b33_exports, {
  default: () => _layout6
});
var import_cookie20, _layout6;
var init_layout_ab0d2b33 = __esm({
  ".svelte-kit/output/server/chunks/__layout-ab0d2b33.js"() {
    init_shims();
    init_app_648d86f1();
    init_mobileLayout_e45d2d82();
    import_cookie20 = __toModule(require_cookie());
    init_stores_bc5c9a0c();
    init_useModal_0f7e070e();
    init_index_91f839fc();
    init_logoutButton_fc8dccce();
    _layout6 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `${validate_component(MobileLayout, "MobileLayout").$$render($$result, {
        layoutHeading: "Portal Docente",
        bgColor: "bg-une-red",
        tabs: [
          { "Mis cursos": "/docente/mis-cursos" },
          {
            "Mis acreditaciones": "/docente/mis-acreditaciones"
          }
        ]
      }, {}, {
        default: () => `${slots.default ? slots.default({}) : ``}`
      })}`;
    });
  }
});

// .svelte-kit/output/server/chunks/index-d8a18eea.js
var index_d8a18eea_exports = {};
__export(index_d8a18eea_exports, {
  default: () => Docente
});
var import_cookie21, Docente;
var init_index_d8a18eea = __esm({
  ".svelte-kit/output/server/chunks/index-d8a18eea.js"() {
    init_shims();
    init_app_648d86f1();
    init_navigation_0a4806ec();
    import_cookie21 = __toModule(require_cookie());
    Docente = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      goto("docente/mis-cursos");
      return ``;
    });
  }
});

// .svelte-kit/output/server/chunks/index-ec56bd95.js
var index_ec56bd95_exports = {};
__export(index_ec56bd95_exports, {
  default: () => Mis_acreditaciones
});
var import_cookie22, Mis_acreditaciones;
var init_index_ec56bd95 = __esm({
  ".svelte-kit/output/server/chunks/index-ec56bd95.js"() {
    init_shims();
    init_app_648d86f1();
    init_stores_bc5c9a0c();
    init_index_812c53f9();
    init_docentesComoUsuario_dbf52d99();
    import_cookie22 = __toModule(require_cookie());
    init_index_9d95a6a7();
    init_index_91f839fc();
    init_competenciasConTipo_85cbff0e();
    init_cursosConDiplomado_92710756();
    init_asistentesEnCursoConfirmados_099159a6();
    init_cursosEnJornadaConInstructorConCurso_cb560969();
    init_useModal_0f7e070e();
    Mis_acreditaciones = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $session, $$unsubscribe_session;
      let $docentesComoUsuarios, $$unsubscribe_docentesComoUsuarios;
      $$unsubscribe_session = subscribe(session, (value) => $session = value);
      $$unsubscribe_docentesComoUsuarios = subscribe(docentesComoUsuarios, (value) => $docentesComoUsuarios = value);
      let docenteID;
      docenteID = $docentesComoUsuarios.find((d) => d.id == $session?.user?.id)?.id_docente;
      $$unsubscribe_session();
      $$unsubscribe_docentesComoUsuarios();
      return `${validate_component(AcreditacionesDocente, "AcreditacionesDocente").$$render($$result, { docenteID }, {}, {})}`;
    });
  }
});

// .svelte-kit/output/server/chunks/index-fcbd752b.js
var index_fcbd752b_exports = {};
__export(index_fcbd752b_exports, {
  default: () => Mis_cursos2
});
var import_cookie23, import_dayjs6, getCursosParaDocente, getInvitacionesParaDocente, Invitaciones, Mis_cursos2;
var init_index_fcbd752b = __esm({
  ".svelte-kit/output/server/chunks/index-fcbd752b.js"() {
    init_shims();
    init_app_648d86f1();
    init_stores_bc5c9a0c();
    init_docentesComoUsuario_dbf52d99();
    init_jornadaActual_3949e904();
    init_index_91f839fc();
    init_cursosEnJornadaConInstructorConCurso_cb560969();
    init_index_9d95a6a7();
    init_cursosConDiplomado_92710756();
    init_toasts_62f37240();
    import_cookie23 = __toModule(require_cookie());
    import_dayjs6 = __toModule(require_dayjs_min());
    getCursosParaDocente = (docenteID) => {
      const cursosDeLaJornadaActualParaInstructor = derived([cursosEnJornadaConInstructorConCurso, db_asistentesEnCurso, jornadaActual], ([cursos, asistentes, jornadaActual2]) => {
        if (!jornadaActual2)
          return [];
        let asistenciasDelDocente = asistentes.filter((a) => a.id_docente == docenteID);
        let cursosDeLaJornadaActual = cursos.filter((c) => c.id_jornada == jornadaActual2.id).map((c) => {
          const asisteACurso = asistenciasDelDocente.find((a) => a.id_cursojornada == c.id);
          if (!asisteACurso)
            return;
          return {
            ...c,
            aprobado: asisteACurso.aprobado
          };
        }).filter((c) => c != void 0);
        return cursosDeLaJornadaActual;
      });
      return cursosDeLaJornadaActualParaInstructor;
    };
    getInvitacionesParaDocente = (docenteID) => derived([
      db_invitacionesCurso,
      cursosConDiplomado,
      instructoresComoUsuario,
      db_cursosEnJornada
    ], ([invitaciones, cursos, instructores, cursosJornada]) => invitaciones.filter((i) => i.id_docente == docenteID && i.estado_invitacion == 0).map((i) => {
      const cursoJornadaDeLaInvitacion = cursosJornada.find((cJ) => cJ.id == i.id_cursojornada);
      if (!cursoJornadaDeLaInvitacion)
        return;
      const cursoDeLaInvitacion = cursos.find((c) => c.id == cursoJornadaDeLaInvitacion.id_curso);
      if (!cursoDeLaInvitacion)
        return;
      const instructorDeLaInvitacion = instructores.find((i2) => i2.id_instructor == cursoJornadaDeLaInvitacion.id_instructor);
      return {
        ...i,
        curso: cursoDeLaInvitacion,
        instructor: instructorDeLaInvitacion,
        cursoJornada: cursoJornadaDeLaInvitacion
      };
    }).filter((i) => i != void 0));
    Invitaciones = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { invitaciones } = $$props;
      let { docenteID } = $$props;
      if ($$props.invitaciones === void 0 && $$bindings.invitaciones && invitaciones !== void 0)
        $$bindings.invitaciones(invitaciones);
      if ($$props.docenteID === void 0 && $$bindings.docenteID && docenteID !== void 0)
        $$bindings.docenteID(docenteID);
      return `${invitaciones ? `<h2 class="${"heading"}">Invitaciones (${escape(invitaciones.length)})
	</h2>

	<section class="${"flex flex-col gap-8 mt-4 mb-8"}">${each(invitaciones, (invitacion) => `<article class="${"rounded-2xl shadow-fix text-center p-4 flex flex-col gap-4"}"><p class="${"font-bold"}">Te invitaron a formar parte de este curso</p>

				<div><p class="${"label"}">${invitacion.curso.diplomado ? `<p>${escape(invitacion.curso.diplomado.nombre)}</p>` : `<p>Sin diplomado</p>`}</p>
					<p>${escape(invitacion.curso.nombre)}</p></div>

				<div><p class="${"label"}">Instructor</p>
					${invitacion.instructor ? `<p>${escape(invitacion.instructor.nombre)}
							${escape(invitacion.instructor.apellido_paterno)}
							${escape(invitacion.instructor.apellido_materno)}
						</p>` : `<p>Sin instructor asignado a\xFAn</p>`}</div>

				<div class="${"flex gap-8 justify-center"}"><button class="${"btn primary"}">Aceptar</button>
					<button class="${"link"}">Rechazar</button></div>
			</article>`)}</section>` : ``}`;
    });
    Mis_cursos2 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $session, $$unsubscribe_session;
      let $docentesComoUsuarios, $$unsubscribe_docentesComoUsuarios;
      let $invitaciones, $$unsubscribe_invitaciones = noop, $$subscribe_invitaciones = () => ($$unsubscribe_invitaciones(), $$unsubscribe_invitaciones = subscribe(invitaciones, ($$value) => $invitaciones = $$value), invitaciones);
      let $cursosJornada, $$unsubscribe_cursosJornada = noop, $$subscribe_cursosJornada = () => ($$unsubscribe_cursosJornada(), $$unsubscribe_cursosJornada = subscribe(cursosJornada, ($$value) => $cursosJornada = $$value), cursosJornada);
      let $jornadaActual, $$unsubscribe_jornadaActual;
      $$unsubscribe_session = subscribe(session, (value) => $session = value);
      $$unsubscribe_docentesComoUsuarios = subscribe(docentesComoUsuarios, (value) => $docentesComoUsuarios = value);
      $$unsubscribe_jornadaActual = subscribe(jornadaActual, (value) => $jornadaActual = value);
      let docenteID;
      let invitaciones;
      let cursosJornada;
      docenteID = $docentesComoUsuarios.find((d) => d.id == $session.user.id)?.id_docente;
      $$subscribe_invitaciones(invitaciones = docenteID ? getInvitacionesParaDocente(docenteID) : void 0);
      $$subscribe_cursosJornada(cursosJornada = docenteID ? getCursosParaDocente(docenteID) : void 0);
      $$unsubscribe_session();
      $$unsubscribe_docentesComoUsuarios();
      $$unsubscribe_invitaciones();
      $$unsubscribe_cursosJornada();
      $$unsubscribe_jornadaActual();
      return `${invitaciones && $invitaciones ? `${$invitaciones.length > 0 ? `${validate_component(Invitaciones, "Invitaciones").$$render($$result, { docenteID, invitaciones: $invitaciones }, {}, {})}
		<hr class="${"border my-12"}">` : ``}` : ``}

${cursosJornada && $cursosJornada ? `<h2 class="${"heading"}">Cursos (${escape($cursosJornada.length)})</h2>
	${$jornadaActual ? `<p class="${"label"}">De la jornada ${escape($jornadaActual.titulo)}</p>` : ``}

	<hr class="${"my-2 border-none"}">

	${$cursosJornada.length == 0 ? `<p>No estas inscrito a cursos en esta jornada a\xFAn.</p>` : `<section class="${"flex flex-col gap-8 mt-4"}">${each($cursosJornada, (cursoJornada) => `<article class="${"rounded-2xl shadow-fix text-center p-4 flex flex-col gap-4"}"><p class="${["label", cursoJornada.estado == 1 ? "text-status-danger" : ""].join(" ").trim()}">${escape(cursoJornada.estado == 0 ? "En curso" : cursoJornada.estado == 1 ? "Cerrado" : "...")}</p>

					<div><p class="${"label"}">${cursoJornada.curso.diplomado ? `<p>${escape(cursoJornada.curso.diplomado.nombre)}</p>` : `<p>Sin diplomado</p>`}</p>
						<p>${escape(cursoJornada.curso.nombre)}</p></div>

					<div><p class="${"label"}">Instructor</p>
						${cursoJornada.instructor ? `<p>${escape(cursoJornada.instructor.nombre)}
								${escape(cursoJornada.instructor.apellido_paterno)}
								${escape(cursoJornada.instructor.apellido_materno)}
							</p>` : `<p>Sin instructor asignado a\xFAn</p>`}</div>

					${cursoJornada.estado == 1 ? `<div><p class="${"label"}">Calificaci\xF3n</p>
							<p class="${[
        "font-bold",
        (cursoJornada.aprobado ? "text-status-success" : "") + " " + (!cursoJornada.aprobado ? "text-status-danger" : "")
      ].join(" ").trim()}">${escape(cursoJornada.aprobado ? "Aprobado" : "Reprobado")}</p>
						</div>` : ``}
				</article>`)}</section>`}` : ``}`;
    });
  }
});

// .svelte-kit/output/server/chunks/__layout-652a32cd.js
var layout_652a32cd_exports = {};
__export(layout_652a32cd_exports, {
  default: () => _layout7
});
var import_cookie24, _layout7;
var init_layout_652a32cd = __esm({
  ".svelte-kit/output/server/chunks/__layout-652a32cd.js"() {
    init_shims();
    init_app_648d86f1();
    init_mobileLayout_e45d2d82();
    import_cookie24 = __toModule(require_cookie());
    init_stores_bc5c9a0c();
    init_useModal_0f7e070e();
    init_index_91f839fc();
    init_logoutButton_fc8dccce();
    _layout7 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `${validate_component(MobileLayout, "MobileLayout").$$render($$result, {
        layoutHeading: "Portal coach",
        bgColor: "bg-une-gold",
        tabs: [{ Docentes: "/coach/docentes" }, { Inscripciones: "/coach/inscripciones" }]
      }, {}, {
        default: () => `${slots.default ? slots.default({}) : ``}`
      })}`;
    });
  }
});

// .svelte-kit/output/server/chunks/index-b5bf7e3d.js
var index_b5bf7e3d_exports = {};
__export(index_b5bf7e3d_exports, {
  default: () => Coach
});
var import_cookie25, Coach;
var init_index_b5bf7e3d = __esm({
  ".svelte-kit/output/server/chunks/index-b5bf7e3d.js"() {
    init_shims();
    init_app_648d86f1();
    init_navigation_0a4806ec();
    import_cookie25 = __toModule(require_cookie());
    Coach = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      goto("coach/docentes");
      return ``;
    });
  }
});

// .svelte-kit/output/server/chunks/index-8a629440.js
var index_8a629440_exports = {};
__export(index_8a629440_exports, {
  default: () => Inscripciones
});
var import_dayjs7, import_cookie26, invitacionesCursoConDocente, cursosEnJornadaConInvitaciones, cursosParaInscribir, getDocentesFaltantesDeCurso, InscribirDocentes, Inscripciones;
var init_index_8a629440 = __esm({
  ".svelte-kit/output/server/chunks/index-8a629440.js"() {
    init_shims();
    init_app_648d86f1();
    init_jornadaActual_3949e904();
    init_index_91f839fc();
    init_cursosEnJornadaConAsistentes_c73643ab();
    init_cursosEnJornadaConInstructorConCurso_cb560969();
    init_docentesComoUsuario_dbf52d99();
    init_index_9d95a6a7();
    init_useModal_0f7e070e();
    import_dayjs7 = __toModule(require_dayjs_min());
    init_toasts_62f37240();
    init_makeArraySearchable_f17ce08a();
    import_cookie26 = __toModule(require_cookie());
    init_asistentesEnCursoConfirmados_099159a6();
    init_cursosConDiplomado_92710756();
    invitacionesCursoConDocente = derived([db_invitacionesCurso, docentesComoUsuarios], ([invitaciones, docentes]) => invitaciones.map((i) => {
      const docenteInvitado = docentes.find((d) => d.id_docente == i.id_docente);
      if (!docenteInvitado)
        return;
      return {
        ...i,
        docente: docenteInvitado
      };
    }).filter((i) => i != void 0));
    cursosEnJornadaConInvitaciones = derived([cursosEnJornadaConInstructorConCurso, invitacionesCursoConDocente], ([cursosJornada, invitaciones]) => cursosJornada.map((cJ) => {
      return {
        ...cJ,
        invitaciones: invitaciones.filter((i) => i.id_cursojornada == cJ.id)
      };
    }));
    cursosParaInscribir = derived([cursosEnJornadaConInvitaciones, jornadaActual], ([cursos, jornadaActual2]) => jornadaActual2 ? cursos.filter((c) => c.id_jornada == jornadaActual2.id) : []);
    getDocentesFaltantesDeCurso = (cursoJornadaID) => derived([
      docentesComoUsuarios,
      cursosEnJornadaConInvitaciones,
      db_asistentesEnCurso,
      db_cursos
    ], ([docentes, cursosJornada, asistentes, cursos]) => {
      const cursoJornada = cursosJornada.find((cJ) => cJ.id == cursoJornadaID);
      if (!cursoJornada)
        return;
      const cursoABuscar = cursoJornada.curso;
      return docentes.filter((d) => {
        if (cursoJornada.invitaciones.find((i) => i.id_docente == d.id_docente))
          return false;
        const asistenciasDeDocente = asistentes.filter((a) => a.id_docente == d.id_docente).map((a) => {
          const cursoJornadaDeLaAsistencia = cursosJornada.find((cJ) => cJ.id == a.id_cursojornada);
          if (!cursoJornadaDeLaAsistencia)
            return;
          const cursoDelCursoJornada = cursos.find((c) => c.id == cursoJornadaDeLaAsistencia.id_curso);
          if (!cursoDelCursoJornada)
            return;
          return {
            ...a,
            cursoJornada: {
              ...cursoJornadaDeLaAsistencia,
              curso: cursoDelCursoJornada
            }
          };
        }).filter((a) => a != void 0);
        const docenteHaAsistido = asistenciasDeDocente.find((a) => a.cursoJornada.curso.id == cursoABuscar.id);
        if (!docenteHaAsistido)
          return true;
        return docenteHaAsistido.aprobado ? false : true;
      });
    });
    InscribirDocentes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $docentes, $$unsubscribe_docentes = noop, $$subscribe_docentes = () => ($$unsubscribe_docentes(), $$unsubscribe_docentes = subscribe(docentes, ($$value) => $docentes = $$value), docentes);
      let { cursoEnJornada } = $$props;
      let docentes;
      let { docentesSeleccionados = [] } = $$props;
      let filterText;
      if ($$props.cursoEnJornada === void 0 && $$bindings.cursoEnJornada && cursoEnJornada !== void 0)
        $$bindings.cursoEnJornada(cursoEnJornada);
      if ($$props.docentesSeleccionados === void 0 && $$bindings.docentesSeleccionados && docentesSeleccionados !== void 0)
        $$bindings.docentesSeleccionados(docentesSeleccionados);
      $$subscribe_docentes(docentes = cursoEnJornada ? getDocentesFaltantesDeCurso(cursoEnJornada.id) : void 0);
      $$unsubscribe_docentes();
      return `<h2 class="${"heading"}">Curso ${escape(cursoEnJornada?.curso.nombre)}</h2>

<hr class="${"border-none my-2"}">

<form><span class="${"flex justify-between gap-8"}"><div><p class="${"label"}">Busca un docente en particular</p>
			<input type="${"text"}"${add_attribute("value", filterText, 0)}></div>

		<button class="${"btn primary flex-1"}">Invitar docentes
		</button></span>

	<hr class="${"border-none my-4"}">

	${docentes && $docentes ? `${$docentes.length == 0 ? `<p class="${"text-text-4"}">No quedan docentes a quien invitar.</p>` : `<p class="${"label mb-2"}">Selecciona docentes para invitarlos</p>
			<section class="${"flex flex-col gap-4"}">${each(makeArraySearchable($docentes, ["nombre", "apellido_paterno", "apellido_materno"], filterText), (docente) => `<label class="${[
        "flex gap-2 items-center p-4 bg-neutral-100 border-2 rounded cursor-pointer select-none",
        docentesSeleccionados.includes(docente.id_docente) ? "border-accent" : ""
      ].join(" ").trim()}"><input class="${"hidden"}" type="${"checkbox"}"${add_attribute("value", docente.id_docente, 0)}${~docentesSeleccionados.indexOf(docente.id_docente) ? add_attribute("checked", true, 1) : ""}>
						${escape(docente.nombre)}
						${escape(docente.apellido_paterno)}
						${escape(docente.apellido_materno)}
					</label>`)}</section>`}` : ``}</form>`;
    });
    Inscripciones = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $cursosParaInscribir, $$unsubscribe_cursosParaInscribir;
      let $inscribirModal, $$unsubscribe_inscribirModal;
      let $jornadaActual, $$unsubscribe_jornadaActual;
      $$unsubscribe_cursosParaInscribir = subscribe(cursosParaInscribir, (value) => $cursosParaInscribir = value);
      $$unsubscribe_jornadaActual = subscribe(jornadaActual, (value) => $jornadaActual = value);
      let inscribirModal = useModal();
      $$unsubscribe_inscribirModal = subscribe(inscribirModal, (value) => $inscribirModal = value);
      let currentCursoEnJornadaID;
      let currentCursoEnJornada;
      currentCursoEnJornada = $cursosParaInscribir.find((cJ) => cJ.id == currentCursoEnJornadaID);
      $$unsubscribe_cursosParaInscribir();
      $$unsubscribe_inscribirModal();
      $$unsubscribe_jornadaActual();
      return `${$inscribirModal ? `<button class="${"link mb-4"}">\u2190 Volver atr\xE1s</button>
	${validate_component(InscribirDocentes, "InscribirDocentes").$$render($$result, { cursoEnJornada: currentCursoEnJornada }, {}, {})}` : ``}

${!$inscribirModal ? `${$jornadaActual ? `<h2 class="${"heading"}">Jornada ${escape($jornadaActual.titulo)}</h2>

		${(0, import_dayjs7.default)(Date()).isAfter($jornadaActual.fecha_inscripcion_fin) ? `<p>El periodo de inscripciones ha terminado.</p>` : `${(0, import_dayjs7.default)(Date()).isBefore($jornadaActual.fecha_inscripcion_inicio) ? `<p>El periodo de inscripciones a\xFAn no comienza.</p>` : `${$cursosParaInscribir.length == 0 ? `<p>A\xFAn no hay cursos en esta jornada.</p>` : `<p class="${"label"}">Cursos de la jornada</p>
			<section class="${"flex flex-col gap-8 mt-4"}">${each($cursosParaInscribir, (cursoEnJornada) => `<article class="${"flex flex-col gap-4 rounded-2xl shadow-fix text-center p-4"}"><div><p class="${"label"}">${cursoEnJornada.curso.diplomado ? `${escape(cursoEnJornada.curso.diplomado.nombre)}` : `Sin Diplomado`}</p>
							<p>${escape(cursoEnJornada.curso.nombre)}</p></div>

						<div><p class="${"label"}">Instructor</p>
							${cursoEnJornada.instructor ? `<p>${escape(cursoEnJornada.instructor.nombre)}
									${escape(cursoEnJornada.instructor.apellido_paterno)}
									${escape(cursoEnJornada.instructor.apellido_materno)}
								</p>` : `<p class="${"text-text-4"}">Sin instructor asignado a\xFAn</p>`}</div>

						<div><p class="${"label"}">Cupo: ${escape(cursoEnJornada.invitaciones.filter((i) => i.estado_invitacion == 1).length)} / ${escape(cursoEnJornada.cupo_maximo)}</p>
							<p>${escape(cursoEnJornada.invitaciones.length)} invitaciones enviadas</p>
							<p class="${"text-status-danger"}">${escape(cursoEnJornada.invitaciones.filter((i) => i.estado_invitacion == 2).length)} invitaciones rechazadas
							</p></div>

						<button class="${"link primary"}">Invitar docentes</button>
					</article>`)}</section>`}`}`}` : `No hay jornada activa.`}` : ``}`;
    });
  }
});

// .svelte-kit/output/server/chunks/index-22fc459a.js
var index_22fc459a_exports = {};
__export(index_22fc459a_exports, {
  default: () => Docentes
});
var import_cookie27, Docentes;
var init_index_22fc459a = __esm({
  ".svelte-kit/output/server/chunks/index-22fc459a.js"() {
    init_shims();
    init_app_648d86f1();
    init_stores_bc5c9a0c();
    init_coachesComoUsuario_f500f2a9();
    init_docentesComoUsuario_dbf52d99();
    init_useModal_0f7e070e();
    init_index_91f839fc();
    init_index_9d95a6a7();
    init_index_812c53f9();
    init_makeArraySearchable_f17ce08a();
    import_cookie27 = __toModule(require_cookie());
    init_competenciasConTipo_85cbff0e();
    init_cursosConDiplomado_92710756();
    init_asistentesEnCursoConfirmados_099159a6();
    init_cursosEnJornadaConInstructorConCurso_cb560969();
    Docentes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $session, $$unsubscribe_session;
      let $coachesComoUsuarios, $$unsubscribe_coachesComoUsuarios;
      let $docenteAcreditacionesDetalles, $$unsubscribe_docenteAcreditacionesDetalles;
      let $docentes, $$unsubscribe_docentes = noop, $$subscribe_docentes = () => ($$unsubscribe_docentes(), $$unsubscribe_docentes = subscribe(docentes, ($$value) => $docentes = $$value), docentes);
      $$unsubscribe_session = subscribe(session, (value) => $session = value);
      $$unsubscribe_coachesComoUsuarios = subscribe(coachesComoUsuarios, (value) => $coachesComoUsuarios = value);
      let docenteAcreditacionesDetalles = useModal();
      $$unsubscribe_docenteAcreditacionesDetalles = subscribe(docenteAcreditacionesDetalles, (value) => $docenteAcreditacionesDetalles = value);
      let currentDocenteUsuarioID;
      let coachID;
      let docentes;
      let filterText = "";
      coachID = $coachesComoUsuarios.find((c) => c.id == $session.user.id)?.id_coach;
      $$subscribe_docentes(docentes = coachID ? derived([docentesComoUsuarios, db_docentesEnCoaches], ([docentes2, asignaciones]) => {
        let docentesAsignados = asignaciones.filter((a) => a.id_coach == coachID);
        return docentesAsignados.map((d) => {
          let docente = docentes2.find((docente2) => docente2.id_docente == d.id_docente);
          if (!docente)
            return;
          return docente;
        }).filter((d) => d != void 0);
      }) : void 0);
      $$unsubscribe_session();
      $$unsubscribe_coachesComoUsuarios();
      $$unsubscribe_docenteAcreditacionesDetalles();
      $$unsubscribe_docentes();
      return `${$docenteAcreditacionesDetalles ? `<button class="${"link mb-4"}">\u2190 Volver atr\xE1s</button>
	${validate_component(AcreditacionesDocente, "AcreditacionesDocente").$$render($$result, { docenteID: currentDocenteUsuarioID }, {}, {})}` : `${docentes && $docentes ? `<h2 class="${"heading"}">Docentes (${escape($docentes.length)})</h2>
	<hr class="${"my-2 border-none"}">

	<p class="${"label"}">Busca un docente en particular</p>
	<input type="${"text"}" class="${"w-full"}"${add_attribute("value", filterText, 0)}>

	<hr class="${"my-2 border-none"}">

	${$docentes.length == 0 ? `<p>No tienes docentes asignados a\xFAn.</p>` : `<section class="${"flex flex-col gap-8"}">${each(makeArraySearchable($docentes, ["nombre", "apellido_paterno", "apellido_materno"], filterText), (docente) => `<article class="${"flex flex-col p-4 gap-8 text-center rounded-2xl shadow-fix items-center"}"><div><p class="${"label"}">Matricula: ${escape(docente.matricula)}</p>
						<p>${escape(docente.nombre)}
							${escape(docente.apellido_paterno)}
							${escape(docente.apellido_materno)}</p>
						<p>${escape(docente.correo)}</p></div>

					<button class="${"link primary"}">Ver acreditaciones</button>
				</article>`)}</section>`}` : ``}`}`;
    });
  }
});

// .svelte-kit/output/server/chunks/__layout.reset-bff6669e.js
var layout_reset_bff6669e_exports = {};
__export(layout_reset_bff6669e_exports, {
  default: () => _layout_reset
});
var import_cookie28, _layout_reset;
var init_layout_reset_bff6669e = __esm({
  ".svelte-kit/output/server/chunks/__layout.reset-bff6669e.js"() {
    init_shims();
    init_app_648d86f1();
    init_toastArea_b7785619();
    import_cookie28 = __toModule(require_cookie());
    init_prompts_dc3f6318();
    init_index_91f839fc();
    init_toasts_62f37240();
    _layout_reset = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `${slots.default ? slots.default({}) : ``}

${validate_component(ToastArea, "ToastArea").$$render($$result, {}, {}, {})}
${validate_component(PromptArea, "PromptArea").$$render($$result, {}, {}, {})}`;
    });
  }
});

// .svelte-kit/output/server/chunks/index-02c205ff.js
var index_02c205ff_exports = {};
__export(index_02c205ff_exports, {
  default: () => Login
});
var import_cookie29, Login;
var init_index_02c205ff = __esm({
  ".svelte-kit/output/server/chunks/index-02c205ff.js"() {
    init_shims();
    init_app_648d86f1();
    init_stores_bc5c9a0c();
    init_prompts_dc3f6318();
    init_toasts_62f37240();
    import_cookie29 = __toModule(require_cookie());
    init_index_91f839fc();
    Login = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $$unsubscribe_session;
      $$unsubscribe_session = subscribe(session, (value) => value);
      let matriculaInput = "";
      let passwordInput = "";
      $$unsubscribe_session();
      return `<main class="${"absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center bg-une-red gap-8 "}"><section class="${"w-40"}"><img class="${"object-contain"}" src="${"../../../static/une white logo.png"}" alt="${"Une logo"}" id="${"logo"}"></section>
	<h1 class="${"text-4xl font-bold text-white"}">Sistema coaching</h1>

	<form class="${"shadow-lg bg-white p-4 rounded-md flex flex-col max-w-sm w-screen gap-4"}"><header><h2 class="${"heading"}">Iniciar sesi\xF3n</h2></header>

		<div class="${"input-group"}"><p class="${"label"}">Matricula</p>
			<input type="${"number"}" required${add_attribute("value", matriculaInput, 0)}></div>
		<div class="${"input-group"}"><p class="${"label"}">Contrase\xF1a</p>
			<input type="${"password"}" required${add_attribute("value", passwordInput, 0)}></div>

		${``}

		<button class="${"btn primary flex justify-center items-center"}">${``}

			Ingresar</button></form>
	<div class="${"h-20"}"></div></main>`;
    });
  }
});

// .svelte-kit/output/server/chunks/app-648d86f1.js
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function resolve(base2, path) {
  if (scheme.test(path))
    return path;
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
function is_root_relative(path) {
  return path[0] === "/" && path[1] !== "/";
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error2(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler2 = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler2) {
    return;
  }
  const params = route.params(match);
  const response = await handler2({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error2(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error2(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop$1() {
}
function safe_not_equal$1(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function writable2(value, start = noop$1) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal$1(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue2.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue2.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue2.length; i += 2) {
            subscriber_queue2[i][0](subscriber_queue2[i + 1]);
          }
          subscriber_queue2.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop$1) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop$1;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
function escape_json_string_in_html(str) {
  return escape$1(str, escape_json_string_in_html_dict, (code) => `\\u${code.toString(16).toUpperCase()}`);
}
function escape_html_attr(str) {
  return '"' + escape$1(str, escape_html_attr_dict, (code) => `&#${code};`) + '"';
}
function escape$1(str, dict, unicode_encoder) {
  let result = "";
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char in dict) {
      result += dict[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += unicode_encoder(code);
      }
    } else {
      result += char;
    }
  }
  return result;
}
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error22,
  page: page2
}) {
  const css22 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error22) {
    error22.stack = options2.get_stack(error22);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css22.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session2 = writable2($session);
    const props = {
      stores: {
        page: writable2(null),
        navigating: writable2(null),
        session: session2
      },
      page: page2,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session2.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css22).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
    init2 += options2.service_worker ? '<script async custom-element="amp-install-serviceworker" src="https://cdn.ampproject.org/v0/amp-install-serviceworker-0.1.js"><\/script>' : "";
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page2 && page2.host ? s$1(page2.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error22)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page2 && page2.host ? s$1(page2.host) : "location.host"}, // TODO this is redundant
						path: ${page2 && page2.path ? try_serialize(page2.path, (error3) => {
      throw new Error(`Failed to serialize page.path: ${error3.message}`);
    }) : null},
						query: new URLSearchParams(${page2 && page2.query ? s$1(page2.query.toString()) : ""}),
						params: ${page2 && page2.params ? try_serialize(page2.params, (error3) => {
      throw new Error(`Failed to serialize page.params: ${error3.message}`);
    }) : null}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += options2.amp ? `<amp-install-serviceworker src="${options2.service_worker}" layout="nodisplay"></amp-install-serviceworker>` : `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url=${escape_html_attr(url)}`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error22) {
  if (!error22)
    return null;
  let serialized = try_serialize(error22);
  if (!serialized) {
    const { name, message, stack } = error22;
    serialized = try_serialize({ ...error22, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error22 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error22 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error22}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error22 };
    }
    return { status, error: error22 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  if (loaded.context) {
    throw new Error('You are returning "context" from a load function. "context" was renamed to "stuff", please adjust your code accordingly.');
  }
  return loaded;
}
async function load_node({
  request,
  options: options2,
  state,
  route,
  page: page2,
  node,
  $session,
  stuff,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error22
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page2, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module2.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const prefix = options2.paths.assets || options2.paths.base;
        const filename = (resolved.startsWith(prefix) ? resolved.slice(prefix.length) : resolved).slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page2.host}/${asset.file}`, opts);
        } else if (is_root_relative(resolved)) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, _receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":"${escape_json_string_in_html(body)}"}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      stuff: { ...stuff }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error22;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    stuff: loaded.stuff || stuff,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error22 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page: page2,
    node: default_layout,
    $session,
    stuff: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page: page2,
      node: default_error,
      $session,
      stuff: loaded ? loaded.stuff : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error22
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error22,
      branch,
      page: page2
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {}
    };
  }
  let branch = [];
  let status = 200;
  let error22;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let stuff = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              stuff,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error22 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error22 = e;
          }
          if (loaded && !error22) {
            branch.push(loaded);
          }
          if (error22) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    stuff: node_loaded.stuff,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error22
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error22
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.stuff) {
          stuff = {
            ...stuff,
            ...loaded.loaded.stuff
          };
        }
      }
    }
  try {
    return with_cookies(await render_response({
      ...opts,
      page_config,
      status,
      error: error22,
      branch: branch.filter(Boolean)
    }), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    }), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page: page2
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                let if_none_match_value = request2.headers["if-none-match"];
                if (if_none_match_value?.startsWith('W/"')) {
                  if_none_match_value = if_none_match_value.substring(2);
                }
                const etag = `"${hash(response.body || "")}"`;
                if (if_none_match_value === etag) {
                  return {
                    status: 304,
                    headers: {}
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
  let value;
  subscribe(store, (_) => value = _)();
  return value;
}
function null_to_empty(value) {
  return value == null ? "" : value;
}
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css22) => css22.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-052244ee.js",
      css: [assets + "/_app/assets/start-464e9d0a.css", assets + "/_app/assets/vendor-15d9d811.css"],
      js: [assets + "/_app/start-052244ee.js", assets + "/_app/chunks/vendor-0b4b0cdb.js", assets + "/_app/chunks/singletons-12a22614.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error22) => String(error22),
    handle_error: (error22, request) => {
      hooks.handleError({ error: error22, request });
      error22.stack = options.get_stack(error22);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
async function load_component(file) {
  const { entry, css: css22, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css22.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
var import_cookie30, __accessCheck, __privateGet, __privateAdd, __privateSet, _map, absolute, scheme, chars, unsafeChars, reserved, escaped$1, objectProtoOwnPropertyNames, subscriber_queue2, escape_json_string_in_html_dict, escape_html_attr_dict, s$1, s, ReadOnlyFormData, current_component, escaped, missing_component, on_destroy, css5, Root, base, assets, getSession, getCookie, user_hooks, template, options, default_settings, empty, manifest, get_hooks, module_lookup, metadata_lookup;
var init_app_648d86f1 = __esm({
  ".svelte-kit/output/server/chunks/app-648d86f1.js"() {
    init_shims();
    import_cookie30 = __toModule(require_cookie());
    __accessCheck = (obj, member, msg) => {
      if (!member.has(obj))
        throw TypeError("Cannot " + msg);
    };
    __privateGet = (obj, member, getter) => {
      __accessCheck(obj, member, "read from private field");
      return getter ? getter.call(obj) : member.get(obj);
    };
    __privateAdd = (obj, member, value) => {
      if (member.has(obj))
        throw TypeError("Cannot add the same private member more than once");
      member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
    };
    __privateSet = (obj, member, value, setter) => {
      __accessCheck(obj, member, "write to private field");
      setter ? setter.call(obj, value) : member.set(obj, value);
      return value;
    };
    absolute = /^([a-z]+:)?\/?\//;
    scheme = /^[a-z]+:/;
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
    unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
    reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
    escaped$1 = {
      "<": "\\u003C",
      ">": "\\u003E",
      "/": "\\u002F",
      "\\": "\\\\",
      "\b": "\\b",
      "\f": "\\f",
      "\n": "\\n",
      "\r": "\\r",
      "	": "\\t",
      "\0": "\\0",
      "\u2028": "\\u2028",
      "\u2029": "\\u2029"
    };
    objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
    Promise.resolve();
    subscriber_queue2 = [];
    escape_json_string_in_html_dict = {
      '"': '\\"',
      "<": "\\u003C",
      ">": "\\u003E",
      "/": "\\u002F",
      "\\": "\\\\",
      "\b": "\\b",
      "\f": "\\f",
      "\n": "\\n",
      "\r": "\\r",
      "	": "\\t",
      "\0": "\\0",
      "\u2028": "\\u2028",
      "\u2029": "\\u2029"
    };
    escape_html_attr_dict = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    };
    s$1 = JSON.stringify;
    s = JSON.stringify;
    ReadOnlyFormData = class {
      constructor(map) {
        __privateAdd(this, _map, void 0);
        __privateSet(this, _map, map);
      }
      get(key) {
        const value = __privateGet(this, _map).get(key);
        return value && value[0];
      }
      getAll(key) {
        return __privateGet(this, _map).get(key);
      }
      has(key) {
        return __privateGet(this, _map).has(key);
      }
      *[Symbol.iterator]() {
        for (const [key, value] of __privateGet(this, _map)) {
          for (let i = 0; i < value.length; i += 1) {
            yield [key, value[i]];
          }
        }
      }
      *entries() {
        for (const [key, value] of __privateGet(this, _map)) {
          for (let i = 0; i < value.length; i += 1) {
            yield [key, value[i]];
          }
        }
      }
      *keys() {
        for (const [key] of __privateGet(this, _map))
          yield key;
      }
      *values() {
        for (const [, value] of __privateGet(this, _map)) {
          for (let i = 0; i < value.length; i += 1) {
            yield value[i];
          }
        }
      }
    };
    _map = new WeakMap();
    Promise.resolve();
    escaped = {
      '"': "&quot;",
      "'": "&#39;",
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;"
    };
    missing_component = {
      $$render: () => ""
    };
    css5 = {
      code: "#svelte-announcer.svelte-1pdgbjn{clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);height:1px;left:0;overflow:hidden;position:absolute;top:0;white-space:nowrap;width:1px}",
      map: null
    };
    Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { stores } = $$props;
      let { page: page2 } = $$props;
      let { components } = $$props;
      let { props_0 = null } = $$props;
      let { props_1 = null } = $$props;
      let { props_2 = null } = $$props;
      let { props_3 = null } = $$props;
      let { props_4 = null } = $$props;
      setContext("__svelte__", stores);
      afterUpdate(stores.page.notify);
      if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
        $$bindings.stores(stores);
      if ($$props.page === void 0 && $$bindings.page && page2 !== void 0)
        $$bindings.page(page2);
      if ($$props.components === void 0 && $$bindings.components && components !== void 0)
        $$bindings.components(components);
      if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
        $$bindings.props_0(props_0);
      if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
        $$bindings.props_1(props_1);
      if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
        $$bindings.props_2(props_2);
      if ($$props.props_3 === void 0 && $$bindings.props_3 && props_3 !== void 0)
        $$bindings.props_3(props_3);
      if ($$props.props_4 === void 0 && $$bindings.props_4 && props_4 !== void 0)
        $$bindings.props_4(props_4);
      $$result.css.add(css5);
      {
        stores.page.set(page2);
      }
      return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
        default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
          default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {
            default: () => `${components[3] ? `${validate_component(components[3] || missing_component, "svelte:component").$$render($$result, Object.assign(props_3 || {}), {}, {
              default: () => `${components[4] ? `${validate_component(components[4] || missing_component, "svelte:component").$$render($$result, Object.assign(props_4 || {}), {}, {})}` : ``}`
            })}` : ``}`
          })}` : ``}`
        })}` : ``}`
      })}

${``}`;
    });
    base = "";
    assets = "";
    getSession = ({ headers }) => {
      let session2 = getCookie("access_token", headers.cookie);
      return {
        isLoggedIn: session2 ? true : false,
        ...session2
      };
    };
    getCookie = (name, cookieStr) => {
      if (!cookieStr)
        return;
      let parsed = import_cookie30.default.parse(cookieStr);
      let str = parsed[name]?.substr(2);
      try {
        let data = JSON.parse(str);
        return data;
      } catch (e) {
        console.error(e);
        return;
      }
    };
    user_hooks = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      [Symbol.toStringTag]: "Module",
      getSession
    });
    template = ({ head, body }) => '<!doctype html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<meta name="description" content="" />\n		<link rel="icon" href="/favicon.ico" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
    options = null;
    default_settings = { paths: { "base": "", "assets": "" } };
    empty = () => ({});
    manifest = {
      assets: [{ "file": "favicon.ico", "size": 15406, "type": "image/vnd.microsoft.icon" }, { "file": "menu_black_24dp.svg", "size": 204, "type": "image/svg+xml" }, { "file": "une white logo.png", "size": 33476, "type": "image/png" }],
      layout: "src/routes/__layout.svelte",
      error: ".svelte-kit/build/components/error.svelte",
      routes: [
        {
          type: "page",
          pattern: /^\/$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/administrativo\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/administrativo/__layout.svelte", "src/routes/administrativo/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/coordinador\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/coordinador/__layout.svelte", "src/routes/coordinador/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/coordinador\/estructurar-diplomados-competencias\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/coordinador/__layout.svelte", "src/routes/coordinador/estructurar-diplomados-competencias/__layout.svelte", "src/routes/coordinador/estructurar-diplomados-competencias/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/coordinador\/estructurar-diplomados-competencias\/competencias\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/coordinador/__layout.svelte", "src/routes/coordinador/estructurar-diplomados-competencias/__layout.svelte", "src/routes/coordinador/estructurar-diplomados-competencias/competencias/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/coordinador\/estructurar-diplomados-competencias\/cursos\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/coordinador/__layout.svelte", "src/routes/coordinador/estructurar-diplomados-competencias/__layout.svelte", "src/routes/coordinador/estructurar-diplomados-competencias/cursos/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/coordinador\/coordinar-coaches\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/coordinador/__layout.svelte", "src/routes/coordinador/coordinar-coaches/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/coordinador\/gestion-registros\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/coordinador/__layout.svelte", "src/routes/coordinador/gestion-registros/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/coordinador\/gestion-jornadas\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/coordinador/__layout.svelte", "src/routes/coordinador/gestion-jornadas/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/coordinador\/gestion-usuarios\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/coordinador/__layout.svelte", "src/routes/coordinador/gestion-usuarios/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/newpassword\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/newpassword.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/instructor\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/instructor/__layout.svelte", "src/routes/instructor/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/instructor\/mis-cursos\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/instructor/__layout.svelte", "src/routes/instructor/mis-cursos/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/docente\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/docente/__layout.svelte", "src/routes/docente/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/docente\/mis-acreditaciones\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/docente/__layout.svelte", "src/routes/docente/mis-acreditaciones/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/docente\/mis-cursos\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/docente/__layout.svelte", "src/routes/docente/mis-cursos/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/coach\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/coach/__layout.svelte", "src/routes/coach/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/coach\/inscripciones\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/coach/__layout.svelte", "src/routes/coach/inscripciones/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/coach\/docentes\/?$/,
          params: empty,
          a: ["src/routes/__layout.svelte", "src/routes/coach/__layout.svelte", "src/routes/coach/docentes/index.svelte"],
          b: [".svelte-kit/build/components/error.svelte"]
        },
        {
          type: "page",
          pattern: /^\/login\/?$/,
          params: empty,
          a: ["src/routes/login/__layout.reset.svelte", "src/routes/login/index.svelte"],
          b: []
        }
      ]
    };
    get_hooks = (hooks) => ({
      getSession: hooks.getSession || (() => ({})),
      handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
      handleError: hooks.handleError || (({ error: error22 }) => console.error(error22.stack)),
      externalFetch: hooks.externalFetch || fetch
    });
    module_lookup = {
      "src/routes/__layout.svelte": () => Promise.resolve().then(() => (init_layout_753ddf4d(), layout_753ddf4d_exports)),
      ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(() => (init_error_d8b9c7da(), error_d8b9c7da_exports)),
      "src/routes/index.svelte": () => Promise.resolve().then(() => (init_index_34e5a335(), index_34e5a335_exports)),
      "src/routes/administrativo/__layout.svelte": () => Promise.resolve().then(() => (init_layout_0e5aaf68(), layout_0e5aaf68_exports)),
      "src/routes/administrativo/index.svelte": () => Promise.resolve().then(() => (init_index_062dcc89(), index_062dcc89_exports)),
      "src/routes/coordinador/__layout.svelte": () => Promise.resolve().then(() => (init_layout_e34548b7(), layout_e34548b7_exports)),
      "src/routes/coordinador/index.svelte": () => Promise.resolve().then(() => (init_index_9e9716a5(), index_9e9716a5_exports)),
      "src/routes/coordinador/estructurar-diplomados-competencias/__layout.svelte": () => Promise.resolve().then(() => (init_layout_99075d10(), layout_99075d10_exports)),
      "src/routes/coordinador/estructurar-diplomados-competencias/index.svelte": () => Promise.resolve().then(() => (init_index_a5c764ad(), index_a5c764ad_exports)),
      "src/routes/coordinador/estructurar-diplomados-competencias/competencias/index.svelte": () => Promise.resolve().then(() => (init_index_fb667e80(), index_fb667e80_exports)),
      "src/routes/coordinador/estructurar-diplomados-competencias/cursos/index.svelte": () => Promise.resolve().then(() => (init_index_33d0aa71(), index_33d0aa71_exports)),
      "src/routes/coordinador/coordinar-coaches/index.svelte": () => Promise.resolve().then(() => (init_index_d5283307(), index_d5283307_exports)),
      "src/routes/coordinador/gestion-registros/index.svelte": () => Promise.resolve().then(() => (init_index_388a53b1(), index_388a53b1_exports)),
      "src/routes/coordinador/gestion-jornadas/index.svelte": () => Promise.resolve().then(() => (init_index_520f7598(), index_520f7598_exports)),
      "src/routes/coordinador/gestion-usuarios/index.svelte": () => Promise.resolve().then(() => (init_index_eec71471(), index_eec71471_exports)),
      "src/routes/newpassword.svelte": () => Promise.resolve().then(() => (init_newpassword_74616ea9(), newpassword_74616ea9_exports)),
      "src/routes/instructor/__layout.svelte": () => Promise.resolve().then(() => (init_layout_12417190(), layout_12417190_exports)),
      "src/routes/instructor/index.svelte": () => Promise.resolve().then(() => (init_index_10eab8e7(), index_10eab8e7_exports)),
      "src/routes/instructor/mis-cursos/index.svelte": () => Promise.resolve().then(() => (init_index_81c96711(), index_81c96711_exports)),
      "src/routes/docente/__layout.svelte": () => Promise.resolve().then(() => (init_layout_ab0d2b33(), layout_ab0d2b33_exports)),
      "src/routes/docente/index.svelte": () => Promise.resolve().then(() => (init_index_d8a18eea(), index_d8a18eea_exports)),
      "src/routes/docente/mis-acreditaciones/index.svelte": () => Promise.resolve().then(() => (init_index_ec56bd95(), index_ec56bd95_exports)),
      "src/routes/docente/mis-cursos/index.svelte": () => Promise.resolve().then(() => (init_index_fcbd752b(), index_fcbd752b_exports)),
      "src/routes/coach/__layout.svelte": () => Promise.resolve().then(() => (init_layout_652a32cd(), layout_652a32cd_exports)),
      "src/routes/coach/index.svelte": () => Promise.resolve().then(() => (init_index_b5bf7e3d(), index_b5bf7e3d_exports)),
      "src/routes/coach/inscripciones/index.svelte": () => Promise.resolve().then(() => (init_index_8a629440(), index_8a629440_exports)),
      "src/routes/coach/docentes/index.svelte": () => Promise.resolve().then(() => (init_index_22fc459a(), index_22fc459a_exports)),
      "src/routes/login/__layout.reset.svelte": () => Promise.resolve().then(() => (init_layout_reset_bff6669e(), layout_reset_bff6669e_exports)),
      "src/routes/login/index.svelte": () => Promise.resolve().then(() => (init_index_02c205ff(), index_02c205ff_exports))
    };
    metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-5ba64ce6.js", "css": ["assets/pages/__layout.svelte-55892ec5.css", "assets/vendor-15d9d811.css", "assets/toastArea-56d70290.css"], "js": ["pages/__layout.svelte-5ba64ce6.js", "chunks/vendor-0b4b0cdb.js", "chunks/stores-166c9dbe.js", "chunks/loadingSpinner-c13a4766.js", "chunks/toastArea-57856682.js", "chunks/prompts-f6e18b65.js", "chunks/toasts-b7bacc0f.js", "chunks/index-57452749.js", "chunks/serverURL-d16f5684.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "error.svelte-dc1a4c81.js", "css": ["assets/vendor-15d9d811.css"], "js": ["error.svelte-dc1a4c81.js", "chunks/vendor-0b4b0cdb.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-4bf035d8.js", "css": ["assets/vendor-15d9d811.css"], "js": ["pages/index.svelte-4bf035d8.js", "chunks/vendor-0b4b0cdb.js", "chunks/stores-166c9dbe.js", "chunks/logoutButton-8b996539.js", "chunks/serverURL-d16f5684.js", "chunks/capitalizeString-bffa0771.js"], "styles": [] }, "src/routes/administrativo/__layout.svelte": { "entry": "pages/administrativo/__layout.svelte-75a508b9.js", "css": ["assets/vendor-15d9d811.css", "assets/mobileLayout-3c7291fc.css"], "js": ["pages/administrativo/__layout.svelte-75a508b9.js", "chunks/vendor-0b4b0cdb.js", "chunks/mobileLayout-121ba740.js", "chunks/stores-166c9dbe.js", "chunks/useModal-16043ad5.js", "chunks/logoutButton-8b996539.js", "chunks/serverURL-d16f5684.js"], "styles": [] }, "src/routes/administrativo/index.svelte": { "entry": "pages/administrativo/index.svelte-98887475.js", "css": ["assets/vendor-15d9d811.css"], "js": ["pages/administrativo/index.svelte-98887475.js", "chunks/vendor-0b4b0cdb.js"], "styles": [] }, "src/routes/coordinador/__layout.svelte": { "entry": "pages/coordinador/__layout.svelte-33428351.js", "css": ["assets/pages/coordinador/__layout.svelte-e86784fa.css", "assets/vendor-15d9d811.css"], "js": ["pages/coordinador/__layout.svelte-33428351.js", "chunks/vendor-0b4b0cdb.js", "chunks/stores-166c9dbe.js", "chunks/logoutButton-8b996539.js", "chunks/serverURL-d16f5684.js"], "styles": [] }, "src/routes/coordinador/index.svelte": { "entry": "pages/coordinador/index.svelte-35fbafdb.js", "css": ["assets/vendor-15d9d811.css"], "js": ["pages/coordinador/index.svelte-35fbafdb.js", "chunks/vendor-0b4b0cdb.js", "chunks/navigation-51f4a605.js", "chunks/singletons-12a22614.js"], "styles": [] }, "src/routes/coordinador/estructurar-diplomados-competencias/__layout.svelte": { "entry": "pages/coordinador/estructurar-diplomados-competencias/__layout.svelte-138d8498.js", "css": ["assets/vendor-15d9d811.css"], "js": ["pages/coordinador/estructurar-diplomados-competencias/__layout.svelte-138d8498.js", "chunks/vendor-0b4b0cdb.js", "chunks/stores-166c9dbe.js"], "styles": [] }, "src/routes/coordinador/estructurar-diplomados-competencias/index.svelte": { "entry": "pages/coordinador/estructurar-diplomados-competencias/index.svelte-4ea82867.js", "css": ["assets/vendor-15d9d811.css"], "js": ["pages/coordinador/estructurar-diplomados-competencias/index.svelte-4ea82867.js", "chunks/vendor-0b4b0cdb.js", "chunks/navigation-51f4a605.js", "chunks/singletons-12a22614.js"], "styles": [] }, "src/routes/coordinador/estructurar-diplomados-competencias/competencias/index.svelte": { "entry": "pages/coordinador/estructurar-diplomados-competencias/competencias/index.svelte-ca23144d.js", "css": ["assets/modal.svelte_svelte_type_style_lang-5db5270b.css", "assets/vendor-15d9d811.css"], "js": ["pages/coordinador/estructurar-diplomados-competencias/competencias/index.svelte-ca23144d.js", "chunks/vendor-0b4b0cdb.js", "chunks/handleError-b3179747.js", "chunks/toasts-b7bacc0f.js", "chunks/capitalizeString-bffa0771.js", "chunks/index-57452749.js", "chunks/serverURL-d16f5684.js", "chunks/competenciasConTipo-581daa1d.js", "chunks/prompts-f6e18b65.js", "chunks/useModal-16043ad5.js", "chunks/makeArraySearchable-01ec942f.js", "chunks/noUndefinedValues-bf4bff28.js"], "styles": [] }, "src/routes/coordinador/estructurar-diplomados-competencias/cursos/index.svelte": { "entry": "pages/coordinador/estructurar-diplomados-competencias/cursos/index.svelte-c02b8aff.js", "css": ["assets/modal.svelte_svelte_type_style_lang-5db5270b.css", "assets/vendor-15d9d811.css"], "js": ["pages/coordinador/estructurar-diplomados-competencias/cursos/index.svelte-c02b8aff.js", "chunks/vendor-0b4b0cdb.js", "chunks/handleError-b3179747.js", "chunks/toasts-b7bacc0f.js", "chunks/capitalizeString-bffa0771.js", "chunks/index-57452749.js", "chunks/serverURL-d16f5684.js", "chunks/cursosConDiplomado-1e8fc1ea.js", "chunks/prompts-f6e18b65.js", "chunks/useModal-16043ad5.js", "chunks/makeArraySearchable-01ec942f.js", "chunks/noUndefinedValues-bf4bff28.js"], "styles": [] }, "src/routes/coordinador/coordinar-coaches/index.svelte": { "entry": "pages/coordinador/coordinar-coaches/index.svelte-b29247ef.js", "css": ["assets/modal.svelte_svelte_type_style_lang-5db5270b.css", "assets/vendor-15d9d811.css"], "js": ["pages/coordinador/coordinar-coaches/index.svelte-b29247ef.js", "chunks/vendor-0b4b0cdb.js", "chunks/handleError-b3179747.js", "chunks/toasts-b7bacc0f.js", "chunks/capitalizeString-bffa0771.js", "chunks/index-57452749.js", "chunks/serverURL-d16f5684.js", "chunks/coachesComoUsuario-e3afe54d.js", "chunks/docentesComoUsuario-996e6954.js", "chunks/useModal-16043ad5.js", "chunks/makeArraySearchable-01ec942f.js"], "styles": [] }, "src/routes/coordinador/gestion-registros/index.svelte": { "entry": "pages/coordinador/gestion-registros/index.svelte-48249ab7.js", "css": ["assets/modal.svelte_svelte_type_style_lang-5db5270b.css", "assets/vendor-15d9d811.css"], "js": ["pages/coordinador/gestion-registros/index.svelte-48249ab7.js", "chunks/vendor-0b4b0cdb.js", "chunks/handleError-b3179747.js", "chunks/toasts-b7bacc0f.js", "chunks/capitalizeString-bffa0771.js", "chunks/index-57452749.js", "chunks/serverURL-d16f5684.js", "chunks/docentesComoUsuario-996e6954.js", "chunks/competenciasConTipo-581daa1d.js", "chunks/cursosConDiplomado-1e8fc1ea.js", "chunks/prompts-f6e18b65.js", "chunks/useModal-16043ad5.js", "chunks/makeArraySearchable-01ec942f.js", "chunks/stores-166c9dbe.js", "chunks/formatDate-2f20d9da.js", "chunks/usuariosConRoles-6c685d82.js"], "styles": [] }, "src/routes/coordinador/gestion-jornadas/index.svelte": { "entry": "pages/coordinador/gestion-jornadas/index.svelte-652f0344.js", "css": ["assets/modal.svelte_svelte_type_style_lang-5db5270b.css", "assets/vendor-15d9d811.css"], "js": ["pages/coordinador/gestion-jornadas/index.svelte-652f0344.js", "chunks/vendor-0b4b0cdb.js", "chunks/handleError-b3179747.js", "chunks/toasts-b7bacc0f.js", "chunks/capitalizeString-bffa0771.js", "chunks/index-57452749.js", "chunks/serverURL-d16f5684.js", "chunks/cursosEnJornadaConAsistentes-c8c5f4de.js", "chunks/cursosEnJornadaConInstructorConCurso-6d0e043b.js", "chunks/cursosConDiplomado-1e8fc1ea.js", "chunks/docentesComoUsuario-996e6954.js", "chunks/asistentesEnCursoConfirmados-1f73ad4b.js", "chunks/prompts-f6e18b65.js", "chunks/useModal-16043ad5.js", "chunks/formatDate-2f20d9da.js", "chunks/makeArraySearchable-01ec942f.js", "chunks/competenciasConTipo-581daa1d.js", "chunks/usuariosConRoles-6c685d82.js", "chunks/noUndefinedValues-bf4bff28.js"], "styles": [] }, "src/routes/coordinador/gestion-usuarios/index.svelte": { "entry": "pages/coordinador/gestion-usuarios/index.svelte-1cd8d310.js", "css": ["assets/modal.svelte_svelte_type_style_lang-5db5270b.css", "assets/vendor-15d9d811.css"], "js": ["pages/coordinador/gestion-usuarios/index.svelte-1cd8d310.js", "chunks/vendor-0b4b0cdb.js", "chunks/stores-166c9dbe.js", "chunks/index-f48b41d2.js", "chunks/index-57452749.js", "chunks/serverURL-d16f5684.js", "chunks/competenciasConTipo-581daa1d.js", "chunks/cursosConDiplomado-1e8fc1ea.js", "chunks/docentesComoUsuario-996e6954.js", "chunks/asistentesEnCursoConfirmados-1f73ad4b.js", "chunks/cursosEnJornadaConInstructorConCurso-6d0e043b.js", "chunks/useModal-16043ad5.js", "chunks/handleError-b3179747.js", "chunks/toasts-b7bacc0f.js", "chunks/capitalizeString-bffa0771.js", "chunks/usuariosConRoles-6c685d82.js", "chunks/prompts-f6e18b65.js", "chunks/makeArraySearchable-01ec942f.js", "chunks/noUndefinedValues-bf4bff28.js"], "styles": [] }, "src/routes/newpassword.svelte": { "entry": "pages/newpassword.svelte-c5ca1a63.js", "css": ["assets/vendor-15d9d811.css"], "js": ["pages/newpassword.svelte-c5ca1a63.js", "chunks/vendor-0b4b0cdb.js", "chunks/stores-166c9dbe.js", "chunks/spinner-167f60b4.js", "chunks/index-57452749.js", "chunks/serverURL-d16f5684.js", "chunks/toasts-b7bacc0f.js"], "styles": [] }, "src/routes/instructor/__layout.svelte": { "entry": "pages/instructor/__layout.svelte-886c0cae.js", "css": ["assets/vendor-15d9d811.css", "assets/mobileLayout-3c7291fc.css"], "js": ["pages/instructor/__layout.svelte-886c0cae.js", "chunks/vendor-0b4b0cdb.js", "chunks/mobileLayout-121ba740.js", "chunks/stores-166c9dbe.js", "chunks/useModal-16043ad5.js", "chunks/logoutButton-8b996539.js", "chunks/serverURL-d16f5684.js"], "styles": [] }, "src/routes/instructor/index.svelte": { "entry": "pages/instructor/index.svelte-2c2b276f.js", "css": ["assets/vendor-15d9d811.css"], "js": ["pages/instructor/index.svelte-2c2b276f.js", "chunks/vendor-0b4b0cdb.js", "chunks/navigation-51f4a605.js", "chunks/singletons-12a22614.js"], "styles": [] }, "src/routes/instructor/mis-cursos/index.svelte": { "entry": "pages/instructor/mis-cursos/index.svelte-c9d8bc32.js", "css": ["assets/modal.svelte_svelte_type_style_lang-5db5270b.css", "assets/vendor-15d9d811.css"], "js": ["pages/instructor/mis-cursos/index.svelte-c9d8bc32.js", "chunks/vendor-0b4b0cdb.js", "chunks/stores-166c9dbe.js", "chunks/cursosEnJornadaConInstructorConCurso-6d0e043b.js", "chunks/index-57452749.js", "chunks/serverURL-d16f5684.js", "chunks/cursosConDiplomado-1e8fc1ea.js", "chunks/jornadaActual-4e08460c.js", "chunks/cursosEnJornadaConAsistentes-c8c5f4de.js", "chunks/docentesComoUsuario-996e6954.js", "chunks/asistentesEnCursoConfirmados-1f73ad4b.js", "chunks/useModal-16043ad5.js", "chunks/toasts-b7bacc0f.js", "chunks/handleError-b3179747.js", "chunks/capitalizeString-bffa0771.js", "chunks/loadingSpinner-c13a4766.js", "chunks/prompts-f6e18b65.js"], "styles": [] }, "src/routes/docente/__layout.svelte": { "entry": "pages/docente/__layout.svelte-c28726e8.js", "css": ["assets/vendor-15d9d811.css", "assets/mobileLayout-3c7291fc.css"], "js": ["pages/docente/__layout.svelte-c28726e8.js", "chunks/vendor-0b4b0cdb.js", "chunks/mobileLayout-121ba740.js", "chunks/stores-166c9dbe.js", "chunks/useModal-16043ad5.js", "chunks/logoutButton-8b996539.js", "chunks/serverURL-d16f5684.js"], "styles": [] }, "src/routes/docente/index.svelte": { "entry": "pages/docente/index.svelte-e24c47ef.js", "css": ["assets/vendor-15d9d811.css"], "js": ["pages/docente/index.svelte-e24c47ef.js", "chunks/vendor-0b4b0cdb.js", "chunks/navigation-51f4a605.js", "chunks/singletons-12a22614.js"], "styles": [] }, "src/routes/docente/mis-acreditaciones/index.svelte": { "entry": "pages/docente/mis-acreditaciones/index.svelte-4163d587.js", "css": ["assets/vendor-15d9d811.css"], "js": ["pages/docente/mis-acreditaciones/index.svelte-4163d587.js", "chunks/vendor-0b4b0cdb.js", "chunks/stores-166c9dbe.js", "chunks/index-f48b41d2.js", "chunks/index-57452749.js", "chunks/serverURL-d16f5684.js", "chunks/competenciasConTipo-581daa1d.js", "chunks/cursosConDiplomado-1e8fc1ea.js", "chunks/docentesComoUsuario-996e6954.js", "chunks/asistentesEnCursoConfirmados-1f73ad4b.js", "chunks/cursosEnJornadaConInstructorConCurso-6d0e043b.js", "chunks/useModal-16043ad5.js"], "styles": [] }, "src/routes/docente/mis-cursos/index.svelte": { "entry": "pages/docente/mis-cursos/index.svelte-5ccad419.js", "css": ["assets/vendor-15d9d811.css"], "js": ["pages/docente/mis-cursos/index.svelte-5ccad419.js", "chunks/vendor-0b4b0cdb.js", "chunks/stores-166c9dbe.js", "chunks/docentesComoUsuario-996e6954.js", "chunks/index-57452749.js", "chunks/serverURL-d16f5684.js", "chunks/jornadaActual-4e08460c.js", "chunks/cursosEnJornadaConInstructorConCurso-6d0e043b.js", "chunks/cursosConDiplomado-1e8fc1ea.js", "chunks/toasts-b7bacc0f.js"], "styles": [] }, "src/routes/coach/__layout.svelte": { "entry": "pages/coach/__layout.svelte-b70ee6f4.js", "css": ["assets/vendor-15d9d811.css", "assets/mobileLayout-3c7291fc.css"], "js": ["pages/coach/__layout.svelte-b70ee6f4.js", "chunks/vendor-0b4b0cdb.js", "chunks/mobileLayout-121ba740.js", "chunks/stores-166c9dbe.js", "chunks/useModal-16043ad5.js", "chunks/logoutButton-8b996539.js", "chunks/serverURL-d16f5684.js"], "styles": [] }, "src/routes/coach/index.svelte": { "entry": "pages/coach/index.svelte-1a0fdbf0.js", "css": ["assets/vendor-15d9d811.css"], "js": ["pages/coach/index.svelte-1a0fdbf0.js", "chunks/vendor-0b4b0cdb.js", "chunks/navigation-51f4a605.js", "chunks/singletons-12a22614.js"], "styles": [] }, "src/routes/coach/inscripciones/index.svelte": { "entry": "pages/coach/inscripciones/index.svelte-fcf79e98.js", "css": ["assets/modal.svelte_svelte_type_style_lang-5db5270b.css", "assets/vendor-15d9d811.css"], "js": ["pages/coach/inscripciones/index.svelte-fcf79e98.js", "chunks/vendor-0b4b0cdb.js", "chunks/jornadaActual-4e08460c.js", "chunks/index-57452749.js", "chunks/serverURL-d16f5684.js", "chunks/cursosEnJornadaConAsistentes-c8c5f4de.js", "chunks/cursosEnJornadaConInstructorConCurso-6d0e043b.js", "chunks/cursosConDiplomado-1e8fc1ea.js", "chunks/docentesComoUsuario-996e6954.js", "chunks/asistentesEnCursoConfirmados-1f73ad4b.js", "chunks/useModal-16043ad5.js", "chunks/toasts-b7bacc0f.js", "chunks/makeArraySearchable-01ec942f.js"], "styles": [] }, "src/routes/coach/docentes/index.svelte": { "entry": "pages/coach/docentes/index.svelte-094ff033.js", "css": ["assets/vendor-15d9d811.css"], "js": ["pages/coach/docentes/index.svelte-094ff033.js", "chunks/vendor-0b4b0cdb.js", "chunks/stores-166c9dbe.js", "chunks/coachesComoUsuario-e3afe54d.js", "chunks/index-57452749.js", "chunks/serverURL-d16f5684.js", "chunks/docentesComoUsuario-996e6954.js", "chunks/useModal-16043ad5.js", "chunks/index-f48b41d2.js", "chunks/competenciasConTipo-581daa1d.js", "chunks/cursosConDiplomado-1e8fc1ea.js", "chunks/asistentesEnCursoConfirmados-1f73ad4b.js", "chunks/cursosEnJornadaConInstructorConCurso-6d0e043b.js", "chunks/makeArraySearchable-01ec942f.js"], "styles": [] }, "src/routes/login/__layout.reset.svelte": { "entry": "pages/login/__layout.reset.svelte-b4455b8e.js", "css": ["assets/vendor-15d9d811.css", "assets/toastArea-56d70290.css"], "js": ["pages/login/__layout.reset.svelte-b4455b8e.js", "chunks/vendor-0b4b0cdb.js", "chunks/toastArea-57856682.js", "chunks/prompts-f6e18b65.js", "chunks/toasts-b7bacc0f.js"], "styles": [] }, "src/routes/login/index.svelte": { "entry": "pages/login/index.svelte-bb8e09f8.js", "css": ["assets/vendor-15d9d811.css"], "js": ["pages/login/index.svelte-bb8e09f8.js", "chunks/vendor-0b4b0cdb.js", "chunks/navigation-51f4a605.js", "chunks/singletons-12a22614.js", "chunks/stores-166c9dbe.js", "chunks/spinner-167f60b4.js", "chunks/serverURL-d16f5684.js", "chunks/prompts-f6e18b65.js", "chunks/toasts-b7bacc0f.js"], "styles": [] } };
  }
});

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});
init_shims();

// .svelte-kit/output/server/app.js
init_shims();
init_app_648d86f1();
var import_cookie31 = __toModule(require_cookie());

// .svelte-kit/netlify/entry.js
init();
async function handler(event) {
  const { path, httpMethod, headers, rawQuery, body, isBase64Encoded } = event;
  const query = new URLSearchParams(rawQuery);
  const rawBody = headers["content-type"] === "application/octet-stream" ? new TextEncoder("base64").encode(body) : isBase64Encoded ? Buffer.from(body, "base64").toString() : body;
  const rendered = await render({
    method: httpMethod,
    headers,
    path,
    query,
    rawBody
  });
  if (rendered) {
    return {
      isBase64Encoded: false,
      statusCode: rendered.status,
      headers: rendered.headers,
      body: rendered.body
    };
  }
  return {
    statusCode: 404,
    body: "Not found"
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
/*! fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */
