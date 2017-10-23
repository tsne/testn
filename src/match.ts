

export type Matcher = (path: string[]) => boolean;


export function createMatcher(pattern?: string): Matcher {
	const filter = splitPattern(pattern || "");
	return function(path: string[]): boolean {
		for(let i = 0; i < path.length; ++i) {
			if(i >= filter.length) {
				break;
			}
			if(!filter[i].test(path[i])) {
				return false;
			}
		}
		return true;
	};
}


function splitPattern(pattern: string): RegExp[] {
	if(!pattern) {
		return [];
	}

	const res = [];
	let brack = 0;
	let paren = 0;
	let off = 0;
	for(let i = 0; i < pattern.length; ++i) {
		switch(pattern[i]) {
		case "[":
			++brack;
			break;

		case "]":
			if(--brack < 0) {
				brack = 0;
			}
			break;

		case "(":
			if(brack === 0) {
  				++paren;
  			}
			break;

		case ")":
			if(brack === 0) {
  				--paren;
  			}
			break;

		case "/":
			if(brack === 0 && paren === 0) {
				res.push(new RegExp(pattern.slice(off, i)));
				off = i + 1;
			}
			break;
		}
	}

	res.push(new RegExp(pattern.slice(off)));
	return res;
}
