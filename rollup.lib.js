import path from "path";
import pkg from "./package.json";



export default {
	input: "src/lib.ts",
	output: [
		{file: pkg["module"], format: "es"},
		{file: pkg["main"], format: "cjs"},
	],
	sourcemap: true,
	plugins: [
		require("rollup-plugin-tsc")({
			compilerOptions: {
				noUnusedLocals: true,
				declaration: true,
				declarationDir: path.dirname(pkg["types"]),
			},
		}),
	],
};
