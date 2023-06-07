#!/usr/bin/env node
/*

(C) Kriss@XIXs.com 2023 and released under the MIT license.

See https://github.com/xriss/dilf for full notice.

*/

const cmd=exports;

const pfs=require("fs/promises")


const ls=function(a) { console.log(util.inspect(a,{depth:null})); }


cmd.parse=function(argv)
{
	argv.filename_cmd=__filename

}


cmd.run=async function(argv)
{
	if( argv._[0]=="format" )
	{
		await require("./cmd_format.js").run(argv)
		return
	}

	// help text
	console.log(
`
>	dilf format

Convert between formats.

`)
}

// if global.argv is set then we are inside another command so do nothing
if(!global.argv)
{
	var argv = require('yargs').argv
	global.argv=argv
	cmd.parse(argv)
	cmd.run(argv)
}
