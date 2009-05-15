JS.Set = new JS.Class('Set', {
  extend: {
    forEach: function(list, block, context) {
      if (!list) return;
      if (list.forEach) return list.forEach(block, context);
      for (var i = 0, n = list.length; i < n; i++) {
        if (list[i] !== undefined)
          block.call(context || null, list[i], i);
      }
    },
    
    areEqual: function(one, another) {
      return one.equals
          ? one.equals(another)
          : (one === another);
    }
  },
  
  include: JS.Enumerable || {},
  
  initialize: function(list, block, context) {
    this.clear();
    if (block) this.klass.forEach(list, function(item) {
      this.add(block.call(context || null, item));
    }, this);
    else this.merge(list);
  },
  
  forEach: function(block, context) {
    this.klass.forEach(this._members, block, context);
  },
  
  add: function(item) {
    if (this.contains(item)) return false;
    this._members.push(item);
    this.length = this.size = this._members.length;
    return true;
  },
  
  classify: function(block, context) {
    var classes = {};
    this.forEach(function(item) {
      var value = block.call(context || null, item);
      if (!classes[value]) classes[value] = new this.klass;
      classes[value].add(item);
    }, this);
    return classes;
  },
  
  clear: function() {
    this._members = [];
    this.length = this.size = 0;
  },
  
  complement: function(other) {
    var set = new this.klass;
    this.klass.forEach(other, function(item) {
      if (!this.contains(item)) set.add(item);
    }, this);
    return set;
  },
  
  contains: function(item) {
    return this._indexOf(item) !== -1;
  },
  
  difference: function(other) {
    other = (other instanceof JS.Set) ? other : new JS.Set(other);
    var set = new this.klass;
    this.forEach(function(item) {
      if (!other.contains(item)) set.add(item);
    });
    return set;
  },
  
  divide: function(block, context) {
    var classes = this.classify(block, context),
        sets    = new this.klass,
        key;
    
    for (key in classes) {
      if (!classes.hasOwnProperty(key)) continue;
      sets.add(classes[key]);
    }
    return sets;
  },
  
  equals: function(other) {
    if (this.length !== other.length || !(other instanceof JS.Set)) return false;
    var result = true;
    this.forEach(function(item) {
      if (!result) return;
      if (!other.contains(item)) result = false;
    });
    return result;
  },
  
  hash: function() {
    var hashes = [];
    this.forEach(function(object) { hashes.push(JS.Hash.codeFor(object)) });
    return hashes.sort().join('');
  },
  
  flatten: function(set) {
    var copy = new this.klass;
    copy._members = this._members;
    if (!set) { set = this; set.clear(); }
    copy.forEach(function(item) {
      if (item instanceof JS.Set) item.flatten(set);
      else set.add(item);
    });
    return set;
  },
  
  intersection: function(other) {
    var set = new this.klass;
    this.klass.forEach(other, function(item) {
      if (this.contains(item)) set.add(item);
    }, this);
    return set;
  },
  
  isEmpty: function() {
    return this._members.length === 0;
  },
  
  isProperSubset: function(other) {
    return this._members.length < other._members.length && this.isSubset(other);
  },
  
  isProperSuperset: function() {
    return this._members.length > other._members.length && this.isSuperset(other);
  },
  
  isSubset: function(other) {
    var result = true;
    this.forEach(function(item) {
      if (!result) return;
      if (!other.contains(item)) result = false;
    });
    return result;
  },
  
  isSuperset: function(other) {
    return other.isSubset(this);
  },
  
  merge: function(list) {
    this.klass.forEach(list, function(item) { this.add(item) }, this);
  },
  
  product: function(other) {
    var pairs = new JS.Set;
    this.forEach(function(item) {
      this.klass.forEach(other, function(partner) {
        pairs.add([item, partner]);
      });
    }, this);
    return pairs;
  },
  
  rebuild: function() {
    var members = this._members;
    this.clear();
    this.merge(members);
  },
  
  remove: function(item) {
    var index = this._indexOf(item);
    if (index === -1) return;
    this._members.splice(index, 1);
    this.length = this.size = this._members.length;
  },
  
  removeIf: function(predicate, context) {
    var members = this._members,
        i       = members.length;
    
    while (i--) {
      if (predicate.call(context || null, members[i]))
        this.remove(members[i]);
    }
  },
  
  replace: function(other) {
    this.clear();
    this.merge(other);
  },
  
  subtract: function(list) {
    this.klass.forEach(list, function(item) {
      this.remove(item);
    }, this);
  },
  
  union: function(other) {
    var set = new this.klass;
    set.merge(this);
    set.merge(other);
    return set;
  },
  
  xor: function(other) {
    var set = new JS.Set(other);
    this.forEach(function(item) {
      set[set.contains(item) ? 'remove' : 'add'](item);
    });
    return set;
  },
  
  _indexOf: function(item) {
    var i     = this._members.length,
        equal = this.klass.areEqual;
    
    while (i--) {
      if (equal(item, this._members[i])) return i;
    }
    return -1;
  }
});

