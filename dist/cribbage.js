(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

// Associates DOM Nodes with state objects.
var StateCache = new Map();

// Associates Virtual Tree Elements with DOM Nodes.
var NodeCache = new Map();

// Cache transition functions.
var TransitionCache = new Map();

// Caches all middleware. You cannot unset a middleware once it has been added.
var MiddlewareCache = new Set();

// Very specific caches used by middleware.
MiddlewareCache.CreateTreeHookCache = new Set();
MiddlewareCache.CreateNodeHookCache = new Set();
MiddlewareCache.SyncTreeHookCache = new Set();

var caches = Object.freeze({
	StateCache: StateCache,
	NodeCache: NodeCache,
	TransitionCache: TransitionCache,
	MiddlewareCache: MiddlewareCache
});

// A modest size.
var size = 10000;

var free = new Set();
var allocate = new Set();
var protect = new Set();
var shape = function () { return ({
  rawNodeName: '',
  nodeName: '',
  nodeValue: '',
  nodeType: 1,
  key: '',
  childNodes: [],
  attributes: {}
}); };

// Creates a pool to query new or reused values from.
var memory = { free: free, allocated: allocate, protected: protect };

// Prime the free memory pool with VTrees.
for (var i = 0; i < size; i++) {
  free.add(shape());
}

// Cache the values object, we'll refer to this iterator which is faster
// than calling it every single time. It gets replaced once exhausted.
var freeValues = free.values();

// Cache VTree objects in a pool which is used to get
var Pool = {
  size: size,
  memory: memory,

  get: function get() {
    var ref = freeValues.next();
    var value = ref.value; if ( value === void 0 ) value = shape();
    var done = ref.done;

    // This extra bit of work allows us to avoid calling `free.values()` every
    // single time an object is needed.
    if (done) {
      freeValues = free.values();
    }

    free.delete(value);
    allocate.add(value);
    return value;
  },

  protect: function protect$1(value) {
    allocate.delete(value);
    protect.add(value);
  },

  unprotect: function unprotect(value) {
    if (protect.has(value)) {
      protect.delete(value);
      free.add(value);
    }
  }
};

var CreateTreeHookCache = MiddlewareCache.CreateTreeHookCache;
var isArray = Array.isArray;
var fragmentName = '#document-fragment';

function createTree(input, attributes, childNodes) {
  var rest = [], len = arguments.length - 3;
  while ( len-- > 0 ) rest[ len ] = arguments[ len + 3 ];

  // If no input was provided then we return an indication as such.
  if (!input) {
    return null;
  }

  // If the first argument is an array, we assume this is a DOM fragment and
  // the array are the childNodes.
  if (isArray(input)) {
    childNodes = [];

    for (var i = 0; i < input.length; i++) {
      var newTree = createTree(input[i]);
      if (!newTree) {
        continue;
      }
      var isFragment = newTree.nodeType === 11;

      if (typeof newTree.rawNodeName === 'string' && isFragment) {
        childNodes.push.apply(childNodes, newTree.childNodes);
      } else {
        childNodes.push(newTree);
      }
    }

    return createTree(fragmentName, null, childNodes);
  }

  var isObject = typeof input === 'object';

  // Crawl an HTML or SVG Element/Text Node etc. for attributes and children.
  if (input && isObject && 'parentNode' in input) {
    attributes = {};
    childNodes = [];

    // When working with a text node, simply save the nodeValue as the
    // initial value.
    if (input.nodeType === 3) {
      childNodes = input.nodeValue;
    }
    // Element types are the only kind of DOM node we care about attributes
    // from. Shadow DOM, Document Fragments, Text, Comment nodes, etc. can
    // ignore this.
    else if (input.nodeType === 1 && input.attributes.length) {
        attributes = {};

        for (var i$1 = 0; i$1 < input.attributes.length; i$1++) {
          var ref = input.attributes[i$1];
          var name = ref.name;
          var value = ref.value;

          // If the attribute's value is empty, seek out the property instead.
          if (value === '' && name in input) {
            attributes[name] = input[name];
            continue;
          }

          attributes[name] = value;
        }
      }

    // Get the child nodes from an Element or Fragment/Shadow Root.
    if (input.nodeType === 1 || input.nodeType === 11) {
      if (input.childNodes.length) {
        childNodes = [];

        for (var i$2 = 0; i$2 < input.childNodes.length; i$2++) {
          childNodes.push(createTree(input.childNodes[i$2]));
        }
      }
    }

    var vTree$1 = createTree(input.nodeName, attributes, childNodes);
    NodeCache.set(vTree$1, input);
    return vTree$1;
  }

  // Assume any object value is a valid VTree object.
  if (isObject) {
    return input;
  }

  // Support JSX-style children being passed.
  if (rest.length) {
    childNodes = [childNodes ].concat( rest);
  }

  // Allocate a new VTree from the pool.
  var entry = Pool.get();
  var isTextNode = input === '#text';
  var isString = typeof input === 'string';

  entry.key = '';
  entry.rawNodeName = input;
  entry.nodeName = isString ? input.toLowerCase() : '#document-fragment';
  entry.childNodes.length = 0;
  entry.nodeValue = '';
  entry.attributes = {};

  if (isTextNode) {
    var nodes$1 = arguments.length === 2 ? attributes : childNodes;
    var nodeValue = isArray(nodes$1) ? nodes$1.join('') : nodes$1;

    entry.nodeType = 3;
    entry.nodeValue = String(nodeValue || '');

    return entry;
  }

  if (input === fragmentName || typeof input !== 'string') {
    entry.nodeType = 11;
  } else if (input === '#comment') {
    entry.nodeType = 8;
  } else {
    entry.nodeType = 1;
  }

  var useAttributes = isArray(attributes) || typeof attributes !== 'object';
  var nodes = useAttributes ? attributes : childNodes;
  var nodeArray = isArray(nodes) ? nodes : [nodes];

  if (nodes && nodeArray.length) {
    for (var i$3 = 0; i$3 < nodeArray.length; i$3++) {
      var newNode = nodeArray[i$3];
      var isArray$1 = Array.isArray(newNode);

      // Merge in arrays.
      if (isArray$1) {
        for (var i$4 = 0; i$4 < newNode.length; i$4++) {
          entry.childNodes.push(newNode[i$4]);
        }
      }
      // Merge in fragments.
      else if (newNode.nodeType === 11 && typeof newNode.rawNodeName === 'string') {
          for (var i$5 = 0; i$5 < newNode.childNodes.length; i$5++) {
            entry.childNodes.push(newNode.childNodes[i$5]);
          }
        }
        // Assume objects are vTrees.
        else if (newNode && typeof newNode === 'object') {
            entry.childNodes.push(newNode);
          }
          // Cover generate cases where a user has indicated they do not want a
          // node from appearing.
          else if (newNode) {
              entry.childNodes.push(createTree('#text', null, newNode));
            }
    }
  }

  if (attributes && typeof attributes === 'object' && !isArray(attributes)) {
    entry.attributes = attributes;
  }

  // If is a script tag and has a src attribute, key off that.
  if (entry.nodeName === 'script' && entry.attributes.src) {
    entry.key = String(entry.attributes.src);
  }

  // Set the `key` prop if passed as an attr, overrides `script[src]`.
  if (entry.attributes && 'key' in entry.attributes) {
    entry.key = String(entry.attributes.key);
  }

  var vTree = entry;

  CreateTreeHookCache.forEach(function (fn, retVal) {
    // Invoke all the `createNodeHook` functions passing along this transaction
    // as the only argument. These functions must return valid vTree values.
    if (retVal = fn(vTree)) {
      vTree = retVal;
    }
  });

  return vTree;
}

var process$1 = typeof process !== 'undefined' ? process : {
  env: { NODE_ENV: 'development' }
};

var CreateNodeHookCache = MiddlewareCache.CreateNodeHookCache;
var namespace = 'http://www.w3.org/2000/svg';

/**
 * Takes in a Virtual Tree Element (VTree) and creates a DOM Node from it.
 * Sets the node into the Node cache. If this VTree already has an
 * associated node, it will reuse that.
 *
 * @param {Object} - A Virtual Tree Element or VTree-like element
 * @param {Object} - Document to create Nodes in
 * @param {Boolean} - Is their a root SVG element?
 * @return {Object} - A DOM Node matching the vTree
 */
function createNode(vTree, ownerDocument, isSVG) {
  if ( ownerDocument === void 0 ) ownerDocument = document;

  if (process$1.env.NODE_ENV !== 'production') {
    if (!vTree) {
      throw new Error('Missing VTree when trying to create DOM Node');
    }
  }

  var existingNode = NodeCache.get(vTree);

  // If the DOM Node was already created, reuse the existing node.
  if (existingNode) {
    return existingNode;
  }

  var nodeName = vTree.nodeName;
  var rawNodeName = vTree.rawNodeName;
  var childNodes = vTree.childNodes; if ( childNodes === void 0 ) childNodes = [];
  isSVG = isSVG || nodeName === 'svg';

  // Will vary based on the properties of the VTree.
  var domNode = null;

  CreateNodeHookCache.forEach(function (fn, retVal) {
    // Invoke all the `createNodeHook` functions passing along the vTree as the
    // only argument. These functions must return a valid DOM Node value.
    if (retVal = fn(vTree)) {
      domNode = retVal;
    }
  });

  if (!domNode) {
    // Create empty text elements. They will get filled in during the patch
    // process.
    if (nodeName === '#text') {
      domNode = ownerDocument.createTextNode(vTree.nodeValue);
    }
    // Support dynamically creating document fragments.
    else if (nodeName === '#document-fragment') {
        domNode = ownerDocument.createDocumentFragment();
      }
      // Support SVG.
      else if (isSVG) {
          domNode = ownerDocument.createElementNS(namespace, rawNodeName);
        }
        // If not a Text or SVG Node, then create with the standard method.
        else {
            domNode = ownerDocument.createElement(rawNodeName);
          }
  }

  // Add to the domNodes cache.
  NodeCache.set(vTree, domNode);

  // Append all the children into the domNode, making sure to run them
  // through this `createNode` function as well.
  for (var i = 0; i < childNodes.length; i++) {
    domNode.appendChild(createNode(childNodes[i], ownerDocument, isSVG));
  }

  return domNode;
}

// Support loading diffHTML in non-browser environments.
var g = typeof global === 'object' ? global : window;
var element = g.document ? document.createElement('div') : null;

/**
 * Decodes HTML strings.
 *
 * @see http://stackoverflow.com/a/5796718
 * @param string
 * @return unescaped HTML
 */
function decodeEntities(string) {
  // If there are no HTML entities, we can safely pass the string through.
  if (!element || !string || !string.indexOf || !string.includes('&')) {
    return string;
  }

  element.innerHTML = string;
  return element.textContent;
}

/**
 * Tiny HTML escaping function, useful to protect against things like XSS and
 * unintentionally breaking attributes with quotes.
 *
 * @param {String} unescaped - An HTML value, unescaped
 * @return {String} - An HTML-safe string
 */
function escape(unescaped) {
  return unescaped.replace(/[&<>]/g, function (match) { return ("&#" + (match.charCodeAt(0)) + ";"); });
}

var marks = new Map();
var prefix = 'diffHTML';
var DIFF_PERF = 'diff_perf';

var hasSearch = typeof location !== 'undefined';
var hasArguments = typeof process !== 'undefined' && process.argv;
var nop = function () {};

var makeMeasure = (function (domNode, vTree) {
  // Check for these changes on every check.
  var wantsSearch = hasSearch && location.search.includes(DIFF_PERF);
  var wantsArguments = hasArguments && process.argv.includes(DIFF_PERF);
  var wantsPerfChecks = wantsSearch || wantsArguments;

  // If the user has not requested they want perf checks, return a nop
  // function.
  if (!wantsPerfChecks) {
    return nop;
  }

  return function (name) {
    // Use the Web Component name if it's available.
    if (domNode && domNode.host) {
      name = (domNode.host.constructor.name) + " " + name;
    } else if (typeof vTree.rawNodeName === 'function') {
      name = (vTree.rawNodeName.name) + " " + name;
    }

    var endName = name + "-end";

    if (!marks.has(name)) {
      marks.set(name, performance.now());
      performance.mark(name);
    } else {
      var totalMs = (performance.now() - marks.get(name)).toFixed(3);

      marks.delete(name);

      performance.mark(endName);
      performance.measure((prefix + " " + name + " (" + totalMs + "ms)"), name, endName);
    }
  };
});

var memory$1 = Pool.memory;
var protect$1 = Pool.protect;
var unprotect = Pool.unprotect;

/**
 * Ensures that an vTree is not recycled during a render cycle.
 *
 * @param vTree
 * @return vTree
 */
function protectVTree(vTree) {
  protect$1(vTree);

  for (var i = 0; i < vTree.childNodes.length; i++) {
    protectVTree(vTree.childNodes[i]);
  }

  return vTree;
}

/**
 * Allows an vTree to be recycled during a render cycle.
 *
 * @param vTree
 * @return
 */
function unprotectVTree(vTree) {
  unprotect(vTree);

  for (var i = 0; i < vTree.childNodes.length; i++) {
    unprotectVTree(vTree.childNodes[i]);
  }

  return vTree;
}

/**
 * Moves all unprotected allocations back into available pool. This keeps
 * diffHTML in a consistent state after synchronizing.
 */
function cleanMemory(isBusy) {
  if ( isBusy === void 0 ) isBusy = false;

  StateCache.forEach(function (state) { return isBusy = state.isRendering || isBusy; });

  // TODO Pause GC in between renders.
  //if (isBusy) {
  //  return;
  //}

  memory$1.allocated.forEach(function (vTree) { return memory$1.free.add(vTree); });
  memory$1.allocated.clear();

  // Clean out unused elements, if we have any elements cached that no longer
  // have a backing VTree, we can safely remove them from the cache.
  NodeCache.forEach(function (node, descriptor) {
    if (!memory$1.protected.has(descriptor)) {
      NodeCache.delete(descriptor);
    }
  });
}

var memory$2 = Object.freeze({
	protectVTree: protectVTree,
	unprotectVTree: unprotectVTree,
	cleanMemory: cleanMemory
});

var internals = Object.assign({
  decodeEntities: decodeEntities,
  escape: escape,
  makeMeasure: makeMeasure,
  memory: memory$2,
  Pool: Pool,
  process: process$1
}, caches);

function schedule(transaction) {
  // The state is a global store which is shared by all like-transactions.
  var state = transaction.state;

  // If there is an in-flight transaction render happening, push this
  // transaction into a queue.
  if (state.isRendering) {
    // Resolve an existing transaction that we're going to pave over in the
    // next statement.
    if (state.nextTransaction) {
      state.nextTransaction.promises[0].resolve(state.nextTransaction);
    }

    // Set a pointer to this current transaction to render immediatately after
    // the current transaction completes.
    state.nextTransaction = transaction;

    var deferred = {};
    var resolver = new Promise(function (resolve) { return deferred.resolve = resolve; });

    resolver.resolve = deferred.resolve;
    transaction.promises = [resolver];

    return transaction.abort();
  }

  // Indicate we are now rendering a transaction for this DOM Node.
  state.isRendering = true;
}

function shouldUpdate(transaction) {
  var markup = transaction.markup;
  var state = transaction.state;
  var measure = transaction.state.measure;

  measure('should update');

  // If the contents haven't changed, abort the flow. Only support this if
  // the new markup is a string, otherwise it's possible for our object
  // recycling to match twice.
  if (typeof markup === 'string' && state.markup === markup) {
    return transaction.abort();
  } else if (typeof markup === 'string') {
    state.markup = markup;
  }

  measure('should update');
}

function reconcileTrees(transaction) {
  var state = transaction.state;
  var domNode = transaction.domNode;
  var markup = transaction.markup;
  var options = transaction.options;
  var previousMarkup = state.previousMarkup;
  var inner = options.inner;

  // We rebuild the tree whenever the DOM Node changes, including the first
  // time we patch a DOM Node.
  if (previousMarkup !== domNode.outerHTML || !state.oldTree) {
    if (state.oldTree) {
      unprotectVTree(state.oldTree);
    }

    state.oldTree = createTree(domNode);
    NodeCache.set(state.oldTree, domNode);
    protectVTree(state.oldTree);
  }

  // Associate the old tree with this brand new transaction.
  transaction.oldTree = state.oldTree;

  // If we are in a render transaction where no markup was previously parsed
  // then reconcile trees will attempt to create a tree based on the incoming
  // markup (JSX/html/etc).
  if (!transaction.newTree) {
    transaction.newTree = createTree(markup);
  }

  // If we are diffing only the parent's childNodes, then adjust the newTree to
  // be a replica of the oldTree except with the childNodes changed.
  if (inner) {
    var oldTree = transaction.oldTree;
    var newTree = transaction.newTree;
    var rawNodeName = oldTree.rawNodeName;
    var nodeName = oldTree.nodeName;
    var attributes = oldTree.attributes;
    var isUnknown = typeof newTree.rawNodeName !== 'string';
    var isFragment = newTree.nodeType === 11;
    var children = isFragment && !isUnknown ? newTree.childNodes : newTree;

    transaction.newTree = createTree(nodeName, attributes, children);
  }
}

var SyncTreeHookCache = MiddlewareCache.SyncTreeHookCache;
var empty = {};
var keyNames = ['old', 'new'];

// Compares how the new state should look to the old state and mutates it,
// while recording the changes along the way.
function syncTree(oldTree, newTree, patches) {
  var arguments$1 = arguments;

  if (!oldTree) { oldTree = empty; }
  if (!newTree) { newTree = empty; }

  var oldNodeName = oldTree.nodeName;
  var newNodeName = newTree.nodeName;
  var isFragment = newTree.nodeType === 11;
  var isEmpty = oldTree === empty;

  // Reuse these maps, it's more efficient to clear them than to re-create.
  var keysLookup = { old: new Map(), new: new Map() };

  if (process$1.env.NODE_ENV !== 'production') {
    if (newTree === empty) {
      throw new Error('Missing new Virtual Tree to sync changes from');
    }

    if (!isEmpty && oldNodeName !== newNodeName && !isFragment) {
      throw new Error(("Sync failure, cannot compare " + newNodeName + " with " + oldNodeName));
    }
  }

  // Reduce duplicate logic by condensing old and new operations in a loop.
  for (var i = 0; i < keyNames.length; i++) {
    var keyName = keyNames[i];
    var map = keysLookup[keyName];
    var vTree = arguments$1[i];
    var nodes = vTree && vTree.childNodes;

    if (nodes && nodes.length) {
      for (var i$1 = 0; i$1 < nodes.length; i$1++) {
        var vTree$1 = nodes[i$1];

        if (vTree$1.key) {
          map.set(vTree$1.key, vTree$1);
        }
      }
    }
  }

  // Invoke any middleware hooks, allow the middleware to replace the
  // `newTree`. Pass along the `keysLookup` object so that middleware can make
  // smart decisions when dealing with keys.
  SyncTreeHookCache.forEach(function (fn, retVal) {
    if ((retVal = fn(oldTree, newTree, null)) && retVal !== newTree) {
      newTree = retVal;

      // Find attributes.
      syncTree(null, retVal, patches);
    }

    for (var i = 0; i < newTree.childNodes.length; i++) {
      var oldChildNode = isEmpty ? empty : oldTree.childNodes[i];
      var newChildNode = newTree.childNodes[i];

      if (retVal = fn(oldChildNode, newChildNode, keysLookup)) {
        newTree.childNodes[i] = retVal;
      }
    }
  });

  // Create new arrays for patches or use existing from a recursive call.
  patches = patches || {
    SET_ATTRIBUTE: [],
    REMOVE_ATTRIBUTE: [],
    TREE_OPS: [],
    NODE_VALUE: []
  };

  var SET_ATTRIBUTE = patches.SET_ATTRIBUTE;
  var REMOVE_ATTRIBUTE = patches.REMOVE_ATTRIBUTE;
  var TREE_OPS = patches.TREE_OPS;
  var NODE_VALUE = patches.NODE_VALUE;

  // Build up a patchset object to use for tree operations.
  var patchset = {
    INSERT_BEFORE: [],
    REMOVE_CHILD: [],
    REPLACE_CHILD: []
  };

  // USED: INSERT_BEFORE: 3x, REMOVE_CHILD: 2x, REPLACE_CHILD: 3x.
  var INSERT_BEFORE = patchset.INSERT_BEFORE;
  var REMOVE_CHILD = patchset.REMOVE_CHILD;
  var REPLACE_CHILD = patchset.REPLACE_CHILD;
  var isElement = newTree.nodeType === 1;

  // Text nodes are low level and frequently change, so this path is accounted
  // for first.
  if (newTree.nodeName === '#text') {
    // If there was no previous element to compare to, simply set the value
    // on the new node.
    if (oldTree.nodeName !== '#text') {
      NODE_VALUE.push(newTree, newTree.nodeValue, null);
    }
    // If both VTrees are text nodes and the values are different, change the
    // `Element#nodeValue`.
    else if (!isEmpty && oldTree.nodeValue !== newTree.nodeValue) {
        NODE_VALUE.push(oldTree, newTree.nodeValue, oldTree.nodeValue);
        oldTree.nodeValue = newTree.nodeValue;
      }

    return patches;
  }

  // Seek out attribute changes first, but only from element Nodes.
  if (isElement) {
    var oldAttributes = isEmpty ? empty : oldTree.attributes;
    var newAttributes = newTree.attributes;

    // Search for sets and changes.
    for (var key in newAttributes) {
      var value = newAttributes[key];

      if (key in oldAttributes && oldAttributes[key] === newAttributes[key]) {
        continue;
      }

      if (!isEmpty) {
        oldAttributes[key] = value;
      }

      SET_ATTRIBUTE.push(isEmpty ? newTree : oldTree, key, value);
    }

    // Search for removals.
    if (!isEmpty) {
      for (var key$1 in oldAttributes) {
        if (key$1 in newAttributes) {
          continue;
        }
        REMOVE_ATTRIBUTE.push(oldTree, key$1);
        delete oldAttributes[key$1];
      }
    }
  }

  // If we somehow end up comparing two totally different kinds of elements,
  // we'll want to raise an error to let the user know something is wrong.
  if (process$1.env.NODE_ENV !== 'production') {
    if (!isEmpty && oldNodeName !== newNodeName && !isFragment) {
      throw new Error(("Sync failure, cannot compare " + newNodeName + " with " + oldNodeName));
    }
  }

  var newChildNodes = newTree.childNodes;

  // Scan all childNodes for attribute changes.
  if (isEmpty) {
    // Do a single pass over the new child nodes.
    for (var i$2 = 0; i$2 < newChildNodes.length; i$2++) {
      syncTree(null, newChildNodes[i$2], patches);
    }

    return patches;
  }

  var oldChildNodes = oldTree.childNodes;

  // If we are working with keys, we can follow an optimized path.
  if (keysLookup.old.size || keysLookup.new.size) {
    var values = keysLookup.old.values();

    // Do a single pass over the new child nodes.
    for (var i$3 = 0; i$3 < newChildNodes.length; i$3++) {
      var oldChildNode = oldChildNodes[i$3];
      var newChildNode = newChildNodes[i$3];
      var newKey = newChildNode.key;

      // If there is no old element to compare to, this is a simple addition.
      if (!oldChildNode) {
        INSERT_BEFORE.push(oldTree, newChildNode, null);
        oldChildNodes.push(newChildNode);
        syncTree(null, newChildNode, patches);
        continue;
      }

      var oldKey = oldChildNode.key;
      var oldInNew = keysLookup.new.has(oldKey);
      var newInOld = keysLookup.old.has(newKey);

      // Remove the old Node and insert the new node (aka replace).
      if (!oldInNew && !newInOld) {
        REPLACE_CHILD.push(newChildNode, oldChildNode);
        oldChildNodes.splice(oldChildNodes.indexOf(oldChildNode), 1, newChildNode);
        syncTree(null, newChildNode, patches);
        continue;
      }
      // Remove the old node instead of replacing.
      else if (!oldInNew) {
          REMOVE_CHILD.push(oldChildNode);
          oldChildNodes.splice(oldChildNodes.indexOf(oldChildNode), 1);
          i$3 = i$3 - 1;
          continue;
        }

      // If there is a key set for this new element, use that to figure out
      // which element to use.
      if (newKey !== oldKey) {
        var optimalNewNode = newChildNode;

        // Prefer existing to new and remove from old position.
        if (newKey && newInOld) {
          optimalNewNode = keysLookup.old.get(newKey);
          oldChildNodes.splice(oldChildNodes.indexOf(optimalNewNode), 1);
        } else if (newKey) {
          optimalNewNode = newChildNode;

          // Find attribute changes for this Node.
          syncTree(null, newChildNode, patches);
        }

        INSERT_BEFORE.push(oldTree, optimalNewNode, oldChildNode);
        oldChildNodes.splice(i$3, 0, optimalNewNode);
        continue;
      }

      // If the element we're replacing is totally different from the previous
      // replace the entire element, don't bother investigating children.
      if (oldChildNode.nodeName !== newChildNode.nodeName) {
        REPLACE_CHILD.push(newChildNode, oldChildNode);
        oldTree.childNodes[i$3] = newChildNode;
        syncTree(null, newChildNode, patches);
        continue;
      }

      syncTree(oldChildNode, newChildNode, patches);
    }
  }

  // No keys used on this level, so we will do easier transformations.
  else {
      // Do a single pass over the new child nodes.
      for (var i$4 = 0; i$4 < newChildNodes.length; i$4++) {
        var oldChildNode$1 = oldChildNodes && oldChildNodes[i$4];
        var newChildNode$1 = newChildNodes[i$4];

        // If there is no old element to compare to, this is a simple addition.
        if (!oldChildNode$1) {
          INSERT_BEFORE.push(oldTree, newChildNode$1, null);

          if (oldChildNodes) {
            oldChildNodes.push(newChildNode$1);
          }

          syncTree(null, newChildNode$1, patches);
          continue;
        }

        // If the element we're replacing is totally different from the previous
        // replace the entire element, don't bother investigating children.
        if (oldChildNode$1.nodeName !== newChildNode$1.nodeName) {
          REPLACE_CHILD.push(newChildNode$1, oldChildNode$1);
          oldTree.childNodes[i$4] = newChildNode$1;
          syncTree(null, newChildNode$1, patches);
          continue;
        }

        syncTree(oldChildNode$1, newChildNode$1, patches);
      }
    }

  // If there was no `oldTree` provided, we have sync'd all the attributes and
  // the node value of the `newTree` so we can early abort and not worry about
  // tree operations.
  if (isEmpty) {
    return patches;
  }

  // We've reconciled new changes, so we can remove any old nodes and adjust
  // lengths to be equal.
  if (oldChildNodes.length !== newChildNodes.length) {
    for (var i$5 = newChildNodes.length; i$5 < oldChildNodes.length; i$5++) {
      REMOVE_CHILD.push(oldChildNodes[i$5]);
    }

    oldChildNodes.length = newChildNodes.length;
  }

  // We want to look if anything has changed, if nothing has we won't add it to
  // the patchset.
  if (INSERT_BEFORE.length || REMOVE_CHILD.length || REPLACE_CHILD.length) {
    // Null out the empty arrays.
    if (!INSERT_BEFORE.length) {
      patchset.INSERT_BEFORE = null;
    }
    if (!REMOVE_CHILD.length) {
      patchset.REMOVE_CHILD = null;
    }
    if (!REPLACE_CHILD.length) {
      patchset.REPLACE_CHILD = null;
    }

    TREE_OPS.push(patchset);
  }

  return patches;
}

function syncTrees(transaction) {
  var measure = transaction.state.measure;
  var oldTree = transaction.oldTree;
  var newTree = transaction.newTree;
  var domNode = transaction.domNode;

  measure('sync trees');

  // Do a global replace of the element, unable to do this at a lower level.
  // Ignore this for document fragments, they don't appear in the DOM and we
  // treat them as transparent containers.
  if (oldTree.nodeName !== newTree.nodeName && newTree.nodeType !== 11) {
    transaction.patches = {
      TREE_OPS: [{ REPLACE_CHILD: [newTree, oldTree] }],
      SET_ATTRIBUTE: [],
      REMOVE_ATTRIBUTE: [],
      NODE_VALUE: []
    };

    unprotectVTree(transaction.oldTree);
    transaction.oldTree = transaction.state.oldTree = newTree;
    protectVTree(transaction.oldTree);

    // Update the StateCache since we are changing the top level element.
    StateCache.set(createNode(newTree), transaction.state);
  }
  // Otherwise only diff the children.
  else {
      transaction.patches = syncTree(oldTree, newTree);
    }

  measure('sync trees');
}

var stateNames = ['attached', 'detached', 'replaced', 'attributeChanged', 'textChanged'];

// Sets up the states up so we can add and remove events from the sets.
stateNames.forEach(function (stateName) { return TransitionCache.set(stateName, new Set()); });

function addTransitionState(stateName, callback) {
  if (process$1.env.NODE_ENV !== 'production') {
    if (!stateName || !stateNames.includes(stateName)) {
      throw new Error(("Invalid state name '" + stateName + "'"));
    }

    if (!callback) {
      throw new Error('Missing transition state callback');
    }
  }

  TransitionCache.get(stateName).add(callback);
}

function removeTransitionState(stateName, callback) {
  if (process$1.env.NODE_ENV !== 'production') {
    // Only validate the stateName if the caller provides one.
    if (stateName && !stateNames.includes(stateName)) {
      throw new Error(("Invalid state name '" + stateName + "'"));
    }
  }

  // Remove all transition callbacks from state.
  if (!callback && stateName) {
    TransitionCache.get(stateName).clear();
  }
  // Remove a specific transition callback.
  else if (stateName && callback) {
      TransitionCache.get(stateName).delete(callback);
    }
    // Remove all callbacks.
    else {
        for (var i = 0; i < stateNames.length; i++) {
          TransitionCache.get(stateNames[i]).clear();
        }
      }
}

function runTransitions(setName) {
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  var set = TransitionCache.get(setName);
  var promises = [];

  if (!set.size) {
    return promises;
  }

  // Ignore text nodes.
  if (setName !== 'textChanged' && args[0].nodeType === 3) {
    return promises;
  }

  // Run each transition callback, if on the attached/detached.
  set.forEach(function (callback) {
    var retVal = callback.apply(void 0, args);

    // Is a `thennable` object or Native Promise.
    if (typeof retVal === 'object' && retVal.then) {
      promises.push(retVal);
    }
  });

  if (setName === 'attached' || setName === 'detached') {
    var element = args[0];

    [].concat( element.childNodes ).forEach(function (childNode) {
      promises.push.apply(promises, runTransitions.apply(void 0, [ setName, childNode ].concat( args.slice(1) )));
    });
  }

  return promises;
}

var blockText = new Set(['script', 'noscript', 'style', 'code', 'template']);

var removeAttribute = function (domNode, name) {
  domNode.removeAttribute(name);

  if (name in domNode) {
    domNode[name] = undefined;
  }
};

var blacklist = new Set();

function patchNode(patches, state) {
  if ( state === void 0 ) state = {};

  var promises = [];
  var TREE_OPS = patches.TREE_OPS;
  var NODE_VALUE = patches.NODE_VALUE;
  var SET_ATTRIBUTE = patches.SET_ATTRIBUTE;
  var REMOVE_ATTRIBUTE = patches.REMOVE_ATTRIBUTE;
  var isSVG = state.isSVG;
  var ownerDocument = state.ownerDocument;

  // Set attributes.
  if (SET_ATTRIBUTE.length) {
    for (var i = 0; i < SET_ATTRIBUTE.length; i += 3) {
      var vTree = SET_ATTRIBUTE[i];
      var _name = SET_ATTRIBUTE[i + 1];
      var value = decodeEntities(SET_ATTRIBUTE[i + 2]);

      var domNode = createNode(vTree, ownerDocument, isSVG);
      var oldValue = domNode.getAttribute(_name);
      var newPromises = runTransitions('attributeChanged', domNode, _name, oldValue, value);

      // Triggered either synchronously or asynchronously depending on if a
      // transition was invoked.
      var isObject = typeof value === 'object';
      var isFunction = typeof value === 'function';

      // Events must be lowercased otherwise they will not be set correctly.
      var name = _name.indexOf('on') === 0 ? _name.toLowerCase() : _name;

      // Normal attribute value.
      if (!isObject && !isFunction && name) {
        var noValue = value === null || value === undefined;
        // Runtime checking if the property can be set.
        var blacklistName = vTree.nodeName + '-' + name;

        // If the property has not been blacklisted then use try/catch to try
        // and set it.
        if (!blacklist.has(blacklistName)) {
          try {
            domNode[name] = value;
          } catch (unhandledException) {
            blacklist.add(blacklistName);
          }
        }

        // Set the actual attribute, this will ensure attributes like
        // `autofocus` aren't reset by the property call above.
        domNode.setAttribute(name, noValue ? '' : value);
      }
      // Support patching an object representation of the style object.
      else if (isObject && name === 'style') {
          var keys = Object.keys(value);

          for (var i$1 = 0; i$1 < keys.length; i$1++) {
            domNode.style[keys[i$1]] = value[keys[i$1]];
          }
        } else if (typeof value !== 'string') {
          // We remove and re-add the attribute to trigger a change in a web
          // component or mutation observer. Although you could use a setter or
          // proxy, this is more natural.
          if (domNode.hasAttribute(name) && domNode[name] !== value) {
            domNode.removeAttribute(name, '');
          }

          // Necessary to track the attribute/prop existence.
          domNode.setAttribute(name, '');

          // Since this is a property value it gets set directly on the node.
          try {
            domNode[name] = value;
          } catch (unhandledException) {}
        }

      if (newPromises.length) {
        promises.push.apply(promises, newPromises);
      }
    }
  }

  // Remove attributes.
  if (REMOVE_ATTRIBUTE.length) {
    var loop = function ( i ) {
      var vTree$1 = REMOVE_ATTRIBUTE[i];
      var name$1 = REMOVE_ATTRIBUTE[i + 1];

      var domNode$1 = NodeCache.get(vTree$1);
      var attributeChanged = TransitionCache.get('attributeChanged');
      var oldValue$1 = domNode$1.getAttribute(name$1);
      var newPromises$1 = runTransitions('attributeChanged', domNode$1, name$1, oldValue$1, null);

      if (newPromises$1.length) {
        Promise.all(newPromises$1).then(function () { return removeAttribute(domNode$1, name$1); });
        promises.push.apply(promises, newPromises$1);
      } else {
        removeAttribute(domNode$1, name$1);
      }
    };

    for (var i$2 = 0; i$2 < REMOVE_ATTRIBUTE.length; i$2 += 2) loop( i$2 );
  }

  // Once attributes have been synchronized into the DOM Nodes, assemble the
  // DOM Tree.
  for (var i$3 = 0; i$3 < TREE_OPS.length; i$3++) {
    var ref = TREE_OPS[i$3];
    var INSERT_BEFORE = ref.INSERT_BEFORE;
    var REMOVE_CHILD = ref.REMOVE_CHILD;
    var REPLACE_CHILD = ref.REPLACE_CHILD;

    // Insert/append elements.
    if (INSERT_BEFORE && INSERT_BEFORE.length) {
      for (var i$4 = 0; i$4 < INSERT_BEFORE.length; i$4 += 3) {
        var vTree$2 = INSERT_BEFORE[i$4];
        var newTree = INSERT_BEFORE[i$4 + 1];
        var refTree = INSERT_BEFORE[i$4 + 2];

        var domNode$2 = NodeCache.get(vTree$2);
        var refNode = refTree && createNode(refTree, ownerDocument, isSVG);
        var attached = TransitionCache.get('attached');

        if (refTree) {
          protectVTree(refTree);
        }

        var newNode = createNode(newTree, ownerDocument, isSVG);
        protectVTree(newTree);

        // If refNode is `null` then it will simply append like `appendChild`.
        domNode$2.insertBefore(newNode, refNode);

        var attachedPromises = runTransitions('attached', newNode);

        promises.push.apply(promises, attachedPromises);
      }
    }

    // Remove elements.
    if (REMOVE_CHILD && REMOVE_CHILD.length) {
      var loop$1 = function ( i ) {
        var vTree$3 = REMOVE_CHILD[i];
        var domNode$3 = NodeCache.get(vTree$3);
        var detached = TransitionCache.get('detached');
        var detachedPromises = runTransitions('detached', domNode$3);

        if (detachedPromises.length) {
          Promise.all(detachedPromises).then(function () {
            domNode$3.parentNode.removeChild(domNode$3);
            unprotectVTree(vTree$3);
          });

          promises.push.apply(promises, detachedPromises);
        } else {
          domNode$3.parentNode.removeChild(domNode$3);
          unprotectVTree(vTree$3);
        }
      };

      for (var i$5 = 0; i$5 < REMOVE_CHILD.length; i$5++) loop$1( i$5 );
    }

    // Replace elements.
    if (REPLACE_CHILD && REPLACE_CHILD.length) {
      var loop$2 = function ( i ) {
        var newTree$1 = REPLACE_CHILD[i];
        var oldTree = REPLACE_CHILD[i + 1];

        var oldDomNode = NodeCache.get(oldTree);
        var newDomNode = createNode(newTree$1, ownerDocument, isSVG);
        var attached$1 = TransitionCache.get('attached');
        var detached$1 = TransitionCache.get('detached');
        var replaced = TransitionCache.get('replaced');

        // Always insert before to allow the element to transition.
        oldDomNode.parentNode.insertBefore(newDomNode, oldDomNode);
        protectVTree(newTree$1);

        var attachedPromises$1 = runTransitions('attached', newDomNode);
        var detachedPromises$1 = runTransitions('detached', oldDomNode);
        var replacedPromises = runTransitions('replaced', oldDomNode, newDomNode);
        var allPromises = attachedPromises$1.concat( detachedPromises$1, replacedPromises);

        if (allPromises.length) {
          Promise.all(allPromises).then(function () {
            oldDomNode.parentNode.replaceChild(newDomNode, oldDomNode);
            unprotectVTree(oldTree);
          });

          promises.push.apply(promises, allPromises);
        } else {
          oldDomNode.parentNode.replaceChild(newDomNode, oldDomNode);
          unprotectVTree(oldTree);
        }
      };

      for (var i$6 = 0; i$6 < REPLACE_CHILD.length; i$6 += 2) loop$2( i$6 );
    }
  }

  // Change all nodeValues.
  if (NODE_VALUE.length) {
    for (var i$7 = 0; i$7 < NODE_VALUE.length; i$7 += 3) {
      var vTree$4 = NODE_VALUE[i$7];
      var nodeValue = NODE_VALUE[i$7 + 1];
      var oldValue$2 = NODE_VALUE[i$7 + 2];
      var domNode$4 = NodeCache.get(vTree$4);
      var textChanged = TransitionCache.get('textChanged');
      var textChangedPromises = runTransitions('textChanged', domNode$4, oldValue$2, nodeValue);

      var ref$1 = domNode$4;
      var parentNode = ref$1.parentNode;

      if (nodeValue.includes('&')) {
        domNode$4.nodeValue = decodeEntities(nodeValue);
      } else {
        domNode$4.nodeValue = nodeValue;
      }

      if (parentNode && blockText.has(parentNode.nodeName.toLowerCase())) {
        parentNode.nodeValue = escape(decodeEntities(nodeValue));
      }

      if (textChangedPromises.length) {
        promises.push.apply(promises, textChangedPromises);
      }
    }
  }

  return promises;
}

function patch(transaction) {
  var domNode = transaction.domNode;
  var state = transaction.state;
  var measure = transaction.state.measure;
  var patches = transaction.patches;
  var promises = transaction.promises; if ( promises === void 0 ) promises = [];
  var namespaceURI = domNode.namespaceURI; if ( namespaceURI === void 0 ) namespaceURI = '';
  var nodeName = domNode.nodeName;

  state.isSVG = nodeName.toLowerCase() === 'svg' || namespaceURI.includes('svg');
  state.ownerDocument = domNode.ownerDocument || document;

  measure('patch node');
  promises.push.apply(promises, patchNode(patches, state));
  measure('patch node');

  transaction.promises = promises;
}

// End flow, this terminates the transaction and returns a Promise that
// resolves when completed. If you want to make diffHTML return streams or
// callbacks replace this function.
function endAsPromise(transaction) {
  var promises = transaction.promises; if ( promises === void 0 ) promises = [];

  // Operate synchronously unless opted into a Promise-chain. Doesn't matter
  // if they are actually Promises or not, since they will all resolve
  // eventually with `Promise.all`.
  if (promises.length) {
    return Promise.all(promises).then(function () { return transaction.end(); });
  } else {
    // Pass off the remaining middleware to allow users to dive into the
    // transaction completed lifecycle event.
    return Promise.resolve(transaction.end());
  }
}

var defaultTasks = [schedule, shouldUpdate, reconcileTrees, syncTrees, patch, endAsPromise];

var tasks = {
  schedule: schedule, shouldUpdate: shouldUpdate, reconcileTrees: reconcileTrees, syncTrees: syncTrees, patchNode: patch, endAsPromise: endAsPromise
};

var Transaction = function Transaction(domNode, markup, options) {
  this.domNode = domNode;
  this.markup = markup;
  this.options = options;

  this.state = StateCache.get(domNode) || {
    measure: makeMeasure(domNode, markup)
  };

  this.tasks = [].concat(options.tasks);

  // Store calls to trigger after the transaction has ended.
  this.endedCallbacks = new Set();

  StateCache.set(domNode, this.state);
};

Transaction.create = function create (domNode, markup, options) {
  return new Transaction(domNode, markup, options);
};

Transaction.renderNext = function renderNext (state) {
  if (!state.nextTransaction) {
    return;
  }

  // Create the next transaction.
  var nextTransaction = state.nextTransaction;
    var promises = state.nextTransaction.promises;
  var resolver = promises && promises[0];

  state.nextTransaction = undefined;
  nextTransaction.aborted = false;

  // Remove the last task, this has already been executed (via abort).
  nextTransaction.tasks.pop();

  // Reflow this transaction.
  Transaction.flow(nextTransaction, nextTransaction.tasks);

  // Wait for the promises to complete if they exist, otherwise resolve
  // immediately.
  if (promises && promises.length > 1) {
    Promise.all(promises.slice(1)).then(function () { return resolver.resolve(); });
  } else if (resolver) {
    resolver.resolve();
  }
};

Transaction.flow = function flow (transaction, tasks) {
  var retVal = transaction;

  // Execute each "task" serially, passing the transaction as a baton that
  // can be used to share state across the tasks.
  for (var i = 0; i < tasks.length; i++) {
    // If aborted, don't execute any more tasks.
    if (transaction.aborted) {
      return retVal;
    }

    // Run the task.
    retVal = tasks[i](transaction);

    // The last `returnValue` is what gets sent to the consumer. This
    // mechanism is crucial for the `abort`, if you want to modify the "flow"
    // that's fine, but you must ensure that your last task provides a
    // mechanism to know when the transaction completes. Something like
    // callbacks or a Promise.
    if (retVal !== undefined && retVal !== transaction) {
      return retVal;
    }
  }
};

Transaction.assert = function assert (transaction) {
  if (process$1.env.NODE_ENV !== 'production') {
    if (typeof transaction.domNode !== 'object') {
      throw new Error('Transaction requires a DOM Node mount point');
    }

    if (transaction.aborted && transaction.completed) {
      throw new Error('Transaction was previously aborted');
    }

    if (transaction.completed) {
      throw new Error('Transaction was previously completed');
    }
  }
};

Transaction.invokeMiddleware = function invokeMiddleware (transaction) {
  var tasks = transaction.tasks;

  MiddlewareCache.forEach(function (fn) {
    // Invoke all the middleware passing along this transaction as the only
    // argument. If they return a value (must be a function) it will be added
    // to the transaction task flow.
    var result = fn(transaction);

    if (result) {
      tasks.push(result);
    }
  });
};

Transaction.prototype.start = function start () {
  if (process$1.env.NODE_ENV !== 'production') {
    Transaction.assert(this);
  }

  var ref = this;
    var domNode = ref.domNode;
    var measure = ref.state.measure;
    var tasks = ref.tasks;
  var takeLastTask = tasks.pop();

  this.aborted = false;

  // Add middleware in as tasks.
  Transaction.invokeMiddleware(this);

  // Measure the render flow if the user wants to track performance.
  measure('render');

  // Push back the last task as part of ending the flow.
  tasks.push(takeLastTask);

  return Transaction.flow(this, tasks);
};

// This will immediately call the last flow task and terminate the flow. We
// call the last task to ensure that the control flow completes. This should
// end psuedo-synchronously. Think `Promise.resolve()`, `callback()`, and
// `return someValue` to provide the most accurate performance reading. This
// doesn't matter practically besides that.
Transaction.prototype.abort = function abort () {
  var ref = this;
    var state = ref.state;

  this.aborted = true;

  // Grab the last task in the flow and return, this task will be responsible
  // for calling `transaction.end`.
  return this.tasks[this.tasks.length - 1](this);
};

Transaction.prototype.end = function end () {
    var this$1 = this;

  var ref = this;
    var state = ref.state;
    var domNode = ref.domNode;
    var options = ref.options;
  var measure = state.measure;
  var inner = options.inner;

  measure('finalize');

  this.completed = true;

  // Mark the end to rendering.
  measure('finalize');
  measure('render');

  // Trigger all `onceEnded` callbacks, so that middleware can know the
  // transaction has ended.
  this.endedCallbacks.forEach(function (callback) { return callback(this$1); });
  this.endedCallbacks.clear();

  // Cache the markup and text for the DOM node to allow for short-circuiting
  // future render transactions.
  state.previousMarkup = domNode.outerHTML;
  state.isRendering = false;

  // Clean up memory before rendering the next transaction, however if
  // another transaction is running concurrently this will be delayed until
  // the last render completes.
  cleanMemory();

  // Try and render the next transaction if one has been saved.
  Transaction.renderNext(state);

  return this;
};

Transaction.prototype.onceEnded = function onceEnded (callback) {
  this.endedCallbacks.add(callback);
};

function innerHTML(element, markup, options) {
  if ( markup === void 0 ) markup = '';
  if ( options === void 0 ) options = {};

  options.inner = true;
  options.tasks = options.tasks || defaultTasks;
  return Transaction.create(element, markup, options).start();
}

function outerHTML(element, markup, options) {
  if ( markup === void 0 ) markup = '';
  if ( options === void 0 ) options = {};

  options.inner = false;
  options.tasks = options.tasks || defaultTasks;
  return Transaction.create(element, markup, options).start();
}

function release(domNode) {
  // Try and find a state object for this DOM Node.
  var state = StateCache.get(domNode);

  // If there is a Virtual Tree element, recycle all objects allocated for it.
  if (state && state.oldTree) {
    unprotectVTree(state.oldTree);
  }

  // Remove the DOM Node's state object from the cache.
  StateCache.delete(domNode);

  // Recycle all unprotected objects.
  cleanMemory();
}

var CreateTreeHookCache$1 = MiddlewareCache.CreateTreeHookCache;
var CreateNodeHookCache$1 = MiddlewareCache.CreateNodeHookCache;
var SyncTreeHookCache$1 = MiddlewareCache.SyncTreeHookCache;

function use(middleware) {
  if (process$1.env.NODE_ENV !== 'production') {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function');
    }
  }

  var subscribe = middleware.subscribe;
  var unsubscribe = middleware.unsubscribe;
  var createTreeHook = middleware.createTreeHook;
  var createNodeHook = middleware.createNodeHook;
  var syncTreeHook = middleware.syncTreeHook;

  // Add the function to the set of middlewares.
  MiddlewareCache.add(middleware);

  // Call the subscribe method if it was defined, passing in the full public
  // API we have access to at this point.
  subscribe && middleware.subscribe();

  // Add the hyper-specific create hooks.
  createTreeHook && CreateTreeHookCache$1.add(createTreeHook);
  createNodeHook && CreateNodeHookCache$1.add(createNodeHook);
  syncTreeHook && SyncTreeHookCache$1.add(syncTreeHook);

  // The unsubscribe method for the middleware.
  return function () {
    // Remove this middleware from the internal cache. This will prevent it
    // from being invoked in the future.
    MiddlewareCache.delete(middleware);

    // Call the unsubscribe method if defined in the middleware (allows them
    // to cleanup).
    unsubscribe && unsubscribe();

    // Cleanup the specific fns from their Cache.
    CreateTreeHookCache$1.delete(createTreeHook);
    CreateNodeHookCache$1.delete(createNodeHook);
    SyncTreeHookCache$1.delete(syncTreeHook);
  };
}

