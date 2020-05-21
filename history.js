/***********************************************

  "history.js"

  Created by Michael Cheng on 01/10/2016 13:10
            http://michaelcheng.us/
            michael@michaelcheng.us
            --All Rights Reserved--

***********************************************/

'use strict';

/* jshint -W079 */
export const history = (() => {
	/* jshint +W079 */

	const HASH_BANG = '#!/';

	/**
	 * A map of states and their controllers supported by the caller.
	 * @type {Object}
	 */
	const STATES = {};

	/**
	 * Either HASH_BANG or the base URL.
	 * @type {string}
	 */
	let _stateMode = HASH_BANG;

	/**
	 * A page state object.
	 * @param {string} state The state defined by the user.
	 * @param {number} length The length of the state match compared with current page.
	 */
	function State(state, length) {
		this.state = state;
		this.$$length = length;
	}

	/**
	 * Push the new state to the history stack.
	 * @param {string} payload The URL of the new state
	 * @param {string} title Optional. The page title of the new state. Default is the current page title
	 * @param {Object} bundle Optional. An object for the new state
	 */
	function pushState(payload, title, bundle) {
		// New URL is the user-specified new state, e.g. bathroom/1
		const url = getBaseURL() + (_stateMode === HASH_BANG ? HASH_BANG : '') + payload;

		title = title || document.title;
		bundle = bundle || null;

		if(window.history.pushState) {
			// Don't navigate if not needed.
			if(getHash() === payload) {
				return;
			}

			window.history.pushState(bundle, title, url);

			handleState();
		} else {
			throw new Error('History API not supported');
		}
	}

	/**
	 * Navigate back in the history stack.
	 */
	function popState() {
		window.history.back();
	}

	/**
	 * Handle the current page state. Use this when your page is loaded, and specify which states should be handled by which controller. The base state should be empty.
	 * @param {Object} states An object containing the state and its controller, e.g.
	 * {
	 * 	'': baseState,
	 * 	'person/:id': person
	 * }
	 */
	function setStates(states, options) {
		if(options) {
			_stateMode = options.base;
		}

		Object.keys(states).forEach(state => {
			STATES[state] = states[state];
		});

		// Handle the current page state
		handleState();

		window.addEventListener('popstate', function() {
			handleState();
		});
	}

	/**
	 * Manage the state by calling the user defined callback when the state is reached.
	 */
	function handleState() {
		const currentState = getBestStateMatch(STATES);

		// Current state is not handled. This is not necessarily an error.
		if(!currentState) {
			return;
		}

		// Get variable of current state.
		let stateVar = currentState.state.split(':')[0];
		stateVar = getHash().split(stateVar)[1];

		// Handle the state by calling the user defined callback.
		STATES[currentState.state](stateVar || undefined);
	}

	/**
	 * Get the best state match according to current state.
	 * @param  {Object} states The states defined by the user.
	 * @return {State} Returns the user-defined state that best matches the current page.
	 */
	function getBestStateMatch(states) {
		const match = Object.keys(states)
			.map(state => {
				if(state === '') {
					return new State(state, 0);
				}

				const match = state.split(':')[0]; // e.g. bathroom/
				const length = getHash().indexOf(match) === 0 ? match.length : -1;
				return new State(state, length);
			})
			.reduce((prev, cur) =>
				prev.$$length === -1 ? null :
				(prev.$$length >= cur.$$length ? prev : cur), {});

		if(getHash() && match.$$length === -1) {
			console.warn('Current state is unhandled');
			return null;
		}

		return match;
	}

	/**
	 * Gets the pathname as specified by the window object, e.g. /history/index.html
	 * @return {string} Returns the pathname.
	 */
	function getPath() {
		return window.location.pathname;
	}

	/**
	 * Gets the base URL of the page. When not using hashbang, the base URL
	 * is the base URL specified in the options.
	 * @return {string} The base URL of the page.
	 */
	function getBaseURL() {
		if(_stateMode === HASH_BANG) {
			return getPath();
		}

		return _stateMode;
	}

	/**
	 * Returns the application state. This is the state after the base URL, e.g. bathroom/1
	 * @return {string} The application state.
	 */
	function getHash() {
		let hash;
		if(_stateMode === HASH_BANG) {
			hash = window.location.hash;
			// Remove the hashbang from the hash.
			hash = hash.split(HASH_BANG)[1];
		} else {
			hash = getPath().split(getBaseURL())[1];
		}

		if(!hash) {
			return '';
		}

		// Remove the trailing slash if it's there.
		if(hash.substr(-1) === '/') {
			hash = hash.substring(0, hash.length - 1);
		}

		return hash;
	}

	return { pushState, popState, setStates };
})();