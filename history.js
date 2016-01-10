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
	//User states and handlers
	var _states = {};

	var _baseURL = null;
	var HASH_BANG = '#!/';

	function getBaseURL() {
		return window.location.pathname;
	}

	function getHash() {
		return window.location.hash;
	}

	function handleState(state, action) {
		if(state.indexOf(HASH_BANG) === 0) {
			//Managing state from current state
			state = Object.keys(_states).find(_state => _state.split(state).length >= 1);
		}
		var _hash = HASH_BANG + state.split(':')[0];
		var _split = getHash().split(_hash);
		if(_split.length < 1) return false;

		console.log(_states, state);

		_states[state](_split[1], action);
		return true;
	}

	/**
	 * Push history state
	 * @param {String} payload The URL to add to the current
	 * @param {String} title   Optional. The title of the new state
	 * @param {Object} bundle  Optional. The new state object
	 */
	function Push(payload, title, bundle) {
		var _payload = getBaseURL() + HASH_BANG + payload;
		title = title || document.title;
		bundle = bundle || null;

		if(window.history.pushState) {
			//console.log(payload, bundle);
			window.history.pushState(bundle, title, _payload);
			handleState(getHash(), State.PUSH);
		} else {
			console.error('History API is not supported');
		}
	}

	function HandleStates(states) {
		//if(!getHash()) return;
		//console.log(window.location);

		_states = states;

		Object.keys(states).find(state => handleState(state, State.PUSH));
		window.addEventListener('popstate', function() {
			//states[state](_split[1], State.POP);
			handleState(getHash(), State.POP);
		});
	}

	var State = {
		PUSH: 'push',
		POP: 'pop'
	};

	return {
		Push: Push,
		HandleStates: HandleStates,
		State: State
	};
})();