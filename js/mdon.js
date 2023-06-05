/*

(C) Kriss@XIXs.com 2023 and released under the MIT license.

See https://github.com/xriss/dilf for full notice.

*/

const convert=exports;

const pfs=require("fs/promises")
const marked=require("marked")
const hjson=require("hjson")
const stringify = require('json-stable-stringify')


const util=require("util")
const ls=function(a) { console.log(util.inspect(a,{depth:null})); }



convert.to_markdown=async function(ifname,ofname)
{
	let itext=await pfs.readFile(ifname,"utf8")
	let otext=""
	await pfs.writeFile(ofname,otext,"utf8")
}




convert.to_json=async function(ifname,ofname)
{
	let itext=await pfs.readFile(ifname,"utf8")

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
	await pfs.writeFile(ofname,otext,"utf8") // write partially complete

	let obj = hjson.parse(otext)
	otext = stringify(obj,{ space: ' ' })

	await pfs.writeFile(ofname,otext,"utf8")
}


