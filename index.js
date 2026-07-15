// ============================================================
// FILENAME: index.js
// AVIS-COMPONENT: MENU-BUILDER
// ARTIFACT-ID: AV-MENU-2026-JS
// STATE-MATRIX-REF: Version 1/STATE/global.state
// ============================================================


// ============================================================
// FILENAME: index.js
// AVIS-COMPONENT: MENU-BUILDER
// ARTIFACT-ID: AV-MENU-2026-JS
// STATE-MATRIX-REF: Version 1/STATE/global.state
// ============================================================

const files = [];

let conn = {};
let dirs = {};


let activePath = null;
let lastFetchedFileContent = null;


async function loadconfig() {
  try {
    const response = await fetch("config.json");
    if (!response.ok) {
      console.error("Failed to load config.json:", response.statusText);
      return {};
    }

    const settings = await response.json();

    // assign globals
    conn = settings.conn || {};
    dirs = settings.dirs || {};

    console.log("Config loaded:", settings);

    // return dirs so startup can assign it
    return dirs;
  } catch (err) {
    console.error("Error loading config.json:", err);
    return {};
  }
}


async function do_git(path) {
  if (!conn.user || !conn.repo || !conn.branch) {
    console.error("Repo connection not loaded.");
    return [];
  }

  const url = `https://api.github.com/repos/${conn.user}/${conn.repo}/contents/${path}?ref=${conn.branch}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("GitHub API error:", response.statusText);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data)
      ? data.filter(item => item.type === "file").map(item => item.name)
      : [];
  } catch (err) {
    console.error("do_git fetch failed:", err);
    return [];
  }
}




// Fill files array from dirs
async function FillFiles() {
  if (!dirs || typeof dirs !== "object") {
    console.warn("Dirs not loaded, skipping FillFiles.");
    return;
  }

  for (const [key, value] of Object.entries(dirs)) {
    try {
      const list = await do_git(value);
      list.forEach(fname => {
        files.push({ name: fname, source: value, category: key });
      });
    } catch (err) {
      console.error(`Error fetching files for ${key}:`, err);
    }
  }

  RenderMenu();
  buildMenu();
}


// Render flat list of files
function RenderMenu() {
  const menu = document.getElementById("md-list");
  if (!menu) {
    console.warn("RenderMenu: #md-list not found yet");
    return;
  }
  menu.innerHTML = "";
  files.forEach(f => {
    const li = document.createElement("li");
    li.textContent = `[${f.category}] ${f.name}`;
    menu.appendChild(li);
  });
}
function buildMenu() {
  const menuContainer = document.getElementById("menuContainer");
  if (!menuContainer) {
    console.warn("buildMenu: #menuContainer not found yet");
    return;
  }
  menuContainer.innerHTML = "";

  // Group files by category
  const grouped = {};
  files.forEach(file => {
    if (!grouped[file.category]) grouped[file.category] = [];
    grouped[file.category].push(file);
  });

  const baseUrl = `https://${conn.user}.github.io/${conn.repo}/`;

  // Create collapsible sections
  for (const category in grouped) {
    const section = document.createElement("div");
    section.className = "menu-section";

    const header = document.createElement("div");
    header.className = "menu-header";
    header.textContent = category;

    const content = document.createElement("div");
    content.className = "menu-content collapsed";

    header.onclick = () => content.classList.toggle("collapsed");

    grouped[category].forEach(file => {
      const link = document.createElement("a");
      const fullPath = `${baseUrl}${file.source}/${file.name}`;
      link.href = fullPath;
      link.textContent = file.name;

      link.onclick = e => {
        e.preventDefault();

        // Clear previous active states
        document.querySelectorAll(".menu-content a").forEach(a => a.classList.remove("active"));

        // Mark this link active
        link.classList.add("active");

        // Load file into viewer
        loadFile("html_obj.html", fullPath);
      };

      content.appendChild(link);
    });

    section.appendChild(header);
    section.appendChild(content);
    menuContainer.appendChild(section);
  }
}




