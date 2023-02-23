# Vanilla JS Dependency Injection

based on Injector.js (https://github.com/jamesmh/Injector.js/). All code from this folder is licensed under the MIT License.

## Usage Installation

If you want to import the ES6 module into your project then reference "/src/injection/core/injector.js."

```javascript
import { Injector } from './core/injector';
//Singleton
export let $injector = new Injector();
```

### Step 1: Register Dependencies

You need to provide "$injector" with all the dependencies you will need. Provide to the .register() or .registerSingleton() method an object with (a) keys that correspond to the argument names that they will be injected into and (b) the actual object to be the dependency.

```javascript
var http = { get: "I'm a http service." };
var router = { routes: "I'm a router." };

$injector.registerSingleton({
	HttpService: http,
	RouterService: router
});
```

The .register() and .registerSingleton() methods will also accept a dependency registration in the following format:

```javascript
var http = { get: "I'm a http service." };
var router = { routes: "I'm a router." };

$injector.registerSingleton('HttpService', http).registerSingleton('RouterService', router);
```

To register dependencies that will be new instantiations everytime they are injected, use .register(). You need to provide an object that has a constructor so the injector is able to instantiate a new one.

```javascript
// Prototype....
var http = function () {
	this.get = "I'm a http service.";
};

// ES6 class
class router {
	constructor() {
		this.get = "I'm a router.";
	}
}

$injector.register({
	HttpService: http,
	RouterService: router
});
```

### Step 2: Enable Function For Injection

Each function you want to have DI enabled for will have to "initialize" himself.

(a) Call the .inject() method from the injector object ("$injector" if using pre-built file) then (b) supply the function you are inside of as the parameter. The returned object has the dependencies as properties.

#### ES6 class constructor:

For ES6 constructors, supply the .inject() method with "this.constructor".

```javascript
class InjectMe {
	constructor() {
		// Using ES6 destructuring...
		const { HttpService, RouterService } = $injector.inject('HttpService', 'RouterService');
		this.http = HttpService;
		this.router = RouterService;
	}
}
```

#### Non-class / prototype constructor:

As with ES6 constructors, supply the .inject() method with "this.constructor".

```javascript
var prototypeConstructor = function () {
	const { HttpService, RouterService } = $injector.inject('HttpService', 'RouterService');
	this.http = HttpService;
	this.router = RouterService;
};
```

#### Function:

Supply the .inject() method with the function you are in. Note that anonymous and self-executing functions will not work.

```javascript
var regularFunction = function (HttpService, RouterService) {
	// Without ES6 destructuring
	const injected = $injector.inject('HttpService', 'RouterService');
	HttpService = injected.HttpService;
	RouterService = injected.RouterService;
};
```

### Step 3: Call The Function With No Arguments :)

Just call the function you configured. Consider the following:

```javascript
class InjectMe {
	constructor(HttpService, RouterService) {
		// Using ES6 deconstruction...
		const { HttpService, RouterService } = $injector.inject('HttpService', 'RouterService');
		this.http = HttpService;
		this.router = RouterService;
	}
}

const myInstance = new InjectMe(); // myInstance.http is the injected object that was previous configured....
```
