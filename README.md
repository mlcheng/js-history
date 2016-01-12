# js-history

This history library will handle the state of your single page application. This will allow you to use links such as `/email.html#!/read/13432` and manage those states easily.

A demo is available on my [playground](https://www.michaelcheng.us/playground/lib-js/history/)

## Usage
To begin managing your SPA state, you must register your application state and respective controllers when the page loads

```javascript
iqwerty.history.HandleStates({
	'': BaseStateController
	'read/:id': EmailStateController
});
```

The `BaseStateController` will handle the state with no hash, e.g. `/email.html`. The `EmailStateController` will handle the state `read` that can have a trailing parameter, e.g. `/email.html#!/read` or `/email.html#!/read/13432`. The `EmailStateController` can receive the parameter as an argument in its function.

```javascript
function BaseStateController() {
	closeEmailReader();
}
```

```javascript
function EmailStateController(id) {
	openEmailReader(id);
}
```

## Pushing state
If you need to add a state programmatically, you can use the `Push()` function

```javascript
iqwerty.history.Push('read/13432');
```

**Note that the hash bang (#!) is used by default and cannot be changed.**
