import { spawn } from "node:child_process";

const commands = [
  ["fleet", "html/fleet/server.mjs"],
  ["dealer", "html/dealer/server.mjs"],
];

const children = commands.map(([name, entry]) => {
  const child = spawn(process.execPath, [entry], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: { ...process.env },
  });

  child.on("exit", (code, signal) => {
    if (code && code !== 0) {
      console.error(`${name} server exited with code ${code}${signal ? ` (${signal})` : ""}`);
    }
  });

  return child;
});

function shutdown(signal) {
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
}

process.on("SIGINT", () => {
  shutdown("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
  process.exit(0);
});

console.log("LIN-Q selector: http://localhost:3000/");
