/**
  * @license
  * Copyright 2017 Richard Anaya
  *Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  *The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  *THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  */

import {repeat} from 'lit-html/lib/repeat';
import {html, render} from 'lit-html/lib/lit-extended';

function shallowEquals(a,b){
  if(a===b){
    return true;
  }
  var keysA = Object.keys(a);
  var keysB = Object.keys(b);
  if(keysA.length != keysB.length){
    return false;
  }

  for(var i = 0 ; i < keysA.length; i++){
    if(a[keysA[i]]!==b[keysA[i]]){
      return false;
    }
  }

  return true;
}

class ComposableElement extends HTMLElement {
  constructor(propDefs){
    super()
    //create a list functions for a functional composition chain
    if(this.__proto__.constructor.composition){
        this.$composition = this.__proto__.constructor.composition.map(f => f(this));
    }
    this.$propDefs = this.__proto__.constructor.properties;
    this.$attrDefs = {};
    this.$props = {};
    this.$shadow = this.attachShadow({mode:'open'});
    if(this.$propDefs){
      var keys = Object.keys(this.$propDefs);
      for(var i = 0 ; i < keys.length; i++){
        const key = keys[i];
        const def = this.$propDefs[key];
        this.$props[key] = def.value;
        if(def.attr){
          this.$attrDefs[def.attr] = {propDef:def,key};
          var attrValue = this.getAttribute(def.attr);
          if(attrValue !== null){
              this.$props[key] = this.getAttrValue(attrValue,def.type);
          }
        }
        this.defineProp(key);
      }
    }
    if(!this.__proto__.constructor.observedAttributes){
      this.__proto__.constructor.observedAttributes = Object.keys(this.$attrDefs);
    }
    this.$render = this.__proto__.constructor.render;
  }

  attributeChangedCallback(attributeName, oldValue, newValue, namespace){
    var def = this.$attrDefs[attributeName];
    if(def){
      this.updateProp(def.key,this.getAttrValue(newValue,def.propDef.type))
    }
  }

  getAttrValue(value,type){
    if(type === Number){
      return parseFloat(value);
    }
    if(type === Array || type === Object){
      return JSON.parse(value);
    }
    return value;
  }

  connectedCallback(){
    // make sure connected always called first
    this.$processComposition(this.$props,true);
    if(this.$lifecycle && this.$lifecycle.connected){
      this.$lifecycle.connected.call(this,this.$props);
    }
    this.$renderProps();
  }

  disconnectedCallback(){
    if(this.$lifecycle && this.$lifecycle.disconnected){
      this.$lifecycle.disconnected.call(this,this.$props);
    }
  }

  defineProp(name){
    Object.defineProperty(this, name, {
      get: function() { return this.$props[name] },
      set: function(newValue) {
        this.updateProp(name,newValue);
      },
      enumerable: true,
      configurable: true
    });
  }

  updateProp(name,value){
    this.$updateProps(Object.assign({},this.$props,{[name]:value}));
  }

  $updateProps(nextProps,force){
    this.$processComposition(nextProps,force);
    this.$renderProps();
  }

  $processComposition(nextProps,force){
    if(this.$composition){
      for(var i = 0; i < this.$composition.length; i++){
        var result = this.$composition[i].call(this,nextProps,this.$props);
        if(result === false){
          if(force){
            continue;
          }
          else {
            return;
          }
        }
        nextProps = result;
      }
    }
    this.$props = nextProps;
  }

  $renderProps(){
    if(this.$lifecycle && this.$lifecycle.prerender){
      this.$lifecycle.prerender.call(this,this.$props);
    }
    var fragments = this.$render(this.$props);
    render(fragments,this.$shadow)
    if(this.$lifecycle && this.$lifecycle.postrender){
      this.$lifecycle.postrender.call(this,this.$props);
    }
  }
}

function withProps(props){
  return () => (nextProps)=>{
    return Object.assign(nextProps,props(nextProps));
  }
}

function createHandler(instance,fnCreator){
  return () => {
    var fn = fnCreator(instance.$props);
    fn.apply(instance,arguments)
  }
}

function withHandlers(handlers){
  return (instance) => {
    var handlerProxies = {};
    var keys = Object.keys(handlers);
    keys.forEach(k => {
      handlerProxies[k] = createHandler(instance,handlers[k])
    });
    return (nextProps) => {
      return Object.assign(nextProps,handlerProxies);
    }
  }
}

function pure(props){
  return () => (nextProps,currentProps)=>{
    if(shallowEquals(currentProps,nextProps)){
      return false;
    }
    return nextProps;
  }
}

function withState(name,functionName,value){
  return (instance) => {
    var currentValue = value;
    function updateValue(v){
      currentValue = v;
      instance.$updateProps(instance.$props);
    }
    return (nextProps)=>{
      return Object.assign({},nextProps, {
        [name] : currentValue,
        [functionName] : updateValue
      });
    }
  }
}

function connect(mapStateToProps,mapDispatchToProps){
  return (el) => {
    var provider = el.closest('provider');
    if(!provider){
      throw new Error("Could not find a provider element with redux store");
    }
    provider.store.subscribe(()=>{
      el.$updateProps(el.$props);
    })
    return (nextProps)=>{
      let newProps = nextProps;
      if(mapStateToProps){
      	newProps = Object.assign(newProps,mapStateToProps(provider.store.getState(),newProps));
      }
      if(mapDispatchToProps){
      	newProps = Object.assign(newProps,mapDispatchToProps(provider.store.dispatch,newProps));
      }
      return newProps;
    }
  }
}

function lifecycle(handlers){
  return (instance) => {
    instance.$lifecycle = handlers;
    return (nextProps)=>{
      return nextProps;
    }
  }
}

export {
  ComposableElement,
  html,
  withProps,
  withHandlers,
  pure,
  withState,
  render,
  connect,
  repeat,
  lifecycle
}
