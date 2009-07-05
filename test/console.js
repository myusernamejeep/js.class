JSCLASS_PATH = 'build/min/';
load (JSCLASS_PATH + 'loader.js');

require('JS.Test.Unit', function() {
  TestFoo = new JS.Class('TestFoo', JS.Test.Unit.TestCase, {
    testError: function() {
      this.noneSuch();
    },
    
    testFlunk: function() {
      this.flunk('Write tests or I will kneecap you')
    },
    
    testAssert: function() {
      this.assert(true);
      this.assert(false);
    },
    
    testAssertEqual: function() {
      this.assertEqual('foo', 'foo');
      this.assertEqual('foo', 'bar');
    },
    
    testAssertNotEqual: function() {
      this.assertNotEqual('foo', 'bar');
      this.assertNotEqual('foo', 'foo');
    },
    
    testAssertNull: function() {
      this.assertNull(null);
      this.assertNull(false);
    },
    
    testAssertNotNull: function() {
      this.assertNotNull(false);
      this.assertNotNull(null);
    },
    
    testAssertKindOf: function() {
      this.assertKindOf(Array, []);
      this.assertKindOf(Function, []);
    },
    
    testAssertRespondTo: function() {
      this.assertRespondTo('string', 'toUpperCase');
      this.assertRespondTo('string', 'quack', 'This is odd.');
    },
    
    testAssertMatch: function() {
      this.assertMatch(/foo/, 'food');
      this.assertMatch(/foo/, 'foal');
    },
    
    testAssertNoMatch: function() {
      this.assertNoMatch(/foo/, 'foal');
      this.assertNoMatch(/foo/, 'food');
    },
    
    testAssertSame: function() {
      var a = [1,2,3];
      this.assertSame(a, a);
      this.assertSame(a, [1,2,3]);
    },
    
    testAssertNotSame: function() {
      var a = [1,2,3];
      this.assertNotSame(a, [1,2,3]);
      this.assertNotSame(a, a);
    },
    
    testAssertInDelta: function() {
      this.assertInDelta(9,8,1);
      this.assertInDelta(9,7,1);
    },
    
    testAssertSend: function() {
      this.assertSend([/foo/, 'test', 'food']);
      this.assertSend([/foo/, 'test', 'foal']);
    }
  });

  JS.Test.Unit.UI.Console.TestRunner.run(TestFoo);
});
