function getGlobalScope() {
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    throw new Error('globalScope is not found');
}
const globalScope = getGlobalScope();

export { getGlobalScope, globalScope };
