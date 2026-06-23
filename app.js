// SECTION SCHEMAS
const sectionSchemas = {
    "Title": {
        fields: [
            { id: "title", label: "Project Title", type: "text" },
            { id: "tagline", label: "Tagline", type: "text" }
        ]
    },
    "Description": {
        fields: [
            { id: "summary", label: "Short Description", type: "textarea" },
            { id: "features", label: "Key Features (comma separated)", type: "text" }
        ]
    },
    "Installation": {
        fields: [
            { id: "steps", label: "Installation Steps (one per line)", type: "textarea" }
        ]
    },
    "Usage": {
        fields: [
            { id: "examples", label: "Usage Examples", type: "textarea" }
        ]
    },
    "License": {
        fields: [
            { id: "license", label: "License Name", type: "text" }
        ]
    },
    "CJS Node": {
        fields: [
            { id: "name", label: "Node Name", type: "text" },
            { id: "description", label: "Node Description", type: "textarea" },
            { id: "cjs", label: "CJS JSON File", type: "cjs" }
        ]
    }
};

// PERSONAL DATA BLOCKS
const personalBlocks = {
    "None": [],
    "Author Info": [
        { id: "author", label: "Author Name", type: "text" },
        { id: "email", label: "Email", type: "text" }
    ],
    "Project Meta": [
        { id: "version", label: "Version", type: "text" },
        { id: "status", label: "Status", type: "text" }
    ]
};

// ROOT README STRUCTURE
let readmeData = [];

// DOM ELEMENTS
const sectionTypeSelect = document.getElementById("sectionType");
const personalTypeSelect = document.getElementById("personalType");
const formArea = document.getElementById("formArea");
const addSectionBtn = document.getElementById("addSectionBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const jsonOutput = document.getElementById("jsonOutput");
const treePreview = document.getElementById("treePreview");
const mdPreview = document.getElementById("mdPreview");

// POPULATE DROPDOWNS
Object.keys(sectionSchemas).forEach(type => {
    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = type;
    sectionTypeSelect.appendChild(opt);
});

Object.keys(personalBlocks).forEach(type => {
    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = type;
    personalTypeSelect.appendChild(opt);
});

// RENDER FORM
function renderForm() {
    const sectionType = sectionTypeSelect.value;
    const personalType = personalTypeSelect.value;

    const schema = sectionSchemas[sectionType];
    const personal = personalBlocks[personalType];

    formArea.innerHTML = "";

    const box = document.createElement("div");

    [...schema.fields, ...personal].forEach(field => {
        const label = document.createElement("label");
        label.textContent = field.label;

        let input;

        if (field.type === "textarea") {
            input = document.createElement("textarea");
        } else if (field.type === "cjs") {
            input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.dataset.cjs = "true";

            input.addEventListener("change", e => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const parsed = JSON.parse(reader.result);
                        e.target.dataset.cjsData = JSON.stringify(parsed);
                    } catch {
                        alert("Invalid JSON file");
                    }
                };
                reader.readAsText(file);
            });

        } else {
            input = document.createElement("input");
            input.type = field.type;
        }

        input.id = field.id;
        box.appendChild(label);
        box.appendChild(input);
    });

    formArea.appendChild(box);
}

sectionTypeSelect.addEventListener("change", renderForm);
personalTypeSelect.addEventListener("change", renderForm);
renderForm();

// ADD SECTION
addSectionBtn.addEventListener("click", () => {
    const sectionType = sectionTypeSelect.value;
    const personalType = personalTypeSelect.value;

    const schema = sectionSchemas[sectionType];
    const personal = personalBlocks[personalType];

    const sectionObj = { type: sectionType };

    [...schema.fields, ...personal].forEach(field => {
        const el = document.getElementById(field.id);

        if (field.type === "cjs") {
            const fileName = el.files[0]?.name || "";
            const data = el.dataset.cjsData ? JSON.parse(el.dataset.cjsData) : null;

            sectionObj[field.id] = { file: fileName, data };
        } else {
            sectionObj[field.id] = el.value;
        }
    });

    readmeData.push(sectionObj);
    updateOutputs();
});

// CLEAR ALL
clearAllBtn.addEventListener("click", () => {
    if (!confirm("Clear all sections?")) return;
    readmeData = [];
    updateOutputs();
});

// UPDATE OUTPUTS
function updateOutputs() {
    jsonOutput.textContent = JSON.stringify(readmeData, null, 4);
    renderTree();
    renderMarkdown();
}

// RECURSIVE TREE
function renderTree() {
    treePreview.innerHTML = "";

    readmeData.forEach(section => {
        treePreview.appendChild(createTreeNode(section));
    });
}

function createTreeNode(section) {
    const node = document.createElement("div");
    node.className = "tree-node";

    const header = document.createElement("div");
    header.className = "tree-node-header";

    const typeSpan = document.createElement("span");
    typeSpan.className = "tree-type";
    typeSpan.textContent = section.type;

    header.appendChild(typeSpan);

    Object.keys(section).forEach(key => {
        if (key === "type") return;

        const value = section[key];

        if (key === "cjs") {
            const cjsSpan = document.createElement("span");
            cjsSpan.className = "tree-cjs";
            cjsSpan.textContent = `CJS → ${value.file}`;
            header.appendChild(cjsSpan);
        } else if (typeof value === "string" && value.trim()) {
            const labelSpan = document.createElement("span");
            labelSpan.className = "tree-label";
            labelSpan.textContent = `${key}: "${value}"`;
            header.appendChild(labelSpan);
        }
    });

    node.appendChild(header);

    if (section.cjs?.data) {
        const children = document.createElement("div");
        children.className = "tree-children";

        const arr = Array.isArray(section.cjs.data)
            ? section.cjs.data
            : section.cjs.data.sections || [];

        arr.forEach(child => {
            children.appendChild(createTreeNode(child));
        });

        node.appendChild(children);
    }

    return node;
}

// MARKDOWN PREVIEW (RAW)
function renderMarkdown() {
    let md = "";

    readmeData.forEach(sec => {
        md += `## ${sec.type}\n`;

        Object.keys(sec).forEach(key => {
            if (key === "type") return;

            if (key === "cjs") {
                md += `- CJS File: ${sec[key].file}\n`;
            } else {
                md += `- ${key}: ${sec[key]}\n`;
            }
        });

        md += `\n`;
    });

    mdPreview.textContent = md;
}

// INITIAL RENDER
updateOutputs();
