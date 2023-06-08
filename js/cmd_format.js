/*

(C) Kriss@XIXs.com 2023 and released under the MIT license.

See https://github.com/xriss/dilf for full notice.

*/

const cmd_format=exports;

const pfs=require("fs/promises")
const path=require("path")

const mdon=require("./mdon.js")
const jxml=require("./jxml.js")
const hjson=require("hjson")

let stringify = require('json-stable-stringify');


const ls=function(a) { console.log(util.inspect(a,{depth:null})); }


cmd_format.run=async function(argv)
{

	let ifname=argv._[1]
	let ofname=argv._[2]
	let ifmt="md"
	let ofmt="json"
	
	if( ifname ) // input
	{
		if( ifname.endsWith(".json") ) { ifmt="json" }
		if( ifname.endsWith(".xml") )  { ifmt="xml" }
		if( ifname.endsWith(".md") )   { ifmt="md" }
	}

	if( ofname ) // output
	{
		if( ofname.endsWith(".json") ) { ofmt="json" }
		if( ofname.endsWith(".xml") )  { ofmt="xml" }
		if( ofname.endsWith(".md") )   { ofmt="md" }
	}

	if( argv["json-to-xml"] ) { ifmt="json"; ofmt="xml"  }
	if( argv["json-to-md"]  ) { ifmt="json"; ofmt="md"   }
	if( argv["xml-to-json"] ) { ifmt="xml";  ofmt="json" }
	if( argv["xml-to-md"]   ) { ifmt="xml";  ofmt="md"   }
	if( argv["md-to-json"]  ) { ifmt="md";   ofmt="json" }
	if( argv["md-to-xml"]   ) { ifmt="md";   ofmt="xml"  }

	let find_files = async function(pname,recurse,ret)
	{
		ret=ret || []
		var files=await pfs.readdir(pname)
		for(var i in files){ var v=files[i];
			let fname=path.join(pname,v)
			var st=await pfs.stat( fname ) // follow links
			if( st.isDirectory() )
			{
				if(recurse)
				{
					await find_files(fname,recurse,ret)
				}
			}
			else
			{
				ret.push(fname)
			}
		}
		return ret
	}
	
	let format=async function(ifname,ofname)
	{
		if(!ofname) // build output file name
		{
			if( ifname.endsWith("."+ifmt) ) // replace
			{
				ofname = ifname.substring(0,ifname.length-ifmt.length)+ofmt
			}
			else // add
			{
				ofname = ifname+"."+ofmt
			}
		}

		console.log(`
Converting ${ifname} (${ifmt}) to ${ofname} (${ofmt})
`)

		let data={}
		try{
			if(ifmt=="json")
			{
				let text=await pfs.readFile(ifname,"utf8")
				data = hjson.parse(text)
			}
			else
			if(ifmt=="xml")
			{
				let text=await pfs.readFile(ifname,"utf8")
				data = jxml.parse_xml(text)
			}
			else
			if(ifmt=="md")
			{
				let text=await pfs.readFile(ifname,"utf8")
				data = mdon.parse_md(text)
			}
		}catch(e){
			console.log(e)
			await pfs.writeFile(ofname,""+e,"utf8")
			return
		}

		try{
			if(ofmt=="json")
			{
				let text=stringify(data,{space:" "})
				await pfs.writeFile(ofname,text,"utf8")
			}
			else
			if(ofmt=="xml")
			{
				let text=jxml.build_xml(data)
				await pfs.writeFile(ofname,text,"utf8")
			}
			else
			if(ofmt=="md")
			{
				let text=mdon.build_md(data)
				await pfs.writeFile(ofname,text,"utf8")
			}
		}catch(e){
			console.log(e)
			await pfs.writeFile(ofname,""+e,"utf8")
			return
		}
	}

	if( argv["dirs"] ) // recursive search
	{
		let fnames=await find_files( argv["dirs"] , true )
		for( let fname of fnames )
		{
			if( fname.endsWith("."+ifmt) ) // found
			{
				await format(fname)
			}
		}
		return
	}
	else
	if( argv["dir"] ) // single dir search
	{
		let fnames=await find_files( argv["dir"] , false )
		for( let fname of fnames )
		{
			if( fname.endsWith("."+ifmt) ) // found
			{
				await format(fname)
			}
		}
		return
	}
	else
	if( ifname ) // input file
	{
		await format(ifname,ofname)
		return
	}


	console.log(
`
>	dilf format infilename.[json|xml|md] outfilename.[json|xml|md]

We try and auto pick the input and output formats from the filenames 
extensions but you can also force specific formats using the following 
flags. Note expect lowercase and if we can not guess the format we 
deafult to --md-to-json so will assume these formats.

>	dilf format --json-to-xml infilename.json [outfilename.xml]
>	dilf format --json-to-md infilename.json [outfilename.md]

>	dilf format --md-to-json infilename.md [outfilename.json]
>	dilf format --md-to-xml infilename.md [outfilename.xml]

>	dilf format --xml-to-json infilename.xml [outfilename.json]
>	dilf format --xml-to-md infilename.xml [outfilename.md]


>	dilf format --md-to-xml --dirs=.

Convert an entire directory, recuresivly, any .md files found will be 
converted to a .xml This depensds of course on your choice of formats.

>	dilf format --md-to-xml --dir=.

Note the use of --dir instead of --dirs , this stops recursion into sub 
directories so only the directory explicitly given will be searched for 
.md files.

`)



}
