// Shared loader for the sessions-layer unit tests.
//
// The sessions files are dual-mode: they assign to `window.X` for the browser and the
// concatenated ESP32 bundle, and also export via `module.exports` so Node can require
// them. Tests require() them, so the objects they return come from this realm and
// assert.deepEqual compares them normally -- values built inside a `vm` sandbox carry
// that sandbox's own Array/Object prototypes and fail strict deep equality.
//
// loadSessionsInSandbox() still exercises the browser path (IIFE + window assignment) and
// is used by the test that checks the globals get registered.
//
// This file intentionally contains no tests of its own.

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SESSIONS_FILES = [
  'sessions-model.js',
  'sessions-storage.js',
  'sessions-services.js'
];

const Model = require('../sessions-model.js');
const Storage = require('../sessions-storage.js');
const Services = require('../sessions-services.js');

/** In-memory storage service + services, which is what almost every test wants. */
function createTestServices() {
  const storage = Storage.createStorageService({
    backend: Storage.createMemoryBackend(),
    fileStore: Storage.createMemoryFileStore()
  });
  const services = Services.createServices({ storage });
  return { Model, Storage, Services, storage, services };
}

/**
 * Loads the sessions layer the way a browser does: each file as a bare script in a
 * sandbox with a fake `window`, no module system available.
 * @param {{navigator?: Object, indexedDB?: Object, extraGlobals?: Object}} [options]
 */
function loadSessionsInSandbox(options) {
  const opts = options || {};
  const windowObj = {};

  const context = Object.assign({
    window: windowObj,
    console,
    Math,
    Number,
    String,
    Boolean,
    Date,
    Array,
    Object,
    Set,
    Map,
    JSON,
    Promise,
    RegExp,
    Error,
    Uint8Array,
    TextEncoder,
    TextDecoder,
    parseInt,
    parseFloat,
    isNaN,
    Infinity,
    setTimeout,
    clearTimeout,
    // crypto.getRandomValues is what the model uses for UUIDs (crypto.randomUUID needs a
    // secure context the ESP32 build does not have), so provide just that.
    crypto: { getRandomValues: (bytes) => require('node:crypto').randomFillSync(bytes) }
  }, opts.extraGlobals || {});

  // Only defined when a test supplies them, so the "no IndexedDB / no camera" fallback
  // paths are what runs by default.
  if (opts.indexedDB) context.indexedDB = opts.indexedDB;
  if (opts.navigator) context.navigator = opts.navigator;

  vm.createContext(context);
  SESSIONS_FILES.forEach((file) => {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    vm.runInContext(source, context, { filename: file });
  });

  return {
    window: windowObj,
    context,
    Model: windowObj.SessionsModel,
    Storage: windowObj.SessionsStorage,
    Services: windowObj.SessionsServices
  };
}

module.exports = {
  Model,
  Storage,
  Services,
  createTestServices,
  loadSessionsInSandbox,
  SESSIONS_FILES
};
