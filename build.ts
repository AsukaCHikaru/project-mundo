import tailwind from "bun-plugin-tailwind";

const result = await Bun.build({
  entrypoints: ["./src/index.html"],
  outdir: "./dist",
  sourcemap: "linked",
  target: "browser",
  minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
  env: "BUN_PUBLIC_*",
  plugins: [tailwind],
});

if (!result.success) {
  console.error("Build failed");
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

console.log(`Built ${result.outputs.length} files to ./dist`);
