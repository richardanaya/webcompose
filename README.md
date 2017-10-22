# WebCompose
Create web components with functional composition

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


# Simple Counter

```javascript
import { ComposableElement, html, pure, withState, withHandlers } from "webcompose"

  static get composition(){
    return [
      withState("counter","setCounter",1),
      pure(),
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
