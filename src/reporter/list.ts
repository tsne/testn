import {Reporter, Report, Status} from "./types";



export function listReporter(): Reporter {
	const log = console.log;
	const icons = {
		[Status.Passed]:  "\u2713", // ✓
		[Status.Failed]:  "\u2717", // ✗
		[Status.Skipped]: "\u00bb", // »
	};

	let failed: boolean;

	return {
		start(): void {
			failed = false;
		},

		finish(): void {
			log(failed ? "FAILED" : "PASSED");
		},

		report(r: Report): void {
			const name = r.path.join(" / ");
			const icon = icons[r.status];
			const secs = (r.duration/1000).toFixed(2);

			log(`${icon} ${name} (${secs}s)`);
			r.errors.forEach(err => {
				log("\terror: " + err.replace("\n", "\n\t\t"));
			});

			failed = failed || r.status === Status.Failed;
		},
	};
}