JS.Set.include({
  n:  JS.Set.instanceMethod('intersection'),
  u:  JS.Set.instanceMethod('union'),
  x:  JS.Set.instanceMethod('product')
}, false);

JS.SortedSet = new JS.Class('SortedSet', JS.Set, {
  extend: {
    compare: function(one, another) {
      return one.compareTo
          ? one.compareTo(another)
          : (one < another ? -1 : (one > another ? 1 : 0));
    }
  },
  
  add: function(item) {
    var point = this._indexOf(item, true);
    if (point === null) return;
    this._members.splice(point, 0, item);
    this.length = this.size = this._members.length;
  },
  
  _indexOf: function(item, insertionPoint) {
    var items   = this._members,
        n       = items.length,
        i       = 0,
        d       = n,
        compare = this.klass.compare,
        equal   = this.klass.areEqual,
        found;
    
    if (n === 0) return insertionPoint ? 0 : -1;
    
    if (compare(item, items[0]) < 1)   { d = 0; i = 0; }
    if (compare(item, items[n-1]) > 0) { d = 0; i = n; }
    
    while (!equal(item, items[i]) && d > 0.5) {
      d = d / 2;
      i += (compare(item, items[i]) > 0 ? 1 : -1) * Math.round(d);
      if (i > 0 && compare(item, items[i-1]) > 0 && compare(item, items[i]) < 1) d = 0;
    }
    
    // The pointer will end up at the start of any homogenous section. Step
    // through the section until we find the needle or until the section ends.
    while (items[i] && !equal(item, items[i]) &&
        compare(item, items[i]) === 0) i += 1;
    
    found = equal(item, items[i]);
    return insertionPoint
        ? (found ? null : i)
        : (found ? i : -1);
  }
});

JS.HashSet = new JS.Class('HashSet', JS.Set, {
  forEach: function(block, context) {
    this._members.forEachKey(block, context);
  },
  
  add: function(item) {
    if (this.contains(item)) return false;
    this._members.store(item, true);
    this.length = this.size = this._members.length;
    return true;
  },
  
  clear: function() {
    this._members = new JS.Hash();
    this.size = this.length = 0;
  },
  
  contains: function(item) {
    return this._members.hasKey(item);
  },
  
  rebuild: function() {
    this._members.rehash();
    this.length = this.size = this._members.length;
  },
  
  remove: function(item) {
    this._members.remove(item);
    this.length = this.size = this._members.length;
  },
  
  removeIf: function(block, context) {
    this._members.removeIf(function(pair) {
      return block.call(context || null, pair.key);
    });
    this.length = this.size = this._members.length;
  }
});

JS.Enumerable.include({
  toSet: function(klass, block, context) {
    klass = klass || JS.Set;
    return new klass(this, block, context);
  }
}, true);
