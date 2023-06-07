/*

(C) Kriss@XIXs.com 2023 and released under the MIT license.

See https://github.com/xriss/dilf for full notice.

*/

const mdon=exports;

const pfs=require("fs/promises")
const marked=require("marked")
const hjson=require("hjson")
const stringify = require('json-stable-stringify')


const util=require("util")
const ls=function(a) { console.log(util.inspect(a,{depth:null})); }



mdon.build_md=function(obj)
{
	let otext=hjson.stringify(obj)
	return otext
}



mdon.parse_md=function(itext)
{
	let otext=[]

	let dump="none"
	const tokens = marked.lexer(itext);
	for( let token of tokens )
	{
		if( token.type=="code" && ( token.lang=="mdon" || !token.lang ) )
		{
			if( dump=="next" )
			{
				otext.push("'''\n")
			}
			otext.push(token.text)
			if( token.text.trim().endsWith(":") )
			{
				dump="next"
				otext.push("\n'''\n")
			}
			else
			{
				dump="none"
			}
		}
		else
		if(dump=="next")
		{
			otext.push(token.raw)
		}
	}
	if( dump=="next" )
	{
		otext.push("'''\n")
	}
//	ls(tokens);


	otext=otext.join("")

	let data = hjson.parse(otext)

	return data
}


