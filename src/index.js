const { Command, flags } = require("@oclif/command");
const _ = require("lodash");
const request = require("request-promise-native").defaults({ strictSSL: true });
const { Client } = require("pg");

const PG_CLIENT = new Client();

async function sendMetric(projectName, isUp, latency) {
  try {
    const { rowCount, rows } = await PG_CLIENT.query({
      text:
        "SELECT is_up FROM uptime WHERE project = $1 ORDER BY date DESC LIMIT 1;",
      values: [projectName]
    });

    if (rowCount === 0 || rows[0].is_up !== isUp) {
      await PG_CLIENT.query({
        text:
          "INSERT INTO uptime (date, project, is_up, latency) VALUES (NOW(), $1, $2, $3);",
        values: [projectName, isUp, latency]
      });
    }

    return true;
  } catch (err) {
    console.error(`Failed trying to query/post metrics: ${err}`);
    return false;
  }
}

function check(projectsToCheck) {
  return async () => {
    for (let { name, uri } of projectsToCheck) {
      try {
        const res = await request({
          resolveWithFullResponse: true,
          method: "GET",
          uri,
          time: true
        });

        const timeStr = res.timingPhases.total.toFixed(2);

        if (res.statusCode === 200) {
          console.log(
            `${uri}: PASS! Got status ${res.statusCode}, body length ${res.body.length} in ${timeStr}ms`
          );
          await sendMetric(name, true, res.timingPhases.total);
        } else {
          console.log(
            `${uri}: FAIL! Got status ${res.statusCode} in ${timeStr}ms`
          );
          console.log(`Response body: ${res.body}`);
          await sendMetric(name, false, res.timingPhases.total);
        }
      } catch (err) {
        console.log(`${uri}: FAIL! Making request failed with error: ${err}`);
        await sendMetric(name, false, -1);
      }
    }
  };
}

function main(projectsToCheck, interval) {
  [
    "exit",
    "SIGINT",
    "SIGTERM",
    "SIGUSR1",
    "SIGUSR2",
    "uncaughtException",
    "unhandledRejection"
  ].forEach(e =>
    process.on(e, () => {
      console.log("Exiting...");
      PG_CLIENT.end(); // Close the PostgreSQL client connection
      process.exit();
    })
  );

  console.log("Connecting to Grafana PostgreSQL database...");
  PG_CLIENT.connect();

  const projects = projectsToCheck.map(({ name }) => name);
  console.log(`Checking ${projects.join(", ")} every ${interval} seconds...`);
  const timer = setInterval(check(projectsToCheck), interval * 1000);
  return timer;
}

class UptimeCheckCommand extends Command {
  async run() {
    const { argv, flags } = this.parse(UptimeCheckCommand);
    if (argv.length % 2 !== 0) {
      this.error(
        "Must provide an even number of arguments as projectName projectUrl pairs\nSee more help with --help"
      );
    }
    const interval = flags.interval;
    main(_.chunk(argv, 2), interval);
  }
}

UptimeCheckCommand.description = `Periodically checks a set of projects for uptime.

Specify the projects to check as arguments to this command, in projectName projectUrl pairs. You may specify as many pairs as you'd like so long as each has both a name and a URL.

You MUST have the following environment variables set in order to post metrics:
 - PGHOST
 - PGUSER
 - PGPASSWORD
 - PGDATABASE
`;

UptimeCheckCommand.usage =
  "PROJECTNAME PROJECTURL [PROJECTNAME2 PROJECTURL2...]";

UptimeCheckCommand.examples = [
  "$ uptime-check CoolProject http://example.com AnotherProject https://cool.example.com",
  "$ uptime-check -i 600 CoolProject http://example.com"
];

UptimeCheckCommand.flags = {
  version: flags.version({ char: "v" }),
  help: flags.help({ char: "h" }),
  interval: flags.string({
    char: "i",
    description: "interval to check on (in seconds)",
    parse: input => parseInt(input, 10),
    default: "1800"
  })
};

UptimeCheckCommand.strict = false; // Permit varargs
UptimeCheckCommand.args = [
  {
    name: "projectName",
    required: true,
    description: "Name of project for logging metrics"
  },
  {
    name: "projectURL",
    required: true,
    description: "URL to check for the project"
  }
];

module.exports = UptimeCheckCommand;
