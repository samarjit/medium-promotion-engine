// productExists(productType="PHONE" and price > 600)
// productExists(productType="PHONE" and price > 600) and productExists(productType='CASE')
var productAndCaseRule = {
   "groupOp": "and",
   debug:'a',
   "predicates": [
      {
         "type": "SelectorExpr",
         "name": "productExists",
         debug: 'x',  
         "args": {
            "groupOp": "and",
            "predicates": [
               {
                  "op": "=",
                  "left": {
                     "name": "productType",
                     "type": "identifier"
                  },
                  "value": "PHONE"
               },
               {
                  "op": ">",
                  "left": {
                     "name": "price",
                     "type": "identifier"
                  },
                  "value": "600"
               }
            ]
         }
      },
      {
         "type": "SelectorExpr",
         "name": "productExists",
         debug: 'y',  
         "args": {
            "op": "=",
            "left": {
               "name": "productType",
               "type": "identifier"
            },
            "value": "CASE"
         }
      }
   ]
};
// productCount(productModel="IPHONE") > 1
var butManyRule = {
   "op": ">",
   debug: false,
   "callex": {
      "type": "SelectorExpr",
      "name": "productCount",
      debug: false,
      "args": {
         "op": "=",
         debug: false,
         "left": {
            "name": "productModel",
            "type": "identifier"
         },
         "value": "IPHONE"
      }
   },
   "value": "1"
};

let productList = [
  {
    name: 'Samsung A51',
    productType: 'PHONE',
    productModel: 'A51',
    price: 800,
    iconClass: 'phone_android',
  },{
    name: 'iPhone',
    productType: 'PHONE',
    productModel: 'IPHONE',
    price: 800,
    iconClass: 'phone_iphone',
    selected: true,
  },{
    name: 'Case',
    productType: 'CASE',
    productModel: 'FLIPCASE',
    price: 20,
    iconClass: 'camera_rear',
    selected: true,
  },{
    name: 'iPad',
    productType: 'IPAD',
    productModel: 'IPAD',
    price: 600,
    iconClass: 'tablet_mac',
  },
]
var cartData1 = {
  lines: [
    {
      productType: 'PHONE',
      productModel: 'IPHONE',
      price: 800
    }, {
      productType: 'PHONE',
      productModel: 'IPHONE',
      price: 600
    }
  ]
};
var cartData = {
  lines: [
    {
      productType: 'PHONE',
      productModel: 'IPHONE',
      price: 800
    }, {
      productType: 'CASE',
      productModel: 'ClearCase',
      price: 20
    }
  ]
};

let promotions = [
  {
  name: 'Buy 2 iphone and get $400 off',
  expression: 'productCount(productModel="IPHONE") > 1',
  rule: butManyRule,
}, 
{
  name: 'Buy any phone and a phone case and get $50 off',
  expression: 'productExists(productType="PHONE" and price > 600) and productExists(productType="CASE")',
  rule: productAndCaseRule,
}];

function findValue(path, context) {
  return context[path];
}
function evalSelectorExpr(rule, context) {
  const selectorFn = rule.name, args = rule.args;
  if(selectorFn === 'productCount') {
    return context.lines.map(line => {
      const res = evalRule(args, line);
      if (rule.debug) {
      console.log(rule.debug, line, res)
      }
      return res;
    }).filter(x=>x).length;
  }
  if(selectorFn === 'productExists') {
    const partial = [];
    const res = context.lines.map(line => {
      const res = evalRule(args, line, partial);
      if (rule.debug) {
      console.log(rule.debug, line, res)
      }
      return res;
    }).filter(x=>x).length > 0;
    if (res === true) {
      return res;
    }
  }
  if(selectorFn === 'not') {

  }
}
function evalRule(rule, context,  partial) {
  if (rule.op === '>') {
    let res;
    if (rule.left) {
      res = findValue(rule.left.name, context);
    } else if (rule.callex && rule.callex.type === 'SelectorExpr') {
      res = evalSelectorExpr(rule.callex, context);
    }
    if (rule.debug) {
      console.log(rule.debug, rule, context, res)
    }
    if(res > rule.value) {
      return true;
    }
  }
  if (rule.op === '=') {
    let res;
    if (rule.left) {
      res = findValue(rule.left.name, context);
    } else if (rule.callex && rule.callex.type === 'SelectorExpr') {
      res = evalSelectorExpr(rule.callex, context);
    }
    if (rule.debug) {
      console.log(rule.debug, rule, context, res)
    }
    if(res == rule.value) {
      partial && partial.push()
      return true;
    }
  }

  if (rule && rule.type === 'SelectorExpr') {
    let res = evalSelectorExpr(rule, context);
    if (rule.debug) {
      console.log(rule.debug, rule, context, res)
    }
    return res;
  }

  if (rule.groupOp === 'and') {
    const res = rule.predicates.map(pred => {
      return evalRule(pred, context);
      }
    );
    if (rule.debug) {
      console.log(rule.debug, rule, context, res)
    }
    return res.reduce((acc, r) => acc && r, true);
  }
  if (rule.groupOp === 'or') {
    const res = rule.predicates.map(pred => {
      return evalRule(pred, context);
      }
    );
    if (rule.debug) {
      console.log(rule.debug, rule, context, res)
    }
    return res.reduce((acc, r) => acc || r, false);
  }
  return false;
}

function main(promos, cart) {
  return promos.map(promo => {
    let prRes = evalRule(promo.rule, cart);
    console.log(promo.name, prRes);
    return { promo: promo.name, result: prRes};
  });
}
exports.productList = productList;
exports.cartData = cartData;
exports.promotions = promotions;
exports.main = main;
main(promotions, cartData);