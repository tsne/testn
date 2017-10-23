import {Status, Reporter} from "./reporter/types";
import {Matcher} from "./match";



export type TestFunc = (t: T) => void;

export interface T {
	skip(): void;
	fail(): void;
	error(msg?: string): void;
	fatal(msg?: string): void;
	run(name: string, f: TestFunc): boolean;
}


interface Context {
	reporter: Reporter;
	match: Matcher;
}


class TestAbort extends Error {}


class Test {
	private _parent?: Test;
	private _ctx: Context;
	private _path: string[];
	private _failed: boolean;
	private _skipped: boolean;
	private _errors: string[];


	public constructor(path: string[], ctx: Context, parent?: Test) {
		this._parent = parent;
		this._ctx = ctx;
		this._path = path;
		this._failed = false;
		this._skipped = false;
		this._errors = [];
	}

	public skip(): void {
		this._skipped = true;
		this._abort();
	}

	public fail(): void {
		if(this._parent) {
			this._parent.fail();
		}
		this._failed = true;
	}

	public error(msg?: string): void {
		if(msg) {
			this._errors.push(msg);
		}
		this.fail();
	}

	public fatal(msg?: string): void {
		this.error(msg);
		this._abort();
	}

	public run(name: string, func: TestFunc): boolean {
		if(!name) {
			throw new Error("no test name provided");
		}

		const childPath = this._path.concat(name);
		if(!this._ctx.match(childPath)) {
			return true;
		}

		const t = new Test(childPath, this._ctx, this);
		const now = new Date();
		try {
			func(t);
		} catch(e) {
			if(!(e instanceof TestAbort)) {
				throw e;
			}
		}

		t._report(+(new Date()) - +now);
		return !t._failed;
	}


	private _abort(): never {
		throw new TestAbort();
	}

	private _report(duration: number): void {
		this._ctx.reporter.report({
			path: this._path,
			status: this._failed ? Status.Failed : this._skipped ? Status.Skipped : Status.Passed,
			duration: duration,
			errors: this._errors,
		});
	}
}



const tests = [];


export function test(name: string, func: TestFunc): void {
	tests.push({name, func});
}

export function run(match: Matcher, reporter: Reporter): void {
	const t = new Test([], {reporter, match});
	reporter.start && reporter.start();
	tests.forEach(test => t.run(test.name, test.func));
	reporter.finish && reporter.finish();
}
