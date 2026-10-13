import { spawn } from "node:child_process";
const children = [];
function run(args, env = {}) {
  const child = spawn("pnpm", args, {
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  children.push(child);
  return child;
}
const seed = run(["--filter","@crunchrr/database","exec","tsx","src/seed-all.ts"], { DEMO_MODE: "true" });
seed.on("exit", (code) => {
  if (code) process.exit(code);
  run(["--filter", "@crunchrr/api", "dev"], {
    DEMO_MODE: "true",
    PORT: "4001",
  });
  run(["--filter", "@crunchrr/web", "dev"]);
  console.log("Demo: http://localhost:3000/demo/dashboard");
});
function stop() {
  children.forEach((c) => c.kill("SIGTERM"));
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
