uptime-check
============

[![License](https://img.shields.io/npm/l/uptime-check.svg)](https://github.com/pkcsecurity/uptime-check/blob/master/LICENSE)
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

Periodically checks a list of projects for uptime.


Currently the list of projects is hardcoded. Ideally this tool could accept additional projects at the command line - if you can get around to doing that before I can, feel free to submit a PR!

# Usage
```bash
npm install
./bin/run
```

Execute `./bin/run` to begin polling the built-in list of projects at a default interval of once every 30 minutes. It's recommended to backgrond this process so you don't have to leave a terminal open. Details of the uptime test results are logged to stdout (for both passes and failures), and metrics are automatically posted to PKC's Grafana PostgreSQL database after each test run.

You can customize the checking interval by passing the `-i` flag followed by an interval in seconds.
