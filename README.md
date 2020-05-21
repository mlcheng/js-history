# js-history

This history library will handle the state of your single page application. This will allow you to use links such as `/email.html#!/read/13432` and manage those states easily.

A demo is available on my [playground](https://playground.michaelcheng.us/lib-js/history/).

## Usage
To begin managing your SPA state, you must register your application state and respective controllers when the page loads

```javascript
iqwerty.history.setStates({
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
If you need to add a state programmatically, you can use the `pushState()` function

```javascript
iqwerty.history.pushState('read/13432');
```

## Additional notes
You can choose not to use the hashbang style (#!) URLs, but this **will require that you do some server config** (e.g. in the `.htaccess` file). In choosing so, you will get URLs that are much more stable, such as `/email/read/13432`. To do so, simply state your base URL when defining your application state

```javascript
iqwerty.history.setStates({
	'': BaseStateController,
	'read/:id': EmailStateController
}, {
	'base': '/email/'
});
```
