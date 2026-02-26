async function processZip() {
  const fileInput = document.getElementById("zipInput");
  const resultDiv = document.getElementById("result");
  const loading = document.getElementById("loading");

  if (!fileInput.files.length) {
    alert("Please upload ZIP file first!");
    return;
  }

  loading.classList.remove("hidden");
  resultDiv.innerHTML = "";

  const zip = await JSZip.loadAsync(fileInput.files[0]);

  let followers = new Set();
  let following = new Set();

  for (const filename of Object.keys(zip.files)) {

    if (filename.includes("followers_1.json")) {
      const content = await zip.files[filename].async("string");
      const data = JSON.parse(content);

      data.forEach(entry => {
        if (entry.string_list_data.length > 0) {
          followers.add(entry.string_list_data[0].value);
        }
      });
    }

    if (filename.includes("following.json")) {
      const content = await zip.files[filename].async("string");
      const data = JSON.parse(content);

      data.relationships_following.forEach(entry => {
        following.add(entry.title);
      });
    }
  }

  const notFollowingBack = [...following].filter(x => !followers.has(x));
  const notFollowedBack = [...followers].filter(x => !following.has(x));

  loading.classList.add("hidden");

  resultDiv.innerHTML = `
    <div class="stats">
      <div class="card">
        <h3>Following</h3>
        <p>${following.size}</p>
      </div>
      <div class="card">
        <h3>Followers</h3>
        <p>${followers.size}</p>
      </div>
      <div class="card">
        <h3>Not Following Back</h3>
        <p>${notFollowingBack.length}</p>
      </div>
    </div>

    <h3>Not Following Back</h3>
    <pre>${notFollowingBack.join("\n")}</pre>

    <h3>They Follow You but You Don't</h3>
    <pre>${notFollowedBack.join("\n")}</pre>
  `;
}

/* Drag & Drop */
const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("zipInput");

dropArea.addEventListener("click", () => fileInput.click());

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.style.background = "rgba(255,255,255,0.2)";
});

dropArea.addEventListener("dragleave", () => {
  dropArea.style.background = "transparent";
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  fileInput.files = e.dataTransfer.files;
  dropArea.style.background = "transparent";
});