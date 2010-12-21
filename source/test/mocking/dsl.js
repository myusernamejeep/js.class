JS.Test.extend({
  Mocking: new JS.Module({
    extend: {
      __activeStubs__: [],
      
      findStub: function(object, methodName) {
        var stubs = this.__activeStubs__,
            i     = stubs.length;
        
        while (i--) {
          if (stubs[i]._object === object && stubs[i]._methodName === methodName)
            return stubs[i];
        }
        
        var stub = new JS.Test.Mocking.Stub(object, methodName);
        stubs.push(stub);
        return stub;
      },
      
      removeStubs: function() {
        var stubs = this.__activeStubs__,
            i     = stubs.length;
        
        while (i--) stubs[i].revoke();
        this.__activeStubs__ = [];
      },
      
      Stub: new JS.Class({
        initialize: function(object, methodName) {
          this._object      = object;
          this._methodName  = methodName;
          this._original    = object[methodName];
          this._ownProperty = object.hasOwnProperty(methodName);
          this._argMatchers = [new JS.Test.Mocking.Parameters(this, [])];
        },
        
        apply: function() {
          var object = this._object, methodName = this._methodName;
          if (object[methodName] !== this._original) return;
          var self = this;
          object[methodName] = function() { return self._dispatch(arguments) };
        },
        
        revoke: function() {
          if (this._ownProperty)
            this._object[this._methodName] = this._original;
          else
            delete this._object[this._methodName];
        },
        
        given: function() {
          var matcher = new JS.Test.Mocking.Parameters(arguments);
          this._argMatchers.push(matcher);
          return this;
        },
        
        raises: function(exception) {
          var matchers = this._argMatchers;
          matchers[matchers.length - 1]._exception = exception;
          return this;
        },
        
        returns: function(returnValue) {
          var matchers = this._argMatchers;
          matchers[matchers.length - 1]._returnValue = returnValue;
          return this;
        },
        
        yields: function() {
          var matchers = this._argMatchers;
          matchers[matchers.length - 1]._yieldArgs = arguments;
          return this;
        },
        
        _dispatch: function(args) {
          var matchers = this._argMatchers,
              matcher, result;
          
          for (var i = 0, n = matchers.length; i < n; i++) {
            matcher = matchers[i];
            result  = matcher.match(args);
            
            if (!result) continue;
            
            if (result === true)  return matcher._returnValue;
            if (result.callback)  return result.callback.apply(result.context, matcher._yieldArgs);
            if (result.exception) throw result.exception;
          }
        }
      }),
      
      Parameters: new JS.Class({
        initialize: function(params) {
          this._params = JS.array(params);
        },
        
        match: function(args) {
          var argsCopy = JS.array(args), callback, context;
          
          if (this._yieldArgs) {
            if (JS.isFn(argsCopy[argsCopy.length - 2])) {
              context  = argsCopy.pop();
              callback = argsCopy.pop();
            } else if (JS.isFn(argsCopy[argsCopy.length - 1])) {
              context  = null;
              callback = argsCopy.pop();
            }
          }
          
          if (!JS.Enumerable.areEqual(this._params, argsCopy)) return false;
          
          if (this._exception) return {exception: this._exception};
          if (this._yieldArgs) return {callback: callback, context: context};
          return true;
        }
      }),
      
      ArrayIncluding: new JS.Class({
        initialize: function(elements) {
          this._elements = elements;
        },
        
        equals: function(array) {
          if (!JS.isType(array, Array)) return false;
          var i = this._elements.length;
          while (i--) {
            if (JS.indexOf(array, this._elements[i]) === -1)
              return false;
          }
          return true;
        }
      }),
      
      ObjectIncluding: new JS.Class({
        initialize: function(elements) {
          this._elements = elements;
        },
        
        equals: function(object) {
          if (!JS.isType(object, Object)) return false;
          for (var key in this._elements) {
            if (!JS.Enumerable.areEqual(this._elements[key], object[key]))
              return false;
          }
          return true;
        }
      }),
      
      InstanceOf: new JS.Class({
        initialize: function(type) {
          this._type = type;
        },
        
        equals: function(object) {
          return JS.isType(object, this._type);
        }
      }),
      
      Matcher: new JS.Class({
        initialize: function(type) {
          this._type = type;
        },
        
        equals: function(object) {
          return JS.match(this._type, object);
        }
      }),
      
      DSL: new JS.Module({
        stub: function(object, methodName) {
          var stub = JS.Test.Mocking.findStub(object, methodName);
          stub.apply();
          return stub;
        },
        
        a: function(type) {
          return new JS.Test.Mocking.InstanceOf(type);
        },
        
        match: function(type) {
          return new JS.Test.Mocking.Matcher(type);
        },
        
        arrayIncluding: function() {
          return new JS.Test.Mocking.ArrayIncluding(arguments);
        },
        
        objectIncluding: function(elements) {
          return new JS.Test.Mocking.ObjectIncluding(elements);
        }
      })
    }
  })
});

JS.Test.Mocking.DSL.include({
  an: JS.Test.Mocking.DSL.instanceMethod('a')
});

JS.Test.Unit.TestCase.include(JS.Test.Mocking.DSL);
JS.Test.Unit.mocking = JS.Test.Mocking;
