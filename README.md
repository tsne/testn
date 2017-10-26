# testsome
testsome is a small JavaScript test runner without any dependencies.

## Usage
To run a test with testsome, a `test` function is provided. It takes the test's name and a function which will be called:
```TypeScript
function test(name: string, func: (t: T) => void): void
```
The passed function `func` gets a parameter of type `T` which can be used to manage test state:
```TypeScript
interface T {
    skip(): void;
    fail(): void;
    error(msg?: string): void;
    fatal(msg?: string): void;
    run(name: string, func: TestFunc): boolean;
}
```

### T.skip()
The `skip` method marks the test as skipped and stops its execution.

### T.fail()
The `fail` method marks the test as failed and continues it execution.

### T.error(msg)
The `error` method reports an optional error message and marks the test as failed. If no `msg` parameter is provided, this function will be equivalent to calling `fail`.

### T.fatal(msg)
The `fatal` method reports an optional error message and stops the test execution. This function is equivalent to calling `error` followed by returning from the test function.

### T.run(name, func)
The `run` method start a subtest with the provided name. It basically has the same semantics as the `test` function. The return value reports whether the subtest succeeded or not.

## Command Line
```
testsome [options] [file ...]

Run all tests which are defined in the provided files. A file could also be a glob pattern,
which includes every file the pattern matches.

Options:
    --run regexp
        Run only the test where the name matches the regular expression. All other will be ignored.
        The regular expression is split into parts by unbracketed slashes where each part must match
        the corresponding subtest. All parents of a matching test are run, too. For example, for
        '--run A/B' runs the test A with its subtests matching B.
```

## Example
test.js
```TypeScript
import {test} from "testsome";

test("my first test", t => {
    if(!initializeTest()) {
        t.fatal("cannot initialize test");
    }

    t.run("subtest", t => {
        if(somethingIsWrong) {
            t.error("something went wrong");
        }
    });
});
```

command line
```
testsome test.js
```
