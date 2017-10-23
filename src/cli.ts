import * as process from "process";
import {Reporter} from "./reporter/types";
import {listReporter} from "./reporter/list";
import {createMatcher, Matcher} from "./match";
import {glob} from "./glob";



interface Config {
	files: string[];
	reporter: Reporter;
	matcher: Matcher;
}

function parseArgs(argv: string[]): Config {
	let runPattern = "";
	const globPatterns = [];
	for(let i = 2; i < argv.length; ++i) {
		switch(argv[i]) {
		case "-r":
		case "--run":
			if(i+1 < argv.length && !argv[i+1].startsWith("-")) {
				runPattern = argv[++i];
			}
			break;

		default:
			if(argv[i].startsWith("-")) {
				throw new Error(`error: invalid option ${argv[i]}`);
			}
			globPatterns.push(argv[i]);
			break;
		}
	}

	if(!globPatterns.length) {
		globPatterns.push("**/*_test.js");
	}

	return {
		files: glob(process.cwd(), globPatterns),
		reporter: listReporter(),
		matcher: createMatcher(runPattern),
	};
}



const testsome = require("testsome");
const conf = parseArgs(process.argv);
conf.files.forEach(require);
testsome.run(conf.matcher, conf.reporter);

