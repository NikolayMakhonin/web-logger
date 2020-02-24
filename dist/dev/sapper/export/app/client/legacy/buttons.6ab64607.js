import { _ as _inherits, a as _classCallCheck, b as _possibleConstructorReturn, c as _getPrototypeOf, i as init, s as safe_not_equal, d as _assertThisInitialized, e as dispatch_dev, S as SvelteComponentDev, Q as onMount, t as element, v as claim_element, w as children, k as _forEachInstanceProperty, y as detach_dev, z as attr_dev, A as add_location, B as insert_dev, n as noop, a4 as _Array$isArray, a5 as _getIterator, U as binding_callbacks } from './client.d5c92d1b.js';

var file = "src\\routes\\dev\\components\\small\\buttons.svelte";

function create_fragment(ctx) {
  var div;
  var block = {
    c: function create() {
      div = element("div");
      this.h();
    },
    l: function claim(nodes) {
      div = claim_element(nodes, "DIV", {
        class: true
      });
      var div_nodes = children(div);

      _forEachInstanceProperty(div_nodes).call(div_nodes, detach_dev);

      this.h();
    },
    h: function hydrate() {
      attr_dev(div, "class", "container svelte-1whmb7e");
      add_location(div, file, 12, 0, 180);
    },
    m: function mount(target, anchor) {
      insert_dev(target, div, anchor);
      /*div_binding*/

      ctx[1](div);
    },
    p: noop,
    i: noop,
    o: noop,
    d: function destroy(detaching) {
      if (detaching) detach_dev(div);
      /*div_binding*/

      ctx[1](null);
    }
  };
  dispatch_dev("SvelteRegisterBlock", {
    block: block,
    id: create_fragment.name,
    type: "component",
    source: "",
    ctx: ctx
  });
  return block;
}

function instance($$self, $$props, $$invalidate) {
  var container;
  onMount(function () {
    for (var _iterator = container.children, _isArray = _Array$isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _getIterator(_iterator);;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var _element = _ref;
      _element.title = _element.classList[0];
    }
  });

  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](function () {
      $$invalidate(0, container = $$value);
    });
  }

  $$self.$capture_state = function () {
    return {};
  };

  $$self.$inject_state = function ($$props) {
    if ("container" in $$props) $$invalidate(0, container = $$props.container);
  };

  return [container, div_binding];
}

var Buttons =
/*#__PURE__*/
function (_SvelteComponentDev) {
  _inherits(Buttons, _SvelteComponentDev);

  function Buttons(options) {
    var _this;

    _classCallCheck(this, Buttons);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Buttons).call(this, options));
    init(_assertThisInitialized(_this), options, instance, create_fragment, safe_not_equal, {});
    dispatch_dev("SvelteRegisterComponent", {
      component: _assertThisInitialized(_this),
      tagName: "Buttons",
      options: options,
      id: create_fragment.name
    });
    return _this;
  }

  return Buttons;
}(SvelteComponentDev);

export default Buttons;