var __VERSION__ = '1.0.0-beta';

var VERSION = __VERSION__ + "-runtime";

var api = {
  VERSION: VERSION,
  addTransitionState: addTransitionState,
  removeTransitionState: removeTransitionState,
  release: release,
  createTree: createTree,
  use: use,
  outerHTML: outerHTML,
  innerHTML: innerHTML,
  html: createTree,
  defaultTasks: defaultTasks
};

// This is an internal API exported purely for middleware and extensions to
// leverage internal APIs that are not part of the public API. There are no
// promises that this will not break in the future. We will attempt to minimize
// changes and will supply fallbacks when APIs change.
var Internals = Object.assign(internals, api, { defaultTasks: defaultTasks, tasks: tasks, createNode: createNode });

// Attach a circular reference to `Internals` for ES/CJS builds.
api.Internals = Internals;

// Automatically hook up to DevTools if they are present.
if (typeof devTools === 'function') {
  use(devTools(Internals));
  console.info('diffHTML DevTools Found and Activated...');
}

var Deck = function Deck(size) {
  this.size = size;
  this.isShuffled = false;
  this.cards = [];

  this.shuffle();
};

Deck.prototype.shuffle = function shuffle () {
  var ref = this;
    var size = ref.size;
    var cards = ref.cards;

  // Assign random very high values
  for (var i = 0; i < size; i++) {
    cards[i] = Math.round(Math.random() * 10000);
  }

  // Find the largest random number
  var tempShuffledCards = [];
  var tempLargeNumber = 0;
  var tempLargeNumberIndex = 0;

  for (var i$1 = 0; i$1 < size; i$1++) {
    tempLargeNumber = 0;

    for (var i$2 = 0; i$2 < size; i$2++) {
      if (tempLargeNumber < cards[i$2]) {
        tempLargeNumber = cards[i$2];
        tempLargeNumberIndex = i$2;
      }
    }

    cards[tempLargeNumberIndex] = 0;
    tempShuffledCards[i$1] = tempLargeNumberIndex;
  }

  this.cards = tempShuffledCards;
};

