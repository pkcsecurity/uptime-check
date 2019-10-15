uptime-check
============

[![License](https://img.shields.io/npm/l/uptime-check.svg)](https://github.com/pkcsecurity/uptime-check/blob/master/LICENSE)
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

Periodically checks a list of projects for uptime.


# Installation
```bash
npm install
npm link # Optional, otherwise use ./bin/run instead of uptime-check
uptime-check CoolProject http://example.com
```

Execute `uptime-check` to begin polling the list of projects provided at the command line at a default interval of once every 30 minutes. It's recommended to background this process so you don't have to leave a terminal open.

Details of the uptime test results are logged to stdout (for both passes and failures), and metrics are automatically posted to your PostgreSQL database (specified using environment variables) after each test run.

# PostgreSQL Configuration
You **must** have the following environment variables set in order to post metrics to PostgreSQL:
- PGHOST
- PGUSER
- PGPASSWORD
- PGDATABASE

You may specify additional variables according to the [libpq documentation](https://www.postgresql.org/docs/current/libpq-envars.html).

# Usage
```bash
uptime-check PROJECTNAME PROJECTURL [PROJECTNAME2 PROJECTURL2...]
```
### Arguments
- PROJECTNAME  Name of project for logging metrics
- PROJECTURL   URL to check for the project

### Options
- -h, --help               show CLI help
- -i, --interval=interval  [default: 1800] interval to check on (in seconds)
- -v, --version            show CLI version

### Description
Specify the projects to check as arguments to this command, in projectName projectUrl pairs. You may specify as many pairs as you'd like so long as each has both a name and a URL.


### Examples
`$ uptime-check CoolProject http://example.com AnotherProject https://cool.example.com`
`$ uptime-check -i 600 CoolProject http://example.com`
