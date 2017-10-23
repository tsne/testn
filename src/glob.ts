import {readdirSync, statSync} from "fs";
import {join as joinPath} from "path";



export function glob(rootPath: string, patterns: string[]): string[] {
	const root = new Directory(rootPath);
	const matchers = patterns.map(p => parsePattern(p.replace("\\", "/").split("/"), 0));
	return sort(unique(flatten(matchers.map(m => m(root)))));
}



interface DirInfo {
	subdirs: Directory[];
	files: string[];
}

class Directory {
	private _name: string;
	private _path: string;
	private _info: DirInfo;
	private _read: boolean;


	public constructor(name: string, parentPath?: string) {
		this._name = name;
		this._path = parentPath ? joinPath(parentPath, name) : name;
		this._info = {subdirs: [], files: []};
		this._read = false;
	}

	public name(): string {
		return this._name;
	}

	public path(): string {
		return this._path;
	}

	public info(): DirInfo {
		if(this._read) {
			return this._info;
		}

		const subdirs = [];
		const files = [];
		readdirSync(this._path).forEach(filename => {
			const stat = statSync(joinPath(this._path, filename));
			if(!filename.startsWith(".")) {
				if(stat.isDirectory()) {
					subdirs.push(new Directory(filename, this._path));
				} else {
					files.push(filename);
				}
			}
		})

		this._info = {subdirs, files};
		this._read = true;
		return this._info;
	}
}



type Matcher = (root: Directory) => string[];

function parsePattern(components: string[], idx: number): Matcher {
	if(idx === components.length) {
		return matchNothing;
	}

	const isLast = idx === components.length - 1;
	const matchNext = parsePattern(components, idx + 1);
	switch(components[idx]) {
	case "":
		return matchNothing;

	case "*":
		if(isLast) {
			return function(root: Directory): string[] {
				const info = root.info();
				return info.files.map(fullpath(root));
			};
		} else {
			return function(root: Directory): string[] {
				const info = root.info();
				return flatten(info.subdirs.map(matchNext));
			};
		}

	case "**":
		if(isLast) {
			return matchNothing; // we want to match files only
		} else {
			return function matchAsterisks(root: Directory): string[] {
				const info = root.info();
				return unique(flatten(info.subdirs.map(matchAsterisks).concat(info.subdirs.map(matchNext))));
			};
		}

	default:
		const rx = toRegexp(components[idx]);
		if(isLast) {
			return function(root: Directory): string[] {
				const info = root.info();
				return info.files.filter(f => rx.test(f)).map(fullpath(root));
			};
		} else {
			return function(root: Directory): string[] {
				const info = root.info();
				return flatten(info.subdirs.filter(dir => rx.test(dir.name())).map(matchNext));
			};
		}
	}
}


function toRegexp(s: string): RegExp {
	let rx = "";
	for(let i = 0; i < s.length; ++i) {
		switch(s[i]) {
		case "*":
			if(i+1 < s.length && s[i+1] === "*") {
				throw new Error("invalid glob token '**'");
			}
			rx += ".*";
			break;

		case "?":
			rx += ".";
			break;

		case "[":
			rx += "[";
			if(++i < s.length) {
				rx += s[i] === "!" ? "^" : s[i];
				for(++i; i < s.length && s[i] != "]"; ++i) {
					rx += s[i];
				}
				rx += i === s.length ? "" : "[";
			}
			break;

		case ".":
			rx += "\\.";
			break;

		default:
			rx += s[i];
			break;
		}
	}

	return new RegExp(`^${rx}$`);
}

function matchNothing(root: Directory): string[] {
	return [];
}

function flatten(arrs: string[][]): string[] {
	return arrs.reduce((res, arr) => {
		res.push(...arr);
		return res;
	}, []);
}

function unique(arr: string[]): string[] {
	const found = {};
	return arr.filter(e => {
		const pass = !(e in found);
		found[e] = true;
		return pass;
	});
}

function sort(arr: string[]): string[] {
	arr.sort((x, y) => x.localeCompare(y));
	return arr;
}

function fullpath(dir: Directory) {
	return function(filename: string): string {
		return joinPath(dir.path(), filename);
	};
}