Deck.prototype.draw = function draw () {
  return parseInt(this.cards.pop());
};

Deck.prototype.atPosition = function atPosition (index) {
  return parseInt(this.cards[index]);
};

(typeof window !== 'undefined' ? window : global).process = Internals.process;

var process$2 = Internals.process;

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

var emptyFunction_1 = emptyFunction;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

var validateFormat = function validateFormat(format) {};

if (process.env.NODE_ENV !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

var invariant_1 = invariant;

var warning = emptyFunction_1;

if (process.env.NODE_ENV !== 'production') {
  (function () {
    var printWarning = function printWarning(format) {
      var arguments$1 = arguments;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments$1[_key];
      }

      var argIndex = 0;
      var message = 'Warning: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    };

    warning = function warning(condition, format) {
      var arguments$1 = arguments;

      if (format === undefined) {
        throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
      }

      if (format.indexOf('Failed Composite propType: ') === 0) {
        return; // Ignore CompositeComponent proptype check.
      }

      if (!condition) {
        for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          args[_key2 - 2] = arguments$1[_key2];
        }

        printWarning.apply(undefined, [format].concat(args));
      }
    };
  })();
}

var warning_1 = warning;

/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

var ReactPropTypesSecret_1 = ReactPropTypesSecret;

if (process.env.NODE_ENV !== 'production') {
  var invariant$1 = invariant_1;
  var warning$1 = warning_1;
  var ReactPropTypesSecret$1 = ReactPropTypesSecret_1;
  var loggedTypeFailures = {};
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (process.env.NODE_ENV !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (typeSpecs.hasOwnProperty(typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          invariant$1(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', componentName || 'React class', location, typeSpecName);
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret$1);
        } catch (ex) {
          error = ex;
        }
        warning$1(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          warning$1(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
        }
      }
    }
  }
}

