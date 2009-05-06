<%= license %>

/**
 * == utils ==
 **/

/** section: utils
 * JS
 **/
JS = {
  /** section: utils
   * JS.extend(target, extensions) -> Object
   * - target (Object): object to be extended
   * - extensions (Object): object containing key/value pairs to add to target
   *
   * Adds the properties of the second argument to the first, and returns the first. Will not
   * needlessly overwrite fields with identical values; if an object has inherited a property
   * we should not add the property to the object itself.
   **/
  extend: function(target, extensions) {
    extensions = extensions || {};
    for (var prop in extensions) {
      if (target[prop] === extensions[prop]) continue;
      target[prop] = extensions[prop];
    }
    return target;
  },
  
  /** section: utils
   * JS.makeFunction() -> Function
   *
   * Returns a function for use as a constructor. These functions are used as the basis for
   * classes. The constructor calls the object's initialize() method if it exists.
   **/
  makeFunction: function() {
    return function() {
      return this.initialize
          ? (this.initialize.apply(this, arguments) || this)
          : this;
    };
  },
  
  /** section: utils
   * JS.makeBridge(klass) -> Object
   * - klass (JS.Class): class from which you want to inherit
   *
   * Takes a class and returns an instance of it, without calling the class's constructor.
   * Used for forging links between objects using JavaScript's inheritance model.
   **/
  makeBridge: function(klass) {
    var bridge = function() {};
    bridge.prototype = klass.prototype;
    return new bridge;
  },
  
  /** section: utils
   * JS.bind(object, func) -> Function
   * - object (Object): object to bind the function to
   * - func (Function): function that the bound function should call
   *
   * Takes a function and an object, and returns a new function that calls the original
   * function with 'this' set to refer to the object. Used to implement Object#method,
   * amongst other things.
   **/
  bind: function() {
    var args = JS.array(arguments), method = args.shift(), object = args.shift() || null;
    return function() {
      return method.apply(object, args.concat(JS.array(arguments)));
    };
  },
  
  /** section: utils
   * JS.callsSuper(func) -> Boolean
   * - func (Function): function to test for super() calls
   *
   * Takes a function and returns true iff the function makes a call to callSuper(). Result
   * is cached on the function itself since functions are immutable and decompiling them
   * is expensive. We use this to determine whether to wrap the function when it's added
   * to a class; wrapping impedes performance and should be avoided where possible.
   **/
  callsSuper: function(func) {
    return func.SUPER === undefined
        ? func.SUPER = /\bcallSuper\b/.test(func.toString())
        : func.SUPER;
  },
  
  /** section: utils
   * JS.mask(func) -> Function
   * - func (Function): function to obfuscate
   *
   * Disguises a function so that we cannot tell if it uses callSuper(). Sometimes we don't
   * want such functions to be wrapped by the inheritance system. Modifies the function's
   * toString() method and returns the function.
   **/
  mask: function(func) {
    var string = func.toString().replace(/callSuper/g, 'super');
    func.toString = function() { return string };
    return func;
  },
  
  /** section: utils
   * JS.array(iterable) -> Array
   * - iterable (Object): object you want to cast to an Array
   *
   * Takes any iterable object (something with a 'length' property) and returns a native
   * JavaScript Array containing the same elements.
   **/
  array: function(iterable) {
    if (!iterable) return [];
    if (iterable.toArray) return iterable.toArray();
    var length = iterable.length, results = [];
    while (length--) results[length] = iterable[length];
    return results;
  },
  
  /** section: utils
   * JS.indexOf(haystack, needle) -> Number
   * - haystack (Array): array to search
   * - needle (Object): object to search for
   *
   * Returns the index of the needle in the haystack, which is typically an Array or an
   * array-like object. Returns -1 if no matching element is found. We need this as older
   * IE versions don't implement Array#indexOf().
   **/
  indexOf: function(haystack, needle) {
    for (var i = 0, n = haystack.length; i < n; i++) {
      if (haystack[i] === needle) return i;
    }
    return -1;
  },
  
  /** section: utils
   * JS.isFn(object) -> Boolean
   * - object (Object): object to test
   *
   * Returns true iff the argument is a function.
   **/
  isFn: function(object) {
    return object instanceof Function;
  },
  
  /** section: utils
   * JS.ignore(key, object) -> Boolean
   * - key (String): name of field being added to an object
   * - object (Object): value of the given field
   *
   * Used to determine whether a key-value pair should be added to a class or module. Pairs
   * may be ignored if they have some special function, like 'include' or 'extend'.
   **/
  ignore: function(key, object) {
    return /^(include|extend)$/.test(key) && typeof object === 'object';
  }
};
