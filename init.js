'use strict';

document.addEventListener('DOMContentLoaded', asd);

function asd() {
	iqwerty.history.HandleStates({
		'bathroom/:id': bathroom
	});
}

function bathroom(id, action) {
	console.log(id, action);
}

function pushhistory(payload) {
	iqwerty.history.Push(payload);
}