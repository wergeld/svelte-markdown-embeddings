
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	/** @returns {void} */
	function add_location(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	/** @type {typeof globalThis} */
	const globals =
		typeof window !== 'undefined'
			? window
			: typeof globalThis !== 'undefined'
			? globalThis
			: // @ts-ignore Node typings have this
			  global;

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @template {keyof SVGElementTagNameMap} K
	 * @param {K} name
	 * @returns {SVGElement}
	 */
	function svg_element(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @returns {Text} */
	function empty() {
		return text('');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @returns {void} */
	function set_input_value(input, value) {
		input.value = value == null ? '' : value;
	}

	/**
	 * @returns {void} */
	function set_style(node, key, value, important) {
		if (value == null) {
			node.style.removeProperty(key);
		} else {
			node.style.setProperty(key, value, important ? 'important' : '');
		}
	}

	/**
	 * @returns {void} */
	function toggle_class(element, name, toggle) {
		// The `!!` is required because an `undefined` flag means flipping the current state.
		element.classList.toggle(name, !!toggle);
	}

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
	 * @returns {CustomEvent<T>}
	 */
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		return new CustomEvent(type, { detail, bubbles, cancelable });
	}
	/** */
	class HtmlTag {
		/**
		 * @private
		 * @default false
		 */
		is_svg = false;
		/** parent for creating node */
		e = undefined;
		/** html tag nodes */
		n = undefined;
		/** target */
		t = undefined;
		/** anchor */
		a = undefined;
		constructor(is_svg = false) {
			this.is_svg = is_svg;
			this.e = this.n = null;
		}

		/**
		 * @param {string} html
		 * @returns {void}
		 */
		c(html) {
			this.h(html);
		}

		/**
		 * @param {string} html
		 * @param {HTMLElement | SVGElement} target
		 * @param {HTMLElement | SVGElement} anchor
		 * @returns {void}
		 */
		m(html, target, anchor = null) {
			if (!this.e) {
				if (this.is_svg)
					this.e = svg_element(/** @type {keyof SVGElementTagNameMap} */ (target.nodeName));
				/** #7364  target for <template> may be provided as #document-fragment(11) */ else
					this.e = element(
						/** @type {keyof HTMLElementTagNameMap} */ (
							target.nodeType === 11 ? 'TEMPLATE' : target.nodeName
						)
					);
				this.t =
					target.tagName !== 'TEMPLATE'
						? target
						: /** @type {HTMLTemplateElement} */ (target).content;
				this.c(html);
			}
			this.i(anchor);
		}

		/**
		 * @param {string} html
		 * @returns {void}
		 */
		h(html) {
			this.e.innerHTML = html;
			this.n = Array.from(
				this.e.nodeName === 'TEMPLATE' ? this.e.content.childNodes : this.e.childNodes
			);
		}

		/**
		 * @returns {void} */
		i(anchor) {
			for (let i = 0; i < this.n.length; i += 1) {
				insert(this.t, this.n[i], anchor);
			}
		}

		/**
		 * @param {string} html
		 * @returns {void}
		 */
		p(html) {
			this.d();
			this.h(html);
			this.i(this.a);
		}

		/**
		 * @returns {void} */
		d() {
			this.n.forEach(detach);
		}
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}

	/**
	 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
	 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
	 * it can be called from an external module).
	 *
	 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
	 *
	 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
	 *
	 * https://svelte.dev/docs/svelte#onmount
	 * @template T
	 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
	 * @returns {void}
	 */
	function onMount(fn) {
		get_current_component().$$.on_mount.push(fn);
	}

	/**
	 * Schedules a callback to run immediately before the component is unmounted.
	 *
	 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
	 * only one that runs inside a server-side component.
	 *
	 * https://svelte.dev/docs/svelte#ondestroy
	 * @param {() => any} fn
	 * @returns {void}
	 */
	function onDestroy(fn) {
		get_current_component().$$.on_destroy.push(fn);
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	const outroing = new Set();

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	/**
	 * The current version, as set in package.json.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-version
	 * @type {string}
	 */
	const VERSION = '4.2.20';
	const PUBLIC_VERSION = '4';

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @returns {void}
	 */
	function dispatch_dev(type, detail) {
		document.dispatchEvent(custom_event(type, { version: VERSION, ...detail }, { bubbles: true }));
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append_dev(target, node) {
		dispatch_dev('SvelteDOMInsert', { target, node });
		append(target, node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert_dev(target, node, anchor) {
		dispatch_dev('SvelteDOMInsert', { target, node, anchor });
		insert(target, node, anchor);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach_dev(node) {
		dispatch_dev('SvelteDOMRemove', { node });
		detach(node);
	}

	/**
	 * @param {Node} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @param {boolean} [has_prevent_default]
	 * @param {boolean} [has_stop_propagation]
	 * @param {boolean} [has_stop_immediate_propagation]
	 * @returns {() => void}
	 */
	function listen_dev(
		node,
		event,
		handler,
		options,
		has_prevent_default,
		has_stop_propagation,
		has_stop_immediate_propagation
	) {
		const modifiers =
			options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
		if (has_prevent_default) modifiers.push('preventDefault');
		if (has_stop_propagation) modifiers.push('stopPropagation');
		if (has_stop_immediate_propagation) modifiers.push('stopImmediatePropagation');
		dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
		const dispose = listen(node, event, handler, options);
		return () => {
			dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
			dispose();
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr_dev(node, attribute, value) {
		attr(node, attribute, value);
		if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
		else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data_dev(text, data) {
		data = '' + data;
		if (text.data === data) return;
		dispatch_dev('SvelteDOMSetData', { node: text, data });
		text.data = /** @type {string} */ (data);
	}

	function ensure_array_like_dev(arg) {
		if (
			typeof arg !== 'string' &&
			!(arg && typeof arg === 'object' && 'length' in arg) &&
			!(typeof Symbol === 'function' && arg && Symbol.iterator in arg)
		) {
			throw new Error('{#each} only works with iterable values.');
		}
		return ensure_array_like(arg);
	}

	/**
	 * @returns {void} */
	function validate_slots(name, slot, keys) {
		for (const slot_key of Object.keys(slot)) {
			if (!~keys.indexOf(slot_key)) {
				console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
			}
		}
	}

	/**
	 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
	 *
	 * Can be used to create strongly typed Svelte components.
	 *
	 * #### Example:
	 *
	 * You have component library on npm called `component-library`, from which
	 * you export a component called `MyComponent`. For Svelte+TypeScript users,
	 * you want to provide typings. Therefore you create a `index.d.ts`:
	 * ```ts
	 * import { SvelteComponent } from "svelte";
	 * export class MyComponent extends SvelteComponent<{foo: string}> {}
	 * ```
	 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
	 * to provide intellisense and to use the component like this in a Svelte file
	 * with TypeScript:
	 * ```svelte
	 * <script lang="ts">
	 * 	import { MyComponent } from "component-library";
	 * </script>
	 * <MyComponent foo={'bar'} />
	 * ```
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 * @template {Record<string, any>} [Slots=any]
	 * @extends {SvelteComponent<Props, Events>}
	 */
	class SvelteComponentDev extends SvelteComponent {
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Props}
		 */
		$$prop_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Events}
		 */
		$$events_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Slots}
		 */
		$$slot_def;

		/** @param {import('./public.js').ComponentConstructorOptions<Props>} options */
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error("'target' is a required option");
			}
			super();
		}

		/** @returns {void} */
		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn('Component was already destroyed'); // eslint-disable-line no-console
			};
		}

		/** @returns {void} */
		$capture_state() {}

		/** @returns {void} */
		$inject_state() {}
	}

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	/**
	 * marked v11.2.0 - a markdown parser
	 * Copyright (c) 2011-2024, Christopher Jeffrey. (MIT Licensed)
	 * https://github.com/markedjs/marked
	 */

	/**
	 * DO NOT EDIT THIS FILE
	 * The code in this file is generated from files in ./src/
	 */

	/**
	 * Gets the original marked default options.
	 */
	function _getDefaults() {
	    return {
	        async: false,
	        breaks: false,
	        extensions: null,
	        gfm: true,
	        hooks: null,
	        pedantic: false,
	        renderer: null,
	        silent: false,
	        tokenizer: null,
	        walkTokens: null
	    };
	}
	let _defaults = _getDefaults();
	function changeDefaults(newDefaults) {
	    _defaults = newDefaults;
	}

	/**
	 * Helpers
	 */
	const escapeTest = /[&<>"']/;
	const escapeReplace = new RegExp(escapeTest.source, 'g');
	const escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
	const escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, 'g');
	const escapeReplacements = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#39;'
	};
	const getEscapeReplacement = (ch) => escapeReplacements[ch];
	function escape$1(html, encode) {
	    if (encode) {
	        if (escapeTest.test(html)) {
	            return html.replace(escapeReplace, getEscapeReplacement);
	        }
	    }
	    else {
	        if (escapeTestNoEncode.test(html)) {
	            return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
	        }
	    }
	    return html;
	}
	const unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;
	function unescape(html) {
	    // explicitly match decimal, hex, and named HTML entities
	    return html.replace(unescapeTest, (_, n) => {
	        n = n.toLowerCase();
	        if (n === 'colon')
	            return ':';
	        if (n.charAt(0) === '#') {
	            return n.charAt(1) === 'x'
	                ? String.fromCharCode(parseInt(n.substring(2), 16))
	                : String.fromCharCode(+n.substring(1));
	        }
	        return '';
	    });
	}
	const caret = /(^|[^\[])\^/g;
	function edit(regex, opt) {
	    let source = typeof regex === 'string' ? regex : regex.source;
	    opt = opt || '';
	    const obj = {
	        replace: (name, val) => {
	            let valSource = typeof val === 'string' ? val : val.source;
	            valSource = valSource.replace(caret, '$1');
	            source = source.replace(name, valSource);
	            return obj;
	        },
	        getRegex: () => {
	            return new RegExp(source, opt);
	        }
	    };
	    return obj;
	}
	function cleanUrl(href) {
	    try {
	        href = encodeURI(href).replace(/%25/g, '%');
	    }
	    catch (e) {
	        return null;
	    }
	    return href;
	}
	const noopTest = { exec: () => null };
	function splitCells(tableRow, count) {
	    // ensure that every cell-delimiting pipe has a space
	    // before it to distinguish it from an escaped pipe
	    const row = tableRow.replace(/\|/g, (match, offset, str) => {
	        let escaped = false;
	        let curr = offset;
	        while (--curr >= 0 && str[curr] === '\\')
	            escaped = !escaped;
	        if (escaped) {
	            // odd number of slashes means | is escaped
	            // so we leave it alone
	            return '|';
	        }
	        else {
	            // add space before unescaped |
	            return ' |';
	        }
	    }), cells = row.split(/ \|/);
	    let i = 0;
	    // First/last cell in a row cannot be empty if it has no leading/trailing pipe
	    if (!cells[0].trim()) {
	        cells.shift();
	    }
	    if (cells.length > 0 && !cells[cells.length - 1].trim()) {
	        cells.pop();
	    }
	    if (count) {
	        if (cells.length > count) {
	            cells.splice(count);
	        }
	        else {
	            while (cells.length < count)
	                cells.push('');
	        }
	    }
	    for (; i < cells.length; i++) {
	        // leading or trailing whitespace is ignored per the gfm spec
	        cells[i] = cells[i].trim().replace(/\\\|/g, '|');
	    }
	    return cells;
	}
	/**
	 * Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
	 * /c*$/ is vulnerable to REDOS.
	 *
	 * @param str
	 * @param c
	 * @param invert Remove suffix of non-c chars instead. Default falsey.
	 */
	function rtrim(str, c, invert) {
	    const l = str.length;
	    if (l === 0) {
	        return '';
	    }
	    // Length of suffix matching the invert condition.
	    let suffLen = 0;
	    // Step left until we fail to match the invert condition.
	    while (suffLen < l) {
	        const currChar = str.charAt(l - suffLen - 1);
	        if (currChar === c && !invert) {
	            suffLen++;
	        }
	        else if (currChar !== c && invert) {
	            suffLen++;
	        }
	        else {
	            break;
	        }
	    }
	    return str.slice(0, l - suffLen);
	}
	function findClosingBracket(str, b) {
	    if (str.indexOf(b[1]) === -1) {
	        return -1;
	    }
	    let level = 0;
	    for (let i = 0; i < str.length; i++) {
	        if (str[i] === '\\') {
	            i++;
	        }
	        else if (str[i] === b[0]) {
	            level++;
	        }
	        else if (str[i] === b[1]) {
	            level--;
	            if (level < 0) {
	                return i;
	            }
	        }
	    }
	    return -1;
	}

	function outputLink(cap, link, raw, lexer) {
	    const href = link.href;
	    const title = link.title ? escape$1(link.title) : null;
	    const text = cap[1].replace(/\\([\[\]])/g, '$1');
	    if (cap[0].charAt(0) !== '!') {
	        lexer.state.inLink = true;
	        const token = {
	            type: 'link',
	            raw,
	            href,
	            title,
	            text,
	            tokens: lexer.inlineTokens(text)
	        };
	        lexer.state.inLink = false;
	        return token;
	    }
	    return {
	        type: 'image',
	        raw,
	        href,
	        title,
	        text: escape$1(text)
	    };
	}
	function indentCodeCompensation(raw, text) {
	    const matchIndentToCode = raw.match(/^(\s+)(?:```)/);
	    if (matchIndentToCode === null) {
	        return text;
	    }
	    const indentToCode = matchIndentToCode[1];
	    return text
	        .split('\n')
	        .map(node => {
	        const matchIndentInNode = node.match(/^\s+/);
	        if (matchIndentInNode === null) {
	            return node;
	        }
	        const [indentInNode] = matchIndentInNode;
	        if (indentInNode.length >= indentToCode.length) {
	            return node.slice(indentToCode.length);
	        }
	        return node;
	    })
	        .join('\n');
	}
	/**
	 * Tokenizer
	 */
	class _Tokenizer {
	    options;
	    rules; // set by the lexer
	    lexer; // set by the lexer
	    constructor(options) {
	        this.options = options || _defaults;
	    }
	    space(src) {
	        const cap = this.rules.block.newline.exec(src);
	        if (cap && cap[0].length > 0) {
	            return {
	                type: 'space',
	                raw: cap[0]
	            };
	        }
	    }
	    code(src) {
	        const cap = this.rules.block.code.exec(src);
	        if (cap) {
	            const text = cap[0].replace(/^ {1,4}/gm, '');
	            return {
	                type: 'code',
	                raw: cap[0],
	                codeBlockStyle: 'indented',
	                text: !this.options.pedantic
	                    ? rtrim(text, '\n')
	                    : text
	            };
	        }
	    }
	    fences(src) {
	        const cap = this.rules.block.fences.exec(src);
	        if (cap) {
	            const raw = cap[0];
	            const text = indentCodeCompensation(raw, cap[3] || '');
	            return {
	                type: 'code',
	                raw,
	                lang: cap[2] ? cap[2].trim().replace(this.rules.inline.anyPunctuation, '$1') : cap[2],
	                text
	            };
	        }
	    }
	    heading(src) {
	        const cap = this.rules.block.heading.exec(src);
	        if (cap) {
	            let text = cap[2].trim();
	            // remove trailing #s
	            if (/#$/.test(text)) {
	                const trimmed = rtrim(text, '#');
	                if (this.options.pedantic) {
	                    text = trimmed.trim();
	                }
	                else if (!trimmed || / $/.test(trimmed)) {
	                    // CommonMark requires space before trailing #s
	                    text = trimmed.trim();
	                }
	            }
	            return {
	                type: 'heading',
	                raw: cap[0],
	                depth: cap[1].length,
	                text,
	                tokens: this.lexer.inline(text)
	            };
	        }
	    }
	    hr(src) {
	        const cap = this.rules.block.hr.exec(src);
	        if (cap) {
	            return {
	                type: 'hr',
	                raw: cap[0]
	            };
	        }
	    }
	    blockquote(src) {
	        const cap = this.rules.block.blockquote.exec(src);
	        if (cap) {
	            const text = rtrim(cap[0].replace(/^ *>[ \t]?/gm, ''), '\n');
	            const top = this.lexer.state.top;
	            this.lexer.state.top = true;
	            const tokens = this.lexer.blockTokens(text);
	            this.lexer.state.top = top;
	            return {
	                type: 'blockquote',
	                raw: cap[0],
	                tokens,
	                text
	            };
	        }
	    }
	    list(src) {
	        let cap = this.rules.block.list.exec(src);
	        if (cap) {
	            let bull = cap[1].trim();
	            const isordered = bull.length > 1;
	            const list = {
	                type: 'list',
	                raw: '',
	                ordered: isordered,
	                start: isordered ? +bull.slice(0, -1) : '',
	                loose: false,
	                items: []
	            };
	            bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
	            if (this.options.pedantic) {
	                bull = isordered ? bull : '[*+-]';
	            }
	            // Get next list item
	            const itemRegex = new RegExp(`^( {0,3}${bull})((?:[\t ][^\\n]*)?(?:\\n|$))`);
	            let raw = '';
	            let itemContents = '';
	            let endsWithBlankLine = false;
	            // Check if current bullet point can start a new List Item
	            while (src) {
	                let endEarly = false;
	                if (!(cap = itemRegex.exec(src))) {
	                    break;
	                }
	                if (this.rules.block.hr.test(src)) { // End list if bullet was actually HR (possibly move into itemRegex?)
	                    break;
	                }
	                raw = cap[0];
	                src = src.substring(raw.length);
	                let line = cap[2].split('\n', 1)[0].replace(/^\t+/, (t) => ' '.repeat(3 * t.length));
	                let nextLine = src.split('\n', 1)[0];
	                let indent = 0;
	                if (this.options.pedantic) {
	                    indent = 2;
	                    itemContents = line.trimStart();
	                }
	                else {
	                    indent = cap[2].search(/[^ ]/); // Find first non-space char
	                    indent = indent > 4 ? 1 : indent; // Treat indented code blocks (> 4 spaces) as having only 1 indent
	                    itemContents = line.slice(indent);
	                    indent += cap[1].length;
	                }
	                let blankLine = false;
	                if (!line && /^ *$/.test(nextLine)) { // Items begin with at most one blank line
	                    raw += nextLine + '\n';
	                    src = src.substring(nextLine.length + 1);
	                    endEarly = true;
	                }
	                if (!endEarly) {
	                    const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ \t][^\\n]*)?(?:\\n|$))`);
	                    const hrRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`);
	                    const fencesBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`);
	                    const headingBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`);
	                    // Check if following lines should be included in List Item
	                    while (src) {
	                        const rawLine = src.split('\n', 1)[0];
	                        nextLine = rawLine;
	                        // Re-align to follow commonmark nesting rules
	                        if (this.options.pedantic) {
	                            nextLine = nextLine.replace(/^ {1,4}(?=( {4})*[^ ])/g, '  ');
	                        }
	                        // End list item if found code fences
	                        if (fencesBeginRegex.test(nextLine)) {
	                            break;
	                        }
	                        // End list item if found start of new heading
	                        if (headingBeginRegex.test(nextLine)) {
	                            break;
	                        }
	                        // End list item if found start of new bullet
	                        if (nextBulletRegex.test(nextLine)) {
	                            break;
	                        }
	                        // Horizontal rule found
	                        if (hrRegex.test(src)) {
	                            break;
	                        }
	                        if (nextLine.search(/[^ ]/) >= indent || !nextLine.trim()) { // Dedent if possible
	                            itemContents += '\n' + nextLine.slice(indent);
	                        }
	                        else {
	                            // not enough indentation
	                            if (blankLine) {
	                                break;
	                            }
	                            // paragraph continuation unless last line was a different block level element
	                            if (line.search(/[^ ]/) >= 4) { // indented code block
	                                break;
	                            }
	                            if (fencesBeginRegex.test(line)) {
	                                break;
	                            }
	                            if (headingBeginRegex.test(line)) {
	                                break;
	                            }
	                            if (hrRegex.test(line)) {
	                                break;
	                            }
	                            itemContents += '\n' + nextLine;
	                        }
	                        if (!blankLine && !nextLine.trim()) { // Check if current line is blank
	                            blankLine = true;
	                        }
	                        raw += rawLine + '\n';
	                        src = src.substring(rawLine.length + 1);
	                        line = nextLine.slice(indent);
	                    }
	                }
	                if (!list.loose) {
	                    // If the previous item ended with a blank line, the list is loose
	                    if (endsWithBlankLine) {
	                        list.loose = true;
	                    }
	                    else if (/\n *\n *$/.test(raw)) {
	                        endsWithBlankLine = true;
	                    }
	                }
	                let istask = null;
	                let ischecked;
	                // Check for task list items
	                if (this.options.gfm) {
	                    istask = /^\[[ xX]\] /.exec(itemContents);
	                    if (istask) {
	                        ischecked = istask[0] !== '[ ] ';
	                        itemContents = itemContents.replace(/^\[[ xX]\] +/, '');
	                    }
	                }
	                list.items.push({
	                    type: 'list_item',
	                    raw,
	                    task: !!istask,
	                    checked: ischecked,
	                    loose: false,
	                    text: itemContents,
	                    tokens: []
	                });
	                list.raw += raw;
	            }
	            // Do not consume newlines at end of final item. Alternatively, make itemRegex *start* with any newlines to simplify/speed up endsWithBlankLine logic
	            list.items[list.items.length - 1].raw = raw.trimEnd();
	            (list.items[list.items.length - 1]).text = itemContents.trimEnd();
	            list.raw = list.raw.trimEnd();
	            // Item child tokens handled here at end because we needed to have the final item to trim it first
	            for (let i = 0; i < list.items.length; i++) {
	                this.lexer.state.top = false;
	                list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
	                if (!list.loose) {
	                    // Check if list should be loose
	                    const spacers = list.items[i].tokens.filter(t => t.type === 'space');
	                    const hasMultipleLineBreaks = spacers.length > 0 && spacers.some(t => /\n.*\n/.test(t.raw));
	                    list.loose = hasMultipleLineBreaks;
	                }
	            }
	            // Set all items to loose if list is loose
	            if (list.loose) {
	                for (let i = 0; i < list.items.length; i++) {
	                    list.items[i].loose = true;
	                }
	            }
	            return list;
	        }
	    }
	    html(src) {
	        const cap = this.rules.block.html.exec(src);
	        if (cap) {
	            const token = {
	                type: 'html',
	                block: true,
	                raw: cap[0],
	                pre: cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style',
	                text: cap[0]
	            };
	            return token;
	        }
	    }
	    def(src) {
	        const cap = this.rules.block.def.exec(src);
	        if (cap) {
	            const tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
	            const href = cap[2] ? cap[2].replace(/^<(.*)>$/, '$1').replace(this.rules.inline.anyPunctuation, '$1') : '';
	            const title = cap[3] ? cap[3].substring(1, cap[3].length - 1).replace(this.rules.inline.anyPunctuation, '$1') : cap[3];
	            return {
	                type: 'def',
	                tag,
	                raw: cap[0],
	                href,
	                title
	            };
	        }
	    }
	    table(src) {
	        const cap = this.rules.block.table.exec(src);
	        if (!cap) {
	            return;
	        }
	        if (!/[:|]/.test(cap[2])) {
	            // delimiter row must have a pipe (|) or colon (:) otherwise it is a setext heading
	            return;
	        }
	        const headers = splitCells(cap[1]);
	        const aligns = cap[2].replace(/^\||\| *$/g, '').split('|');
	        const rows = cap[3] && cap[3].trim() ? cap[3].replace(/\n[ \t]*$/, '').split('\n') : [];
	        const item = {
	            type: 'table',
	            raw: cap[0],
	            header: [],
	            align: [],
	            rows: []
	        };
	        if (headers.length !== aligns.length) {
	            // header and align columns must be equal, rows can be different.
	            return;
	        }
	        for (const align of aligns) {
	            if (/^ *-+: *$/.test(align)) {
	                item.align.push('right');
	            }
	            else if (/^ *:-+: *$/.test(align)) {
	                item.align.push('center');
	            }
	            else if (/^ *:-+ *$/.test(align)) {
	                item.align.push('left');
	            }
	            else {
	                item.align.push(null);
	            }
	        }
	        for (const header of headers) {
	            item.header.push({
	                text: header,
	                tokens: this.lexer.inline(header)
	            });
	        }
	        for (const row of rows) {
	            item.rows.push(splitCells(row, item.header.length).map(cell => {
	                return {
	                    text: cell,
	                    tokens: this.lexer.inline(cell)
	                };
	            }));
	        }
	        return item;
	    }
	    lheading(src) {
	        const cap = this.rules.block.lheading.exec(src);
	        if (cap) {
	            return {
	                type: 'heading',
	                raw: cap[0],
	                depth: cap[2].charAt(0) === '=' ? 1 : 2,
	                text: cap[1],
	                tokens: this.lexer.inline(cap[1])
	            };
	        }
	    }
	    paragraph(src) {
	        const cap = this.rules.block.paragraph.exec(src);
	        if (cap) {
	            const text = cap[1].charAt(cap[1].length - 1) === '\n'
	                ? cap[1].slice(0, -1)
	                : cap[1];
	            return {
	                type: 'paragraph',
	                raw: cap[0],
	                text,
	                tokens: this.lexer.inline(text)
	            };
	        }
	    }
	    text(src) {
	        const cap = this.rules.block.text.exec(src);
	        if (cap) {
	            return {
	                type: 'text',
	                raw: cap[0],
	                text: cap[0],
	                tokens: this.lexer.inline(cap[0])
	            };
	        }
	    }
	    escape(src) {
	        const cap = this.rules.inline.escape.exec(src);
	        if (cap) {
	            return {
	                type: 'escape',
	                raw: cap[0],
	                text: escape$1(cap[1])
	            };
	        }
	    }
	    tag(src) {
	        const cap = this.rules.inline.tag.exec(src);
	        if (cap) {
	            if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
	                this.lexer.state.inLink = true;
	            }
	            else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
	                this.lexer.state.inLink = false;
	            }
	            if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
	                this.lexer.state.inRawBlock = true;
	            }
	            else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
	                this.lexer.state.inRawBlock = false;
	            }
	            return {
	                type: 'html',
	                raw: cap[0],
	                inLink: this.lexer.state.inLink,
	                inRawBlock: this.lexer.state.inRawBlock,
	                block: false,
	                text: cap[0]
	            };
	        }
	    }
	    link(src) {
	        const cap = this.rules.inline.link.exec(src);
	        if (cap) {
	            const trimmedUrl = cap[2].trim();
	            if (!this.options.pedantic && /^</.test(trimmedUrl)) {
	                // commonmark requires matching angle brackets
	                if (!(/>$/.test(trimmedUrl))) {
	                    return;
	                }
	                // ending angle bracket cannot be escaped
	                const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), '\\');
	                if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
	                    return;
	                }
	            }
	            else {
	                // find closing parenthesis
	                const lastParenIndex = findClosingBracket(cap[2], '()');
	                if (lastParenIndex > -1) {
	                    const start = cap[0].indexOf('!') === 0 ? 5 : 4;
	                    const linkLen = start + cap[1].length + lastParenIndex;
	                    cap[2] = cap[2].substring(0, lastParenIndex);
	                    cap[0] = cap[0].substring(0, linkLen).trim();
	                    cap[3] = '';
	                }
	            }
	            let href = cap[2];
	            let title = '';
	            if (this.options.pedantic) {
	                // split pedantic href and title
	                const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);
	                if (link) {
	                    href = link[1];
	                    title = link[3];
	                }
	            }
	            else {
	                title = cap[3] ? cap[3].slice(1, -1) : '';
	            }
	            href = href.trim();
	            if (/^</.test(href)) {
	                if (this.options.pedantic && !(/>$/.test(trimmedUrl))) {
	                    // pedantic allows starting angle bracket without ending angle bracket
	                    href = href.slice(1);
	                }
	                else {
	                    href = href.slice(1, -1);
	                }
	            }
	            return outputLink(cap, {
	                href: href ? href.replace(this.rules.inline.anyPunctuation, '$1') : href,
	                title: title ? title.replace(this.rules.inline.anyPunctuation, '$1') : title
	            }, cap[0], this.lexer);
	        }
	    }
	    reflink(src, links) {
	        let cap;
	        if ((cap = this.rules.inline.reflink.exec(src))
	            || (cap = this.rules.inline.nolink.exec(src))) {
	            const linkString = (cap[2] || cap[1]).replace(/\s+/g, ' ');
	            const link = links[linkString.toLowerCase()];
	            if (!link) {
	                const text = cap[0].charAt(0);
	                return {
	                    type: 'text',
	                    raw: text,
	                    text
	                };
	            }
	            return outputLink(cap, link, cap[0], this.lexer);
	        }
	    }
	    emStrong(src, maskedSrc, prevChar = '') {
	        let match = this.rules.inline.emStrongLDelim.exec(src);
	        if (!match)
	            return;
	        // _ can't be between two alphanumerics. \p{L}\p{N} includes non-english alphabet/numbers as well
	        if (match[3] && prevChar.match(/[\p{L}\p{N}]/u))
	            return;
	        const nextChar = match[1] || match[2] || '';
	        if (!nextChar || !prevChar || this.rules.inline.punctuation.exec(prevChar)) {
	            // unicode Regex counts emoji as 1 char; spread into array for proper count (used multiple times below)
	            const lLength = [...match[0]].length - 1;
	            let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
	            const endReg = match[0][0] === '*' ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
	            endReg.lastIndex = 0;
	            // Clip maskedSrc to same section of string as src (move to lexer?)
	            maskedSrc = maskedSrc.slice(-1 * src.length + lLength);
	            while ((match = endReg.exec(maskedSrc)) != null) {
	                rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
	                if (!rDelim)
	                    continue; // skip single * in __abc*abc__
	                rLength = [...rDelim].length;
	                if (match[3] || match[4]) { // found another Left Delim
	                    delimTotal += rLength;
	                    continue;
	                }
	                else if (match[5] || match[6]) { // either Left or Right Delim
	                    if (lLength % 3 && !((lLength + rLength) % 3)) {
	                        midDelimTotal += rLength;
	                        continue; // CommonMark Emphasis Rules 9-10
	                    }
	                }
	                delimTotal -= rLength;
	                if (delimTotal > 0)
	                    continue; // Haven't found enough closing delimiters
	                // Remove extra characters. *a*** -> *a*
	                rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
	                // char length can be >1 for unicode characters;
	                const lastCharLength = [...match[0]][0].length;
	                const raw = src.slice(0, lLength + match.index + lastCharLength + rLength);
	                // Create `em` if smallest delimiter has odd char count. *a***
	                if (Math.min(lLength, rLength) % 2) {
	                    const text = raw.slice(1, -1);
	                    return {
	                        type: 'em',
	                        raw,
	                        text,
	                        tokens: this.lexer.inlineTokens(text)
	                    };
	                }
	                // Create 'strong' if smallest delimiter has even char count. **a***
	                const text = raw.slice(2, -2);
	                return {
	                    type: 'strong',
	                    raw,
	                    text,
	                    tokens: this.lexer.inlineTokens(text)
	                };
	            }
	        }
	    }
	    codespan(src) {
	        const cap = this.rules.inline.code.exec(src);
	        if (cap) {
	            let text = cap[2].replace(/\n/g, ' ');
	            const hasNonSpaceChars = /[^ ]/.test(text);
	            const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
	            if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
	                text = text.substring(1, text.length - 1);
	            }
	            text = escape$1(text, true);
	            return {
	                type: 'codespan',
	                raw: cap[0],
	                text
	            };
	        }
	    }
	    br(src) {
	        const cap = this.rules.inline.br.exec(src);
	        if (cap) {
	            return {
	                type: 'br',
	                raw: cap[0]
	            };
	        }
	    }
	    del(src) {
	        const cap = this.rules.inline.del.exec(src);
	        if (cap) {
	            return {
	                type: 'del',
	                raw: cap[0],
	                text: cap[2],
	                tokens: this.lexer.inlineTokens(cap[2])
	            };
	        }
	    }
	    autolink(src) {
	        const cap = this.rules.inline.autolink.exec(src);
	        if (cap) {
	            let text, href;
	            if (cap[2] === '@') {
	                text = escape$1(cap[1]);
	                href = 'mailto:' + text;
	            }
	            else {
	                text = escape$1(cap[1]);
	                href = text;
	            }
	            return {
	                type: 'link',
	                raw: cap[0],
	                text,
	                href,
	                tokens: [
	                    {
	                        type: 'text',
	                        raw: text,
	                        text
	                    }
	                ]
	            };
	        }
	    }
	    url(src) {
	        let cap;
	        if (cap = this.rules.inline.url.exec(src)) {
	            let text, href;
	            if (cap[2] === '@') {
	                text = escape$1(cap[0]);
	                href = 'mailto:' + text;
	            }
	            else {
	                // do extended autolink path validation
	                let prevCapZero;
	                do {
	                    prevCapZero = cap[0];
	                    cap[0] = this.rules.inline._backpedal.exec(cap[0])?.[0] ?? '';
	                } while (prevCapZero !== cap[0]);
	                text = escape$1(cap[0]);
	                if (cap[1] === 'www.') {
	                    href = 'http://' + cap[0];
	                }
	                else {
	                    href = cap[0];
	                }
	            }
	            return {
	                type: 'link',
	                raw: cap[0],
	                text,
	                href,
	                tokens: [
	                    {
	                        type: 'text',
	                        raw: text,
	                        text
	                    }
	                ]
	            };
	        }
	    }
	    inlineText(src) {
	        const cap = this.rules.inline.text.exec(src);
	        if (cap) {
	            let text;
	            if (this.lexer.state.inRawBlock) {
	                text = cap[0];
	            }
	            else {
	                text = escape$1(cap[0]);
	            }
	            return {
	                type: 'text',
	                raw: cap[0],
	                text
	            };
	        }
	    }
	}

	/**
	 * Block-Level Grammar
	 */
	const newline = /^(?: *(?:\n|$))+/;
	const blockCode = /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/;
	const fences = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
	const hr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
	const heading = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
	const bullet = /(?:[*+-]|\d{1,9}[.)])/;
	const lheading = edit(/^(?!bull )((?:.|\n(?!\s*?\n|bull ))+?)\n {0,3}(=+|-+) *(?:\n+|$)/)
	    .replace(/bull/g, bullet) // lists can interrupt
	    .getRegex();
	const _paragraph = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/;
	const blockText = /^[^\n]+/;
	const _blockLabel = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
	const def = edit(/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/)
	    .replace('label', _blockLabel)
	    .replace('title', /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/)
	    .getRegex();
	const list = edit(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/)
	    .replace(/bull/g, bullet)
	    .getRegex();
	const _tag = 'address|article|aside|base|basefont|blockquote|body|caption'
	    + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
	    + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
	    + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
	    + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr'
	    + '|track|ul';
	const _comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
	const html = edit('^ {0,3}(?:' // optional indentation
	    + '<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
	    + '|comment[^\\n]*(\\n+|$)' // (2)
	    + '|<\\?[\\s\\S]*?(?:\\?>\\n*|$)' // (3)
	    + '|<![A-Z][\\s\\S]*?(?:>\\n*|$)' // (4)
	    + '|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)' // (5)
	    + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (6)
	    + '|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) open tag
	    + '|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) closing tag
	    + ')', 'i')
	    .replace('comment', _comment)
	    .replace('tag', _tag)
	    .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
	    .getRegex();
	const paragraph = edit(_paragraph)
	    .replace('hr', hr)
	    .replace('heading', ' {0,3}#{1,6}(?:\\s|$)')
	    .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
	    .replace('|table', '')
	    .replace('blockquote', ' {0,3}>')
	    .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
	    .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
	    .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
	    .replace('tag', _tag) // pars can be interrupted by type (6) html blocks
	    .getRegex();
	const blockquote = edit(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/)
	    .replace('paragraph', paragraph)
	    .getRegex();
	/**
	 * Normal Block Grammar
	 */
	const blockNormal = {
	    blockquote,
	    code: blockCode,
	    def,
	    fences,
	    heading,
	    hr,
	    html,
	    lheading,
	    list,
	    newline,
	    paragraph,
	    table: noopTest,
	    text: blockText
	};
	/**
	 * GFM Block Grammar
	 */
	const gfmTable = edit('^ *([^\\n ].*)\\n' // Header
	    + ' {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)' // Align
	    + '(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)') // Cells
	    .replace('hr', hr)
	    .replace('heading', ' {0,3}#{1,6}(?:\\s|$)')
	    .replace('blockquote', ' {0,3}>')
	    .replace('code', ' {4}[^\\n]')
	    .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
	    .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
	    .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
	    .replace('tag', _tag) // tables can be interrupted by type (6) html blocks
	    .getRegex();
	const blockGfm = {
	    ...blockNormal,
	    table: gfmTable,
	    paragraph: edit(_paragraph)
	        .replace('hr', hr)
	        .replace('heading', ' {0,3}#{1,6}(?:\\s|$)')
	        .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
	        .replace('table', gfmTable) // interrupt paragraphs with table
	        .replace('blockquote', ' {0,3}>')
	        .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
	        .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
	        .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
	        .replace('tag', _tag) // pars can be interrupted by type (6) html blocks
	        .getRegex()
	};
	/**
	 * Pedantic grammar (original John Gruber's loose markdown specification)
	 */
	const blockPedantic = {
	    ...blockNormal,
	    html: edit('^ *(?:comment *(?:\\n|\\s*$)'
	        + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
	        + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
	        .replace('comment', _comment)
	        .replace(/tag/g, '(?!(?:'
	        + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
	        + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
	        + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
	        .getRegex(),
	    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
	    heading: /^(#{1,6})(.*)(?:\n+|$)/,
	    fences: noopTest, // fences not supported
	    lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
	    paragraph: edit(_paragraph)
	        .replace('hr', hr)
	        .replace('heading', ' *#{1,6} *[^\n]')
	        .replace('lheading', lheading)
	        .replace('|table', '')
	        .replace('blockquote', ' {0,3}>')
	        .replace('|fences', '')
	        .replace('|list', '')
	        .replace('|html', '')
	        .replace('|tag', '')
	        .getRegex()
	};
	/**
	 * Inline-Level Grammar
	 */
	const escape = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
	const inlineCode = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
	const br = /^( {2,}|\\)\n(?!\s*$)/;
	const inlineText = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
	// list of unicode punctuation marks, plus any missing characters from CommonMark spec
	const _punctuation = '\\p{P}$+<=>`^|~';
	const punctuation = edit(/^((?![*_])[\spunctuation])/, 'u')
	    .replace(/punctuation/g, _punctuation).getRegex();
	// sequences em should skip over [title](link), `code`, <html>
	const blockSkip = /\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g;
	const emStrongLDelim = edit(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/, 'u')
	    .replace(/punct/g, _punctuation)
	    .getRegex();
	const emStrongRDelimAst = edit('^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)' // Skip orphan inside strong
	    + '|[^*]+(?=[^*])' // Consume to delim
	    + '|(?!\\*)[punct](\\*+)(?=[\\s]|$)' // (1) #*** can only be a Right Delimiter
	    + '|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)' // (2) a***#, a*** can only be a Right Delimiter
	    + '|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])' // (3) #***a, ***a can only be Left Delimiter
	    + '|[\\s](\\*+)(?!\\*)(?=[punct])' // (4) ***# can only be Left Delimiter
	    + '|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])' // (5) #***# can be either Left or Right Delimiter
	    + '|[^punct\\s](\\*+)(?=[^punct\\s])', 'gu') // (6) a***a can be either Left or Right Delimiter
	    .replace(/punct/g, _punctuation)
	    .getRegex();
	// (6) Not allowed for _
	const emStrongRDelimUnd = edit('^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)' // Skip orphan inside strong
	    + '|[^_]+(?=[^_])' // Consume to delim
	    + '|(?!_)[punct](_+)(?=[\\s]|$)' // (1) #___ can only be a Right Delimiter
	    + '|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)' // (2) a___#, a___ can only be a Right Delimiter
	    + '|(?!_)[punct\\s](_+)(?=[^punct\\s])' // (3) #___a, ___a can only be Left Delimiter
	    + '|[\\s](_+)(?!_)(?=[punct])' // (4) ___# can only be Left Delimiter
	    + '|(?!_)[punct](_+)(?!_)(?=[punct])', 'gu') // (5) #___# can be either Left or Right Delimiter
	    .replace(/punct/g, _punctuation)
	    .getRegex();
	const anyPunctuation = edit(/\\([punct])/, 'gu')
	    .replace(/punct/g, _punctuation)
	    .getRegex();
	const autolink = edit(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/)
	    .replace('scheme', /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/)
	    .replace('email', /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/)
	    .getRegex();
	const _inlineComment = edit(_comment).replace('(?:-->|$)', '-->').getRegex();
	const tag = edit('^comment'
	    + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
	    + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
	    + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
	    + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
	    + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>') // CDATA section
	    .replace('comment', _inlineComment)
	    .replace('attribute', /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/)
	    .getRegex();
	const _inlineLabel = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
	const link = edit(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/)
	    .replace('label', _inlineLabel)
	    .replace('href', /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/)
	    .replace('title', /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/)
	    .getRegex();
	const reflink = edit(/^!?\[(label)\]\[(ref)\]/)
	    .replace('label', _inlineLabel)
	    .replace('ref', _blockLabel)
	    .getRegex();
	const nolink = edit(/^!?\[(ref)\](?:\[\])?/)
	    .replace('ref', _blockLabel)
	    .getRegex();
	const reflinkSearch = edit('reflink|nolink(?!\\()', 'g')
	    .replace('reflink', reflink)
	    .replace('nolink', nolink)
	    .getRegex();
	/**
	 * Normal Inline Grammar
	 */
	const inlineNormal = {
	    _backpedal: noopTest, // only used for GFM url
	    anyPunctuation,
	    autolink,
	    blockSkip,
	    br,
	    code: inlineCode,
	    del: noopTest,
	    emStrongLDelim,
	    emStrongRDelimAst,
	    emStrongRDelimUnd,
	    escape,
	    link,
	    nolink,
	    punctuation,
	    reflink,
	    reflinkSearch,
	    tag,
	    text: inlineText,
	    url: noopTest
	};
	/**
	 * Pedantic Inline Grammar
	 */
	const inlinePedantic = {
	    ...inlineNormal,
	    link: edit(/^!?\[(label)\]\((.*?)\)/)
	        .replace('label', _inlineLabel)
	        .getRegex(),
	    reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/)
	        .replace('label', _inlineLabel)
	        .getRegex()
	};
	/**
	 * GFM Inline Grammar
	 */
	const inlineGfm = {
	    ...inlineNormal,
	    escape: edit(escape).replace('])', '~|])').getRegex(),
	    url: edit(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, 'i')
	        .replace('email', /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/)
	        .getRegex(),
	    _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
	    del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
	    text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
	};
	/**
	 * GFM + Line Breaks Inline Grammar
	 */
	const inlineBreaks = {
	    ...inlineGfm,
	    br: edit(br).replace('{2,}', '*').getRegex(),
	    text: edit(inlineGfm.text)
	        .replace('\\b_', '\\b_| {2,}\\n')
	        .replace(/\{2,\}/g, '*')
	        .getRegex()
	};
	/**
	 * exports
	 */
	const block = {
	    normal: blockNormal,
	    gfm: blockGfm,
	    pedantic: blockPedantic
	};
	const inline = {
	    normal: inlineNormal,
	    gfm: inlineGfm,
	    breaks: inlineBreaks,
	    pedantic: inlinePedantic
	};

	/**
	 * Block Lexer
	 */
	class _Lexer {
	    tokens;
	    options;
	    state;
	    tokenizer;
	    inlineQueue;
	    constructor(options) {
	        // TokenList cannot be created in one go
	        this.tokens = [];
	        this.tokens.links = Object.create(null);
	        this.options = options || _defaults;
	        this.options.tokenizer = this.options.tokenizer || new _Tokenizer();
	        this.tokenizer = this.options.tokenizer;
	        this.tokenizer.options = this.options;
	        this.tokenizer.lexer = this;
	        this.inlineQueue = [];
	        this.state = {
	            inLink: false,
	            inRawBlock: false,
	            top: true
	        };
	        const rules = {
	            block: block.normal,
	            inline: inline.normal
	        };
	        if (this.options.pedantic) {
	            rules.block = block.pedantic;
	            rules.inline = inline.pedantic;
	        }
	        else if (this.options.gfm) {
	            rules.block = block.gfm;
	            if (this.options.breaks) {
	                rules.inline = inline.breaks;
	            }
	            else {
	                rules.inline = inline.gfm;
	            }
	        }
	        this.tokenizer.rules = rules;
	    }
	    /**
	     * Expose Rules
	     */
	    static get rules() {
	        return {
	            block,
	            inline
	        };
	    }
	    /**
	     * Static Lex Method
	     */
	    static lex(src, options) {
	        const lexer = new _Lexer(options);
	        return lexer.lex(src);
	    }
	    /**
	     * Static Lex Inline Method
	     */
	    static lexInline(src, options) {
	        const lexer = new _Lexer(options);
	        return lexer.inlineTokens(src);
	    }
	    /**
	     * Preprocessing
	     */
	    lex(src) {
	        src = src
	            .replace(/\r\n|\r/g, '\n');
	        this.blockTokens(src, this.tokens);
	        for (let i = 0; i < this.inlineQueue.length; i++) {
	            const next = this.inlineQueue[i];
	            this.inlineTokens(next.src, next.tokens);
	        }
	        this.inlineQueue = [];
	        return this.tokens;
	    }
	    blockTokens(src, tokens = []) {
	        if (this.options.pedantic) {
	            src = src.replace(/\t/g, '    ').replace(/^ +$/gm, '');
	        }
	        else {
	            src = src.replace(/^( *)(\t+)/gm, (_, leading, tabs) => {
	                return leading + '    '.repeat(tabs.length);
	            });
	        }
	        let token;
	        let lastToken;
	        let cutSrc;
	        let lastParagraphClipped;
	        while (src) {
	            if (this.options.extensions
	                && this.options.extensions.block
	                && this.options.extensions.block.some((extTokenizer) => {
	                    if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
	                        src = src.substring(token.raw.length);
	                        tokens.push(token);
	                        return true;
	                    }
	                    return false;
	                })) {
	                continue;
	            }
	            // newline
	            if (token = this.tokenizer.space(src)) {
	                src = src.substring(token.raw.length);
	                if (token.raw.length === 1 && tokens.length > 0) {
	                    // if there's a single \n as a spacer, it's terminating the last line,
	                    // so move it there so that we don't get unnecessary paragraph tags
	                    tokens[tokens.length - 1].raw += '\n';
	                }
	                else {
	                    tokens.push(token);
	                }
	                continue;
	            }
	            // code
	            if (token = this.tokenizer.code(src)) {
	                src = src.substring(token.raw.length);
	                lastToken = tokens[tokens.length - 1];
	                // An indented code block cannot interrupt a paragraph.
	                if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
	                    lastToken.raw += '\n' + token.raw;
	                    lastToken.text += '\n' + token.text;
	                    this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
	                }
	                else {
	                    tokens.push(token);
	                }
	                continue;
	            }
	            // fences
	            if (token = this.tokenizer.fences(src)) {
	                src = src.substring(token.raw.length);
	                tokens.push(token);
	                continue;
	            }
	            // heading
	            if (token = this.tokenizer.heading(src)) {
	                src = src.substring(token.raw.length);
	                tokens.push(token);
	                continue;
	            }
	            // hr
	            if (token = this.tokenizer.hr(src)) {
	                src = src.substring(token.raw.length);
	                tokens.push(token);
	                continue;
	            }
	            // blockquote
	            if (token = this.tokenizer.blockquote(src)) {
	                src = src.substring(token.raw.length);
	                tokens.push(token);
	                continue;
	            }
	            // list
	            if (token = this.tokenizer.list(src)) {
	                src = src.substring(token.raw.length);
	                tokens.push(token);
	                continue;
	            }
	            // html
	            if (token = this.tokenizer.html(src)) {
	                src = src.substring(token.raw.length);
	                tokens.push(token);
	                continue;
	            }
	            // def
	            if (token = this.tokenizer.def(src)) {
	                src = src.substring(token.raw.length);
	                lastToken = tokens[tokens.length - 1];
	                if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
	                    lastToken.raw += '\n' + token.raw;
	                    lastToken.text += '\n' + token.raw;
	                    this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
	                }
	                else if (!this.tokens.links[token.tag]) {
	                    this.tokens.links[token.tag] = {
	                        href: token.href,
	                        title: token.title
	                    };
	                }
	                continue;
	            }
	            // table (gfm)
	            if (token = this.tokenizer.table(src)) {
	                src = src.substring(token.raw.length);
	                tokens.push(token);
	                continue;
	            }
	            // lheading
	            if (token = this.tokenizer.lheading(src)) {
	                src = src.substring(token.raw.length);
	                tokens.push(token);
	                continue;
	            }
	            // top-level paragraph
	            // prevent paragraph consuming extensions by clipping 'src' to extension start
	            cutSrc = src;
	            if (this.options.extensions && this.options.extensions.startBlock) {
	                let startIndex = Infinity;
	                const tempSrc = src.slice(1);
	                let tempStart;
	                this.options.extensions.startBlock.forEach((getStartIndex) => {
	                    tempStart = getStartIndex.call({ lexer: this }, tempSrc);
	                    if (typeof tempStart === 'number' && tempStart >= 0) {
	                        startIndex = Math.min(startIndex, tempStart);
	                    }
	                });
	                if (startIndex < Infinity && startIndex >= 0) {
	                    cutSrc = src.substring(0, startIndex + 1);
	                }
	            }
	            if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
	                lastToken = tokens[tokens.length - 1];
	                if (lastParagraphClipped && lastToken.type === 'paragraph') {
	                    lastToken.raw += '\n' + token.raw;
	                    lastToken.text += '\n' + token.text;
	                    this.inlineQueue.pop();
	                    this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
	                }
	                else {
	                    tokens.push(token);
	                }
	                lastParagraphClipped = (cutSrc.length !== src.length);
	                src = src.substring(token.raw.length);
	                continue;
	            }
	            // text
	            if (token = this.tokenizer.text(src)) {
	                src = src.substring(token.raw.length);
	                lastToken = tokens[tokens.length - 1];
	                if (lastToken && lastToken.type === 'text') {
	                    lastToken.raw += '\n' + token.raw;
	                    lastToken.text += '\n' + token.text;
	                    this.inlineQueue.pop();
	                    this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
	                }
	                else {
	                    tokens.push(token);
	                }
	                continue;
	            }
	            if (src) {
	                const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
	                if (this.options.silent) {
	                    console.error(errMsg);
	                    break;
	                }
	                else {
	                    throw new Error(errMsg);
	                }
	            }
	        }
	        this.state.top = true;
	        return tokens;
	    }
	    inline(src, tokens = []) {
	        this.inlineQueue.push({ src, tokens });
	        return tokens;
	    }
	    /**
	     * Lexing/Compiling
	     */
	    inlineTokens(src, tokens = []) {
	        let token, lastToken, cutSrc;
	        // String with links masked to avoid interference with em and strong
	        let maskedSrc = src;
	        let match;
	        let keepPrevChar, prevChar;
	        // Mask out reflinks
	        if (this.tokens.links) {
	            const links = Object.keys(this.tokens.links);
	            if (links.length > 0) {
	                while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
	                    if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
	                        maskedSrc = maskedSrc.slice(0, match.index) + '[' + 'a'.repeat(match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
	                    }
	                }
	            }
	        }
	        // Mask out other blocks
	        while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
	            maskedSrc = maskedSrc.slice(0, match.index) + '[' + 'a'.repeat(match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
	        }
	        // Mask out escaped characters
	        while ((match = this.tokenizer.rules.inline.anyPunctuation.exec(maskedSrc)) != null) {
	            maskedSrc = maskedSrc.slice(0, match.index) + '++' + maskedSrc.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
	        }
	        while (src) {
	            if (!keepPrevChar) {
	                prevChar = '';
	            }
	            keepPrevChar = false;
	            // extensions
	            if (this.options.extensions
	                && this.options.extensions.inline
	                && this.options.extensions.inline.some((extTokenizer) => {
	                    if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
	                        src = src.substring(token.raw.length);
	                        tokens.push(token);
	                        return true;
	                    }
	                    return false;
	                })) {
	                continue;
	            }
	            // escape
	            if (token = this.tokenizer.escape(src)) {
	                src = src.substring(token.raw.length);
	                tokens.push(token);
	                continue;
	            }
	            // tag
	            if (token = this.tokenizer.tag(src)) {
	                src = src.substring(token.raw.length);
	                lastToken = tokens[tokens.length - 1];
	                if (lastToken && token.type === 'text' && lastToken.type === 'text') {
	                    lastToken.raw += token.raw;
	                    lastToken.text += token.text;
	                }
	                else {
	                    tokens.push(token);
	                }
	                continue;
	            }
	            // link
	            if (token = this.tokenizer.link(src)) {
	                src = src.substring(token.raw.length);
	                tokens.push(token);
	                continue;
	            }
	            // reflink, nolink
	            if (token = this.tokenizer.reflink(src, this.tokens.links)) {
	                src = src.substring(token.raw.length);
	                lastToken = tokens[tokens.length - 1];
	                if (lastToken && token.type === 'text' && lastToken.type === 'text') {
	                    lastToken.raw += token.raw;
	                    lastToken.text += token.text;
	                }
	                else {
	                    tokens.push(token);
	                }
	                continue;
	            }
	            // em & strong
	            if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
	                src = src.substring(token.raw.length);
	                tokens.push(token);
	                continue;
	            }
	            // code
	            if (token = this.tokenizer.codespan(src)) {
	                src = src.substring(token.raw.length);
	                tokens.push(token);
	                continue;
	            }
	            // br
	            if (token = this.tokenizer.br(src)) {
	                src = src.substring(token.raw.length);
	                tokens.push(token);
	                continue;
	            }
	            // del (gfm)
	            if (token = this.tokenizer.del(src)) {
	                src = src.substring(token.raw.length);
	                tokens.push(token);
	                continue;
	            }
	            // autolink
	            if (token = this.tokenizer.autolink(src)) {
	                src = src.substring(token.raw.length);
	                tokens.push(token);
	                continue;
	            }
	            // url (gfm)
	            if (!this.state.inLink && (token = this.tokenizer.url(src))) {
	                src = src.substring(token.raw.length);
	                tokens.push(token);
	                continue;
	            }
	            // text
	            // prevent inlineText consuming extensions by clipping 'src' to extension start
	            cutSrc = src;
	            if (this.options.extensions && this.options.extensions.startInline) {
	                let startIndex = Infinity;
	                const tempSrc = src.slice(1);
	                let tempStart;
	                this.options.extensions.startInline.forEach((getStartIndex) => {
	                    tempStart = getStartIndex.call({ lexer: this }, tempSrc);
	                    if (typeof tempStart === 'number' && tempStart >= 0) {
	                        startIndex = Math.min(startIndex, tempStart);
	                    }
	                });
	                if (startIndex < Infinity && startIndex >= 0) {
	                    cutSrc = src.substring(0, startIndex + 1);
	                }
	            }
	            if (token = this.tokenizer.inlineText(cutSrc)) {
	                src = src.substring(token.raw.length);
	                if (token.raw.slice(-1) !== '_') { // Track prevChar before string of ____ started
	                    prevChar = token.raw.slice(-1);
	                }
	                keepPrevChar = true;
	                lastToken = tokens[tokens.length - 1];
	                if (lastToken && lastToken.type === 'text') {
	                    lastToken.raw += token.raw;
	                    lastToken.text += token.text;
	                }
	                else {
	                    tokens.push(token);
	                }
	                continue;
	            }
	            if (src) {
	                const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
	                if (this.options.silent) {
	                    console.error(errMsg);
	                    break;
	                }
	                else {
	                    throw new Error(errMsg);
	                }
	            }
	        }
	        return tokens;
	    }
	}

	/**
	 * Renderer
	 */
	class _Renderer {
	    options;
	    constructor(options) {
	        this.options = options || _defaults;
	    }
	    code(code, infostring, escaped) {
	        const lang = (infostring || '').match(/^\S*/)?.[0];
	        code = code.replace(/\n$/, '') + '\n';
	        if (!lang) {
	            return '<pre><code>'
	                + (escaped ? code : escape$1(code, true))
	                + '</code></pre>\n';
	        }
	        return '<pre><code class="language-'
	            + escape$1(lang)
	            + '">'
	            + (escaped ? code : escape$1(code, true))
	            + '</code></pre>\n';
	    }
	    blockquote(quote) {
	        return `<blockquote>\n${quote}</blockquote>\n`;
	    }
	    html(html, block) {
	        return html;
	    }
	    heading(text, level, raw) {
	        // ignore IDs
	        return `<h${level}>${text}</h${level}>\n`;
	    }
	    hr() {
	        return '<hr>\n';
	    }
	    list(body, ordered, start) {
	        const type = ordered ? 'ol' : 'ul';
	        const startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
	        return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
	    }
	    listitem(text, task, checked) {
	        return `<li>${text}</li>\n`;
	    }
	    checkbox(checked) {
	        return '<input '
	            + (checked ? 'checked="" ' : '')
	            + 'disabled="" type="checkbox">';
	    }
	    paragraph(text) {
	        return `<p>${text}</p>\n`;
	    }
	    table(header, body) {
	        if (body)
	            body = `<tbody>${body}</tbody>`;
	        return '<table>\n'
	            + '<thead>\n'
	            + header
	            + '</thead>\n'
	            + body
	            + '</table>\n';
	    }
	    tablerow(content) {
	        return `<tr>\n${content}</tr>\n`;
	    }
	    tablecell(content, flags) {
	        const type = flags.header ? 'th' : 'td';
	        const tag = flags.align
	            ? `<${type} align="${flags.align}">`
	            : `<${type}>`;
	        return tag + content + `</${type}>\n`;
	    }
	    /**
	     * span level renderer
	     */
	    strong(text) {
	        return `<strong>${text}</strong>`;
	    }
	    em(text) {
	        return `<em>${text}</em>`;
	    }
	    codespan(text) {
	        return `<code>${text}</code>`;
	    }
	    br() {
	        return '<br>';
	    }
	    del(text) {
	        return `<del>${text}</del>`;
	    }
	    link(href, title, text) {
	        const cleanHref = cleanUrl(href);
	        if (cleanHref === null) {
	            return text;
	        }
	        href = cleanHref;
	        let out = '<a href="' + href + '"';
	        if (title) {
	            out += ' title="' + title + '"';
	        }
	        out += '>' + text + '</a>';
	        return out;
	    }
	    image(href, title, text) {
	        const cleanHref = cleanUrl(href);
	        if (cleanHref === null) {
	            return text;
	        }
	        href = cleanHref;
	        let out = `<img src="${href}" alt="${text}"`;
	        if (title) {
	            out += ` title="${title}"`;
	        }
	        out += '>';
	        return out;
	    }
	    text(text) {
	        return text;
	    }
	}

	/**
	 * TextRenderer
	 * returns only the textual part of the token
	 */
	class _TextRenderer {
	    // no need for block level renderers
	    strong(text) {
	        return text;
	    }
	    em(text) {
	        return text;
	    }
	    codespan(text) {
	        return text;
	    }
	    del(text) {
	        return text;
	    }
	    html(text) {
	        return text;
	    }
	    text(text) {
	        return text;
	    }
	    link(href, title, text) {
	        return '' + text;
	    }
	    image(href, title, text) {
	        return '' + text;
	    }
	    br() {
	        return '';
	    }
	}

	/**
	 * Parsing & Compiling
	 */
	class _Parser {
	    options;
	    renderer;
	    textRenderer;
	    constructor(options) {
	        this.options = options || _defaults;
	        this.options.renderer = this.options.renderer || new _Renderer();
	        this.renderer = this.options.renderer;
	        this.renderer.options = this.options;
	        this.textRenderer = new _TextRenderer();
	    }
	    /**
	     * Static Parse Method
	     */
	    static parse(tokens, options) {
	        const parser = new _Parser(options);
	        return parser.parse(tokens);
	    }
	    /**
	     * Static Parse Inline Method
	     */
	    static parseInline(tokens, options) {
	        const parser = new _Parser(options);
	        return parser.parseInline(tokens);
	    }
	    /**
	     * Parse Loop
	     */
	    parse(tokens, top = true) {
	        let out = '';
	        for (let i = 0; i < tokens.length; i++) {
	            const token = tokens[i];
	            // Run any renderer extensions
	            if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
	                const genericToken = token;
	                const ret = this.options.extensions.renderers[genericToken.type].call({ parser: this }, genericToken);
	                if (ret !== false || !['space', 'hr', 'heading', 'code', 'table', 'blockquote', 'list', 'html', 'paragraph', 'text'].includes(genericToken.type)) {
	                    out += ret || '';
	                    continue;
	                }
	            }
	            switch (token.type) {
	                case 'space': {
	                    continue;
	                }
	                case 'hr': {
	                    out += this.renderer.hr();
	                    continue;
	                }
	                case 'heading': {
	                    const headingToken = token;
	                    out += this.renderer.heading(this.parseInline(headingToken.tokens), headingToken.depth, unescape(this.parseInline(headingToken.tokens, this.textRenderer)));
	                    continue;
	                }
	                case 'code': {
	                    const codeToken = token;
	                    out += this.renderer.code(codeToken.text, codeToken.lang, !!codeToken.escaped);
	                    continue;
	                }
	                case 'table': {
	                    const tableToken = token;
	                    let header = '';
	                    // header
	                    let cell = '';
	                    for (let j = 0; j < tableToken.header.length; j++) {
	                        cell += this.renderer.tablecell(this.parseInline(tableToken.header[j].tokens), { header: true, align: tableToken.align[j] });
	                    }
	                    header += this.renderer.tablerow(cell);
	                    let body = '';
	                    for (let j = 0; j < tableToken.rows.length; j++) {
	                        const row = tableToken.rows[j];
	                        cell = '';
	                        for (let k = 0; k < row.length; k++) {
	                            cell += this.renderer.tablecell(this.parseInline(row[k].tokens), { header: false, align: tableToken.align[k] });
	                        }
	                        body += this.renderer.tablerow(cell);
	                    }
	                    out += this.renderer.table(header, body);
	                    continue;
	                }
	                case 'blockquote': {
	                    const blockquoteToken = token;
	                    const body = this.parse(blockquoteToken.tokens);
	                    out += this.renderer.blockquote(body);
	                    continue;
	                }
	                case 'list': {
	                    const listToken = token;
	                    const ordered = listToken.ordered;
	                    const start = listToken.start;
	                    const loose = listToken.loose;
	                    let body = '';
	                    for (let j = 0; j < listToken.items.length; j++) {
	                        const item = listToken.items[j];
	                        const checked = item.checked;
	                        const task = item.task;
	                        let itemBody = '';
	                        if (item.task) {
	                            const checkbox = this.renderer.checkbox(!!checked);
	                            if (loose) {
	                                if (item.tokens.length > 0 && item.tokens[0].type === 'paragraph') {
	                                    item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;
	                                    if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
	                                        item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
	                                    }
	                                }
	                                else {
	                                    item.tokens.unshift({
	                                        type: 'text',
	                                        text: checkbox + ' '
	                                    });
	                                }
	                            }
	                            else {
	                                itemBody += checkbox + ' ';
	                            }
	                        }
	                        itemBody += this.parse(item.tokens, loose);
	                        body += this.renderer.listitem(itemBody, task, !!checked);
	                    }
	                    out += this.renderer.list(body, ordered, start);
	                    continue;
	                }
	                case 'html': {
	                    const htmlToken = token;
	                    out += this.renderer.html(htmlToken.text, htmlToken.block);
	                    continue;
	                }
	                case 'paragraph': {
	                    const paragraphToken = token;
	                    out += this.renderer.paragraph(this.parseInline(paragraphToken.tokens));
	                    continue;
	                }
	                case 'text': {
	                    let textToken = token;
	                    let body = textToken.tokens ? this.parseInline(textToken.tokens) : textToken.text;
	                    while (i + 1 < tokens.length && tokens[i + 1].type === 'text') {
	                        textToken = tokens[++i];
	                        body += '\n' + (textToken.tokens ? this.parseInline(textToken.tokens) : textToken.text);
	                    }
	                    out += top ? this.renderer.paragraph(body) : body;
	                    continue;
	                }
	                default: {
	                    const errMsg = 'Token with "' + token.type + '" type was not found.';
	                    if (this.options.silent) {
	                        console.error(errMsg);
	                        return '';
	                    }
	                    else {
	                        throw new Error(errMsg);
	                    }
	                }
	            }
	        }
	        return out;
	    }
	    /**
	     * Parse Inline Tokens
	     */
	    parseInline(tokens, renderer) {
	        renderer = renderer || this.renderer;
	        let out = '';
	        for (let i = 0; i < tokens.length; i++) {
	            const token = tokens[i];
	            // Run any renderer extensions
	            if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
	                const ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
	                if (ret !== false || !['escape', 'html', 'link', 'image', 'strong', 'em', 'codespan', 'br', 'del', 'text'].includes(token.type)) {
	                    out += ret || '';
	                    continue;
	                }
	            }
	            switch (token.type) {
	                case 'escape': {
	                    const escapeToken = token;
	                    out += renderer.text(escapeToken.text);
	                    break;
	                }
	                case 'html': {
	                    const tagToken = token;
	                    out += renderer.html(tagToken.text);
	                    break;
	                }
	                case 'link': {
	                    const linkToken = token;
	                    out += renderer.link(linkToken.href, linkToken.title, this.parseInline(linkToken.tokens, renderer));
	                    break;
	                }
	                case 'image': {
	                    const imageToken = token;
	                    out += renderer.image(imageToken.href, imageToken.title, imageToken.text);
	                    break;
	                }
	                case 'strong': {
	                    const strongToken = token;
	                    out += renderer.strong(this.parseInline(strongToken.tokens, renderer));
	                    break;
	                }
	                case 'em': {
	                    const emToken = token;
	                    out += renderer.em(this.parseInline(emToken.tokens, renderer));
	                    break;
	                }
	                case 'codespan': {
	                    const codespanToken = token;
	                    out += renderer.codespan(codespanToken.text);
	                    break;
	                }
	                case 'br': {
	                    out += renderer.br();
	                    break;
	                }
	                case 'del': {
	                    const delToken = token;
	                    out += renderer.del(this.parseInline(delToken.tokens, renderer));
	                    break;
	                }
	                case 'text': {
	                    const textToken = token;
	                    out += renderer.text(textToken.text);
	                    break;
	                }
	                default: {
	                    const errMsg = 'Token with "' + token.type + '" type was not found.';
	                    if (this.options.silent) {
	                        console.error(errMsg);
	                        return '';
	                    }
	                    else {
	                        throw new Error(errMsg);
	                    }
	                }
	            }
	        }
	        return out;
	    }
	}

	class _Hooks {
	    options;
	    constructor(options) {
	        this.options = options || _defaults;
	    }
	    static passThroughHooks = new Set([
	        'preprocess',
	        'postprocess',
	        'processAllTokens'
	    ]);
	    /**
	     * Process markdown before marked
	     */
	    preprocess(markdown) {
	        return markdown;
	    }
	    /**
	     * Process HTML after marked is finished
	     */
	    postprocess(html) {
	        return html;
	    }
	    /**
	     * Process all tokens before walk tokens
	     */
	    processAllTokens(tokens) {
	        return tokens;
	    }
	}

	class Marked {
	    defaults = _getDefaults();
	    options = this.setOptions;
	    parse = this.#parseMarkdown(_Lexer.lex, _Parser.parse);
	    parseInline = this.#parseMarkdown(_Lexer.lexInline, _Parser.parseInline);
	    Parser = _Parser;
	    Renderer = _Renderer;
	    TextRenderer = _TextRenderer;
	    Lexer = _Lexer;
	    Tokenizer = _Tokenizer;
	    Hooks = _Hooks;
	    constructor(...args) {
	        this.use(...args);
	    }
	    /**
	     * Run callback for every token
	     */
	    walkTokens(tokens, callback) {
	        let values = [];
	        for (const token of tokens) {
	            values = values.concat(callback.call(this, token));
	            switch (token.type) {
	                case 'table': {
	                    const tableToken = token;
	                    for (const cell of tableToken.header) {
	                        values = values.concat(this.walkTokens(cell.tokens, callback));
	                    }
	                    for (const row of tableToken.rows) {
	                        for (const cell of row) {
	                            values = values.concat(this.walkTokens(cell.tokens, callback));
	                        }
	                    }
	                    break;
	                }
	                case 'list': {
	                    const listToken = token;
	                    values = values.concat(this.walkTokens(listToken.items, callback));
	                    break;
	                }
	                default: {
	                    const genericToken = token;
	                    if (this.defaults.extensions?.childTokens?.[genericToken.type]) {
	                        this.defaults.extensions.childTokens[genericToken.type].forEach((childTokens) => {
	                            const tokens = genericToken[childTokens].flat(Infinity);
	                            values = values.concat(this.walkTokens(tokens, callback));
	                        });
	                    }
	                    else if (genericToken.tokens) {
	                        values = values.concat(this.walkTokens(genericToken.tokens, callback));
	                    }
	                }
	            }
	        }
	        return values;
	    }
	    use(...args) {
	        const extensions = this.defaults.extensions || { renderers: {}, childTokens: {} };
	        args.forEach((pack) => {
	            // copy options to new object
	            const opts = { ...pack };
	            // set async to true if it was set to true before
	            opts.async = this.defaults.async || opts.async || false;
	            // ==-- Parse "addon" extensions --== //
	            if (pack.extensions) {
	                pack.extensions.forEach((ext) => {
	                    if (!ext.name) {
	                        throw new Error('extension name required');
	                    }
	                    if ('renderer' in ext) { // Renderer extensions
	                        const prevRenderer = extensions.renderers[ext.name];
	                        if (prevRenderer) {
	                            // Replace extension with func to run new extension but fall back if false
	                            extensions.renderers[ext.name] = function (...args) {
	                                let ret = ext.renderer.apply(this, args);
	                                if (ret === false) {
	                                    ret = prevRenderer.apply(this, args);
	                                }
	                                return ret;
	                            };
	                        }
	                        else {
	                            extensions.renderers[ext.name] = ext.renderer;
	                        }
	                    }
	                    if ('tokenizer' in ext) { // Tokenizer Extensions
	                        if (!ext.level || (ext.level !== 'block' && ext.level !== 'inline')) {
	                            throw new Error("extension level must be 'block' or 'inline'");
	                        }
	                        const extLevel = extensions[ext.level];
	                        if (extLevel) {
	                            extLevel.unshift(ext.tokenizer);
	                        }
	                        else {
	                            extensions[ext.level] = [ext.tokenizer];
	                        }
	                        if (ext.start) { // Function to check for start of token
	                            if (ext.level === 'block') {
	                                if (extensions.startBlock) {
	                                    extensions.startBlock.push(ext.start);
	                                }
	                                else {
	                                    extensions.startBlock = [ext.start];
	                                }
	                            }
	                            else if (ext.level === 'inline') {
	                                if (extensions.startInline) {
	                                    extensions.startInline.push(ext.start);
	                                }
	                                else {
	                                    extensions.startInline = [ext.start];
	                                }
	                            }
	                        }
	                    }
	                    if ('childTokens' in ext && ext.childTokens) { // Child tokens to be visited by walkTokens
	                        extensions.childTokens[ext.name] = ext.childTokens;
	                    }
	                });
	                opts.extensions = extensions;
	            }
	            // ==-- Parse "overwrite" extensions --== //
	            if (pack.renderer) {
	                const renderer = this.defaults.renderer || new _Renderer(this.defaults);
	                for (const prop in pack.renderer) {
	                    if (!(prop in renderer)) {
	                        throw new Error(`renderer '${prop}' does not exist`);
	                    }
	                    if (prop === 'options') {
	                        // ignore options property
	                        continue;
	                    }
	                    const rendererProp = prop;
	                    const rendererFunc = pack.renderer[rendererProp];
	                    const prevRenderer = renderer[rendererProp];
	                    // Replace renderer with func to run extension, but fall back if false
	                    renderer[rendererProp] = (...args) => {
	                        let ret = rendererFunc.apply(renderer, args);
	                        if (ret === false) {
	                            ret = prevRenderer.apply(renderer, args);
	                        }
	                        return ret || '';
	                    };
	                }
	                opts.renderer = renderer;
	            }
	            if (pack.tokenizer) {
	                const tokenizer = this.defaults.tokenizer || new _Tokenizer(this.defaults);
	                for (const prop in pack.tokenizer) {
	                    if (!(prop in tokenizer)) {
	                        throw new Error(`tokenizer '${prop}' does not exist`);
	                    }
	                    if (['options', 'rules', 'lexer'].includes(prop)) {
	                        // ignore options, rules, and lexer properties
	                        continue;
	                    }
	                    const tokenizerProp = prop;
	                    const tokenizerFunc = pack.tokenizer[tokenizerProp];
	                    const prevTokenizer = tokenizer[tokenizerProp];
	                    // Replace tokenizer with func to run extension, but fall back if false
	                    // @ts-expect-error cannot type tokenizer function dynamically
	                    tokenizer[tokenizerProp] = (...args) => {
	                        let ret = tokenizerFunc.apply(tokenizer, args);
	                        if (ret === false) {
	                            ret = prevTokenizer.apply(tokenizer, args);
	                        }
	                        return ret;
	                    };
	                }
	                opts.tokenizer = tokenizer;
	            }
	            // ==-- Parse Hooks extensions --== //
	            if (pack.hooks) {
	                const hooks = this.defaults.hooks || new _Hooks();
	                for (const prop in pack.hooks) {
	                    if (!(prop in hooks)) {
	                        throw new Error(`hook '${prop}' does not exist`);
	                    }
	                    if (prop === 'options') {
	                        // ignore options property
	                        continue;
	                    }
	                    const hooksProp = prop;
	                    const hooksFunc = pack.hooks[hooksProp];
	                    const prevHook = hooks[hooksProp];
	                    if (_Hooks.passThroughHooks.has(prop)) {
	                        // @ts-expect-error cannot type hook function dynamically
	                        hooks[hooksProp] = (arg) => {
	                            if (this.defaults.async) {
	                                return Promise.resolve(hooksFunc.call(hooks, arg)).then(ret => {
	                                    return prevHook.call(hooks, ret);
	                                });
	                            }
	                            const ret = hooksFunc.call(hooks, arg);
	                            return prevHook.call(hooks, ret);
	                        };
	                    }
	                    else {
	                        // @ts-expect-error cannot type hook function dynamically
	                        hooks[hooksProp] = (...args) => {
	                            let ret = hooksFunc.apply(hooks, args);
	                            if (ret === false) {
	                                ret = prevHook.apply(hooks, args);
	                            }
	                            return ret;
	                        };
	                    }
	                }
	                opts.hooks = hooks;
	            }
	            // ==-- Parse WalkTokens extensions --== //
	            if (pack.walkTokens) {
	                const walkTokens = this.defaults.walkTokens;
	                const packWalktokens = pack.walkTokens;
	                opts.walkTokens = function (token) {
	                    let values = [];
	                    values.push(packWalktokens.call(this, token));
	                    if (walkTokens) {
	                        values = values.concat(walkTokens.call(this, token));
	                    }
	                    return values;
	                };
	            }
	            this.defaults = { ...this.defaults, ...opts };
	        });
	        return this;
	    }
	    setOptions(opt) {
	        this.defaults = { ...this.defaults, ...opt };
	        return this;
	    }
	    lexer(src, options) {
	        return _Lexer.lex(src, options ?? this.defaults);
	    }
	    parser(tokens, options) {
	        return _Parser.parse(tokens, options ?? this.defaults);
	    }
	    #parseMarkdown(lexer, parser) {
	        return (src, options) => {
	            const origOpt = { ...options };
	            const opt = { ...this.defaults, ...origOpt };
	            // Show warning if an extension set async to true but the parse was called with async: false
	            if (this.defaults.async === true && origOpt.async === false) {
	                if (!opt.silent) {
	                    console.warn('marked(): The async option was set to true by an extension. The async: false option sent to parse will be ignored.');
	                }
	                opt.async = true;
	            }
	            const throwError = this.#onError(!!opt.silent, !!opt.async);
	            // throw error in case of non string input
	            if (typeof src === 'undefined' || src === null) {
	                return throwError(new Error('marked(): input parameter is undefined or null'));
	            }
	            if (typeof src !== 'string') {
	                return throwError(new Error('marked(): input parameter is of type '
	                    + Object.prototype.toString.call(src) + ', string expected'));
	            }
	            if (opt.hooks) {
	                opt.hooks.options = opt;
	            }
	            if (opt.async) {
	                return Promise.resolve(opt.hooks ? opt.hooks.preprocess(src) : src)
	                    .then(src => lexer(src, opt))
	                    .then(tokens => opt.hooks ? opt.hooks.processAllTokens(tokens) : tokens)
	                    .then(tokens => opt.walkTokens ? Promise.all(this.walkTokens(tokens, opt.walkTokens)).then(() => tokens) : tokens)
	                    .then(tokens => parser(tokens, opt))
	                    .then(html => opt.hooks ? opt.hooks.postprocess(html) : html)
	                    .catch(throwError);
	            }
	            try {
	                if (opt.hooks) {
	                    src = opt.hooks.preprocess(src);
	                }
	                let tokens = lexer(src, opt);
	                if (opt.hooks) {
	                    tokens = opt.hooks.processAllTokens(tokens);
	                }
	                if (opt.walkTokens) {
	                    this.walkTokens(tokens, opt.walkTokens);
	                }
	                let html = parser(tokens, opt);
	                if (opt.hooks) {
	                    html = opt.hooks.postprocess(html);
	                }
	                return html;
	            }
	            catch (e) {
	                return throwError(e);
	            }
	        };
	    }
	    #onError(silent, async) {
	        return (e) => {
	            e.message += '\nPlease report this to https://github.com/markedjs/marked.';
	            if (silent) {
	                const msg = '<p>An error occurred:</p><pre>'
	                    + escape$1(e.message + '', true)
	                    + '</pre>';
	                if (async) {
	                    return Promise.resolve(msg);
	                }
	                return msg;
	            }
	            if (async) {
	                return Promise.reject(e);
	            }
	            throw e;
	        };
	    }
	}

	const markedInstance = new Marked();
	function marked(src, opt) {
	    return markedInstance.parse(src, opt);
	}
	/**
	 * Sets the default options.
	 *
	 * @param options Hash of options
	 */
	marked.options =
	    marked.setOptions = function (options) {
	        markedInstance.setOptions(options);
	        marked.defaults = markedInstance.defaults;
	        changeDefaults(marked.defaults);
	        return marked;
	    };
	/**
	 * Gets the original marked default options.
	 */
	marked.getDefaults = _getDefaults;
	marked.defaults = _defaults;
	/**
	 * Use Extension
	 */
	marked.use = function (...args) {
	    markedInstance.use(...args);
	    marked.defaults = markedInstance.defaults;
	    changeDefaults(marked.defaults);
	    return marked;
	};
	/**
	 * Run callback for every token
	 */
	marked.walkTokens = function (tokens, callback) {
	    return markedInstance.walkTokens(tokens, callback);
	};
	/**
	 * Compiles markdown to HTML without enclosing `p` tag.
	 *
	 * @param src String of markdown source to be compiled
	 * @param options Hash of options
	 * @return String of compiled HTML
	 */
	marked.parseInline = markedInstance.parseInline;
	/**
	 * Expose
	 */
	marked.Parser = _Parser;
	marked.parser = _Parser.parse;
	marked.Renderer = _Renderer;
	marked.TextRenderer = _TextRenderer;
	marked.Lexer = _Lexer;
	marked.lexer = _Lexer.lex;
	marked.Tokenizer = _Tokenizer;
	marked.Hooks = _Hooks;
	marked.parse = marked;
	marked.options;
	marked.setOptions;
	marked.use;
	marked.walkTokens;
	marked.parseInline;
	_Parser.parse;
	_Lexer.lex;

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var prism = {exports: {}};

	(function (module) {
		/* **********************************************
		     Begin prism-core.js
		********************************************** */

		/// <reference lib="WebWorker"/>

		var _self = (typeof window !== 'undefined')
			? window   // if in browser
			: (
				(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
					? self // if in worker
					: {}   // if in node js
			);

		/**
		 * Prism: Lightweight, robust, elegant syntax highlighting
		 *
		 * @license MIT <https://opensource.org/licenses/MIT>
		 * @author Lea Verou <https://lea.verou.me>
		 * @namespace
		 * @public
		 */
		var Prism = (function (_self) {

			// Private helper vars
			var lang = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i;
			var uniqueId = 0;

			// The grammar object for plaintext
			var plainTextGrammar = {};


			var _ = {
				/**
				 * By default, Prism will attempt to highlight all code elements (by calling {@link Prism.highlightAll}) on the
				 * current page after the page finished loading. This might be a problem if e.g. you wanted to asynchronously load
				 * additional languages or plugins yourself.
				 *
				 * By setting this value to `true`, Prism will not automatically highlight all code elements on the page.
				 *
				 * You obviously have to change this value before the automatic highlighting started. To do this, you can add an
				 * empty Prism object into the global scope before loading the Prism script like this:
				 *
				 * ```js
				 * window.Prism = window.Prism || {};
				 * Prism.manual = true;
				 * // add a new <script> to load Prism's script
				 * ```
				 *
				 * @default false
				 * @type {boolean}
				 * @memberof Prism
				 * @public
				 */
				manual: _self.Prism && _self.Prism.manual,
				/**
				 * By default, if Prism is in a web worker, it assumes that it is in a worker it created itself, so it uses
				 * `addEventListener` to communicate with its parent instance. However, if you're using Prism manually in your
				 * own worker, you don't want it to do this.
				 *
				 * By setting this value to `true`, Prism will not add its own listeners to the worker.
				 *
				 * You obviously have to change this value before Prism executes. To do this, you can add an
				 * empty Prism object into the global scope before loading the Prism script like this:
				 *
				 * ```js
				 * window.Prism = window.Prism || {};
				 * Prism.disableWorkerMessageHandler = true;
				 * // Load Prism's script
				 * ```
				 *
				 * @default false
				 * @type {boolean}
				 * @memberof Prism
				 * @public
				 */
				disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,

				/**
				 * A namespace for utility methods.
				 *
				 * All function in this namespace that are not explicitly marked as _public_ are for __internal use only__ and may
				 * change or disappear at any time.
				 *
				 * @namespace
				 * @memberof Prism
				 */
				util: {
					encode: function encode(tokens) {
						if (tokens instanceof Token) {
							return new Token(tokens.type, encode(tokens.content), tokens.alias);
						} else if (Array.isArray(tokens)) {
							return tokens.map(encode);
						} else {
							return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
						}
					},

					/**
					 * Returns the name of the type of the given value.
					 *
					 * @param {any} o
					 * @returns {string}
					 * @example
					 * type(null)      === 'Null'
					 * type(undefined) === 'Undefined'
					 * type(123)       === 'Number'
					 * type('foo')     === 'String'
					 * type(true)      === 'Boolean'
					 * type([1, 2])    === 'Array'
					 * type({})        === 'Object'
					 * type(String)    === 'Function'
					 * type(/abc+/)    === 'RegExp'
					 */
					type: function (o) {
						return Object.prototype.toString.call(o).slice(8, -1);
					},

					/**
					 * Returns a unique number for the given object. Later calls will still return the same number.
					 *
					 * @param {Object} obj
					 * @returns {number}
					 */
					objId: function (obj) {
						if (!obj['__id']) {
							Object.defineProperty(obj, '__id', { value: ++uniqueId });
						}
						return obj['__id'];
					},

					/**
					 * Creates a deep clone of the given object.
					 *
					 * The main intended use of this function is to clone language definitions.
					 *
					 * @param {T} o
					 * @param {Record<number, any>} [visited]
					 * @returns {T}
					 * @template T
					 */
					clone: function deepClone(o, visited) {
						visited = visited || {};

						var clone; var id;
						switch (_.util.type(o)) {
							case 'Object':
								id = _.util.objId(o);
								if (visited[id]) {
									return visited[id];
								}
								clone = /** @type {Record<string, any>} */ ({});
								visited[id] = clone;

								for (var key in o) {
									if (o.hasOwnProperty(key)) {
										clone[key] = deepClone(o[key], visited);
									}
								}

								return /** @type {any} */ (clone);

							case 'Array':
								id = _.util.objId(o);
								if (visited[id]) {
									return visited[id];
								}
								clone = [];
								visited[id] = clone;

								(/** @type {Array} */(/** @type {any} */(o))).forEach(function (v, i) {
									clone[i] = deepClone(v, visited);
								});

								return /** @type {any} */ (clone);

							default:
								return o;
						}
					},

					/**
					 * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
					 *
					 * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
					 *
					 * @param {Element} element
					 * @returns {string}
					 */
					getLanguage: function (element) {
						while (element) {
							var m = lang.exec(element.className);
							if (m) {
								return m[1].toLowerCase();
							}
							element = element.parentElement;
						}
						return 'none';
					},

					/**
					 * Sets the Prism `language-xxxx` class of the given element.
					 *
					 * @param {Element} element
					 * @param {string} language
					 * @returns {void}
					 */
					setLanguage: function (element, language) {
						// remove all `language-xxxx` classes
						// (this might leave behind a leading space)
						element.className = element.className.replace(RegExp(lang, 'gi'), '');

						// add the new `language-xxxx` class
						// (using `classList` will automatically clean up spaces for us)
						element.classList.add('language-' + language);
					},

					/**
					 * Returns the script element that is currently executing.
					 *
					 * This does __not__ work for line script element.
					 *
					 * @returns {HTMLScriptElement | null}
					 */
					currentScript: function () {
						if (typeof document === 'undefined') {
							return null;
						}
						if (document.currentScript && document.currentScript.tagName === 'SCRIPT' && 1 < 2 /* hack to trip TS' flow analysis */) {
							return /** @type {any} */ (document.currentScript);
						}

						// IE11 workaround
						// we'll get the src of the current script by parsing IE11's error stack trace
						// this will not work for inline scripts

						try {
							throw new Error();
						} catch (err) {
							// Get file src url from stack. Specifically works with the format of stack traces in IE.
							// A stack will look like this:
							//
							// Error
							//    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
							//    at Global code (http://localhost/components/prism-core.js:606:1)

							var src = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(err.stack) || [])[1];
							if (src) {
								var scripts = document.getElementsByTagName('script');
								for (var i in scripts) {
									if (scripts[i].src == src) {
										return scripts[i];
									}
								}
							}
							return null;
						}
					},

					/**
					 * Returns whether a given class is active for `element`.
					 *
					 * The class can be activated if `element` or one of its ancestors has the given class and it can be deactivated
					 * if `element` or one of its ancestors has the negated version of the given class. The _negated version_ of the
					 * given class is just the given class with a `no-` prefix.
					 *
					 * Whether the class is active is determined by the closest ancestor of `element` (where `element` itself is
					 * closest ancestor) that has the given class or the negated version of it. If neither `element` nor any of its
					 * ancestors have the given class or the negated version of it, then the default activation will be returned.
					 *
					 * In the paradoxical situation where the closest ancestor contains __both__ the given class and the negated
					 * version of it, the class is considered active.
					 *
					 * @param {Element} element
					 * @param {string} className
					 * @param {boolean} [defaultActivation=false]
					 * @returns {boolean}
					 */
					isActive: function (element, className, defaultActivation) {
						var no = 'no-' + className;

						while (element) {
							var classList = element.classList;
							if (classList.contains(className)) {
								return true;
							}
							if (classList.contains(no)) {
								return false;
							}
							element = element.parentElement;
						}
						return !!defaultActivation;
					}
				},

				/**
				 * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
				 *
				 * @namespace
				 * @memberof Prism
				 * @public
				 */
				languages: {
					/**
					 * The grammar for plain, unformatted text.
					 */
					plain: plainTextGrammar,
					plaintext: plainTextGrammar,
					text: plainTextGrammar,
					txt: plainTextGrammar,

					/**
					 * Creates a deep copy of the language with the given id and appends the given tokens.
					 *
					 * If a token in `redef` also appears in the copied language, then the existing token in the copied language
					 * will be overwritten at its original position.
					 *
					 * ## Best practices
					 *
					 * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
					 * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
					 * understand the language definition because, normally, the order of tokens matters in Prism grammars.
					 *
					 * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
					 * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
					 *
					 * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
					 * @param {Grammar} redef The new tokens to append.
					 * @returns {Grammar} The new language created.
					 * @public
					 * @example
					 * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
					 *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
					 *     // at its original position
					 *     'comment': { ... },
					 *     // CSS doesn't have a 'color' token, so this token will be appended
					 *     'color': /\b(?:red|green|blue)\b/
					 * });
					 */
					extend: function (id, redef) {
						var lang = _.util.clone(_.languages[id]);

						for (var key in redef) {
							lang[key] = redef[key];
						}

						return lang;
					},

					/**
					 * Inserts tokens _before_ another token in a language definition or any other grammar.
					 *
					 * ## Usage
					 *
					 * This helper method makes it easy to modify existing languages. For example, the CSS language definition
					 * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
					 * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
					 * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
					 * this:
					 *
					 * ```js
					 * Prism.languages.markup.style = {
					 *     // token
					 * };
					 * ```
					 *
					 * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
					 * before existing tokens. For the CSS example above, you would use it like this:
					 *
					 * ```js
					 * Prism.languages.insertBefore('markup', 'cdata', {
					 *     'style': {
					 *         // token
					 *     }
					 * });
					 * ```
					 *
					 * ## Special cases
					 *
					 * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
					 * will be ignored.
					 *
					 * This behavior can be used to insert tokens after `before`:
					 *
					 * ```js
					 * Prism.languages.insertBefore('markup', 'comment', {
					 *     'comment': Prism.languages.markup.comment,
					 *     // tokens after 'comment'
					 * });
					 * ```
					 *
					 * ## Limitations
					 *
					 * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
					 * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
					 * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
					 * deleting properties which is necessary to insert at arbitrary positions.
					 *
					 * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
					 * Instead, it will create a new object and replace all references to the target object with the new one. This
					 * can be done without temporarily deleting properties, so the iteration order is well-defined.
					 *
					 * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
					 * you hold the target object in a variable, then the value of the variable will not change.
					 *
					 * ```js
					 * var oldMarkup = Prism.languages.markup;
					 * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
					 *
					 * assert(oldMarkup !== Prism.languages.markup);
					 * assert(newMarkup === Prism.languages.markup);
					 * ```
					 *
					 * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
					 * object to be modified.
					 * @param {string} before The key to insert before.
					 * @param {Grammar} insert An object containing the key-value pairs to be inserted.
					 * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
					 * object to be modified.
					 *
					 * Defaults to `Prism.languages`.
					 * @returns {Grammar} The new grammar object.
					 * @public
					 */
					insertBefore: function (inside, before, insert, root) {
						root = root || /** @type {any} */ (_.languages);
						var grammar = root[inside];
						/** @type {Grammar} */
						var ret = {};

						for (var token in grammar) {
							if (grammar.hasOwnProperty(token)) {

								if (token == before) {
									for (var newToken in insert) {
										if (insert.hasOwnProperty(newToken)) {
											ret[newToken] = insert[newToken];
										}
									}
								}

								// Do not insert token which also occur in insert. See #1525
								if (!insert.hasOwnProperty(token)) {
									ret[token] = grammar[token];
								}
							}
						}

						var old = root[inside];
						root[inside] = ret;

						// Update references in other language definitions
						_.languages.DFS(_.languages, function (key, value) {
							if (value === old && key != inside) {
								this[key] = ret;
							}
						});

						return ret;
					},

					// Traverse a language definition with Depth First Search
					DFS: function DFS(o, callback, type, visited) {
						visited = visited || {};

						var objId = _.util.objId;

						for (var i in o) {
							if (o.hasOwnProperty(i)) {
								callback.call(o, i, o[i], type || i);

								var property = o[i];
								var propertyType = _.util.type(property);

								if (propertyType === 'Object' && !visited[objId(property)]) {
									visited[objId(property)] = true;
									DFS(property, callback, null, visited);
								} else if (propertyType === 'Array' && !visited[objId(property)]) {
									visited[objId(property)] = true;
									DFS(property, callback, i, visited);
								}
							}
						}
					}
				},

				plugins: {},

				/**
				 * This is the most high-level function in Prism’s API.
				 * It fetches all the elements that have a `.language-xxxx` class and then calls {@link Prism.highlightElement} on
				 * each one of them.
				 *
				 * This is equivalent to `Prism.highlightAllUnder(document, async, callback)`.
				 *
				 * @param {boolean} [async=false] Same as in {@link Prism.highlightAllUnder}.
				 * @param {HighlightCallback} [callback] Same as in {@link Prism.highlightAllUnder}.
				 * @memberof Prism
				 * @public
				 */
				highlightAll: function (async, callback) {
					_.highlightAllUnder(document, async, callback);
				},

				/**
				 * Fetches all the descendants of `container` that have a `.language-xxxx` class and then calls
				 * {@link Prism.highlightElement} on each one of them.
				 *
				 * The following hooks will be run:
				 * 1. `before-highlightall`
				 * 2. `before-all-elements-highlight`
				 * 3. All hooks of {@link Prism.highlightElement} for each element.
				 *
				 * @param {ParentNode} container The root element, whose descendants that have a `.language-xxxx` class will be highlighted.
				 * @param {boolean} [async=false] Whether each element is to be highlighted asynchronously using Web Workers.
				 * @param {HighlightCallback} [callback] An optional callback to be invoked on each element after its highlighting is done.
				 * @memberof Prism
				 * @public
				 */
				highlightAllUnder: function (container, async, callback) {
					var env = {
						callback: callback,
						container: container,
						selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
					};

					_.hooks.run('before-highlightall', env);

					env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));

					_.hooks.run('before-all-elements-highlight', env);

					for (var i = 0, element; (element = env.elements[i++]);) {
						_.highlightElement(element, async === true, env.callback);
					}
				},

				/**
				 * Highlights the code inside a single element.
				 *
				 * The following hooks will be run:
				 * 1. `before-sanity-check`
				 * 2. `before-highlight`
				 * 3. All hooks of {@link Prism.highlight}. These hooks will be run by an asynchronous worker if `async` is `true`.
				 * 4. `before-insert`
				 * 5. `after-highlight`
				 * 6. `complete`
				 *
				 * Some the above hooks will be skipped if the element doesn't contain any text or there is no grammar loaded for
				 * the element's language.
				 *
				 * @param {Element} element The element containing the code.
				 * It must have a class of `language-xxxx` to be processed, where `xxxx` is a valid language identifier.
				 * @param {boolean} [async=false] Whether the element is to be highlighted asynchronously using Web Workers
				 * to improve performance and avoid blocking the UI when highlighting very large chunks of code. This option is
				 * [disabled by default](https://prismjs.com/faq.html#why-is-asynchronous-highlighting-disabled-by-default).
				 *
				 * Note: All language definitions required to highlight the code must be included in the main `prism.js` file for
				 * asynchronous highlighting to work. You can build your own bundle on the
				 * [Download page](https://prismjs.com/download.html).
				 * @param {HighlightCallback} [callback] An optional callback to be invoked after the highlighting is done.
				 * Mostly useful when `async` is `true`, since in that case, the highlighting is done asynchronously.
				 * @memberof Prism
				 * @public
				 */
				highlightElement: function (element, async, callback) {
					// Find language
					var language = _.util.getLanguage(element);
					var grammar = _.languages[language];

					// Set language on the element, if not present
					_.util.setLanguage(element, language);

					// Set language on the parent, for styling
					var parent = element.parentElement;
					if (parent && parent.nodeName.toLowerCase() === 'pre') {
						_.util.setLanguage(parent, language);
					}

					var code = element.textContent;

					var env = {
						element: element,
						language: language,
						grammar: grammar,
						code: code
					};

					function insertHighlightedCode(highlightedCode) {
						env.highlightedCode = highlightedCode;

						_.hooks.run('before-insert', env);

						env.element.innerHTML = env.highlightedCode;

						_.hooks.run('after-highlight', env);
						_.hooks.run('complete', env);
						callback && callback.call(env.element);
					}

					_.hooks.run('before-sanity-check', env);

					// plugins may change/add the parent/element
					parent = env.element.parentElement;
					if (parent && parent.nodeName.toLowerCase() === 'pre' && !parent.hasAttribute('tabindex')) {
						parent.setAttribute('tabindex', '0');
					}

					if (!env.code) {
						_.hooks.run('complete', env);
						callback && callback.call(env.element);
						return;
					}

					_.hooks.run('before-highlight', env);

					if (!env.grammar) {
						insertHighlightedCode(_.util.encode(env.code));
						return;
					}

					if (async && _self.Worker) {
						var worker = new Worker(_.filename);

						worker.onmessage = function (evt) {
							insertHighlightedCode(evt.data);
						};

						worker.postMessage(JSON.stringify({
							language: env.language,
							code: env.code,
							immediateClose: true
						}));
					} else {
						insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
					}
				},

				/**
				 * Low-level function, only use if you know what you’re doing. It accepts a string of text as input
				 * and the language definitions to use, and returns a string with the HTML produced.
				 *
				 * The following hooks will be run:
				 * 1. `before-tokenize`
				 * 2. `after-tokenize`
				 * 3. `wrap`: On each {@link Token}.
				 *
				 * @param {string} text A string with the code to be highlighted.
				 * @param {Grammar} grammar An object containing the tokens to use.
				 *
				 * Usually a language definition like `Prism.languages.markup`.
				 * @param {string} language The name of the language definition passed to `grammar`.
				 * @returns {string} The highlighted HTML.
				 * @memberof Prism
				 * @public
				 * @example
				 * Prism.highlight('var foo = true;', Prism.languages.javascript, 'javascript');
				 */
				highlight: function (text, grammar, language) {
					var env = {
						code: text,
						grammar: grammar,
						language: language
					};
					_.hooks.run('before-tokenize', env);
					if (!env.grammar) {
						throw new Error('The language "' + env.language + '" has no grammar.');
					}
					env.tokens = _.tokenize(env.code, env.grammar);
					_.hooks.run('after-tokenize', env);
					return Token.stringify(_.util.encode(env.tokens), env.language);
				},

				/**
				 * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
				 * and the language definitions to use, and returns an array with the tokenized code.
				 *
				 * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
				 *
				 * This method could be useful in other contexts as well, as a very crude parser.
				 *
				 * @param {string} text A string with the code to be highlighted.
				 * @param {Grammar} grammar An object containing the tokens to use.
				 *
				 * Usually a language definition like `Prism.languages.markup`.
				 * @returns {TokenStream} An array of strings and tokens, a token stream.
				 * @memberof Prism
				 * @public
				 * @example
				 * let code = `var foo = 0;`;
				 * let tokens = Prism.tokenize(code, Prism.languages.javascript);
				 * tokens.forEach(token => {
				 *     if (token instanceof Prism.Token && token.type === 'number') {
				 *         console.log(`Found numeric literal: ${token.content}`);
				 *     }
				 * });
				 */
				tokenize: function (text, grammar) {
					var rest = grammar.rest;
					if (rest) {
						for (var token in rest) {
							grammar[token] = rest[token];
						}

						delete grammar.rest;
					}

					var tokenList = new LinkedList();
					addAfter(tokenList, tokenList.head, text);

					matchGrammar(text, tokenList, grammar, tokenList.head, 0);

					return toArray(tokenList);
				},

				/**
				 * @namespace
				 * @memberof Prism
				 * @public
				 */
				hooks: {
					all: {},

					/**
					 * Adds the given callback to the list of callbacks for the given hook.
					 *
					 * The callback will be invoked when the hook it is registered for is run.
					 * Hooks are usually directly run by a highlight function but you can also run hooks yourself.
					 *
					 * One callback function can be registered to multiple hooks and the same hook multiple times.
					 *
					 * @param {string} name The name of the hook.
					 * @param {HookCallback} callback The callback function which is given environment variables.
					 * @public
					 */
					add: function (name, callback) {
						var hooks = _.hooks.all;

						hooks[name] = hooks[name] || [];

						hooks[name].push(callback);
					},

					/**
					 * Runs a hook invoking all registered callbacks with the given environment variables.
					 *
					 * Callbacks will be invoked synchronously and in the order in which they were registered.
					 *
					 * @param {string} name The name of the hook.
					 * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
					 * @public
					 */
					run: function (name, env) {
						var callbacks = _.hooks.all[name];

						if (!callbacks || !callbacks.length) {
							return;
						}

						for (var i = 0, callback; (callback = callbacks[i++]);) {
							callback(env);
						}
					}
				},

				Token: Token
			};
			_self.Prism = _;


			// Typescript note:
			// The following can be used to import the Token type in JSDoc:
			//
			//   @typedef {InstanceType<import("./prism-core")["Token"]>} Token

			/**
			 * Creates a new token.
			 *
			 * @param {string} type See {@link Token#type type}
			 * @param {string | TokenStream} content See {@link Token#content content}
			 * @param {string|string[]} [alias] The alias(es) of the token.
			 * @param {string} [matchedStr=""] A copy of the full string this token was created from.
			 * @class
			 * @global
			 * @public
			 */
			function Token(type, content, alias, matchedStr) {
				/**
				 * The type of the token.
				 *
				 * This is usually the key of a pattern in a {@link Grammar}.
				 *
				 * @type {string}
				 * @see GrammarToken
				 * @public
				 */
				this.type = type;
				/**
				 * The strings or tokens contained by this token.
				 *
				 * This will be a token stream if the pattern matched also defined an `inside` grammar.
				 *
				 * @type {string | TokenStream}
				 * @public
				 */
				this.content = content;
				/**
				 * The alias(es) of the token.
				 *
				 * @type {string|string[]}
				 * @see GrammarToken
				 * @public
				 */
				this.alias = alias;
				// Copy of the full string this token was created from
				this.length = (matchedStr || '').length | 0;
			}

			/**
			 * A token stream is an array of strings and {@link Token Token} objects.
			 *
			 * Token streams have to fulfill a few properties that are assumed by most functions (mostly internal ones) that process
			 * them.
			 *
			 * 1. No adjacent strings.
			 * 2. No empty strings.
			 *
			 *    The only exception here is the token stream that only contains the empty string and nothing else.
			 *
			 * @typedef {Array<string | Token>} TokenStream
			 * @global
			 * @public
			 */

			/**
			 * Converts the given token or token stream to an HTML representation.
			 *
			 * The following hooks will be run:
			 * 1. `wrap`: On each {@link Token}.
			 *
			 * @param {string | Token | TokenStream} o The token or token stream to be converted.
			 * @param {string} language The name of current language.
			 * @returns {string} The HTML representation of the token or token stream.
			 * @memberof Token
			 * @static
			 */
			Token.stringify = function stringify(o, language) {
				if (typeof o == 'string') {
					return o;
				}
				if (Array.isArray(o)) {
					var s = '';
					o.forEach(function (e) {
						s += stringify(e, language);
					});
					return s;
				}

				var env = {
					type: o.type,
					content: stringify(o.content, language),
					tag: 'span',
					classes: ['token', o.type],
					attributes: {},
					language: language
				};

				var aliases = o.alias;
				if (aliases) {
					if (Array.isArray(aliases)) {
						Array.prototype.push.apply(env.classes, aliases);
					} else {
						env.classes.push(aliases);
					}
				}

				_.hooks.run('wrap', env);

				var attributes = '';
				for (var name in env.attributes) {
					attributes += ' ' + name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
				}

				return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + attributes + '>' + env.content + '</' + env.tag + '>';
			};

			/**
			 * @param {RegExp} pattern
			 * @param {number} pos
			 * @param {string} text
			 * @param {boolean} lookbehind
			 * @returns {RegExpExecArray | null}
			 */
			function matchPattern(pattern, pos, text, lookbehind) {
				pattern.lastIndex = pos;
				var match = pattern.exec(text);
				if (match && lookbehind && match[1]) {
					// change the match to remove the text matched by the Prism lookbehind group
					var lookbehindLength = match[1].length;
					match.index += lookbehindLength;
					match[0] = match[0].slice(lookbehindLength);
				}
				return match;
			}

			/**
			 * @param {string} text
			 * @param {LinkedList<string | Token>} tokenList
			 * @param {any} grammar
			 * @param {LinkedListNode<string | Token>} startNode
			 * @param {number} startPos
			 * @param {RematchOptions} [rematch]
			 * @returns {void}
			 * @private
			 *
			 * @typedef RematchOptions
			 * @property {string} cause
			 * @property {number} reach
			 */
			function matchGrammar(text, tokenList, grammar, startNode, startPos, rematch) {
				for (var token in grammar) {
					if (!grammar.hasOwnProperty(token) || !grammar[token]) {
						continue;
					}

					var patterns = grammar[token];
					patterns = Array.isArray(patterns) ? patterns : [patterns];

					for (var j = 0; j < patterns.length; ++j) {
						if (rematch && rematch.cause == token + ',' + j) {
							return;
						}

						var patternObj = patterns[j];
						var inside = patternObj.inside;
						var lookbehind = !!patternObj.lookbehind;
						var greedy = !!patternObj.greedy;
						var alias = patternObj.alias;

						if (greedy && !patternObj.pattern.global) {
							// Without the global flag, lastIndex won't work
							var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
							patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g');
						}

						/** @type {RegExp} */
						var pattern = patternObj.pattern || patternObj;

						for ( // iterate the token list and keep track of the current token/string position
							var currentNode = startNode.next, pos = startPos;
							currentNode !== tokenList.tail;
							pos += currentNode.value.length, currentNode = currentNode.next
						) {

							if (rematch && pos >= rematch.reach) {
								break;
							}

							var str = currentNode.value;

							if (tokenList.length > text.length) {
								// Something went terribly wrong, ABORT, ABORT!
								return;
							}

							if (str instanceof Token) {
								continue;
							}

							var removeCount = 1; // this is the to parameter of removeBetween
							var match;

							if (greedy) {
								match = matchPattern(pattern, pos, text, lookbehind);
								if (!match || match.index >= text.length) {
									break;
								}

								var from = match.index;
								var to = match.index + match[0].length;
								var p = pos;

								// find the node that contains the match
								p += currentNode.value.length;
								while (from >= p) {
									currentNode = currentNode.next;
									p += currentNode.value.length;
								}
								// adjust pos (and p)
								p -= currentNode.value.length;
								pos = p;

								// the current node is a Token, then the match starts inside another Token, which is invalid
								if (currentNode.value instanceof Token) {
									continue;
								}

								// find the last node which is affected by this match
								for (
									var k = currentNode;
									k !== tokenList.tail && (p < to || typeof k.value === 'string');
									k = k.next
								) {
									removeCount++;
									p += k.value.length;
								}
								removeCount--;

								// replace with the new match
								str = text.slice(pos, p);
								match.index -= pos;
							} else {
								match = matchPattern(pattern, 0, str, lookbehind);
								if (!match) {
									continue;
								}
							}

							// eslint-disable-next-line no-redeclare
							var from = match.index;
							var matchStr = match[0];
							var before = str.slice(0, from);
							var after = str.slice(from + matchStr.length);

							var reach = pos + str.length;
							if (rematch && reach > rematch.reach) {
								rematch.reach = reach;
							}

							var removeFrom = currentNode.prev;

							if (before) {
								removeFrom = addAfter(tokenList, removeFrom, before);
								pos += before.length;
							}

							removeRange(tokenList, removeFrom, removeCount);

							var wrapped = new Token(token, inside ? _.tokenize(matchStr, inside) : matchStr, alias, matchStr);
							currentNode = addAfter(tokenList, removeFrom, wrapped);

							if (after) {
								addAfter(tokenList, currentNode, after);
							}

							if (removeCount > 1) {
								// at least one Token object was removed, so we have to do some rematching
								// this can only happen if the current pattern is greedy

								/** @type {RematchOptions} */
								var nestedRematch = {
									cause: token + ',' + j,
									reach: reach
								};
								matchGrammar(text, tokenList, grammar, currentNode.prev, pos, nestedRematch);

								// the reach might have been extended because of the rematching
								if (rematch && nestedRematch.reach > rematch.reach) {
									rematch.reach = nestedRematch.reach;
								}
							}
						}
					}
				}
			}

			/**
			 * @typedef LinkedListNode
			 * @property {T} value
			 * @property {LinkedListNode<T> | null} prev The previous node.
			 * @property {LinkedListNode<T> | null} next The next node.
			 * @template T
			 * @private
			 */

			/**
			 * @template T
			 * @private
			 */
			function LinkedList() {
				/** @type {LinkedListNode<T>} */
				var head = { value: null, prev: null, next: null };
				/** @type {LinkedListNode<T>} */
				var tail = { value: null, prev: head, next: null };
				head.next = tail;

				/** @type {LinkedListNode<T>} */
				this.head = head;
				/** @type {LinkedListNode<T>} */
				this.tail = tail;
				this.length = 0;
			}

			/**
			 * Adds a new node with the given value to the list.
			 *
			 * @param {LinkedList<T>} list
			 * @param {LinkedListNode<T>} node
			 * @param {T} value
			 * @returns {LinkedListNode<T>} The added node.
			 * @template T
			 */
			function addAfter(list, node, value) {
				// assumes that node != list.tail && values.length >= 0
				var next = node.next;

				var newNode = { value: value, prev: node, next: next };
				node.next = newNode;
				next.prev = newNode;
				list.length++;

				return newNode;
			}
			/**
			 * Removes `count` nodes after the given node. The given node will not be removed.
			 *
			 * @param {LinkedList<T>} list
			 * @param {LinkedListNode<T>} node
			 * @param {number} count
			 * @template T
			 */
			function removeRange(list, node, count) {
				var next = node.next;
				for (var i = 0; i < count && next !== list.tail; i++) {
					next = next.next;
				}
				node.next = next;
				next.prev = node;
				list.length -= i;
			}
			/**
			 * @param {LinkedList<T>} list
			 * @returns {T[]}
			 * @template T
			 */
			function toArray(list) {
				var array = [];
				var node = list.head.next;
				while (node !== list.tail) {
					array.push(node.value);
					node = node.next;
				}
				return array;
			}


			if (!_self.document) {
				if (!_self.addEventListener) {
					// in Node.js
					return _;
				}

				if (!_.disableWorkerMessageHandler) {
					// In worker
					_self.addEventListener('message', function (evt) {
						var message = JSON.parse(evt.data);
						var lang = message.language;
						var code = message.code;
						var immediateClose = message.immediateClose;

						_self.postMessage(_.highlight(code, _.languages[lang], lang));
						if (immediateClose) {
							_self.close();
						}
					}, false);
				}

				return _;
			}

			// Get current script and highlight
			var script = _.util.currentScript();

			if (script) {
				_.filename = script.src;

				if (script.hasAttribute('data-manual')) {
					_.manual = true;
				}
			}

			function highlightAutomaticallyCallback() {
				if (!_.manual) {
					_.highlightAll();
				}
			}

			if (!_.manual) {
				// If the document state is "loading", then we'll use DOMContentLoaded.
				// If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
				// DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
				// might take longer one animation frame to execute which can create a race condition where only some plugins have
				// been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
				// See https://github.com/PrismJS/prism/issues/2102
				var readyState = document.readyState;
				if (readyState === 'loading' || readyState === 'interactive' && script && script.defer) {
					document.addEventListener('DOMContentLoaded', highlightAutomaticallyCallback);
				} else {
					if (window.requestAnimationFrame) {
						window.requestAnimationFrame(highlightAutomaticallyCallback);
					} else {
						window.setTimeout(highlightAutomaticallyCallback, 16);
					}
				}
			}

			return _;

		}(_self));

		if (module.exports) {
			module.exports = Prism;
		}

		// hack for components to work correctly in node.js
		if (typeof commonjsGlobal !== 'undefined') {
			commonjsGlobal.Prism = Prism;
		}

		// some additional documentation/types

		/**
		 * The expansion of a simple `RegExp` literal to support additional properties.
		 *
		 * @typedef GrammarToken
		 * @property {RegExp} pattern The regular expression of the token.
		 * @property {boolean} [lookbehind=false] If `true`, then the first capturing group of `pattern` will (effectively)
		 * behave as a lookbehind group meaning that the captured text will not be part of the matched text of the new token.
		 * @property {boolean} [greedy=false] Whether the token is greedy.
		 * @property {string|string[]} [alias] An optional alias or list of aliases.
		 * @property {Grammar} [inside] The nested grammar of this token.
		 *
		 * The `inside` grammar will be used to tokenize the text value of each token of this kind.
		 *
		 * This can be used to make nested and even recursive language definitions.
		 *
		 * Note: This can cause infinite recursion. Be careful when you embed different languages or even the same language into
		 * each another.
		 * @global
		 * @public
		 */

		/**
		 * @typedef Grammar
		 * @type {Object<string, RegExp | GrammarToken | Array<RegExp | GrammarToken>>}
		 * @property {Grammar} [rest] An optional grammar object that will be appended to this grammar.
		 * @global
		 * @public
		 */

		/**
		 * A function which will invoked after an element was successfully highlighted.
		 *
		 * @callback HighlightCallback
		 * @param {Element} element The element successfully highlighted.
		 * @returns {void}
		 * @global
		 * @public
		 */

		/**
		 * @callback HookCallback
		 * @param {Object<string, any>} env The environment variables of the hook.
		 * @returns {void}
		 * @global
		 * @public
		 */


		/* **********************************************
		     Begin prism-markup.js
		********************************************** */

		Prism.languages.markup = {
			'comment': {
				pattern: /<!--(?:(?!<!--)[\s\S])*?-->/,
				greedy: true
			},
			'prolog': {
				pattern: /<\?[\s\S]+?\?>/,
				greedy: true
			},
			'doctype': {
				// https://www.w3.org/TR/xml/#NT-doctypedecl
				pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
				greedy: true,
				inside: {
					'internal-subset': {
						pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
						lookbehind: true,
						greedy: true,
						inside: null // see below
					},
					'string': {
						pattern: /"[^"]*"|'[^']*'/,
						greedy: true
					},
					'punctuation': /^<!|>$|[[\]]/,
					'doctype-tag': /^DOCTYPE/i,
					'name': /[^\s<>'"]+/
				}
			},
			'cdata': {
				pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
				greedy: true
			},
			'tag': {
				pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
				greedy: true,
				inside: {
					'tag': {
						pattern: /^<\/?[^\s>\/]+/,
						inside: {
							'punctuation': /^<\/?/,
							'namespace': /^[^\s>\/:]+:/
						}
					},
					'special-attr': [],
					'attr-value': {
						pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
						inside: {
							'punctuation': [
								{
									pattern: /^=/,
									alias: 'attr-equals'
								},
								{
									pattern: /^(\s*)["']|["']$/,
									lookbehind: true
								}
							]
						}
					},
					'punctuation': /\/?>/,
					'attr-name': {
						pattern: /[^\s>\/]+/,
						inside: {
							'namespace': /^[^\s>\/:]+:/
						}
					}

				}
			},
			'entity': [
				{
					pattern: /&[\da-z]{1,8};/i,
					alias: 'named-entity'
				},
				/&#x?[\da-f]{1,8};/i
			]
		};

		Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
			Prism.languages.markup['entity'];
		Prism.languages.markup['doctype'].inside['internal-subset'].inside = Prism.languages.markup;

		// Plugin to make entity title show the real entity, idea by Roman Komarov
		Prism.hooks.add('wrap', function (env) {

			if (env.type === 'entity') {
				env.attributes['title'] = env.content.replace(/&amp;/, '&');
			}
		});

		Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
			/**
			 * Adds an inlined language to markup.
			 *
			 * An example of an inlined language is CSS with `<style>` tags.
			 *
			 * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
			 * case insensitive.
			 * @param {string} lang The language key.
			 * @example
			 * addInlined('style', 'css');
			 */
			value: function addInlined(tagName, lang) {
				var includedCdataInside = {};
				includedCdataInside['language-' + lang] = {
					pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
					lookbehind: true,
					inside: Prism.languages[lang]
				};
				includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

				var inside = {
					'included-cdata': {
						pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
						inside: includedCdataInside
					}
				};
				inside['language-' + lang] = {
					pattern: /[\s\S]+/,
					inside: Prism.languages[lang]
				};

				var def = {};
				def[tagName] = {
					pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function () { return tagName; }), 'i'),
					lookbehind: true,
					greedy: true,
					inside: inside
				};

				Prism.languages.insertBefore('markup', 'cdata', def);
			}
		});
		Object.defineProperty(Prism.languages.markup.tag, 'addAttribute', {
			/**
			 * Adds an pattern to highlight languages embedded in HTML attributes.
			 *
			 * An example of an inlined language is CSS with `style` attributes.
			 *
			 * @param {string} attrName The name of the tag that contains the inlined language. This name will be treated as
			 * case insensitive.
			 * @param {string} lang The language key.
			 * @example
			 * addAttribute('style', 'css');
			 */
			value: function (attrName, lang) {
				Prism.languages.markup.tag.inside['special-attr'].push({
					pattern: RegExp(
						/(^|["'\s])/.source + '(?:' + attrName + ')' + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
						'i'
					),
					lookbehind: true,
					inside: {
						'attr-name': /^[^\s=]+/,
						'attr-value': {
							pattern: /=[\s\S]+/,
							inside: {
								'value': {
									pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
									lookbehind: true,
									alias: [lang, 'language-' + lang],
									inside: Prism.languages[lang]
								},
								'punctuation': [
									{
										pattern: /^=/,
										alias: 'attr-equals'
									},
									/"|'/
								]
							}
						}
					}
				});
			}
		});

		Prism.languages.html = Prism.languages.markup;
		Prism.languages.mathml = Prism.languages.markup;
		Prism.languages.svg = Prism.languages.markup;

		Prism.languages.xml = Prism.languages.extend('markup', {});
		Prism.languages.ssml = Prism.languages.xml;
		Prism.languages.atom = Prism.languages.xml;
		Prism.languages.rss = Prism.languages.xml;


		/* **********************************************
		     Begin prism-css.js
		********************************************** */

		(function (Prism) {

			var string = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;

			Prism.languages.css = {
				'comment': /\/\*[\s\S]*?\*\//,
				'atrule': {
					pattern: RegExp('@[\\w-](?:' + /[^;{\s"']|\s+(?!\s)/.source + '|' + string.source + ')*?' + /(?:;|(?=\s*\{))/.source),
					inside: {
						'rule': /^@[\w-]+/,
						'selector-function-argument': {
							pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
							lookbehind: true,
							alias: 'selector'
						},
						'keyword': {
							pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
							lookbehind: true
						}
						// See rest below
					}
				},
				'url': {
					// https://drafts.csswg.org/css-values-3/#urls
					pattern: RegExp('\\burl\\((?:' + string.source + '|' + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ')\\)', 'i'),
					greedy: true,
					inside: {
						'function': /^url/i,
						'punctuation': /^\(|\)$/,
						'string': {
							pattern: RegExp('^' + string.source + '$'),
							alias: 'url'
						}
					}
				},
				'selector': {
					pattern: RegExp('(^|[{}\\s])[^{}\\s](?:[^{};"\'\\s]|\\s+(?![\\s{])|' + string.source + ')*(?=\\s*\\{)'),
					lookbehind: true
				},
				'string': {
					pattern: string,
					greedy: true
				},
				'property': {
					pattern: /(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
					lookbehind: true
				},
				'important': /!important\b/i,
				'function': {
					pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,
					lookbehind: true
				},
				'punctuation': /[(){};:,]/
			};

			Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

			var markup = Prism.languages.markup;
			if (markup) {
				markup.tag.addInlined('style', 'css');
				markup.tag.addAttribute('style', 'css');
			}

		}(Prism));


		/* **********************************************
		     Begin prism-clike.js
		********************************************** */

		Prism.languages.clike = {
			'comment': [
				{
					pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
					lookbehind: true,
					greedy: true
				},
				{
					pattern: /(^|[^\\:])\/\/.*/,
					lookbehind: true,
					greedy: true
				}
			],
			'string': {
				pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
				greedy: true
			},
			'class-name': {
				pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
				lookbehind: true,
				inside: {
					'punctuation': /[.\\]/
				}
			},
			'keyword': /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
			'boolean': /\b(?:false|true)\b/,
			'function': /\b\w+(?=\()/,
			'number': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
			'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
			'punctuation': /[{}[\];(),.:]/
		};


		/* **********************************************
		     Begin prism-javascript.js
		********************************************** */

		Prism.languages.javascript = Prism.languages.extend('clike', {
			'class-name': [
				Prism.languages.clike['class-name'],
				{
					pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,
					lookbehind: true
				}
			],
			'keyword': [
				{
					pattern: /((?:^|\})\s*)catch\b/,
					lookbehind: true
				},
				{
					pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
					lookbehind: true
				},
			],
			// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
			'function': /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
			'number': {
				pattern: RegExp(
					/(^|[^\w$])/.source +
					'(?:' +
					(
						// constant
						/NaN|Infinity/.source +
						'|' +
						// binary integer
						/0[bB][01]+(?:_[01]+)*n?/.source +
						'|' +
						// octal integer
						/0[oO][0-7]+(?:_[0-7]+)*n?/.source +
						'|' +
						// hexadecimal integer
						/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source +
						'|' +
						// decimal bigint
						/\d+(?:_\d+)*n/.source +
						'|' +
						// decimal number (integer or float) but no bigint
						/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source
					) +
					')' +
					/(?![\w$])/.source
				),
				lookbehind: true
			},
			'operator': /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
		});

		Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/;

		Prism.languages.insertBefore('javascript', 'keyword', {
			'regex': {
				pattern: RegExp(
					// lookbehind
					// eslint-disable-next-line regexp/no-dupe-characters-character-class
					/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source +
					// Regex pattern:
					// There are 2 regex patterns here. The RegExp set notation proposal added support for nested character
					// classes if the `v` flag is present. Unfortunately, nested CCs are both context-free and incompatible
					// with the only syntax, so we have to define 2 different regex patterns.
					/\//.source +
					'(?:' +
					/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source +
					'|' +
					// `v` flag syntax. This supports 3 levels of nested character classes.
					/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source +
					')' +
					// lookahead
					/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source
				),
				lookbehind: true,
				greedy: true,
				inside: {
					'regex-source': {
						pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
						lookbehind: true,
						alias: 'language-regex',
						inside: Prism.languages.regex
					},
					'regex-delimiter': /^\/|\/$/,
					'regex-flags': /^[a-z]+$/,
				}
			},
			// This must be declared before keyword because we use "function" inside the look-forward
			'function-variable': {
				pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
				alias: 'function'
			},
			'parameter': [
				{
					pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
					lookbehind: true,
					inside: Prism.languages.javascript
				},
				{
					pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
					lookbehind: true,
					inside: Prism.languages.javascript
				},
				{
					pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
					lookbehind: true,
					inside: Prism.languages.javascript
				},
				{
					pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
					lookbehind: true,
					inside: Prism.languages.javascript
				}
			],
			'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
		});

		Prism.languages.insertBefore('javascript', 'string', {
			'hashbang': {
				pattern: /^#!.*/,
				greedy: true,
				alias: 'comment'
			},
			'template-string': {
				pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
				greedy: true,
				inside: {
					'template-punctuation': {
						pattern: /^`|`$/,
						alias: 'string'
					},
					'interpolation': {
						pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
						lookbehind: true,
						inside: {
							'interpolation-punctuation': {
								pattern: /^\$\{|\}$/,
								alias: 'punctuation'
							},
							rest: Prism.languages.javascript
						}
					},
					'string': /[\s\S]+/
				}
			},
			'string-property': {
				pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,
				lookbehind: true,
				greedy: true,
				alias: 'property'
			}
		});

		Prism.languages.insertBefore('javascript', 'operator', {
			'literal-property': {
				pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
				lookbehind: true,
				alias: 'property'
			},
		});

		if (Prism.languages.markup) {
			Prism.languages.markup.tag.addInlined('script', 'javascript');

			// add attribute support for all DOM events.
			// https://developer.mozilla.org/en-US/docs/Web/Events#Standard_events
			Prism.languages.markup.tag.addAttribute(
				/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,
				'javascript'
			);
		}

		Prism.languages.js = Prism.languages.javascript;


		/* **********************************************
		     Begin prism-file-highlight.js
		********************************************** */

		(function () {

			if (typeof Prism === 'undefined' || typeof document === 'undefined') {
				return;
			}

			// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
			if (!Element.prototype.matches) {
				Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
			}

			var LOADING_MESSAGE = 'Loading…';
			var FAILURE_MESSAGE = function (status, message) {
				return '✖ Error ' + status + ' while fetching file: ' + message;
			};
			var FAILURE_EMPTY_MESSAGE = '✖ Error: File does not exist or is empty';

			var EXTENSIONS = {
				'js': 'javascript',
				'py': 'python',
				'rb': 'ruby',
				'ps1': 'powershell',
				'psm1': 'powershell',
				'sh': 'bash',
				'bat': 'batch',
				'h': 'c',
				'tex': 'latex'
			};

			var STATUS_ATTR = 'data-src-status';
			var STATUS_LOADING = 'loading';
			var STATUS_LOADED = 'loaded';
			var STATUS_FAILED = 'failed';

			var SELECTOR = 'pre[data-src]:not([' + STATUS_ATTR + '="' + STATUS_LOADED + '"])'
				+ ':not([' + STATUS_ATTR + '="' + STATUS_LOADING + '"])';

			/**
			 * Loads the given file.
			 *
			 * @param {string} src The URL or path of the source file to load.
			 * @param {(result: string) => void} success
			 * @param {(reason: string) => void} error
			 */
			function loadFile(src, success, error) {
				var xhr = new XMLHttpRequest();
				xhr.open('GET', src, true);
				xhr.onreadystatechange = function () {
					if (xhr.readyState == 4) {
						if (xhr.status < 400 && xhr.responseText) {
							success(xhr.responseText);
						} else {
							if (xhr.status >= 400) {
								error(FAILURE_MESSAGE(xhr.status, xhr.statusText));
							} else {
								error(FAILURE_EMPTY_MESSAGE);
							}
						}
					}
				};
				xhr.send(null);
			}

			/**
			 * Parses the given range.
			 *
			 * This returns a range with inclusive ends.
			 *
			 * @param {string | null | undefined} range
			 * @returns {[number, number | undefined] | undefined}
			 */
			function parseRange(range) {
				var m = /^\s*(\d+)\s*(?:(,)\s*(?:(\d+)\s*)?)?$/.exec(range || '');
				if (m) {
					var start = Number(m[1]);
					var comma = m[2];
					var end = m[3];

					if (!comma) {
						return [start, start];
					}
					if (!end) {
						return [start, undefined];
					}
					return [start, Number(end)];
				}
				return undefined;
			}

			Prism.hooks.add('before-highlightall', function (env) {
				env.selector += ', ' + SELECTOR;
			});

			Prism.hooks.add('before-sanity-check', function (env) {
				var pre = /** @type {HTMLPreElement} */ (env.element);
				if (pre.matches(SELECTOR)) {
					env.code = ''; // fast-path the whole thing and go to complete

					pre.setAttribute(STATUS_ATTR, STATUS_LOADING); // mark as loading

					// add code element with loading message
					var code = pre.appendChild(document.createElement('CODE'));
					code.textContent = LOADING_MESSAGE;

					var src = pre.getAttribute('data-src');

					var language = env.language;
					if (language === 'none') {
						// the language might be 'none' because there is no language set;
						// in this case, we want to use the extension as the language
						var extension = (/\.(\w+)$/.exec(src) || [, 'none'])[1];
						language = EXTENSIONS[extension] || extension;
					}

					// set language classes
					Prism.util.setLanguage(code, language);
					Prism.util.setLanguage(pre, language);

					// preload the language
					var autoloader = Prism.plugins.autoloader;
					if (autoloader) {
						autoloader.loadLanguages(language);
					}

					// load file
					loadFile(
						src,
						function (text) {
							// mark as loaded
							pre.setAttribute(STATUS_ATTR, STATUS_LOADED);

							// handle data-range
							var range = parseRange(pre.getAttribute('data-range'));
							if (range) {
								var lines = text.split(/\r\n?|\n/g);

								// the range is one-based and inclusive on both ends
								var start = range[0];
								var end = range[1] == null ? lines.length : range[1];

								if (start < 0) { start += lines.length; }
								start = Math.max(0, Math.min(start - 1, lines.length));
								if (end < 0) { end += lines.length; }
								end = Math.max(0, Math.min(end, lines.length));

								text = lines.slice(start, end).join('\n');

								// add data-start for line numbers
								if (!pre.hasAttribute('data-start')) {
									pre.setAttribute('data-start', String(start + 1));
								}
							}

							// highlight code
							code.textContent = text;
							Prism.highlightElement(code);
						},
						function (error) {
							// mark as failed
							pre.setAttribute(STATUS_ATTR, STATUS_FAILED);

							code.textContent = error;
						}
					);
				}
			});

			Prism.plugins.fileHighlight = {
				/**
				 * Executes the File Highlight plugin for all matching `pre` elements under the given container.
				 *
				 * Note: Elements which are already loaded or currently loading will not be touched by this method.
				 *
				 * @param {ParentNode} [container=document]
				 */
				highlight: function highlight(container) {
					var elements = (container || document).querySelectorAll(SELECTOR);

					for (var i = 0, element; (element = elements[i++]);) {
						Prism.highlightElement(element);
					}
				}
			};

			var logged = false;
			/** @deprecated Use `Prism.plugins.fileHighlight.highlight` instead. */
			Prism.fileHighlight = function () {
				if (!logged) {
					console.warn('Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead.');
					logged = true;
				}
				Prism.plugins.fileHighlight.highlight.apply(this, arguments);
			};

		}()); 
	} (prism));

	var prismExports = prism.exports;
	var Prism$1 = /*@__PURE__*/getDefaultExportFromCjs(prismExports);

	Prism.languages.javascript = Prism.languages.extend('clike', {
		'class-name': [
			Prism.languages.clike['class-name'],
			{
				pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,
				lookbehind: true
			}
		],
		'keyword': [
			{
				pattern: /((?:^|\})\s*)catch\b/,
				lookbehind: true
			},
			{
				pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
				lookbehind: true
			},
		],
		// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
		'function': /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
		'number': {
			pattern: RegExp(
				/(^|[^\w$])/.source +
				'(?:' +
				(
					// constant
					/NaN|Infinity/.source +
					'|' +
					// binary integer
					/0[bB][01]+(?:_[01]+)*n?/.source +
					'|' +
					// octal integer
					/0[oO][0-7]+(?:_[0-7]+)*n?/.source +
					'|' +
					// hexadecimal integer
					/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source +
					'|' +
					// decimal bigint
					/\d+(?:_\d+)*n/.source +
					'|' +
					// decimal number (integer or float) but no bigint
					/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source
				) +
				')' +
				/(?![\w$])/.source
			),
			lookbehind: true
		},
		'operator': /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
	});

	Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/;

	Prism.languages.insertBefore('javascript', 'keyword', {
		'regex': {
			pattern: RegExp(
				// lookbehind
				// eslint-disable-next-line regexp/no-dupe-characters-character-class
				/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source +
				// Regex pattern:
				// There are 2 regex patterns here. The RegExp set notation proposal added support for nested character
				// classes if the `v` flag is present. Unfortunately, nested CCs are both context-free and incompatible
				// with the only syntax, so we have to define 2 different regex patterns.
				/\//.source +
				'(?:' +
				/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source +
				'|' +
				// `v` flag syntax. This supports 3 levels of nested character classes.
				/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source +
				')' +
				// lookahead
				/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source
			),
			lookbehind: true,
			greedy: true,
			inside: {
				'regex-source': {
					pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
					lookbehind: true,
					alias: 'language-regex',
					inside: Prism.languages.regex
				},
				'regex-delimiter': /^\/|\/$/,
				'regex-flags': /^[a-z]+$/,
			}
		},
		// This must be declared before keyword because we use "function" inside the look-forward
		'function-variable': {
			pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
			alias: 'function'
		},
		'parameter': [
			{
				pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
				lookbehind: true,
				inside: Prism.languages.javascript
			},
			{
				pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
				lookbehind: true,
				inside: Prism.languages.javascript
			},
			{
				pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
				lookbehind: true,
				inside: Prism.languages.javascript
			},
			{
				pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
				lookbehind: true,
				inside: Prism.languages.javascript
			}
		],
		'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
	});

	Prism.languages.insertBefore('javascript', 'string', {
		'hashbang': {
			pattern: /^#!.*/,
			greedy: true,
			alias: 'comment'
		},
		'template-string': {
			pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
			greedy: true,
			inside: {
				'template-punctuation': {
					pattern: /^`|`$/,
					alias: 'string'
				},
				'interpolation': {
					pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
					lookbehind: true,
					inside: {
						'interpolation-punctuation': {
							pattern: /^\$\{|\}$/,
							alias: 'punctuation'
						},
						rest: Prism.languages.javascript
					}
				},
				'string': /[\s\S]+/
			}
		},
		'string-property': {
			pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,
			lookbehind: true,
			greedy: true,
			alias: 'property'
		}
	});

	Prism.languages.insertBefore('javascript', 'operator', {
		'literal-property': {
			pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
			lookbehind: true,
			alias: 'property'
		},
	});

	if (Prism.languages.markup) {
		Prism.languages.markup.tag.addInlined('script', 'javascript');

		// add attribute support for all DOM events.
		// https://developer.mozilla.org/en-US/docs/Web/Events#Standard_events
		Prism.languages.markup.tag.addAttribute(
			/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,
			'javascript'
		);
	}

	Prism.languages.js = Prism.languages.javascript;

	/* src\App.svelte generated by Svelte v4.2.20 */

	const { console: console_1 } = globals;
	const file = "src\\App.svelte";

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[44] = list[i];
		return child_ctx;
	}

	function get_each_context_1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[47] = list[i];
		return child_ctx;
	}

	function get_each_context_2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[50] = list[i];
		return child_ctx;
	}

	function get_each_context_3(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[47] = list[i];
		return child_ctx;
	}

	// (268:8) {#if activeTab==='all'}
	function create_if_block_5(ctx) {
		let if_block_anchor;

		function select_block_type(ctx, dirty) {
			if (/*docs*/ ctx[2].length === 0) return create_if_block_6;
			return create_else_block_2;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type(ctx);

		const block = {
			c: function create() {
				if_block.c();
				if_block_anchor = empty();
			},
			m: function mount(target, anchor) {
				if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
			},
			p: function update(ctx, dirty) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if_block.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_5.name,
			type: "if",
			source: "(268:8) {#if activeTab==='all'}",
			ctx
		});

		return block;
	}

	// (271:10) {:else}
	function create_else_block_2(ctx) {
		let ul;
		let each_value_3 = ensure_array_like_dev(/*docs*/ ctx[2].sort(func));
		let each_blocks = [];

		for (let i = 0; i < each_value_3.length; i += 1) {
			each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
		}

		const block = {
			c: function create() {
				ul = element("ul");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(ul, "class", "list-group flex-grow-1 overflow-auto min-0 svelte-nbi03a");
				add_location(ul, file, 271, 12, 8794);
			},
			m: function mount(target, anchor) {
				insert_dev(target, ul, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(ul, null);
					}
				}
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*darkMode, deleteDoc, docs, editDoc*/ 24596) {
					each_value_3 = ensure_array_like_dev(/*docs*/ ctx[2].sort(func));
					let i;

					for (i = 0; i < each_value_3.length; i += 1) {
						const child_ctx = get_each_context_3(ctx, each_value_3, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block_3(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value_3.length;
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(ul);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block_2.name,
			type: "else",
			source: "(271:10) {:else}",
			ctx
		});

		return block;
	}

	// (269:10) {#if docs.length === 0}
	function create_if_block_6(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element("div");
				div.textContent = "No documents available. Save a document to get started.";
				attr_dev(div, "class", "alert alert-info text-center");
				add_location(div, file, 269, 12, 8660);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_6.name,
			type: "if",
			source: "(269:10) {#if docs.length === 0}",
			ctx
		});

		return block;
	}

	// (273:14) {#each docs.sort((a,b)=>a.title.localeCompare(b.title)) as doc}
	function create_each_block_3(ctx) {
		let li;
		let div;
		let strong;
		let t0_value = /*doc*/ ctx[47].title + "";
		let t0;
		let br;
		let t1;
		let small;
		let t2_value = new Date(/*doc*/ ctx[47].lastModified).toLocaleString() + "";
		let t2;
		let t3;
		let span;
		let button0;
		let i0;
		let t4;
		let button1;
		let i1;
		let t5;
		let mounted;
		let dispose;

		function click_handler_3() {
			return /*click_handler_3*/ ctx[24](/*doc*/ ctx[47]);
		}

		function click_handler_4() {
			return /*click_handler_4*/ ctx[25](/*doc*/ ctx[47]);
		}

		const block = {
			c: function create() {
				li = element("li");
				div = element("div");
				strong = element("strong");
				t0 = text(t0_value);
				br = element("br");
				t1 = space();
				small = element("small");
				t2 = text(t2_value);
				t3 = space();
				span = element("span");
				button0 = element("button");
				i0 = element("i");
				t4 = space();
				button1 = element("button");
				i1 = element("i");
				t5 = space();
				add_location(strong, file, 276, 20, 9140);
				add_location(br, file, 276, 48, 9168);
				attr_dev(small, "class", "last-modified");
				toggle_class(small, "text-light", /*darkMode*/ ctx[4]);
				add_location(small, file, 277, 20, 9193);
				add_location(div, file, 275, 18, 9114);
				attr_dev(i0, "class", "bi bi-pencil-fill");
				add_location(i0, file, 281, 22, 9490);
				attr_dev(button0, "class", "btn btn-sm btn-outline-primary me-1");
				attr_dev(button0, "title", "Edit");
				add_location(button0, file, 280, 20, 9374);
				attr_dev(i1, "class", "bi bi-trash-fill");
				add_location(i1, file, 284, 22, 9688);
				attr_dev(button1, "class", "btn btn-sm btn-outline-danger");
				attr_dev(button1, "title", "Delete");
				add_location(button1, file, 283, 20, 9574);
				add_location(span, file, 279, 18, 9347);
				attr_dev(li, "class", "list-group-item d-flex justify-content-between align-items-center");
				toggle_class(li, "bg-dark", /*darkMode*/ ctx[4]);
				toggle_class(li, "text-light", /*darkMode*/ ctx[4]);
				add_location(li, file, 273, 16, 8944);
			},
			m: function mount(target, anchor) {
				insert_dev(target, li, anchor);
				append_dev(li, div);
				append_dev(div, strong);
				append_dev(strong, t0);
				append_dev(div, br);
				append_dev(div, t1);
				append_dev(div, small);
				append_dev(small, t2);
				append_dev(li, t3);
				append_dev(li, span);
				append_dev(span, button0);
				append_dev(button0, i0);
				append_dev(span, t4);
				append_dev(span, button1);
				append_dev(button1, i1);
				append_dev(li, t5);

				if (!mounted) {
					dispose = [
						listen_dev(button0, "click", click_handler_3, false, false, false, false),
						listen_dev(button1, "click", click_handler_4, false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty[0] & /*docs*/ 4 && t0_value !== (t0_value = /*doc*/ ctx[47].title + "")) set_data_dev(t0, t0_value);
				if (dirty[0] & /*docs*/ 4 && t2_value !== (t2_value = new Date(/*doc*/ ctx[47].lastModified).toLocaleString() + "")) set_data_dev(t2, t2_value);

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(small, "text-light", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(li, "bg-dark", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(li, "text-light", /*darkMode*/ ctx[4]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(li);
				}

				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_3.name,
			type: "each",
			source: "(273:14) {#each docs.sort((a,b)=>a.title.localeCompare(b.title)) as doc}",
			ctx
		});

		return block;
	}

	// (295:8) {#if activeTab==='search'}
	function create_if_block_3(ctx) {
		let if_block_anchor;

		function select_block_type_1(ctx, dirty) {
			if (/*searchResults*/ ctx[6].length === 0) return create_if_block_4;
			return create_else_block_1;
		}

		let current_block_type = select_block_type_1(ctx);
		let if_block = current_block_type(ctx);

		const block = {
			c: function create() {
				if_block.c();
				if_block_anchor = empty();
			},
			m: function mount(target, anchor) {
				if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
			},
			p: function update(ctx, dirty) {
				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if_block.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_3.name,
			type: "if",
			source: "(295:8) {#if activeTab==='search'}",
			ctx
		});

		return block;
	}

	// (298:10) {:else}
	function create_else_block_1(ctx) {
		let ul;
		let each_value_2 = ensure_array_like_dev(/*searchResults*/ ctx[6]);
		let each_blocks = [];

		for (let i = 0; i < each_value_2.length; i += 1) {
			each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
		}

		const block = {
			c: function create() {
				ul = element("ul");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(ul, "class", "list-group flex-grow-1 overflow-auto min-0 svelte-nbi03a");
				add_location(ul, file, 298, 12, 10089);
			},
			m: function mount(target, anchor) {
				insert_dev(target, ul, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(ul, null);
					}
				}
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*darkMode, editDoc, searchResults*/ 8272) {
					each_value_2 = ensure_array_like_dev(/*searchResults*/ ctx[6]);
					let i;

					for (i = 0; i < each_value_2.length; i += 1) {
						const child_ctx = get_each_context_2(ctx, each_value_2, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block_2(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value_2.length;
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(ul);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block_1.name,
			type: "else",
			source: "(298:10) {:else}",
			ctx
		});

		return block;
	}

	// (296:10) {#if searchResults.length === 0}
	function create_if_block_4(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element("div");
				div.textContent = "No search results.";
				attr_dev(div, "class", "alert alert-info text-center");
				add_location(div, file, 296, 12, 9992);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_4.name,
			type: "if",
			source: "(296:10) {#if searchResults.length === 0}",
			ctx
		});

		return block;
	}

	// (300:14) {#each searchResults as r}
	function create_each_block_2(ctx) {
		let li;
		let div;
		let strong;
		let t0_value = /*r*/ ctx[50].title + "";
		let t0;
		let br;
		let t1;
		let small;
		let t2;
		let t3_value = /*r*/ ctx[50].score.toFixed(3) + "";
		let t3;
		let t4;
		let span;
		let button;
		let i;
		let t5;
		let mounted;
		let dispose;

		function click_handler_5() {
			return /*click_handler_5*/ ctx[26](/*r*/ ctx[50]);
		}

		const block = {
			c: function create() {
				li = element("li");
				div = element("div");
				strong = element("strong");
				t0 = text(t0_value);
				br = element("br");
				t1 = space();
				small = element("small");
				t2 = text("Score: ");
				t3 = text(t3_value);
				t4 = space();
				span = element("span");
				button = element("button");
				i = element("i");
				t5 = space();
				add_location(strong, file, 303, 20, 10398);
				add_location(br, file, 303, 46, 10424);
				attr_dev(small, "class", "score-text");
				toggle_class(small, "text-light", /*darkMode*/ ctx[4]);
				add_location(small, file, 304, 20, 10449);
				add_location(div, file, 302, 18, 10372);
				attr_dev(i, "class", "bi bi-pencil-fill");
				add_location(i, file, 308, 22, 10718);
				attr_dev(button, "class", "btn btn-sm btn-outline-primary");
				attr_dev(button, "title", "Edit");
				add_location(button, file, 307, 20, 10609);
				add_location(span, file, 306, 18, 10582);
				attr_dev(li, "class", "list-group-item d-flex justify-content-between align-items-center");
				toggle_class(li, "bg-dark", /*darkMode*/ ctx[4]);
				toggle_class(li, "text-light", /*darkMode*/ ctx[4]);
				add_location(li, file, 300, 16, 10202);
			},
			m: function mount(target, anchor) {
				insert_dev(target, li, anchor);
				append_dev(li, div);
				append_dev(div, strong);
				append_dev(strong, t0);
				append_dev(div, br);
				append_dev(div, t1);
				append_dev(div, small);
				append_dev(small, t2);
				append_dev(small, t3);
				append_dev(li, t4);
				append_dev(li, span);
				append_dev(span, button);
				append_dev(button, i);
				append_dev(li, t5);

				if (!mounted) {
					dispose = listen_dev(button, "click", click_handler_5, false, false, false, false);
					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty[0] & /*searchResults*/ 64 && t0_value !== (t0_value = /*r*/ ctx[50].title + "")) set_data_dev(t0, t0_value);
				if (dirty[0] & /*searchResults*/ 64 && t3_value !== (t3_value = /*r*/ ctx[50].score.toFixed(3) + "")) set_data_dev(t3, t3_value);

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(small, "text-light", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(li, "bg-dark", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(li, "text-light", /*darkMode*/ ctx[4]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(li);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_2.name,
			type: "each",
			source: "(300:14) {#each searchResults as r}",
			ctx
		});

		return block;
	}

	// (328:8) {#if dirty}
	function create_if_block_2(ctx) {
		let div;
		let small;

		const block = {
			c: function create() {
				div = element("div");
				small = element("small");
				small.textContent = "⚠ Unsaved changes…";
				add_location(small, file, 328, 41, 11470);
				attr_dev(div, "class", "text-warning mt-1");
				add_location(div, file, 328, 10, 11439);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, small);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2.name,
			type: "if",
			source: "(328:8) {#if dirty}",
			ctx
		});

		return block;
	}

	// (369:14) {:else}
	function create_else_block(ctx) {
		let div;
		let strong;
		let t1;
		let html_tag;
		let raw_value = marked.parse(/*c*/ ctx[44].text) + "";
		let t2;
		let if_block = /*c*/ ctx[44].docIds?.length && create_if_block_1(ctx);

		const block = {
			c: function create() {
				div = element("div");
				strong = element("strong");
				strong.textContent = "Assistant:";
				t1 = space();
				html_tag = new HtmlTag(false);
				t2 = space();
				if (if_block) if_block.c();
				add_location(strong, file, 370, 18, 13528);
				html_tag.a = t2;
				attr_dev(div, "class", "p-2 border rounded d-inline-block ...");
				add_location(div, file, 369, 16, 13458);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, strong);
				append_dev(div, t1);
				html_tag.m(raw_value, div);
				append_dev(div, t2);
				if (if_block) if_block.m(div, null);
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*chatMessages*/ 1024 && raw_value !== (raw_value = marked.parse(/*c*/ ctx[44].text) + "")) html_tag.p(raw_value);

				if (/*c*/ ctx[44].docIds?.length) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block_1(ctx);
						if_block.c();
						if_block.m(div, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if (if_block) if_block.d();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block.name,
			type: "else",
			source: "(369:14) {:else}",
			ctx
		});

		return block;
	}

	// (363:14) {#if c.role === 'user'}
	function create_if_block(ctx) {
		let div;
		let strong;
		let t1;
		let t2_value = /*c*/ ctx[44].text + "";
		let t2;

		const block = {
			c: function create() {
				div = element("div");
				strong = element("strong");
				strong.textContent = "You:";
				t1 = space();
				t2 = text(t2_value);
				add_location(strong, file, 366, 18, 13366);
				attr_dev(div, "class", "p-2 border rounded d-inline-block");
				toggle_class(div, "bg-primary", !/*darkMode*/ ctx[4]);
				toggle_class(div, "text-white", !/*darkMode*/ ctx[4]);
				toggle_class(div, "bg-dark", /*darkMode*/ ctx[4]);
				toggle_class(div, "text-light", /*darkMode*/ ctx[4]);
				add_location(div, file, 363, 16, 13149);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, strong);
				append_dev(div, t1);
				append_dev(div, t2);
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*chatMessages*/ 1024 && t2_value !== (t2_value = /*c*/ ctx[44].text + "")) set_data_dev(t2, t2_value);

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(div, "bg-primary", !/*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(div, "text-white", !/*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(div, "bg-dark", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(div, "text-light", /*darkMode*/ ctx[4]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block.name,
			type: "if",
			source: "(363:14) {#if c.role === 'user'}",
			ctx
		});

		return block;
	}

	// (372:20) {#if c.docIds?.length}
	function create_if_block_1(ctx) {
		let div;
		let each_value_1 = ensure_array_like_dev(/*c*/ ctx[44].docIds);
		let each_blocks = [];

		for (let i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
		}

		const block = {
			c: function create() {
				div = element("div");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(div, "class", "mt-1");
				add_location(div, file, 372, 22, 13650);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(div, null);
					}
				}
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*openDocById, chatMessages*/ 132096) {
					each_value_1 = ensure_array_like_dev(/*c*/ ctx[44].docIds);
					let i;

					for (i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block_1(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value_1.length;
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1.name,
			type: "if",
			source: "(372:20) {#if c.docIds?.length}",
			ctx
		});

		return block;
	}

	// (374:24) {#each c.docIds as doc}
	function create_each_block_1(ctx) {
		let button;
		let t0;
		let t1_value = /*doc*/ ctx[47].title + "";
		let t1;
		let t2;
		let mounted;
		let dispose;

		function click_handler_7() {
			return /*click_handler_7*/ ctx[30](/*doc*/ ctx[47]);
		}

		const block = {
			c: function create() {
				button = element("button");
				t0 = text("Open \"");
				t1 = text(t1_value);
				t2 = text("\"\n                          ");
				attr_dev(button, "class", "btn btn-sm btn-outline-info me-1");
				add_location(button, file, 374, 26, 13743);
			},
			m: function mount(target, anchor) {
				insert_dev(target, button, anchor);
				append_dev(button, t0);
				append_dev(button, t1);
				append_dev(button, t2);

				if (!mounted) {
					dispose = listen_dev(button, "click", click_handler_7, false, false, false, false);
					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty[0] & /*chatMessages*/ 1024 && t1_value !== (t1_value = /*doc*/ ctx[47].title + "")) set_data_dev(t1, t1_value);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(button);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_1.name,
			type: "each",
			source: "(374:24) {#each c.docIds as doc}",
			ctx
		});

		return block;
	}

	// (361:10) {#each chatMessages as c}
	function create_each_block(ctx) {
		let div;
		let t;
		let div_class_value;

		function select_block_type_2(ctx, dirty) {
			if (/*c*/ ctx[44].role === 'user') return create_if_block;
			return create_else_block;
		}

		let current_block_type = select_block_type_2(ctx);
		let if_block = current_block_type(ctx);

		const block = {
			c: function create() {
				div = element("div");
				if_block.c();
				t = space();

				attr_dev(div, "class", div_class_value = /*c*/ ctx[44].role === 'user'
				? 'text-end mb-2'
				: 'text-start mb-2');

				add_location(div, file, 361, 12, 13025);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				if_block.m(div, null);
				append_dev(div, t);
			},
			p: function update(ctx, dirty) {
				if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(div, t);
					}
				}

				if (dirty[0] & /*chatMessages*/ 1024 && div_class_value !== (div_class_value = /*c*/ ctx[44].role === 'user'
				? 'text-end mb-2'
				: 'text-start mb-2')) {
					attr_dev(div, "class", div_class_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if_block.d();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(361:10) {#each chatMessages as c}",
			ctx
		});

		return block;
	}

	function create_fragment(ctx) {
		let link;
		let t0;
		let div15;
		let header;
		let h1;
		let t2;
		let div0;
		let button0;
		let t3_value = (/*darkMode*/ ctx[4] ? 'Light Mode' : 'Dark Mode') + "";
		let t3;
		let t4;
		let div14;
		let div8;
		let div2;
		let ul;
		let li0;
		let a0;
		let t6;
		let li1;
		let a1;
		let t8;
		let div1;
		let input0;
		let t9;
		let button1;
		let t11;
		let t12;
		let t13;
		let div5;
		let div3;
		let label;
		let t15;
		let input1;
		let t16;
		let t17;
		let div4;
		let button2;
		let t19;
		let button3;
		let t21;
		let textarea;
		let t22;
		let div7;
		let div6;
		let raw_value = marked.parse(/*content*/ ctx[1] || '') + "";
		let t23;
		let div9;
		let t24;
		let div13;
		let div12;
		let h5;
		let t26;
		let div10;
		let t27;
		let div11;
		let input2;
		let t28;
		let button4;
		let mounted;
		let dispose;
		let if_block0 = /*activeTab*/ ctx[8] === 'all' && create_if_block_5(ctx);
		let if_block1 = /*activeTab*/ ctx[8] === 'search' && create_if_block_3(ctx);
		let if_block2 = /*dirty*/ ctx[7] && create_if_block_2(ctx);
		let each_value = ensure_array_like_dev(/*chatMessages*/ ctx[10]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				link = element("link");
				t0 = space();
				div15 = element("div");
				header = element("header");
				h1 = element("h1");
				h1.textContent = "My Notes";
				t2 = space();
				div0 = element("div");
				button0 = element("button");
				t3 = text(t3_value);
				t4 = space();
				div14 = element("div");
				div8 = element("div");
				div2 = element("div");
				ul = element("ul");
				li0 = element("li");
				a0 = element("a");
				a0.textContent = "All Files";
				t6 = space();
				li1 = element("li");
				a1 = element("a");
				a1.textContent = "Search Results";
				t8 = space();
				div1 = element("div");
				input0 = element("input");
				t9 = space();
				button1 = element("button");
				button1.textContent = "Go";
				t11 = space();
				if (if_block0) if_block0.c();
				t12 = space();
				if (if_block1) if_block1.c();
				t13 = space();
				div5 = element("div");
				div3 = element("div");
				label = element("label");
				label.textContent = "Document Title";
				t15 = space();
				input1 = element("input");
				t16 = space();
				if (if_block2) if_block2.c();
				t17 = space();
				div4 = element("div");
				button2 = element("button");
				button2.textContent = "Save";
				t19 = space();
				button3 = element("button");
				button3.textContent = "Clear";
				t21 = space();
				textarea = element("textarea");
				t22 = space();
				div7 = element("div");
				div6 = element("div");
				t23 = space();
				div9 = element("div");
				t24 = space();
				div13 = element("div");
				div12 = element("div");
				h5 = element("h5");
				h5.textContent = "Chat with your notes";
				t26 = space();
				div10 = element("div");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t27 = space();
				div11 = element("div");
				input2 = element("input");
				t28 = space();
				button4 = element("button");
				button4.textContent = "Send";
				attr_dev(link, "rel", "stylesheet");
				attr_dev(link, "href", "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css");
				add_location(link, file, 211, 0, 6323);
				attr_dev(h1, "class", "m-0");
				add_location(h1, file, 218, 4, 6772);
				attr_dev(button0, "class", "btn btn-outline-secondary");
				add_location(button0, file, 222, 6, 6871);
				attr_dev(div0, "class", "mb-0 text-end");
				add_location(div0, file, 221, 4, 6837);
				attr_dev(header, "class", "d-flex justify-content-between align-items-center px-3 py-2 app-header svelte-nbi03a");
				toggle_class(header, "bg-dark", /*darkMode*/ ctx[4]);
				toggle_class(header, "text-light", /*darkMode*/ ctx[4]);
				add_location(header, file, 216, 2, 6617);
				attr_dev(a0, "href", "#");
				attr_dev(a0, "class", "nav-link");
				toggle_class(a0, "active", /*activeTab*/ ctx[8] === 'all');
				toggle_class(a0, "bg-dark", /*darkMode*/ ctx[4]);
				toggle_class(a0, "text-light", /*darkMode*/ ctx[4]);
				add_location(a0, file, 239, 12, 7613);
				attr_dev(li0, "class", "nav-item");
				add_location(li0, file, 238, 10, 7579);
				attr_dev(a1, "href", "#");
				attr_dev(a1, "class", "nav-link");
				toggle_class(a1, "active", /*activeTab*/ ctx[8] === 'search');
				toggle_class(a1, "bg-dark", /*darkMode*/ ctx[4]);
				toggle_class(a1, "text-light", /*darkMode*/ ctx[4]);
				add_location(a1, file, 249, 12, 7959);
				attr_dev(li1, "class", "nav-item");
				add_location(li1, file, 248, 10, 7925);
				attr_dev(ul, "class", "nav nav-tabs mb-2");
				set_style(ul, "border-bottom", "none");
				toggle_class(ul, "bg-dark", /*darkMode*/ ctx[4]);
				toggle_class(ul, "text-light", /*darkMode*/ ctx[4]);
				add_location(ul, file, 237, 8, 7457);
				attr_dev(input0, "class", "form-control form-control-sm");
				attr_dev(input0, "placeholder", "Search...");
				add_location(input0, file, 262, 10, 8360);
				attr_dev(button1, "class", "btn btn-sm btn-primary");
				add_location(button1, file, 263, 10, 8466);
				attr_dev(div1, "class", "input-group mb-2");
				add_location(div1, file, 261, 8, 8319);
				attr_dev(div2, "class", "col-panel file-list-panel border rounded p-2 d-flex flex-column min-0 svelte-nbi03a");
				toggle_class(div2, "bg-dark", /*darkMode*/ ctx[4]);
				toggle_class(div2, "text-light", /*darkMode*/ ctx[4]);
				add_location(div2, file, 233, 6, 7279);
				attr_dev(label, "for", "docTitle");
				attr_dev(label, "class", "form-label");
				toggle_class(label, "text-light", /*darkMode*/ ctx[4]);
				add_location(label, file, 322, 10, 11129);
				attr_dev(input1, "id", "docTitle");
				attr_dev(input1, "class", "form-control");
				attr_dev(input1, "placeholder", "Enter title...");
				toggle_class(input1, "bg-dark", /*darkMode*/ ctx[4]);
				toggle_class(input1, "text-light", /*darkMode*/ ctx[4]);
				add_location(input1, file, 323, 10, 11231);
				attr_dev(div3, "class", "mb-2");
				add_location(div3, file, 321, 8, 11100);
				attr_dev(button2, "class", "btn btn-primary flex-grow-1 svelte-nbi03a");
				add_location(button2, file, 332, 10, 11575);
				attr_dev(button3, "class", "btn btn-secondary flex-grow-1 svelte-nbi03a");
				add_location(button3, file, 333, 10, 11662);
				attr_dev(div4, "class", "mt-2 d-flex gap-2");
				add_location(div4, file, 331, 8, 11533);
				attr_dev(textarea, "class", "form-control flex-grow-1 min-0 svelte-nbi03a");
				set_style(textarea, "resize", "none");
				set_style(textarea, "overflow", "auto");
				toggle_class(textarea, "bg-dark", /*darkMode*/ ctx[4]);
				toggle_class(textarea, "text-light", /*darkMode*/ ctx[4]);
				add_location(textarea, file, 337, 8, 11915);
				attr_dev(div5, "class", "col-panel editor-panel border rounded p-2 d-flex flex-column min-0 svelte-nbi03a");
				toggle_class(div5, "bg-dark", /*darkMode*/ ctx[4]);
				toggle_class(div5, "text-light", /*darkMode*/ ctx[4]);
				add_location(div5, file, 319, 6, 10948);
				attr_dev(div6, "class", "flex-grow-1 overflow-auto min-0 svelte-nbi03a");
				add_location(div6, file, 344, 8, 12306);
				attr_dev(div7, "class", "col-panel preview-panel border rounded p-2 d-flex flex-column min-0 svelte-nbi03a");
				toggle_class(div7, "bg-dark", /*darkMode*/ ctx[4]);
				toggle_class(div7, "text-light", /*darkMode*/ ctx[4]);
				add_location(div7, file, 342, 6, 12153);
				attr_dev(div8, "class", "top-row d-flex w-100 min-0 svelte-nbi03a");
				add_location(div8, file, 231, 4, 7201);
				attr_dev(div9, "class", "resizer svelte-nbi03a");
				add_location(div9, file, 351, 4, 12471);
				attr_dev(h5, "class", "mb-2");
				add_location(h5, file, 356, 8, 12804);
				attr_dev(div10, "class", "chat-history flex-grow-1 overflow-auto border rounded p-2 min-0 svelte-nbi03a");
				add_location(div10, file, 359, 8, 12899);
				attr_dev(input2, "class", "form-control");
				attr_dev(input2, "placeholder", "Ask a question...");
				add_location(input2, file, 389, 10, 14254);
				attr_dev(button4, "class", "btn btn-primary");
				add_location(button4, file, 390, 10, 14398);
				attr_dev(div11, "class", "input-group mt-2 flex-shrink-0");
				add_location(div11, file, 388, 8, 14199);
				attr_dev(div12, "class", "col-12 border rounded p-2 d-flex flex-column min-0 svelte-nbi03a");
				toggle_class(div12, "bg-dark", /*darkMode*/ ctx[4]);
				toggle_class(div12, "text-light", /*darkMode*/ ctx[4]);
				add_location(div12, file, 355, 6, 12678);
				attr_dev(div13, "class", "bottom-row d-flex w-100 min-0 svelte-nbi03a");
				attr_dev(div13, "role", "region");
				attr_dev(div13, "aria-label", "chat panel");
				add_location(div13, file, 354, 4, 12590);
				attr_dev(div14, "class", "flex-grow-1 d-flex flex-column svelte-nbi03a");
				set_style(div14, "min-height", "0");
				add_location(div14, file, 229, 2, 7079);
				attr_dev(div15, "class", "container-fluid app-root p-2 svelte-nbi03a");
				toggle_class(div15, "bg-dark", /*darkMode*/ ctx[4]);
				toggle_class(div15, "text-light", /*darkMode*/ ctx[4]);
				add_location(div15, file, 214, 0, 6518);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, link, anchor);
				insert_dev(target, t0, anchor);
				insert_dev(target, div15, anchor);
				append_dev(div15, header);
				append_dev(header, h1);
				append_dev(header, t2);
				append_dev(header, div0);
				append_dev(div0, button0);
				append_dev(button0, t3);
				append_dev(div15, t4);
				append_dev(div15, div14);
				append_dev(div14, div8);
				append_dev(div8, div2);
				append_dev(div2, ul);
				append_dev(ul, li0);
				append_dev(li0, a0);
				append_dev(ul, t6);
				append_dev(ul, li1);
				append_dev(li1, a1);
				append_dev(div2, t8);
				append_dev(div2, div1);
				append_dev(div1, input0);
				set_input_value(input0, /*searchQuery*/ ctx[5]);
				append_dev(div1, t9);
				append_dev(div1, button1);
				append_dev(div2, t11);
				if (if_block0) if_block0.m(div2, null);
				append_dev(div2, t12);
				if (if_block1) if_block1.m(div2, null);
				append_dev(div8, t13);
				append_dev(div8, div5);
				append_dev(div5, div3);
				append_dev(div3, label);
				append_dev(div3, t15);
				append_dev(div3, input1);
				set_input_value(input1, /*title*/ ctx[0]);
				append_dev(div5, t16);
				if (if_block2) if_block2.m(div5, null);
				append_dev(div5, t17);
				append_dev(div5, div4);
				append_dev(div4, button2);
				append_dev(div4, t19);
				append_dev(div4, button3);
				append_dev(div5, t21);
				append_dev(div5, textarea);
				set_input_value(textarea, /*content*/ ctx[1]);
				append_dev(div8, t22);
				append_dev(div8, div7);
				append_dev(div7, div6);
				div6.innerHTML = raw_value;
				append_dev(div14, t23);
				append_dev(div14, div9);
				append_dev(div14, t24);
				append_dev(div14, div13);
				append_dev(div13, div12);
				append_dev(div12, h5);
				append_dev(div12, t26);
				append_dev(div12, div10);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(div10, null);
					}
				}

				append_dev(div12, t27);
				append_dev(div12, div11);
				append_dev(div11, input2);
				set_input_value(input2, /*chatInput*/ ctx[9]);
				append_dev(div11, t28);
				append_dev(div11, button4);

				if (!mounted) {
					dispose = [
						listen_dev(button0, "click", /*click_handler*/ ctx[20], false, false, false, false),
						listen_dev(a0, "click", /*click_handler_1*/ ctx[21], false, false, false, false),
						listen_dev(a1, "click", /*click_handler_2*/ ctx[22], false, false, false, false),
						listen_dev(input0, "input", /*input0_input_handler*/ ctx[23]),
						listen_dev(button1, "click", /*searchDocs*/ ctx[15], false, false, false, false),
						listen_dev(input1, "input", /*input1_input_handler*/ ctx[27]),
						listen_dev(button2, "click", /*saveDoc*/ ctx[12], false, false, false, false),
						listen_dev(button3, "click", /*click_handler_6*/ ctx[28], false, false, false, false),
						listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[29]),
						listen_dev(div9, "mousedown", /*startResize*/ ctx[11], false, false, false, false),
						listen_dev(input2, "input", /*input2_input_handler*/ ctx[31]),
						listen_dev(input2, "keydown", /*keydown_handler*/ ctx[32], false, false, false, false),
						listen_dev(button4, "click", /*sendChat*/ ctx[16], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*darkMode*/ 16 && t3_value !== (t3_value = (/*darkMode*/ ctx[4] ? 'Light Mode' : 'Dark Mode') + "")) set_data_dev(t3, t3_value);

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(header, "bg-dark", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(header, "text-light", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*activeTab*/ 256) {
					toggle_class(a0, "active", /*activeTab*/ ctx[8] === 'all');
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(a0, "bg-dark", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(a0, "text-light", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*activeTab*/ 256) {
					toggle_class(a1, "active", /*activeTab*/ ctx[8] === 'search');
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(a1, "bg-dark", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(a1, "text-light", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(ul, "bg-dark", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(ul, "text-light", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*searchQuery*/ 32 && input0.value !== /*searchQuery*/ ctx[5]) {
					set_input_value(input0, /*searchQuery*/ ctx[5]);
				}

				if (/*activeTab*/ ctx[8] === 'all') {
					if (if_block0) {
						if_block0.p(ctx, dirty);
					} else {
						if_block0 = create_if_block_5(ctx);
						if_block0.c();
						if_block0.m(div2, t12);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (/*activeTab*/ ctx[8] === 'search') {
					if (if_block1) {
						if_block1.p(ctx, dirty);
					} else {
						if_block1 = create_if_block_3(ctx);
						if_block1.c();
						if_block1.m(div2, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(div2, "bg-dark", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(div2, "text-light", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(label, "text-light", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*title*/ 1 && input1.value !== /*title*/ ctx[0]) {
					set_input_value(input1, /*title*/ ctx[0]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(input1, "bg-dark", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(input1, "text-light", /*darkMode*/ ctx[4]);
				}

				if (/*dirty*/ ctx[7]) {
					if (if_block2) ; else {
						if_block2 = create_if_block_2(ctx);
						if_block2.c();
						if_block2.m(div5, t17);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (dirty[0] & /*content*/ 2) {
					set_input_value(textarea, /*content*/ ctx[1]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(textarea, "bg-dark", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(textarea, "text-light", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(div5, "bg-dark", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(div5, "text-light", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*content*/ 2 && raw_value !== (raw_value = marked.parse(/*content*/ ctx[1] || '') + "")) div6.innerHTML = raw_value;
				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(div7, "bg-dark", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(div7, "text-light", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*chatMessages, darkMode, openDocById*/ 132112) {
					each_value = ensure_array_like_dev(/*chatMessages*/ ctx[10]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div10, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if (dirty[0] & /*chatInput*/ 512 && input2.value !== /*chatInput*/ ctx[9]) {
					set_input_value(input2, /*chatInput*/ ctx[9]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(div12, "bg-dark", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(div12, "text-light", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(div15, "bg-dark", /*darkMode*/ ctx[4]);
				}

				if (dirty[0] & /*darkMode*/ 16) {
					toggle_class(div15, "text-light", /*darkMode*/ ctx[4]);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(link);
					detach_dev(t0);
					detach_dev(div15);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				destroy_each(each_blocks, detaching);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	const func = (a, b) => a.title.localeCompare(b.title);

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('App', slots, []);
		let title = '', content = '', preview = '';
		let docs = [], selectedDocId = null;
		let darkMode = false;
		let searchQuery = '';
		let searchResults = [];
		let savedTitle = "";
		let savedContent = "";
		let dirty = false;

		// Active tab: "all" or "search"
		let activeTab = 'all';

		let isResizing = false;
		let startY;
		let startHeight;

		function startResize(e) {
			isResizing = true;
			startY = e.clientY;
			const topRow = document.querySelector(".top-row");
			startHeight = topRow.offsetHeight;
			document.addEventListener("mousemove", resize);
			document.addEventListener("mouseup", stopResize);
		}

		function resize(e) {
			if (!isResizing) return;
			const containerHeight = document.querySelector(".container-fluid").offsetHeight;
			const dy = e.clientY - startY;
			const newTopHeight = startHeight + dy;

			// Minimums: don't let them collapse completely
			if (newTopHeight < 100 || newTopHeight > containerHeight - 100) return;

			const topRow = document.querySelector(".top-row");
			const bottomRow = document.querySelector(".bottom-row");
			topRow.style.height = `${newTopHeight}px`;
			bottomRow.style.height = `${containerHeight - newTopHeight - 8}px`; // account for resizer height

			// Save height to localStorage
			localStorage.setItem("topRowHeight", newTopHeight);
		}

		function stopResize() {
			isResizing = false;
			document.removeEventListener("mousemove", resize);
			document.removeEventListener("mouseup", stopResize);
		}

		function toggleTheme() {
			$$invalidate(4, darkMode = !darkMode);
			document.body.classList.toggle('bg-dark', darkMode);
			document.body.classList.toggle('text-light', darkMode);
		}

		async function loadDocs() {
			const res = await fetch('/api/docs');
			$$invalidate(2, docs = await res.json());

			//docs = (await res.json()).sort((a,b)=>a.title.localeCompare(b.title));
			console.log(docs);
		}

		async function saveDoc() {
			if (!title || !content) return;
			const now = new Date().toISOString(); // Save current timestamp

			// If updating an existing doc, optionally include the same ID
			const docPayload = { title, content, lastModified: now };

			if (selectedDocId) {
				await fetch(`/api/doc/${selectedDocId}`, { method: 'DELETE' });
			}

			const res = await fetch('/api/save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(docPayload)
			}); //body: JSON.stringify({title, content})

			if (res.ok) {
				clearEditor();
				await loadDocs();
			}

			// Update saved state after successful save
			$$invalidate(18, savedTitle = title);

			$$invalidate(19, savedContent = content);
		}

		// Warn user if leaving with unsaved changes
		function handleBeforeUnload(event) {
			if (dirty) {
				event.preventDefault();
				event.returnValue = ""; // Required for Chrome + most browsers
			}
		}

		function clearEditor() {
			$$invalidate(0, title = '');
			$$invalidate(1, content = '');
			preview = '';
			$$invalidate(3, selectedDocId = null);
		}

		async function editDoc(doc) {
			const res = await fetch(`/api/doc/${doc.id}`);
			if (!res.ok) return;
			const data = await res.json();
			$$invalidate(3, selectedDocId = data.id);
			$$invalidate(0, title = data.title);
			$$invalidate(1, content = data.content);
			updatePreview();

			// set saved state to match loaded doc
			$$invalidate(18, savedTitle = title);

			$$invalidate(19, savedContent = content);
		}

		async function deleteDoc(doc) {
			if (!confirm(`Delete "${doc.title}"?`)) return;
			await fetch(`/api/doc/${doc.id}`, { method: 'DELETE' });
			await loadDocs();
		}

		function updatePreview() {
			preview = marked.parse(content);
			setTimeout(() => document.querySelectorAll('pre code').forEach(block => Prism$1.highlightElement(block)), 0);
		}

		async function searchDocs() {
			if (!searchQuery) return;

			const res = await fetch('http://localhost:3000/api/search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query: searchQuery })
			});

			if (!res.ok) return;
			$$invalidate(6, searchResults = (await res.json()).sort((a, b) => b.score - a.score));

			//searchResults = (await res.json()).sort((a,b)=>b.score - a.score);
			$$invalidate(8, activeTab = 'search');
		}

		let chatInput = '';
		let chatMessages = [];

		// Example messages for testing
		// let chatMessages = [
		//   { role: 'user', text: 'What are the benefits for using RazorSvelte?' },
		//  { role: 'assistant', text: 'RazorSvelte helps integrate Svelte into Razor pages for full-stack apps.' }
		// ];
		async function sendChat() {
			if (!chatInput.trim()) return;

			//chatMessages.push({ role: 'user', text: chatInput });
			$$invalidate(10, chatMessages = [...chatMessages, { role: 'user', text: chatInput }]);

			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question: chatInput })
			});

			const data = await res.json();
			console.log(data);

			//chatMessages.push({ role: 'assistant', text: data.answer });
			$$invalidate(10, chatMessages = [
				...chatMessages,
				{
					role: 'assistant',
					text: data.answer,
					docIds: data.docIds
				}
			]);

			console.log(chatMessages);
			$$invalidate(9, chatInput = '');
		}

		function openDocById(id) {
			fetch(`/api/doc/${id}`).then(r => r.json()).then(d => {
				$$invalidate(3, selectedDocId = d.id);
				$$invalidate(0, title = d.title);
				$$invalidate(1, content = d.content);
				$$invalidate(7, dirty = false);
			});
		}

		onMount(() => {
			loadDocs();
			window.addEventListener("beforeunload", handleBeforeUnload);
			const savedHeight = localStorage.getItem("topRowHeight");

			if (savedHeight) {
				const container = document.querySelector(".container-fluid");
				const containerHeight = container.offsetHeight;
				const topRow = document.querySelector(".top-row");
				const bottomRow = document.querySelector(".bottom-row");
				topRow.style.height = `${savedHeight}px`;
				bottomRow.style.height = `${containerHeight - savedHeight - 8}px`;
			}
		});

		onDestroy(() => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		});

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
		});

		const click_handler = () => $$invalidate(4, darkMode = !darkMode);

		const click_handler_1 = e => {
			e.preventDefault();
			$$invalidate(8, activeTab = 'all');
		};

		const click_handler_2 = e => {
			e.preventDefault();
			$$invalidate(8, activeTab = 'search');
		};

		function input0_input_handler() {
			searchQuery = this.value;
			$$invalidate(5, searchQuery);
		}

		const click_handler_3 = doc => editDoc(doc);
		const click_handler_4 = doc => deleteDoc(doc);
		const click_handler_5 = r => editDoc(r);

		function input1_input_handler() {
			title = this.value;
			$$invalidate(0, title);
		}

		const click_handler_6 = () => {
			$$invalidate(0, title = '');
			$$invalidate(1, content = '');
			$$invalidate(3, selectedDocId = null);
		};

		function textarea_input_handler() {
			content = this.value;
			$$invalidate(1, content);
		}

		const click_handler_7 = doc => openDocById(doc.id);

		function input2_input_handler() {
			chatInput = this.value;
			$$invalidate(9, chatInput);
		}

		const keydown_handler = e => e.key === 'Enter' && sendChat();

		$$self.$capture_state = () => ({
			onMount,
			onDestroy,
			marked,
			Prism: Prism$1,
			title,
			content,
			preview,
			docs,
			selectedDocId,
			darkMode,
			searchQuery,
			searchResults,
			savedTitle,
			savedContent,
			dirty,
			activeTab,
			isResizing,
			startY,
			startHeight,
			startResize,
			resize,
			stopResize,
			toggleTheme,
			loadDocs,
			saveDoc,
			handleBeforeUnload,
			clearEditor,
			editDoc,
			deleteDoc,
			updatePreview,
			searchDocs,
			chatInput,
			chatMessages,
			sendChat,
			openDocById
		});

		$$self.$inject_state = $$props => {
			if ('title' in $$props) $$invalidate(0, title = $$props.title);
			if ('content' in $$props) $$invalidate(1, content = $$props.content);
			if ('preview' in $$props) preview = $$props.preview;
			if ('docs' in $$props) $$invalidate(2, docs = $$props.docs);
			if ('selectedDocId' in $$props) $$invalidate(3, selectedDocId = $$props.selectedDocId);
			if ('darkMode' in $$props) $$invalidate(4, darkMode = $$props.darkMode);
			if ('searchQuery' in $$props) $$invalidate(5, searchQuery = $$props.searchQuery);
			if ('searchResults' in $$props) $$invalidate(6, searchResults = $$props.searchResults);
			if ('savedTitle' in $$props) $$invalidate(18, savedTitle = $$props.savedTitle);
			if ('savedContent' in $$props) $$invalidate(19, savedContent = $$props.savedContent);
			if ('dirty' in $$props) $$invalidate(7, dirty = $$props.dirty);
			if ('activeTab' in $$props) $$invalidate(8, activeTab = $$props.activeTab);
			if ('isResizing' in $$props) isResizing = $$props.isResizing;
			if ('startY' in $$props) startY = $$props.startY;
			if ('startHeight' in $$props) startHeight = $$props.startHeight;
			if ('chatInput' in $$props) $$invalidate(9, chatInput = $$props.chatInput);
			if ('chatMessages' in $$props) $$invalidate(10, chatMessages = $$props.chatMessages);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty[0] & /*title, savedTitle, content, savedContent*/ 786435) {
				// Whenever content or title changes, mark as dirty
				$$invalidate(7, dirty = title !== savedTitle || content !== savedContent);
			}
		};

		return [
			title,
			content,
			docs,
			selectedDocId,
			darkMode,
			searchQuery,
			searchResults,
			dirty,
			activeTab,
			chatInput,
			chatMessages,
			startResize,
			saveDoc,
			editDoc,
			deleteDoc,
			searchDocs,
			sendChat,
			openDocById,
			savedTitle,
			savedContent,
			click_handler,
			click_handler_1,
			click_handler_2,
			input0_input_handler,
			click_handler_3,
			click_handler_4,
			click_handler_5,
			input1_input_handler,
			click_handler_6,
			textarea_input_handler,
			click_handler_7,
			input2_input_handler,
			keydown_handler
		];
	}

	class App extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "App",
				options,
				id: create_fragment.name
			});
		}
	}

	const app = new App({ target: document.getElementById('app') });

	return app;

})();
//# sourceMappingURL=bundle.js.map
