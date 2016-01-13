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
	var _baseURL;

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
		payload = _stateMode + payload;
		if(_stateMode === HASH_BANG) payload = getBaseURL() + payload;
		title = title || document.title;
		bundle = bundle || null;

		if(window.history.pushState) {
			if(getCurrentState() === payload) return;

			window.history.pushState(bundle, title, payload);
			handleState(getHash());
		} else {
			return console.error('History API not supported');
		}
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
		console.log('handling state');
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

				var match = _stateMode + state.split(':')[0];
				var length = getHash().indexOf(match) === 0 ? match.length - _stateMode.length : -1;
				return new State(state, length);
			})
			.reduce((prev, cur) => prev.$$length === -1 ? null : (prev.$$length >= cur.$$length ? prev : cur));

		if(getHash() && match.$$length === -1) {
			console.warn('Current state is unhandled');
			return null;
		}
		return match;
	}

	function getPath() {
		return window.location.pathname; //e.g. /history/index.html
	}

	function getBaseURL() {
		if(!_baseURL) {
			_baseURL = getPath(); //e.g. /history/index.html
			if(_stateMode !== HASH_BANG) {
				_baseURL = _stateMode;
			}
		}
		return _baseURL;
	}

	function getHash() {
		var hash = _stateMode === HASH_BANG ? window.location.hash : getPath();

		if(!hash) {
			return '';
		}


		//Remove the trailing slash if it's there
		if(hash.substr(-1) === '/') {
			hash = hash.substring(0, hash.length - 1);
		}
		return hash; //e.g. #!/bathroom/1
	}

	function getCurrentState() {
		if(_stateMode === HASH_BANG) {
			return getBaseURL() + getHash();
		} else {
			return getHash();
		}
	}

	return {
		Push: Push,
		States: States
	};
})();