var checkPropTypes_1 = checkPropTypes;

var factoryWithTypeCheckers = function (isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (process.env.NODE_ENV !== 'production') {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret_1) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          invariant_1(false, 'Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use `PropTypes.checkPropTypes()` to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (!manualPropTypeCallCache[cacheKey] &&
          // Avoid spamming the console because they are often not actionable except for lib authors
          manualPropTypeWarningCount < 3) {
            warning_1(false, 'You are manually calling a React.PropTypes validation ' + 'function for the `%s` prop on `%s`. This is deprecated ' + 'and will throw in the standalone `prop-types` package. ' + 'You may be seeing this warning due to a third-party PropTypes ' + 'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.', propFullName, componentName);
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }
          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction_1.thatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret_1);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      process.env.NODE_ENV !== 'production' ? warning_1(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
      return emptyFunction_1.thatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues);
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      process.env.NODE_ENV !== 'production' ? warning_1(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
      return emptyFunction_1.thatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== 'function') {
        warning_1(false, 'Invalid argument supplid to oneOfType. Expected an array of check functions, but ' + 'received %s at index %s.', getPostfixForTypeWarning(checker), i);
        return emptyFunction_1.thatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret_1) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;
      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;
      default:
        return type;
    }
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes_1;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

var factoryWithThrowingShims = function () {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret_1) {
      // It is still safe when called from React.
      return;
    }
    invariant_1(false, 'Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use PropTypes.checkPropTypes() to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
  }
  shim.isRequired = shim;
  function getShim() {
    return shim;
  }
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim
  };

  ReactPropTypes.checkPropTypes = emptyFunction_1;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

