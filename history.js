/***********************************************

  "history.js"

  Created by Michael Cheng on 01/10/2016 13:10
            http://michaelcheng.us/
            michael@michaelcheng.us
            --All Rights Reserved--

***********************************************/

'use strict';

var iqwerty = iqwerty || {};

iqwerty.history = (function() {

	var HASH_BANG = '#!/';
	var _stateMode = HASH_BANG;

	/**
	 * A page state object
	 * @param {String} state  The state defined by the user
	 * @param {Number} length The length of the state match compared with current page
	 */
	function State(state, length) {
		this.state = state;
		this.$$length = length;
	}

	State.prototype.states = {};

	/**
	 * Push the new state to the history stack.
	 * @param {String} payload The URL of the new state
	 * @param {String} title   Optional. The page title of the new state. Default is the current page title
	 * @param {Object} bundle  Optional. An object for the new state
	 */
	function Push(payload, title, bundle) {
		//Payload is the user-specified new state, e.g. bathroom/1
		payload = getBaseURL() + (_stateMode === HASH_BANG ? HASH_BANG : '') + payload;
		title = title || document.title;
		bundle = bundle || null;

		if(window.history.pushState) {
			if(getCurrentState() === payload) return;

			window.history.pushState(bundle, title, payload);

			//The state needs to be handled in hashbang mode
			if(_stateMode === HASH_BANG) {
				handleState(getHash());
			}
		} else {
			return console.error('History API not supported');
		}
	}

	function Pop() {
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
	function States(states, options) {
		if(options) {
			_stateMode = options.base
		}

		State.prototype.states = states;

		//Handle the current page state
		handleState(getBestStateMatch(states));

		window.addEventListener('popstate', function() {
			handleState(getHash());
		});
	}

	/**
	 * Manage the state by calling the user defined callback when the state is reached
	 * @param  {Object} state A State object
	 */
	function handleState(state) {
		var states = State.prototype.states;
		var currentState = getBestStateMatch(states);

		if(!currentState) return;

		//Get variable of current state
		var stateVar = currentState.state.split(':')[0];
		stateVar = getHash().split(stateVar)[1];

		//Handle the state by calling the user defined callback
		states[currentState.state](stateVar || null);
	}

	/**
	 * Get the best state match according to current state
	 * @param  {Object} states The states defined by the user
	 * @return {State}         Returns the user-defined state that best matches the current page
	 */
	function getBestStateMatch(states) {
		var match = Object.keys(states)
			.map(state => {
				if(state === '') return new State(state, 0);

				var match = state.split(':')[0]; //e.g. bathroom/
				var length = getHash().indexOf(match) === 0 ? match.length : -1;
				return new State(state, length);
			})
			.reduce((prev, cur) => prev.$$length === -1 ? null : (prev.$$length >= cur.$$length ? prev : cur));

		if(getHash() && match.$$length === -1) {
			console.warn('Current state is unhandled');
			return null;
		}
		return match;
	}

	/**
	 * Gets the pathname as specified by the window object, e.g. /history/index.html
	 * @return {String} Returns the pathname
	 */
	function getPath() {
		return window.location.pathname;
	}

	/**
	 * Gets the base URL of the page. When not using hashbang, the base URL
	 * is the base URL specified in the options
	 * @return {String} The base URL of the page
	 */
	function getBaseURL() {
		if(_stateMode === HASH_BANG) return getPath();
		return _stateMode;
	}

	/**
	 * Returns the application state. This is the state after the base URL, e.g. bathroom/1
	 * @return {String} The application state
	 */
	function getHash() {
		var hash;
		if(_stateMode === HASH_BANG) {
			hash = window.location.hash;
			//Remove the hashbang from the hash
			hash = hash.split(HASH_BANG)[1];
		} else {
			hash = getPath().split(getBaseURL())[1];
		}

		if(!hash) {
			return '';
		}
		//Remove the trailing slash if it's there
		if(hash.substr(-1) === '/') {
			hash = hash.substring(0, hash.length - 1);
		}

		return hash;
	}

	/**
	 * Get the current application state, e.g. /freepee2/m/bathroom/1
	 * @return {String} Returns the current application state
	 */
	function getCurrentState() {
		return getBaseURL() + getHash();
	}

	return {
		Push: Push,
		Pop: Pop,
		States: States
	};
})();