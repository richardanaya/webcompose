# WebCompose
Create web components with functional composition

```bash
npm install webcompose
```
```html
<script src="https://unpkg.com/webcompose@latest/dist/webcompose.min.js"></script>
```

# TLDR

Like [web components](https://www.webcomponents.org/)? Think React's [recompose](https://github.com/acdlite/recompose) is cool? Like the idea of [lit-html](https://github.com/PolymerLabs/lit-html) and writing your virtual dom in template strings without pre-compilers? Want to use [redux](http://redux.js.org/) easily and take advantage of immutability? This project let's you do it all in a minimal ES6 OOP manner. Enjoy!

# Introduction

Hello! You might be wondering why the phrase "functional composition" is so important right now. In a few words: to make your life easier and your code more consistant. OOP is great, but tends to let many people shoot their own foot by writing code in many different ways. Much of modern UI development is focused on unidirectional data flow, and functional composition has been evolving over the last year or so as a standard way to express that flow. It can allow your development to be concerned about a few important principles:

* how will my component consistently receive and acquire it's data it will use to render
* how do I have a stateless and easily testable functional UI components
* how do I easily define when a component should not update it's DOM

This library attempts to serve all these, in addition to exposing a very efficient way of updating the DOM. We'll explore these ideas below in a series of small component examples.

# Basic Web Component

```javascript
import { ComposableElement, html } from "webcompose"

class HelloWorld extends ComposableElement {
  static render(){
    return html`Hello World`
  }
}

customElements.define("hello-world", HelloWorld);
```

```html
<hello-world></hello-world>
```
[Demo](https://jsfiddle.net/n8akh1e9/)

Before beginning anything, let's get our feet wet and remind ourselves what web components are. Simply put: they let us create new and powerful HTML tags! This library uses Custom Elements V1, Shadow DOM V1, and Templates to do this. These technologies can be polyfilled, but many modern browsers are supporting them out of the box too. Custom Elements use ES6 classes to define element behavior. Our components will extend this library's element ComposableElement that does all the heavy lifting.

# Attributes

```javascript
import { ComposableElement, html } from "webcompose"

class HelloWorldly extends ComposableElement {
  static get observedAttributes() {return ['greeting','name']; }

  static get properties() {
    return {
      greeting: {type:String, value:"Hello", attr:"greeting"},
      name:     {type:String, value:"World", attr:"name"}
    }
  }

  static render({greeting,name}){
    return html`${greeting} ${name}`
  }
}

customElements.define("hello-world", HelloWorldly);
```

```html
<hello-worldly greeting="Bonjour" name="Monde"></hello-worldly>
```

[Demo](https://jsfiddle.net/j5jmqef6/)

HTML elements receive data through two primary way: attributes & properties. Properties are primarily a far more efficient way to receive data, as they do not require string conversion and should be the emphasis of the components you create, however sometimes it is useful to expose attributes on your HTML that just make it easier to use!

Custom Elements V1, requires us to describe which attributes our HTML element will observe the changes of: greeting & name. WebCompose requires us to define a definition of the properties used by your component, and how you would like them exposed. In our example above, we express that we not only want properties greeeting & name, but also to expose them as an attribute with a similar name and a default value. Now we can update our component in two ways.

```javascript
var element = // document.querySelector(...);
// directly via observed property
element.greeting="Guten Tag";
// or via attribute
element.setAttribute("name","Welt");
```
*Pro Tip: if you select an element using inspect or element view in Chrome Dev Tools, you can access the selected element using the $0 variable in the console*

You'll notice now that our rendering logic now receives a data object has two properties ( often called it's **props** ) available to it. WebCompose is about defining a flow of data within your component, starting from element attributes & properties, and possibly ending with an update to the web component's HTML. WebCompose is efficient about only re-rendering dynamic elements of your HTML while leaving the static HTML alone.

# Testing

```javascript
import { ComposableElement, html, withProps} from "webcompose"

class MathAdd extends ComposableElement {
  static get observedAttributes() {return ['left','right']; }

  static get properties() {
    return {
      left:   {type:Number, value: 1, attr:"left"},
      right:  {type:Number, value: 1, attr:"right"}
    }
  }

  static get composition(){
    return [
      withProps(({left,right}) => ({
        result: left+right
      }))
    ]
  }

  static render({left, right, result}){
    return html`${left} + ${right} = ${result}`
  }
}

customElements.define("math-add", MathAdd);
```

```html
<math-add left="2" right="2"></math-add>
```

[Demo](https://jsfiddle.net/3wf6hbnk/1/)

UI components often need more than just their element inputs. This component above offers a simple demonstration of how we can use functional composition to introduce a new prop to the data flow that will be used in the final rendering logic. You'll notice our first functional composition utility function **withProps**. Your component's composition will contain a list of functions that will take in the element's observed attributes & properties, output new props that will be given to the next composition function, until finally given to the rendering logic to update UI.

Additionally, you may have noticed that we are using **Number** as a type of our properties. This will instruct WebCompose to automatically convert attribute values to a number whenever they should happen to exist or change.

You might be asking right now why it's useful to perform this level of separation right now. In two words: consistency and testability. It is entirely possible to write the code above using standard OOP logic. Difficulty arrises in large code bases with many components that are written in many different varying ways. Simple compoments may be written differently than complex ones. Programmers may implement different ways to acheive the same result. Logic may be combined for brevity, but increase difficulty for testing.

WebCompose seperates business logic from rendering. This allows us to do testing on our final rendering logic in a very minimal way. Since our render function is stateless, we can test our rendering logic as if it were a pure function.

```javascript
describe('MathAdd Tests', function() {
  it('2 + 2 = 4', function() {
    const container = document.createElement('div');
    render(MathAdd.render({left: 2, right: 2, result: 4}),container)
    expect(container.innerHTML).to.equal(`2 + 2 = 4`);
  });
});
```

[Demo](https://jsfiddle.net/ftpb6fna/)

As you will see in the examples ahead, business logic tends to have very repeated structure, and the power of WebCompose's utility functions will make it easier to see what's happening in your flow of props.

# State

```javascript
class Counter extends ComposableElement {
  static get composition(){
    return [
      withState("counter","setCounter",1),
      withHandlers({
        increment : ({counter, setCounter}) => () => {
          setCounter(counter+1);
        }
      })
    ]
  }

  static render({counter, increment}){
    return html`
      ${counter} <button on-click=${increment}>+</button>
    `
  }
}

customElements.define("simple-counter", Counter);
```

```html
<simple-counter></simple-counter>
```
[Demo](https://jsfiddle.net/58be4jqz/1/)

State is useful. In this component the **withState** composition function allows is to introduce two new props *counter* and *setCounter*. *counter* is initially set to a value of 1. *setCounter* can be used to modify this value and request the component be updated.

**withHandlers** allows us to define functions that will be used most typically with event handlers. It allows us to keep our event handling logic out of our render code and enable easier testability of our rendering.

# Lists
```javascript
const { ComposableElement, html, repeat} = window.webcompose

class FruitList extends ComposableElement {
  static get observedAttributes() {return ['fruit']; }

  static get properties() {
    return {
      fruit: {type:Array, value:["apples","oranges","bananas"], attr:"fruit"},
    }
  }

  static render({fruit}){
    const fruitList = fruit.map((f,i) => html`<div>${i+1}. ${f}</div>`);
    return html`
      <h1>Fruits</h1>
      ${fruitList}
    `
  }
}

customElements.define("fruit-list", FruitList);
```
```html
<fruit-list></fruit-list>
<fruit-list fruit='["avocado","tomato"]'></fruit-list>
```

[Demo](https://jsfiddle.net/7zgjoob5/)

Attributes with type *Array* or *Object* can be converted from strings within the capabilites of *JSON.parse*

While lists can be mapped to HTML, lists can be rendered far more efficiently using a helper function *repeat*. WebCompose's rendering engine uses a unique key on each object in order to efficiently update the DOM when changes occur to the list (reorderings, additions, deletions).

```javascript
const fruitList = repeat(
  fruit,
  (i) => i,
  (i, index) => html`<div>${index+1}. ${i}</div>`
);
```

[Demo](https://jsfiddle.net/n1rn0m3f/)

### `repeat(arrayOfItems, mapItemToKey, mapItemToHTML)`

#### Arguments
* [`mapItemToKey(obj): String`]

* [`mapItemToHTML(obj): Template`]

# Children
```javascript
import { ComposableElement, html} from "webcompose"

class BlogPost extends ComposableElement {
  static render({left, right, result}){
    return html`
      <style>
        .blogpost {
          border: solid 1px black;
          padding: 15px;
          width: 100%;
        }

        .blogpost--title {
          font-size: 20px;
        }

        .blogpost--body {
          font-size: 12px;
        }
      </style>
      <div class="blogpost">
        <div class="blogpost--title"><slot name="title"></slot></h1>
        <div class="blogpost--body"><slot></slot></div>
      </div>
    `
  }
}

customElements.define("blog-post", BlogPost);
```

```html
<blog-post>
  <span slot="title">How To Cook An Egg</span>
  <p>
    1. Crack egg
    2. Butter pan
    3. Put egg in pan
  </p>
  <p>
    Mix egg thoroughly before putting in pan. Add
    a little salt. Putting a lid on top can help
    cook the top faster along with bottom of egg.
  </p>
</blog-post>
```

[Demo](https://jsfiddle.net/005bc157/)

Custom Elements allows for children elements using a system called slots defined in Shadow Dom V1. If your element has slots within it. child elements will be placed in the appropriate default or named slot. Multiple elements are allowed per slot.

# Redux

```javascript
function counter (state=0, action) {
  switch (action.type) {
  	case 'INCREMENT':
    	state++;
      break;
  }
  return state;
}

document.querySelector('provider').store = Redux.createStore(counter);
```

```javascript
import { ComposableElement, html, connect } from 'webcompose'

class Counter extends ComposableElement {
  static get composition(){
    return [
      connect((state)=>({
       counter: state
      }), (dispatch}) => ({
      	increment : () => {
          dispatch({type:"INCREMENT"});
        }
      }))
    ]
  }

  static render({counter, increment}){
    return html`
      ${counter} <button on-click=${increment}>+</button>
    `
  }
}

customElements.define("simple-counter", Counter);
```
```
<provider>
  ...
  <simple-counter></simple-counter>
  ...
</provider>
```

[Demo](https://jsfiddle.net/z0f1mcy6/)

Redux is a common centralized datastore. WebCompose comes with an opionionated utility function connect for assisting in mapping state/dispatch into your component's props. It looks for the closest parent tag *<provider>* and gets the store property on it, and updates the component when the store updates.

### `connect([mapStateToProps], [mapDispatchToProps])`

#### Arguments

* [`mapStateToProps(state, [props]): newProps`]

* [`mapDispatchToProps(dispatch, [props]): newProps`]

# Preventing Rerendering

```javascript
import { ComposableElement, html, pure} from "webcompose"

class ExpensiveComponent extends ComposableElement {
  static get composition(){
    return [
      ...,
      pure()
    ]
  }

  static render(){
    return html`Expensive component goes here!`
  }
}

customElements.define("expensive-component", ExpensiveComponent);
```

By default WebCompose will update your DOM everytime your props are given a value, but sometimes you really want to make sure that your component does not rerender unnecessarily . To facilitate this, we have a utility composition function named *pure* that will stop rendering if it detects that the props it receives are exactly the same as the current props of the component (i.e. nothing has changed and we shouldn't do costly DOM updates). People who use immutable data structures find this useful because they can prevent work from being done that's not necessary.

* *pure* only does a shallow equality test. It is not capable of noticing differences within the props's children themselves.
* Be sure you pay attention to where in the composition you place *pure*. It should only be in a spot where you are certain the update of your component should stop. 99% of the time it should be at the end of your composition.

# Lifecycle

```javascript
const { ComposableElement, html, lifecycle, withState } = window.webcompose

class VerboseComponent extends ComposableElement {
  static get composition(){
    return [
      lifecycle({
      	connected: () => console.log("component connected"),
        prerender: () => console.log("component prerender"),
        postrender: () => console.log("component postrender"),
        disconnected: () => console.log("component disconnected")
      })
    ]
  }

  static render({log}){
    return html`
      Look at the console!
    `
  }
}

customElements.define("verbose-component", VerboseComponent);
```
Sometimes you really need access to the lifecycle. The utility function *lifecycle* lets you define handlers for some events.

### `lifecycle({ connected: [connectedHandler], prerender: [prerenderHandler], postrender: [postrenderHandler], disconnected: [disconnectedHandler] })`

#### Arguments

* [`connectedHandler([props]): void`]
* [`prerenderHandler([props]): void`]
* [`postrenderHandler([props]): void`]
* [`disconnectedHandler([props]): void`]

[Demo](https://jsfiddle.net/k0okrLj7/)
