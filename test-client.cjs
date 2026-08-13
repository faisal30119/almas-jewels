const { JSDOM } = require("jsdom");
const fs = require("fs");
const html = fs.readFileSync("dist/index.html", "utf-8");
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
dom.window.addEventListener("error", (e) => {
  console.error("DOM ERROR:", e.error);
});
dom.window.addEventListener("unhandledrejection", (e) => {
  console.error("UNHANDLED REJECTION:", e.reason);
});
setTimeout(() => {
  console.log("Root content:", dom.window.document.getElementById("root").innerHTML.substring(0, 200));
  process.exit(0);
}, 3000);