function injectPrismDependencies() {
  if (document.getElementById("prism-core-lib")) return;

  const linkEl = document.createElement("link");
  linkEl.rel = "stylesheet";
  linkEl.href = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css";
  document.head.appendChild(linkEl);

  const scriptEl = document.createElement("script");
  scriptEl.id = "prism-core-lib";
  scriptEl.src = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js";

  scriptEl.onload = () => {
    const langs = [
      "javascript","typescript","json","markdown","python",
      "css","c","cpp","bash","java","go","rust"
    ];
    langs.forEach(lang => {
      const s = document.createElement("script");
      s.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`;
      document.body.appendChild(s);
    });

    // Block PHP completely
    delete Prism.languages.php;
    Prism.hooks.add("before-highlight", env => {
      if (env.language === "php") env.language = "none";
    });
  };

  document.body.appendChild(scriptEl);
}
function getPrismLanguageClass(path) {
  const lower = path.toLowerCase();

  // Direct render types
  if (lower.endsWith(".html") || lower.endsWith(".htm") || lower.endsWith(".xml"))
    return "render-html";
  if (lower.endsWith(".md") || lower.endsWith(".markdown"))
    return "render-markdown";
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif") || lower.endsWith(".svg"))
    return "render-image";

  // Code highlight types
  if (lower.endsWith(".js") || lower.endsWith(".jsx")) return "language-javascript";
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "language-typescript";
  if (lower.endsWith(".json")) return "language-json";
  if (lower.endsWith(".py")) return "language-python";
  if (lower.endsWith(".css")) return "language-css";
  if (lower.endsWith(".sh") || lower.endsWith(".bash")) return "language-bash";
  if (lower.endsWith(".c") || lower.endsWith(".h")) return "language-c";
  if (lower.endsWith(".cpp") || lower.endsWith(".hpp")) return "language-cpp";
  if (lower.endsWith(".java")) return "language-java";
  if (lower.endsWith(".asm")) return "language-clike";
  if (lower.endsWith(".php")) return "language-php";

  return "language-none";
}

function loadFile(wrapperUrl, sourceUrl) {
  activePath = sourceUrl;
  fetch(wrapperUrl)
    .then(r => r.text())
    .then(wrapperHtml => {
      const fc = document.getElementById("fileContent");
      if (fc) fc.innerHTML = wrapperHtml;
      return fetch(sourceUrl);
    })
    .then(r => r.text())
    .then(sourceCode => {
      lastFetchedFileContent = sourceCode;
      const viewDiv = document.querySelector(".source-view");
      if (!viewDiv) return;

      const langClass = getPrismLanguageClass(sourceUrl);

      if (langClass === "render-html") {
        viewDiv.innerHTML = sourceCode; // let browser render HTML
        return;
      }

      if (langClass === "render-markdown") {
        viewDiv.innerHTML = marked.parse(sourceCode); // requires marked.js
        return;
      }

      if (langClass === "render-image") {
        viewDiv.innerHTML = `<img src="${sourceUrl}" alt="${sourceUrl}" style="max-width:100%; height:auto;" />`;
        return;
      }

      // Default: Prism highlight
      const safe = sourceCode
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      viewDiv.innerHTML = `
        <pre class="${langClass}" style="margin:0; padding:1rem; background:transparent;">
          <code class="${langClass}">${safe}</code>
        </pre>
      `;
      Prism.highlightAllUnder(viewDiv);
    })
    .catch(err => {
      const fc = document.getElementById("fileContent");
      if (fc) fc.innerHTML = "<p style='color:red'>Error loading file.</p>";
      console.error("loadFile error:", err);
    });
}



function renderPrismCode(rawCode, path) {
  const langClass = getPrismLanguageClass(path);
  const safe = rawCode
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `
    <pre class="${langClass}" style="margin:0; padding:1rem; background:transparent;">
      <code class="${langClass}">${safe}</code>
    </pre>
  `;
}


document.addEventListener("DOMContentLoaded", async () => {
  injectPrismDependencies();
  
  dirs = await loadconfig(); // load from config.json

  if (!document.getElementById("menuContainer")) {
    console.error("#menuContainer element missing in HTML");
    return;
  }

  await FillFiles(); // fetch GitHub files, then render menu
});
