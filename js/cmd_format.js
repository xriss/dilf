/*

(C) Kriss@XIXs.com 2023 and released under the MIT license.

See https://github.com/xriss/dilf for full notice.

*/

const cmd_format=exports;

const pfs=require("fs/promises")

const mdon=require("./mdon.js")
const jxml=require("./jxml.js")

const ls=function(a) { console.log(util.inspect(a,{depth:null})); }


cmd_format.run=async function(argv)
{

	let ifname=argv._[1]
	let ofname=argv._[2]
	let intojson=true
	
	if( ifname ) // need an input
	{
		if( ifname.endsWith(".json") )
		{
			intojson=false
		}
		if( argv.markdown )
		{
			intojson=false
		}
		if( argv.json )
		{
			intojson=true
		}

		if( ! ofname ) // auto outname
		{
			if( intojson )
			{
				ofname=ifname+".json"
			}
			else
			{
				ofname=ifname+".md"
			}
		}
		
		if(intojson)
		{
			console.log(`
Converting ${ifname} to json [${ofname}]
`)
			await mdon.to_json(ifname,ofname)
			return
		}
		else
		{
			console.log(`
Converting ${ifname} to markdown [${ofname}]
`)
			await mdon.to_markdown(ifname,ofname)
			return
		}
	}


	console.log(
`

>	dilf format infilename.json [outfilename.md]
>	dilf format infilename.txt --markdown [outfilename.md]

Convert json to markdown.


>	dilf format infilename.md [outfilename.json]
>	dilf format infilename.txt --json [outfilename.json]

Convert markdown to json.

`)



}
