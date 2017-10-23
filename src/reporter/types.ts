
export const enum Status {
	Passed,
	Failed,
	Skipped,
}


export interface Report {
	readonly path: string[];
	readonly status: Status;
	readonly duration: number; // milliseconds
	readonly errors: string[];
}


export interface Reporter {
	start?(): void;
	finish?(): void;
	report(r: Report): void;
}
