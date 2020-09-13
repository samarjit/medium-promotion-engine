import React, { useState, useEffect, useRef, useCallback, Component } from 'react';
import { render } from 'react-dom';
import Hello from './Hello';
import './style.css';
import {productList, promotions, cartData, main} from './evaluateExpression';
import peg from 'pegjs';
import CodeMirror from 'codemirror';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/selection/mark-selection';
import 'codemirror/lib/codemirror.css';
import './codemirror-mylang';
import grammar from './grammar.peg.js';

function TextArea({value, onBlur, onChange, rows}) {
  const [val,setVal] = useState(value);
  const r = useRef();
  useEffect(() => {
    // Breaking stupid react controlled component. It sets the value to initial without even re-renders
    r.current.value = value;
  }, [value]);
  return <textarea ref={r} rows={rows} onBlur={onBlur} onChange={onChange} className="w100"></textarea>
}

function RenderRule({promo, onUpdate}) {
  const r = useRef();
  const err = useRef();
  const promoRef = useRef(promo);

  // Only useRef was not sufficient to hold current value, it only holds the current reference
  // so setting the actual value in useEffects
  useEffect(() => {
    promoRef.current = promo;
  }, [promo])

  useEffect(() => {

    const editor = CodeMirror(r.current, {
      value: promoRef.current.expression,
      lineNumbers: true,
      lineWrapping: true,
      matchBrackets: true,
      styleSelectedText: true,
      viewportMargin: Infinity,
      mode: 'mylang',
    });

    editor.on('change', (t) => {
     try {
      var parser = peg.generate(grammar);
      const expression = t.getValue().trim();
      const ruleParsed = parser.parse(expression);
      promoRef.current.rule = ruleParsed;
      promoRef.current.expression = expression;
      onUpdate(promoRef.current);
      err.current.innerHTML = '';
      t.getAllMarks().forEach(marker => marker.clear());
    }catch (e) {
      // $('#dynamicruleparsed').empty();
      if (!e.location) {
        err.current.innerHTML  = (e);
        return;
      }
      t.markText(
        {line: e.location.start.line - 1, ch: e.location.start.column - 1}, 
        {line: e.location.end.line - 1, ch: e.location.end.column - 1},
        { 
          inclusiveLeft: true,
          inclusiveRight: true,
          selectLeft: true,
          className: "styled-background",
          // clearOnEnter: true,
        });
      err.current.innerHTML = e.message;
    }

  });
  }, []);

  return <div>
  <div  ref={r}></div>
  <div className="error" ref={err}></div>
  </div>
}

function App() {
  const [prodList, setProdList] = useState(productList);
  const [promos, setPromos] = useState(promotions);
  const [cart, setCart] = useState(cartData);
  const [matchedPromotions, setMatchedPromotions] = useState([]);
  const reset = () => {
    setProdList(productList);
    setPromos(promotions);
    setCart(cartData);
    setMatchedPromotions(main(promos, cart));
    console.log('resetted')
  }
  const addProduct = () => {
    console.log('add prod')
    setProdList([...prodList, {productSubType: 'PHONE', iconClass: 'fiber_new'}]);
  }
  const updateProd = (e, prd, index) => {
    prodList.splice(index, 1, JSON.parse(e.currentTarget.value));
    setProdList([...prodList]);
  }
  const addPromotion = () => {
    console.log('add prod')
    setPromos([...promos, {name: 'PHONE', expression: '', rule: {}}]);
  }
  const addToCart = (prd) => {
    prd.selected = !prd.selected; setProdList([...prodList]);
    cart.lines = prodList.filter(i => i.selected);
    setCart({...cart});
  }
  const updatePromo = (key,updatedPromo) => {
    promos.splice(key, 1, updatedPromo);
    setPromos([...promos]);
  }

  useEffect(() => {
    // run on load
    setMatchedPromotions(main(promos, cart));
  }, [])
  useEffect(() => {
    console.log('rerendering', promos)
    setMatchedPromotions(main(promos, cart));
  }, [cart.lines, promos]);
  return (
    <>
      <h5>Applied Promotions</h5>
      {matchedPromotions.map((promoRes, key) =>
      <>{promoRes.promo}: <b key={key}>{String(promoRes.result)}</b><br/></>
      )}
      <hr/>
      <h5>Products <button type="button" onClick={() => addProduct()}>Add</button> <button type="button" onClick={() => reset()}>Reset <i className="material-icons font-2">restore</i></button></h5>
      <div className="productBox">
      {prodList.map((prd,key) =>
      <div className={'alignMiddle' + (prd.selected?' selected':'')} key={key}>
        <div className="iconWrap">
        <i className='material-icons font-7 cur-pointer' onClick={() => addToCart(prd)}>{prd.iconClass}</i>
        <i className="material-icons font-1 cur-pointer" onClick={(e) => {
          setProdList(prodList.filter(pl => pl !== prd))
        }}>cancel</i>
        </div>
        <TextArea rows="5" value={JSON.stringify(prd, null, 1)} onBlur={(e) => updateProd(e, prd, key)}></TextArea>
      </div>
      )}
      </div>
      <hr/>
      <h5>Promotions <i className="material-icons pos-t-4">card_giftcard</i> <button type="button" onClick={() => addPromotion()}>Add</button> </h5>
      {promos.map((promo, key) =>
        <>
          <div key={key}>
          {promo.name} <i className="material-icons font-1 cur-pointer" onClick={() => setPromos(promos.filter(i => i !== promo))}>cancel</i><br/>
          <RenderRule promo={promo} onUpdate={(updatedPromo) => updatePromo(key, updatedPromo)}/>
          <TextArea value={
            JSON.stringify(promo, null, 1)
            } onChange={(e) => updatePromo(key, JSON.parse(e.currentTarget.value))}className="w100"></TextArea>
          </div>
        </>
      )}
      <hr/>
      <h5>Cart <i className="material-icons pos-t-4">shopping_cart</i></h5>
      {cart.lines.map((line, key) =>
        <>
        <div key={key}>{JSON.stringify(line)}</div>
        </>
      )}
    </>
  );
}

render(<App />, document.getElementById('root'));
