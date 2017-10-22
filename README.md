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

Before beginning anything, let's get our feet wet and remind ourselves what web components are. Simply put: they let us create new and powerful HTML tags! This library uses Custom Elements V1, Shadow DOM V1, and Templates to do this. These technologies can be polyfilled, but many modern libraries are supporting them out of the box too.

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