var index$1 = createCommonjsModule(function (module) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

if (process.env.NODE_ENV !== 'production') {
  var REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element') || 0xeac7;

  var isValidElement = function (object) {
    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
  };

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = factoryWithTypeCheckers(isValidElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = factoryWithThrowingShims();
}
});

var ComponentTreeCache = new Map();
var InstanceCache = new Map();

var NodeCache$2 = Internals.NodeCache;
var assign$4 = Object.assign;

function triggerRef(ref, instance) {
  if (typeof ref === 'function') {
    ref(instance);
  } else if (typeof ref === 'string') {
    this[ref](instance);
  }
}

function searchForRefs(newTree) {
  if (newTree.attributes.ref) {
    triggerRef(newTree.attributes.ref, NodeCache$2.get(newTree));
  }

  newTree.childNodes.forEach(searchForRefs);
}

function componentDidMount(newTree) {
  if (InstanceCache.has(newTree)) {
    InstanceCache.get(newTree).componentDidMount();
  }

  var instance = InstanceCache.get(newTree);

  searchForRefs(newTree);

  if (!instance) {
    return;
  }

  var ref$1 = instance.props;
  var ref = ref$1.ref;

  triggerRef(ref, instance);
}

function componentDidUnmount(oldTree) {
  if (InstanceCache.has(oldTree)) {
    InstanceCache.get(oldTree).componentDidUnmount();
  }

  var instance = InstanceCache.get(oldTree);

  searchForRefs(oldTree);

  if (!instance) {
    return;
  }

  var ref$1 = instance.props;
  var ref = ref$1.ref;

  triggerRef(ref, null);
}

