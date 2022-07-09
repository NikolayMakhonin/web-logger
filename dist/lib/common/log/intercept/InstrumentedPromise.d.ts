export declare const OriginalPromise: PromiseConstructor;
/**
 * ES5 subclassing is used per:
 * https://github.com/rtsao/browser-unhandled-rejection/issues/1
 * https://kangax.github.io/compat-table/es6/#test-Promise_is_subclassable
 *
 * Adapted from: https://gist.github.com/domenic/8ed6048b187ee8f2ec75
 */
export declare const InstrumentedPromise: {
    (resolver: any): any;
    __proto__: PromiseConstructor;
};
export declare const needUnhandledRejectionPolyfill: boolean;
