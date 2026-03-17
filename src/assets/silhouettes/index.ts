const modules = import.meta.glob<string>("./*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

const silhouettes: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const key = path.replace("./", "").replace(".svg", "");
  silhouettes[key] = url;
}

export default silhouettes;