function reactLikeComponentTask(transaction) {
  return transaction.onceEnded(function () {
    if (transaction.aborted) {
      return;
    }

    var patches = transaction.patches;

    if (patches.TREE_OPS && patches.TREE_OPS.length) {
      patches.TREE_OPS.forEach(function (ref) {
        var INSERT_BEFORE = ref.INSERT_BEFORE;
        var REPLACE_CHILD = ref.REPLACE_CHILD;
        var REMOVE_CHILD = ref.REMOVE_CHILD;

        if (INSERT_BEFORE) {
          for (var i = 0; i < INSERT_BEFORE.length; i += 3) {
            var newTree = INSERT_BEFORE[i + 1];
            componentDidMount(newTree);
          }
        }

        if (REPLACE_CHILD) {
          for (var i$1 = 0; i$1 < REPLACE_CHILD.length; i$1 += 2) {
            var newTree$1 = REPLACE_CHILD[i$1];
            componentDidMount(newTree$1);
          }
        }

        if (REMOVE_CHILD) {
          for (var i$2 = 0; i$2 < REMOVE_CHILD.length; i$2 += 1) {
            var oldTree = REMOVE_CHILD[i$2];
            componentDidUnmount(oldTree);
          }
        }
      });
    }
  });
}

reactLikeComponentTask.syncTreeHook = function (oldTree, newTree) {
  var oldChildNodes = oldTree && oldTree.childNodes;

  // Stateful components have a very limited API, designed to be fully
  // implemented by a higher-level abstraction. The only method ever called is
  // `render`. It is up to a higher level abstraction on how to handle the
  // changes.
  for (var i = 0; i < newTree.childNodes.length; i++) {
    var newChild = newTree.childNodes[i];

    // If incoming tree is a component, flatten down to tree for now.
    if (newChild && typeof newChild.rawNodeName === 'function') {
      var newCtor = newChild.rawNodeName;
      var oldChild = oldChildNodes && oldChildNodes[i];
      var oldInstanceCache = InstanceCache.get(oldChild);
      var children = newChild.childNodes;
      var props = assign$4({}, newChild.attributes, { children: children });
      var canNew = newCtor.prototype;

      // If the component has already been initialized, we can reuse it.
      var oldInstance = oldChild && oldInstanceCache instanceof newCtor && oldInstanceCache;
      var newInstance = !oldInstance && canNew && new newCtor(props);
      var instance = oldInstance || newInstance;

      var renderTree = null;

      if (oldInstance) {
        oldInstance.componentWillReceiveProps(props);
        oldInstance.props = props;

        if (oldInstance.shouldComponentUpdate()) {
          renderTree = oldInstance.render(props, oldInstance.state);
        }
      } else if (instance && instance.render) {
        renderTree = createTree(instance.render(props, instance.state));
      } else {
        renderTree = createTree(newCtor(props));
      }

      // Nothing was rendered so continue.
      if (!renderTree) {
        continue;
      }

      // Replace the rendered value into the new tree, if rendering a fragment
      // this will inject the contents into the parent.
      if (renderTree.nodeType === 11) {
        newTree.childNodes = [].concat( renderTree.childNodes );

        if (instance) {
          ComponentTreeCache.set(instance, oldTree);
          InstanceCache.set(oldTree, instance);
        }
      }
      // If the rendered value is a single element use it as the root for
      // diffing.
      else {
          newTree.childNodes[i] = renderTree;

          if (instance) {
            ComponentTreeCache.set(instance, renderTree);
            InstanceCache.set(renderTree, instance);
          }
        }
    }
  }

  return newTree;
};

var lifecycleHooks = {
  shouldComponentUpdate: function shouldComponentUpdate() {
    return true;
  },
  componentWillReceiveProps: function componentWillReceiveProps() {},
  componentWillMount: function componentWillMount() {},
  componentDidMount: function componentDidMount() {},
  componentDidUpdate: function componentDidUpdate() {},
  componentWillUnmount: function componentWillUnmount() {},
  componentDidUnmount: function componentDidUnmount() {}
};

var $$render = Symbol('diff.render');

var Debounce = new WeakMap();
var assign$6 = Object.assign;

function setState(newState) {
  var this$1 = this;

  this.state = assign$6({}, this.state, newState);

  if (!Debounce.has(this) && this.shouldComponentUpdate()) {
    this[$$render]();

    Debounce.set(this, setTimeout(function () {
      Debounce.delete(this$1);

      if (this$1.shouldComponentUpdate()) {
        this$1[$$render]();
      }
    }));
  }
}

function forceUpdate() {
  this[$$render]();
}

var assign$5 = Object.assign;

function upgradeClass(Constructor) {
  assign$5(Constructor.prototype, lifecycleHooks, { forceUpdate: forceUpdate, setState: setState });
  return Constructor;
}

var NodeCache$1 = Internals.NodeCache;
var keys$1 = Object.keys;
var assign$3 = Object.assign;

// Registers a custom middleware to help map the diffHTML render lifecycle
// internals to React. This currently isn't necessary for the Web Component
// implementation since they inherently provide lifecycle hooks.
var subscribeMiddleware = function () { return use(reactLikeComponentTask); };
var unsubscribeMiddleware = subscribeMiddleware();

var Component = upgradeClass((function () {
  function Component(initialProps) {
    var props = this.props = assign$3({}, initialProps);
    var state = this.state = {};
    var context = this.context = {};

    var ref = this.constructor;
  var defaultProps = ref.defaultProps; if ( defaultProps === void 0 ) defaultProps = {};
  var propTypes = ref.propTypes; if ( propTypes === void 0 ) propTypes = {};
  var childContextTypes = ref.childContextTypes; if ( childContextTypes === void 0 ) childContextTypes = {};
  var contextTypes = ref.contextTypes; if ( contextTypes === void 0 ) contextTypes = {};
  var name = ref.name;

    keys$1(defaultProps).forEach(function (prop) {
      if (prop in props && props[prop] !== undefined) {
        return;
      }

      props[prop] = defaultProps[prop];
    });

    if (process$2.env.NODE_ENV !== 'production') {
      if (index$1.checkPropTypes) {
        index$1.checkPropTypes(propTypes, props, 'prop', name);
      }
    }

    //keys(childContextTypes).forEach(prop => {
    //  if (process.env.NODE_ENV !== 'production') {
    //    const err = childContextTypes[prop](this.context, prop, name, 'context');
    //    if (err) { throw err; }
    //  }

    //  //this.context[prop] = child
    //});

    //keys(contextTypes).forEach(prop => {
    //  if (process.env.NODE_ENV !== 'production') {
    //    const err = childContextTypes[prop](this.context, prop, name, 'context');
    //    if (err) { throw err; }
    //  }

    //  this.context[prop] = child
    //});
  }

  Component.subscribeMiddleware = function subscribeMiddleware$1 () {
    return subscribeMiddleware();
  };

  Component.unsubscribeMiddleware = function unsubscribeMiddleware$1 () {
    unsubscribeMiddleware();
    return subscribeMiddleware;
  };

  Component.prototype[$$render] = function () {
    var this$1 = this;

    var vTree = ComponentTreeCache.get(this);
    var domNode = NodeCache$1.get(vTree);
    var renderTree = this.render();

    outerHTML(domNode, renderTree).then(function () {
      this$1.componentDidUpdate();
    });
  };

  return Component;
}()));

var _vtree$1 = createTree('#text', null, "\n        ");
var _vtree2$1 = createTree('#text', null, "\n\n          ");
var _vtree3$1 = createTree('#text', null, "\n            ");
var _vtree4$1 = createTree('#text', null, "\n\n            ");
var _vtree5$1 = createTree('#text', null, "\n          ");
var _vtree6$1 = createTree('#text', null, "\n\n          ");
var _vtree7$1 = createTree('#text', null, "\n            ");
var _vtree8$1 = createTree('#text', null, "\n\n            ");
var _vtree9$1 = createTree('#text', null, "\n          ");

var Card = (function (Component$$1) {
  function Card(props) {
    Component$$1.call(this, props);

    this.update(props);
  }

  if ( Component$$1 ) Card.__proto__ = Component$$1;
  Card.prototype = Object.create( Component$$1 && Component$$1.prototype );
  Card.prototype.constructor = Card;

  Card.prototype.render = function render () {
    var ref = this.props;
    var x = ref.x;
    var y = ref.y;
    var width = ref.width;
    var facing = ref.facing;
    var value = ref.value;
    var children = ref.children;
    var ref$1 = this;
    var suit = ref$1.suit;
    var label = ref$1.label;
    var height = width * 1.4;
    var fontSize = Math.round(width * 0.20);
    var graphicSize = Math.round(width * 0.30);
    var fontX = Math.round(width * 0.12);
    var fontY = Math.round(width * 0.24);
    var isRed = suit === 'diamond' || suit == 'heart';

    return createTree("g", {
      "style": { cursor: 'pointer' },
      "transform": ("translate(" + x + ", " + y + ")"),
      "width": width,
      "height": height
    }, [_vtree$1, createTree("rect", {
      "class": "background",
      "x": "0",
      "y": "0",
      "width": width,
      "height": height,
      "rx": "8",
      "ry": "8",
      "fill": "#303030"
    }, []), facing && [createTree("rect", {
      "class": "foreground",
      "x": "2",
      "y": "2",
      "width": width - 4,
      "height": height - 4,
      "rx": "8",
      "ry": "8",
      "fill": "url(#card_background)"
    }, []), _vtree2$1, createTree("g", {
      "class": "top",
      "text-anchor": "start"
    }, [_vtree3$1, createTree("text", {
      "class": "label-top",
      "font-weight": "bold",
      "font-size": fontSize,
      "fill": isRed ? '#FF0000' : '#000000',
      "x": fontX,
      "y": fontY
    }, [label]), _vtree4$1, createTree("text", {
      "class": "suit-top",
      "font-weight": "bold",
      "font-size": graphicSize,
      "fill": isRed ? '#FF0000' : '#000000',
      "x": fontX,
      "y": fontY * 2
    }, [createTree('#document-fragment', null, [suit === 'heart' && '♥', createTree('#text', '\n              '), suit === 'spade' && '♠', createTree('#text', '\n              '), suit === 'diamond' && '♦', createTree('#text', '\n              '), suit === 'club' && '♣'])]), _vtree5$1]), _vtree6$1, createTree("g", {
      "class": "bottom",
      "text-anchor": "end"
    }, [_vtree7$1, createTree("text", {
      "class": "label-bottom",
      "font-weight": "bold",
      "font-size": fontSize,
      "fill": isRed ? '#FF0000' : '#000000',
      "x": width - fontX,
      "y": height - fontY * 0.65
    }, [label]), _vtree8$1, createTree("text", {
      "class": "suit-bottom",
      "font-weight": "bold",
      "font-size": graphicSize,
      "fill": isRed ? '#FF0000' : '#000000',
      "x": width - fontX,
      "y": height - fontY * 1.5
    }, [createTree('#document-fragment', null, [suit === 'heart' && '♥', createTree('#text', '\n              '), suit === 'spade' && '♠', createTree('#text', '\n              '), suit === 'diamond' && '♦', createTree('#text', '\n              '), suit === 'club' && '♣'])]), _vtree9$1])]]);
  };

  Card.prototype.componentWillReceiveProps = function componentWillReceiveProps (nextProps) {
    this.update(nextProps);
    this.props = nextProps;
  };

  Card.prototype.update = function update (nextProps) {
    var value = nextProps.value;

    this.value = value;
    this.label = value % 13 + 1;

    switch (this.label) {
      case 1:
        {
          this.label = "A";
          this.value = 1;

          break;
        }

      case 11:
        {
          this.label = "J";
          this.value = 10;

          break;
        }

      case 12:
        {
          this.label = "Q";
          this.value = 10;

          break;
        }

      case 13:
        {
          this.label = "K";
          this.value = 10;

          break;
        }
    }

    var index = Math.floor(value / 52 * 4);
    this.suit = ['heart', 'spade', 'diamond', 'club'][index];
  };

  return Card;
}(Component));

