# WebCompose
Create web components with functional composition

# Introduction

Hello! You might be wondering why the phrase "functional composition" is so important right now. In a few words: to make your life easier and your code more consistant. OOP is great, but tends to let many people shoot their own foot by writing code in many different ways. Much of modern UI development is focused on unidirectional data flow, and functional composition has been evolving over the last year or so as a standard way to express that flow. It can allow your development to be concerned about a few important principles:

* how does my component receive and acquire it's props it will use to render
* how do I have a stateless and easily testable functional UI components
* how do I easily define when this component should not update the DOM

This library attempts to serve all these, in addition to exposing a very efficient way of updating the DOM. We'll explore these ideas below in a series of small component examples.

# Hello World

```javascript
import { ComposableElement, html } from "webcompose"

class HelloWorld extends ComposableElement {
  static render(){
    return html`
      Hello World
    `
  }
}

customElements.define("hello-world", HelloWorld);
```

```html
<hello-world></hello-world>
```

Before beginning anything, let's get our feet wet and remind ourselves what web components are. Simply put: they let us create new and powerful HTML tags! This library uses Custom Elements V1, Shadow DOM V1, and Templates to do this. These technologies can be polyfilled, but many modern libraries are supporting them out of the box too. Custom Elements use ES6 classes to define element behavior. Our components will extend this library's element ComposableElement that does all the heavy lifting.

# Bonjour Monde

```javascript
import { ComposableElement, html } from "webcompose"

class HelloWorldly extends ComposableElement {
  static get observedAttributes() {return ['greeting','name']; }
  
  static get properties() {
    return {
      greeting: {type:String, value:"Hello", attr:"greeting"},
      name:     {type:String, value:"Traveler", attr:"name"}
    }
  }

  static render({greeting,name}){
    return html`
      ${greeting} ${name}
    `
  }
}

customElements.define("hello-world", HelloWorldly);
```

```html
<hello-worldly greeting="Bonjour" name="Monde"></hello-worldly>
```

HTML elements receive data through two primary way: attributes & properties. Properties are primarily a far more efficient way to receive data, as they do not require string conversion and should be the emphasis of the components you create, however sometimes it is useful to expose attributes on your HTML that just make it easier to use!

Custom Elements V1, requires us to describe which attributes our HTML element will observe the changes of: greeting & name. WebCompose requires us to define a definition of the properties used by your component, and how you would like them exposed. In our example above, we express that we not only want properties greeeting & name, but also to expose them as an attribute with a similar name. Now we can update our component in two ways.

```javascript
var element = // document.querySelector(...);
// directly via observed property
element.greeting="Guten Tag";
// or via attribute
element.setAttribute("name","Welt");
```

You'll notice now that our rendering logic now has two props available to it. WebCompose is about definint a flow of data within your compoment, starting from element attributes & properties, and possibly ending with an update to the web component's HTML. WebCompose is efficient about only re-rendering dynamic elements of your HTML while leaving the static HTML alone.

# Simple Counter

```javascript
import { ComposableElement, html, withState, withHandlers } from "webcompose"
  static get composition(){
    return [
      withState("counter","setCounter",1)
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
