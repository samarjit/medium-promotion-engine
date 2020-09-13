module.exports =
`start = OrExpr
 
OrExpr = head:AndExpr tail:(_ 'or' _ AndExpr)+ {
			let accum = [head];
			tail.reduce((accumulated, element) => {
            	accumulated.push(element[3]);
                return accumulated;
            }, accum);
			return {groupOp: 'or', predicates: accum};
		}
        /AndExpr

AndExpr = head:CallExpr tail:(_ 'and' _ CallExpr)+ {
			let accum = [head];
			tail.reduce((accumulated, element) => {
            	accumulated.push(element[3]);
                return accumulated;
            }, accum);
			return {groupOp: 'and', predicates: accum};
		}
        /CallExpr


CallExpr = callex:CallOrSelectorEx _ op:op _ val:value { // count() > 0
				return {op, callex, value: val};
			}
         /CallEx
         /SelectorEx

ArgsExpr = head:value _ ',' _ tail:OrExpr {
            	tail.path = head;
				return tail;
		   }
           /value

CallOrSelectorEx = SelectorEx / CallEx
SelectorEx = !ReservedWord ident:[a-zA-Z]+ '(' _ args: OrExpr _ ')' { // exists(a=1)
			return {type: 'SelectorExpr', name: ident.join(''), args: args};
           }

CallEx = !ReservedWord ident:[a-zA-Z]+ '(' _ args: ArgsExpr _ ')' { // exists()
			return {type: 'CalExpr', name: ident.join(''), args: args};
           }
       / ParenExpr
 
ParenExpr = "(" exp:OrExpr ")" { return exp; } / Predicate

Predicate = left:identifier op:op right:value {return {op: op, left, value: right};}
            

// lexer regex
op = '='/'>'/'<'
joiner = 'and'/'or'
ReservedWord = op / joiner

value =  
 _ "'" id:[a-zA-Z0-9- ]+ "'" _ {
	return id.join('');
}/
_ '"' id:[a-zA-Z0-9- ]+ '"' _ {
	return id.join('');
}/
_ id:[a-zA-Z0-9-]+ _ {
  return id.join('');
}

identifier = _ id:[a-zA-Z\\.]+ _ {
  return { name: id.join(''), type: 'identifier' };
}

integer "integer"
  = _ [0-9]+ { return parseInt(text(), 10); }

_ "whitespace"
  = [ \\t\\n\\r]*`