Card.defaultProps = {
  x: 10,
  y: 10,
  width: 50,
  facing: true
};

var _vtree$2 = createTree('#text', null, "\n        ");
var _vtree2$2 = createTree('#text', null, "\n      ");

var Board = (function (Component$$1) {
  function Board() {
    var this$1 = this;
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var _temp;

    return _temp = Component$$1.apply(this, args), this.click = function (ev) {
      if (this$1.state.color !== 'red') {
        this$1.setState({ color: 'red' });
      } else {
        this$1.setState({ color: 'blue' });
      }
    }, _temp;
  }

  if ( Component$$1 ) Board.__proto__ = Component$$1;
  Board.prototype = Object.create( Component$$1 && Component$$1.prototype );
  Board.prototype.constructor = Board;

  Board.prototype.render = function render () {
    var ref = this.props;
    var x = ref.x;
    var y = ref.y;
    var width = ref.width;
    var children = ref.children;
    var style = ref.style;
    var ref$1 = this;
    var color = ref$1.color;
    var height = 300;

    return createTree("g", {
      "onclick": this.click,
      "transform": ("translate(" + x + ", " + y + ")")
    }, [_vtree$2, createTree("rect", {
      "class": "background",
      "x": "0",
      "y": "0",
      "rx": "8",
      "ry": "8",
      "fill": this.state.color || "#8C5831",
      "style": { width: width, height: height }
    }, []), _vtree2$2]);
  };

  return Board;
}(Component));

Board.defaultProps = {
  x: 10,
  y: 10,
  width: 50
};

(typeof window !== 'undefined' ? window : global).process = Internals.process;

var process$3 = Internals.process;

var ComponentTreeCache$1 = new Map();
var InstanceCache$1 = new Map();

var caches$2 = Object.freeze({
	ComponentTreeCache: ComponentTreeCache$1,
	InstanceCache: InstanceCache$1
});

var NodeCache$4 = Internals.NodeCache;
var assign$9 = Object.assign;

function triggerRef$1(ref, instance) {
  if (typeof ref === 'function') {
    ref(instance);
  } else if (typeof ref === 'string') {
    this[ref](instance);
  }
}

function searchForRefs$1(newTree) {
  if (newTree.attributes.ref) {
    triggerRef$1(newTree.attributes.ref, NodeCache$4.get(newTree));
  }

  newTree.childNodes.forEach(searchForRefs$1);
}

function componentDidMount$1(newTree) {
  if (InstanceCache$1.has(newTree)) {
    InstanceCache$1.get(newTree).componentDidMount();
  }

  var instance = InstanceCache$1.get(newTree);

  searchForRefs$1(newTree);

  if (!instance) {
    return;
  }

  var ref$1 = instance.props;
  var ref = ref$1.ref;

  triggerRef$1(ref, instance);
}

function componentDidUnmount$1(oldTree) {
  if (InstanceCache$1.has(oldTree)) {
    InstanceCache$1.get(oldTree).componentDidUnmount();
  }

  var instance = InstanceCache$1.get(oldTree);

  searchForRefs$1(oldTree);

  if (!instance) {
    return;
  }

  var ref$1 = instance.props;
  var ref = ref$1.ref;

  triggerRef$1(ref, null);
}

function reactLikeComponentTask$1(transaction) {
  return transaction.onceEnded(function () {
    if (transaction.aborted) {
      return;
    }

    var patches = transaction.patches;

    if (patches.TREE_OPS && patches.TREE_OPS.length) {
      patches.TREE_OPS.forEach(function (ref) {
        var INSERT_BEFORE = ref.INSERT_BEFORE;
        var REPLACE_CHILD = ref.REPLACE_CHILD;
        var REMOVE_CHILD = ref.REMOVE_CHILD;

        if (INSERT_BEFORE) {
          for (var i = 0; i < INSERT_BEFORE.length; i += 3) {
            var newTree = INSERT_BEFORE[i + 1];
            componentDidMount$1(newTree);
          }
        }

        if (REPLACE_CHILD) {
          for (var i$1 = 0; i$1 < REPLACE_CHILD.length; i$1 += 2) {
            var newTree$1 = REPLACE_CHILD[i$1];
            componentDidMount$1(newTree$1);
          }
        }

        if (REMOVE_CHILD) {
          for (var i$2 = 0; i$2 < REMOVE_CHILD.length; i$2 += 1) {
            var oldTree = REMOVE_CHILD[i$2];
            componentDidUnmount$1(oldTree);
          }
        }
      });
    }
  });
}

reactLikeComponentTask$1.syncTreeHook = function (oldTree, newTree) {
  var oldChildNodes = oldTree && oldTree.childNodes;

  // Stateful components have a very limited API, designed to be fully
  // implemented by a higher-level abstraction. The only method ever called is
  // `render`. It is up to a higher level abstraction on how to handle the
  // changes.
  for (var i = 0; i < newTree.childNodes.length; i++) {
    var newChild = newTree.childNodes[i];

    // If incoming tree is a component, flatten down to tree for now.
    if (newChild && typeof newChild.rawNodeName === 'function') {
      var newCtor = newChild.rawNodeName;
      var oldChild = oldChildNodes && oldChildNodes[i];
      var oldInstanceCache = InstanceCache$1.get(oldChild);
      var children = newChild.childNodes;
      var props = assign$9({}, newChild.attributes, { children: children });
      var canNew = newCtor.prototype;

      // If the component has already been initialized, we can reuse it.
      var oldInstance = oldChild && oldInstanceCache instanceof newCtor && oldInstanceCache;
      var newInstance = !oldInstance && canNew && new newCtor(props);
      var instance = oldInstance || newInstance;

      var renderTree = null;

      if (oldInstance) {
        oldInstance.componentWillReceiveProps(props);
        oldInstance.props = props;

        if (oldInstance.shouldComponentUpdate()) {
          renderTree = oldInstance.render(props, oldInstance.state);
        }
      } else if (instance && instance.render) {
        renderTree = createTree(instance.render(props, instance.state));
      } else {
        renderTree = createTree(newCtor(props));
      }

      // Nothing was rendered so continue.
      if (!renderTree) {
        continue;
      }

      // Replace the rendered value into the new tree, if rendering a fragment
      // this will inject the contents into the parent.
      if (renderTree.nodeType === 11) {
        newTree.childNodes = [].concat( renderTree.childNodes );

        if (instance) {
          ComponentTreeCache$1.set(instance, oldTree);
          InstanceCache$1.set(oldTree, instance);
        }
      }
      // If the rendered value is a single element use it as the root for
      // diffing.
      else {
          newTree.childNodes[i] = renderTree;

          if (instance) {
            ComponentTreeCache$1.set(instance, renderTree);
            InstanceCache$1.set(renderTree, instance);
          }
        }
    }
  }

  return newTree;
};

var lifecycleHooks$1 = {
  shouldComponentUpdate: function shouldComponentUpdate() {
    return true;
  },
  componentWillReceiveProps: function componentWillReceiveProps() {},
  componentWillMount: function componentWillMount() {},
  componentDidMount: function componentDidMount() {},
  componentDidUpdate: function componentDidUpdate() {},
  componentWillUnmount: function componentWillUnmount() {},
  componentDidUnmount: function componentDidUnmount() {}
};

var $$render$1 = Symbol('diff.render');

var Debounce$2 = new WeakMap();
var assign$11 = Object.assign;

function setState$1(newState) {
  var this$1 = this;

  this.state = assign$11({}, this.state, newState);

  if (!Debounce$2.has(this) && this.shouldComponentUpdate()) {
    this[$$render$1]();

    Debounce$2.set(this, setTimeout(function () {
      Debounce$2.delete(this$1);

      if (this$1.shouldComponentUpdate()) {
        this$1[$$render$1]();
      }
    }));
  }
}

function forceUpdate$1() {
  this[$$render$1]();
}

var assign$10 = Object.assign;

function upgradeClass$1(Constructor) {
  assign$10(Constructor.prototype, lifecycleHooks$1, { forceUpdate: forceUpdate$1, setState: setState$1 });
  return Constructor;
}

var NodeCache$3 = Internals.NodeCache;
var keys$2 = Object.keys;
var assign$8 = Object.assign;

// Registers a custom middleware to help map the diffHTML render lifecycle
// internals to React. This currently isn't necessary for the Web Component
// implementation since they inherently provide lifecycle hooks.
var subscribeMiddleware$1 = function () { return use(reactLikeComponentTask$1); };
var unsubscribeMiddleware$1 = subscribeMiddleware$1();

upgradeClass$1((function () {
  function Component(initialProps) {
    var props = this.props = assign$8({}, initialProps);
    var state = this.state = {};
    var context = this.context = {};

    var ref = this.constructor;
  var defaultProps = ref.defaultProps; if ( defaultProps === void 0 ) defaultProps = {};
  var propTypes = ref.propTypes; if ( propTypes === void 0 ) propTypes = {};
  var childContextTypes = ref.childContextTypes; if ( childContextTypes === void 0 ) childContextTypes = {};
  var contextTypes = ref.contextTypes; if ( contextTypes === void 0 ) contextTypes = {};
  var name = ref.name;

    keys$2(defaultProps).forEach(function (prop) {
      if (prop in props && props[prop] !== undefined) {
        return;
      }

      props[prop] = defaultProps[prop];
    });

    if (process$3.env.NODE_ENV !== 'production') {
      if (index$1.checkPropTypes) {
        index$1.checkPropTypes(propTypes, props, 'prop', name);
      }
    }

    //keys(childContextTypes).forEach(prop => {
    //  if (process.env.NODE_ENV !== 'production') {
    //    const err = childContextTypes[prop](this.context, prop, name, 'context');
    //    if (err) { throw err; }
    //  }

    //  //this.context[prop] = child
    //});

    //keys(contextTypes).forEach(prop => {
    //  if (process.env.NODE_ENV !== 'production') {
    //    const err = childContextTypes[prop](this.context, prop, name, 'context');
    //    if (err) { throw err; }
    //  }

    //  this.context[prop] = child
    //});
  }

  Component.subscribeMiddleware = function subscribeMiddleware$1 () {
    return subscribeMiddleware$1();
  };

  Component.unsubscribeMiddleware = function unsubscribeMiddleware$1 () {
    unsubscribeMiddleware$1();
    return subscribeMiddleware$1;
  };

  Component.prototype[$$render$1] = function () {
    var this$1 = this;

    var vTree = ComponentTreeCache$1.get(this);
    var domNode = NodeCache$3.get(vTree);
    var renderTree = this.render();

    outerHTML(domNode, renderTree).then(function () {
      this$1.componentDidUpdate();
    });
  };

  return Component;
}()));

var NodeCache$5 = Internals.NodeCache;
function webComponentTask(transaction) {
  return transaction.onceEnded(function () {
    if (transaction.aborted) {
      return;
    }

    var patches = transaction.patches;

    if (patches.TREE_OPS && patches.TREE_OPS.length) {
      patches.TREE_OPS.forEach(function (ref) {
        var INSERT_BEFORE = ref.INSERT_BEFORE;
        var REPLACE_CHILD = ref.REPLACE_CHILD;
        var REMOVE_CHILD = ref.REMOVE_CHILD;

        if (INSERT_BEFORE) {
          for (var i = 0; i < INSERT_BEFORE.length; i += 3) {
            var newTree = INSERT_BEFORE[i + 1];
            var instance = NodeCache$5.get(newTree);

            if (instance && instance.componentDidMount) {
              instance.componentDidMount();
            }
          }
        }

        if (REPLACE_CHILD) {
          for (var i$1 = 0; i$1 < REPLACE_CHILD.length; i$1 += 2) {
            var newTree$1 = REPLACE_CHILD[i$1];
            var instance$1 = NodeCache$5.get(newTree$1);

            if (instance$1 && instance$1.componentDidMount) {
              instance$1.componentDidMount();
            }
          }
        }

        if (REMOVE_CHILD) {
          for (var i$2 = 0; i$2 < REMOVE_CHILD.length; i$2 += 1) {
            var oldTree = REMOVE_CHILD[i$2];
            var instance$2 = NodeCache$5.get(oldTree);

            if (instance$2 && instance$2.componentDidUnmount) {
              instance$2.componentDidUnmount();
            }
          }
        }
      });
    }
  });
}

webComponentTask.syncTreeHook = function (oldTree, newTree) {
  // Stateful components have a very limited API, designed to be fully
  // implemented by a higher-level abstraction. The only method ever called is
  // `render`. It is up to a higher level abstraction on how to handle the
  // changes.
  if (!newTree || !newTree.childNodes) {
    return newTree;
  }

  var loop = function ( i ) {
    var oldChild = oldTree && oldTree.childNodes && oldTree.childNodes[i];
    var newChild = newTree.childNodes[i];

    // If incoming tree is a web component, flatten down to tree for now.
    if (newChild && customElements.get(newChild.nodeName)) {
      Object.defineProperty(newChild.attributes, 'children', {
        get: function () { return newChild.childNodes; }
      });
    }
  };

  for (var i = 0; i < newTree.childNodes.length; i++) loop( i );

  return newTree;
};

webComponentTask.createNodeHook = function (vTree) {
  var Constructor = null;

  if (Constructor = customElements.get(vTree.nodeName)) {
    return new Constructor(vTree.attributes);
  }
};

var Debounce$4 = new WeakMap();
var assign$13 = Object.assign;
var keys$3 = Object.keys;

// Convert observed attributes from passed PropTypes.
var getObserved = function (ref) {
  var propTypes = ref.propTypes;

  return propTypes ? keys$3(propTypes) : [];
};

// Creates the `component.props` object.
var createProps = function (domNode) {
  var observedAttributes = getObserved(domNode.constructor);
  var initialProps = {
    children: [].map.call(domNode.childNodes, createTree)
  };

  return observedAttributes.reduce(function (props, attr) { return assign$13(props, ( obj = {}, obj[attr] = attr in domNode ? domNode[attr] : domNode.getAttribute(attr) || undefined, obj ))
    var obj; }, initialProps);
};

// Creates the `component.state` object.
var createState = function (domNode, newState) {
  return assign$13({}, domNode.state, newState);
};

// Creates the `component.contxt` object.
var createContext = function (domNode) {};

// Allow tests to unbind this task, you would not typically need to do this
// in a web application, as this code loads once and is not reloaded.
var subscribeMiddleware$2 = function () { return use(webComponentTask); };
var unsubscribeMiddleware$2 = subscribeMiddleware$2();

upgradeClass$1((function (HTMLElement) {
  function WebComponent() {
    var this$1 = this;

    HTMLElement.call(this);

    this.props = createProps(this);
    this.state = createState(this);
    this.context = createContext(this);

    var ref = this.constructor;
    var defaultProps = ref.defaultProps; if ( defaultProps === void 0 ) defaultProps = {};
    var propTypes = ref.propTypes; if ( propTypes === void 0 ) propTypes = {};
    var childContextTypes = ref.childContextTypes; if ( childContextTypes === void 0 ) childContextTypes = {};
    var contextTypes = ref.contextTypes; if ( contextTypes === void 0 ) contextTypes = {};
    var name = ref.name;

    keys$3(defaultProps).forEach(function (prop) {
      if (prop in this$1.props && this$1.props[prop] !== undefined) {
        return;
      }

      this$1.props[prop] = defaultProps[prop];
    });

    if (process.env.NODE_ENV !== 'production') {
      if (index$1.checkPropTypes) {
        index$1.checkPropTypes(propTypes, this.props, 'prop', name);
      }
    }
  }

  if ( HTMLElement ) WebComponent.__proto__ = HTMLElement;
  WebComponent.prototype = Object.create( HTMLElement && HTMLElement.prototype );
  WebComponent.prototype.constructor = WebComponent;

  var staticAccessors = { observedAttributes: {} };

  WebComponent.subscribeMiddleware = function subscribeMiddleware$1 () {
    return subscribeMiddleware$2();
  };

  WebComponent.unsubscribeMiddleware = function unsubscribeMiddleware$1 () {
    unsubscribeMiddleware$2();
    return subscribeMiddleware$2;
  };

  staticAccessors.observedAttributes.get = function () {
    return getObserved(this).map(function (key) { return key.toLowerCase(); });
  };

  WebComponent.prototype[$$render$1] = function () {
    this.props = createProps(this);
    innerHTML(this.shadowRoot, this.render(this.props, this.state));
    this.componentDidUpdate();
  };

  WebComponent.prototype.connectedCallback = function connectedCallback () {
    this.attachShadow({ mode: 'open' });
    this[$$render$1]();
    this.componentDidMount();
  };

  WebComponent.prototype.disconnectedCallback = function disconnectedCallback () {
    // TODO Figure out a better place for `willUnmount`, use the detached
    // transition to determine if a Node is removed would be very accurate
    // as this fires just before an element is removed, also if the user
    // is using a detached animation this would allow them to do something
    // before the animation completes, giving you two nice callbacks to use
    // for detaching.
    this.componentWillUnmount();
    this.componentDidUnmount();
  };

  WebComponent.prototype.attributeChangedCallback = function attributeChangedCallback () {
    var this$1 = this;

    if (this.shadowRoot && !Debounce$4.has(this)) {
      var nextProps = createProps(this);
      this.componentWillReceiveProps(nextProps);
      this.props = nextProps;
      this[$$render$1]();

      Debounce$4.set(this, setTimeout(function () {
        Debounce$4.delete(this$1);
        this$1[$$render$1]();
      }));
    }
  };

  Object.defineProperties( WebComponent, staticAccessors );

  return WebComponent;
}(HTMLElement)));

var caches$1 = caches$2;
var monitorFile = null;
var clearConsole = null;

var handler = function (ref) {
  var file = ref.file;
  var markup = ref.markup;
  var quiet = ref.quiet;

  if (file.slice(-3) !== '.js') {
    return false;
  }

  if (file !== monitorFile) {
    return true;
  }

  if (!quiet) {
    console.log('JS changed, reloading app...');
  }

  // Before doing anything lets reset everything on the page.
  Internals.StateCache.forEach(function (state, domNode) {
    domNode.innerHTML = '';
    release(domNode);
  });

  caches$1.InstanceCache.clear();
  caches$1.ComponentTreeCache.clear();

  unsubscribe();

  var existingEl = document.querySelector(("script[src^='" + file + "']"));

  document.body.appendChild(Object.assign(document.createElement('script'), { src: file }));

  if (existingEl) {
    existingEl.parentNode.removeChild(existingEl);
  }

  if (clearConsole) {
    console.clear();
  }

  return true;
};

var subscribe = function (opts) { return function () {
  monitorFile = opts.src || 'dist/app.js';
  clearConsole = opts.clearConsole;
  window.onload = function () { return staticSyncHandlers.add(handler); };
}; };
var unsubscribe = function (opts) { return function () { return staticSyncHandlers.delete(handler); }; };

var hmr = (function (opts) { return Object.assign(function hmrTask() {}, {
  subscribe: subscribe(opts),
  unsubscribe: unsubscribe(opts)
}); });

var _vtree = createTree('#text', null, "\n    ");
var _vtree2 = createTree('#text', null, "\n      ");
var _vtree3 = createTree('#text', null, "\n      ");
var _vtree4 = createTree('#text', null, "\n      ");
var _vtree5 = createTree('#text', null, "\n      ");
var _vtree6 = createTree('#text', null, "\n    ");
var _vtree7 = createTree('#text', null, "\n  ");
var _vtree8 = createTree('#text', null, "\n\n  ");
var _vtree9 = createTree('#text', null, "\n    ");
var _vtree10 = createTree('#text', null, "\n  ");
var _vtree11 = createTree('#text', null, "\n\n  ");
var _vtree12 = createTree('#text', null, "\n    ");
var _vtree13 = createTree('#text', null, "\n    ");
var _vtree14 = createTree('#text', null, "\n    ");
var _vtree15 = createTree('#text', null, "\n    ");
var _vtree16 = createTree('#text', null, "\n    ");
var _vtree17 = createTree('#text', null, "\n    ");
var _vtree18 = createTree('#text', null, "\n  ");

var mount = document.querySelector('svg');
var deck = new Deck(52);

use(hmr({ clearConsole: true, src: 'dist/cribbage.js' }));

var render = function () { return innerHTML(mount, [createTree("defs", {}, [_vtree, createTree("linearGradient", {
  "id": "card_background",
  "x1": "0%",
  "y1": "0%",
  "x2": "100%",
  "y2": "100%"
}, [_vtree2, createTree("stop", {
  "offset": "0%",
  "style": "stop-color:rgb(230, 238, 243); stop-opacity:1"
}, []), _vtree3, createTree("stop", {
  "offset": "20%",
  "style": "stop-color:rgb(255, 255, 255); stop-opacity: 1"
}, []), _vtree4, createTree("stop", {
  "offset": "40%",
  "style": "stop-color:rgb(255, 255, 255); stop-opacity: 1"
}, []), _vtree5, createTree("stop", {
  "offset": "100%",
  "style": "stop-color:rgb(200, 238, 243); stop-opacity:1"
}, []), _vtree6]), _vtree7]), _vtree8, createTree("g", {
  "class": "board"
}, [_vtree9, createTree(Board, {
  "width": window.innerWidth - 150,
  "x": 50,
  "y": 50
}, []), _vtree10]), _vtree11, createTree("g", {
  "class": "card"
}, [_vtree12, createTree(Card, {
  "value": deck.draw(),
  "width": 100,
  "x": 50,
  "y": 400
}, []), _vtree13, createTree(Card, {
  "value": deck.draw(),
  "width": 100,
  "x": 175,
  "y": 400
}, []), _vtree14, createTree(Card, {
  "value": deck.draw(),
  "width": 100,
  "x": 300,
  "y": 400
}, []), _vtree15, createTree(Card, {
  "value": deck.draw(),
  "width": 100,
  "x": 425,
  "y": 400
}, []), _vtree16, createTree(Card, {
  "value": deck.draw(),
  "width": 100,
  "x": 550,
  "y": 400
}, []), _vtree17, createTree(Card, {
  "value": deck.draw(),
  "width": 100,
  "x": 675,
  "y": 400
}, []), _vtree18])]); };

window.onresize = render;
render();

})));
