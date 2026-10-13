// Support Desk chatbot: main app code.
// Demo mode (no key): answers come from demo.js, free.
// Live mode (visitor adds their own Claude API key): answers come from Claude,
// called directly from the browser. The key never leaves this browser except
// to go to Anthropic.

(() => {
  const $ = (id) => document.getElementById(id);
  const log = $("log"), box = $("box"), sendBtn = $("send"), fileIn = $("file");

  // ---------- product database ----------
  const CATALOG = window.CATALOG;
  const byId = Object.fromEntries(CATALOG.map((p) => [p.id, p]));
  const money = (n) => "A$" + Number(n).toLocaleString("en-AU");
  const catalogText = CATALOG.map((p) =>
    `${p.id} | ${p.brand} ${p.name} | ${p.cat} | ${money(p.price)} | ${p.stock > 0 ? "in stock: " + p.stock : "OUT OF STOCK"} | ${p.desc}`
  ).join("\n");
  const SYSTEM_PROMPT = window.buildRules(catalogText);
  const demo = window.createDemo(CATALOG);

  // ---------- settings saved in this browser ----------
  const API_URL = "https://api.anthropic.com/v1/messages";
  const DEFAULT_MODEL = "claude-sonnet-5-5";
  const KEY_STORE = "supportdesk.apiKey", MODEL_STORE = "supportdesk.model";
  const store = {
    get(k) { try { return localStorage.getItem(k) || ""; } catch { return ""; } },
    set(k, v) { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch {} },
  };
  let apiKey = store.get(KEY_STORE);
  let model = store.get(MODEL_STORE) || DEFAULT_MODEL;

  let busy = false, attached = null, ctl = null;
  const turns = [];               // the conversation, kept by the page
  const shelfNames = new Set();

  // ---------- demo / live mode ----------
  function updateMode() {
    const live = Boolean(apiKey);
    $("mode").classList.toggle("demo", !live);
    $("modeText").innerHTML = live
      ? "<b>Live AI:</b> using your Claude API key. Usage is billed to your own Anthropic account."
      : "<b>Demo mode:</b> scripted answers, no AI and no cost. Add your own Claude API key to use the real AI.";
    $("modeBtn").textContent = live ? "Settings" : "Add API key";
    setStatus(true, live ? "Online" : "Demo");
  }
  function setStatus(on, text) { $("dot").classList.toggle("on", on); $("statusText").textContent = text; }

  const dlg = $("settings");
  $("modeBtn").onclick = () => {
    $("keyInput").value = apiKey;
    $("modelInput").value = model;
    $("removeKey").hidden = !apiKey;
    dlg.showModal();
    $("keyInput").focus();
  };
  $("cancelSettings").onclick = () => dlg.close();
  $("settingsForm").addEventListener("submit", () => {
    apiKey = $("keyInput").value.trim();
    model = $("modelInput").value.trim() || DEFAULT_MODEL;
    store.set(KEY_STORE, apiKey);
    store.set(MODEL_STORE, model === DEFAULT_MODEL ? "" : model);
    updateMode();
  });
  $("removeKey").onclick = () => {
    apiKey = ""; store.set(KEY_STORE, "");
    dlg.close(); updateMode();
  };

  // ---------- chat bubbles ----------
  function addMsg(role, text, opts = {}) {
    $("welcome")?.remove();
    const el = document.createElement("div");
    el.className = "msg " + role + (opts.cls ? " " + opts.cls : "");
    if (opts.img) { const i = document.createElement("img"); i.src = opts.img; i.alt = "Photo you sent"; el.append(i); }
    const t = document.createElement("span"); t.textContent = text; el.append(t);
    log.append(el); log.scrollTop = log.scrollHeight;
    return el;
  }

  // ---------- product cards (only real, in-stock catalog items) ----------
  function addProducts(list) {
    if (!Array.isArray(list) || !list.length) return [];
    const added = [];
    for (const r of list.slice(0, 3)) {
      const p = byId[String(r?.id || "").trim().toUpperCase()];
      if (!p || p.stock <= 0) continue;
      const full = p.brand + " " + p.name;
      added.push({ id: p.id, full });
      if (shelfNames.has(p.id)) continue;
      shelfNames.add(p.id);
      $("emptyShelf")?.remove();
      $("clearShelf").hidden = false;

      const card = document.createElement("article");
      card.className = "prod new";
      const b = document.createElement("div"); b.className = "brand"; b.textContent = p.brand;
      const h = document.createElement("h4"); h.textContent = p.name;
      const pr = document.createElement("span"); pr.className = "price"; pr.textContent = money(p.price);
      const st = document.createElement("p"); st.className = "stock" + (p.stock <= 3 ? " low" : "");
      st.textContent = (p.stock <= 3 ? "Only " + p.stock + " left" : "In stock") + ", item " + p.id;
      const w = document.createElement("p"); w.textContent = String(r.why || p.desc);
      const acts = document.createElement("div"); acts.className = "acts";
      const ask = document.createElement("button"); ask.type = "button"; ask.className = "ask";
      ask.textContent = "Ask about this";
      ask.onclick = () => { box.value = "Tell me more about the " + full + "."; box.focus(); };
      const rev = document.createElement("a");
      rev.href = "https://www.google.com/search?q=" + encodeURIComponent(full + " review");
      rev.target = "_blank"; rev.rel = "noopener"; rev.textContent = "Read reviews";
      acts.append(ask, rev);
      card.append(b, h, pr, st, w, acts);
      $("shelf").prepend(card);
    }
    return added;
  }

  $("clearShelf").onclick = () => {
    $("shelf").innerHTML = '<p class="empty" id="emptyShelf">Tell the assistant what you need. It will ask a couple of quick questions, then suggest items from the store\u2019s catalog.</p>';
    shelfNames.clear(); $("clearShelf").hidden = true;
  };

  // ---------- photos ----------
  $("attach").onclick = () => fileIn.click();
  fileIn.onchange = () => {
    const f = fileIn.files?.[0]; if (!f) return;
    attached = { file: f, url: URL.createObjectURL(f) };
    $("previewImg").src = attached.url; $("previewName").textContent = f.name;
    $("preview").classList.add("show");
    if (!box.value.trim()) box.placeholder = "Add a question about the photo (optional)…";
    box.focus();
  };
  $("removeImg").onclick = clearAttachment;
  function clearAttachment() {
    attached = null; fileIn.value = ""; $("preview").classList.remove("show");
    box.placeholder = "Type your question…";
  }

  // Shrink photos before sending so uploads stay small and fast.
  async function toBase64Jpeg(file) {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1568 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    return { mediaType: "image/jpeg", data: c.toDataURL("image/jpeg", 0.85).split(",")[1] };
  }

  // ---------- talking to Claude (live mode) ----------
  function buildMessages(history, image) {
    const msgs = [];
    for (const m of history.slice(-24)) {
      const last = msgs[msgs.length - 1];
      if (last && last.role === m.role) last.content += "\n\n" + m.content;   // merge back-to-back turns
      else msgs.push({ role: m.role, content: m.content });
    }
    while (msgs.length && msgs[0].role !== "user") msgs.shift();
    if (image && msgs.length) {
      const last = msgs[msgs.length - 1];
      last.content = [
        { type: "image", source: { type: "base64", media_type: image.mediaType, data: image.data } },
        { type: "text", text: last.content },
      ];
    }
    return msgs;
  }

  function parseJson(text) {
    const cleaned = text.replace(/```json|```/g, "").trim();
    try { return JSON.parse(cleaned); } catch {}
    const s = cleaned.indexOf("{"), e = cleaned.lastIndexOf("}");
    if (s !== -1 && e > s) { try { return JSON.parse(cleaned.slice(s, e + 1)); } catch {} }
    return null;
  }

  async function askClaude(history, image, signal) {
    let res;
    try {
      res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          // Required to call the API straight from a browser (the visitor's own key).
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({ model, max_tokens: 1500, system: SYSTEM_PROMPT, messages: buildMessages(history, image) }),
        signal,
      });
    } catch (err) {
      throw err?.name === "AbortError" ? { code: "cancelled" } : { code: "offline" };
    }
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      const code = res.status === 401 ? "bad_api_key"
        : res.status === 429 ? "rate_limited"
        : res.status === 404 ? "bad_model"
        : res.status === 400 ? "bad_request" : "upstream_error";
      throw { code, message: detail?.error?.message };
    }
    const data = await res.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    return parseJson(text) || { reply: text, image_notes: "", products: [] };
  }

  function errorCopy(e) {
    switch (e?.code) {
      case "bad_api_key": return "Your API key was rejected. Open Settings at the top and check it.";
      case "bad_model": return `The model "${model}" wasn't found. Open Settings at the top and check the model name.`;
      case "rate_limited": return "The AI is busy or your usage limit was reached. Wait a moment and send again.";
      case "bad_request": return "The AI couldn't process that: " + (e.message || "please try again.");
      case "offline": return "Can't reach the AI. Check your internet connection and send again.";
      default: return "The assistant didn't respond. Send your message again.";
    }
  }

  // ---------- quick-start chips ----------
  document.querySelectorAll(".chip").forEach((c) => c.onclick = () => {
    if (c.dataset.photo) { fileIn.click(); return; }
    box.value = c.dataset.q; send();
  });

  // ---------- composer ----------
  box.addEventListener("input", () => { box.style.height = "auto"; box.style.height = Math.min(box.scrollHeight, 140) + "px"; });
  box.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
  sendBtn.onclick = () => (busy ? ctl?.abort() : send());

  async function send() {
    if (busy) return;
    const text = box.value.trim();
    if (!text && !attached) return;

    const img = attached;
    const userText = text || "Here's a photo. What can you tell me about it, and can you help?";
    addMsg("user", text || "(photo)", { img: img?.url });
    box.value = ""; box.style.height = "auto";
    clearAttachment();

    const content = (img ? "[Customer attached a photo; it is shown with this message.]\n" : "") + userText;
    turns.push({ role: "user", content });
    while (turns.length > 24) turns.shift();

    busy = true; sendBtn.textContent = "Stop"; setStatus(true, "Typing…");
    const pending = addMsg("bot", "Looking into it…", { cls: "thinking" });
    ctl = new AbortController();

    try {
      const data = apiKey
        ? await askClaude(turns, img ? await toBase64Jpeg(img.file) : null, ctl.signal)
        : await demo.reply(userText, Boolean(img), ctl.signal);

      const reply = String(data?.reply || "Sorry, I didn't catch that. Could you say it another way?");
      pending.classList.remove("thinking");
      pending.querySelector("span").textContent = reply;

      const notes = String(data?.image_notes || "").trim();
      if (img && notes) {
        const s = document.createElement("small"); s.className = "seen"; s.textContent = "In your photo: " + notes;
        pending.append(s);
        turns[turns.length - 1].content += "\n[Photo description: " + notes + "]";
      }
      const added = addProducts(data?.products);
      if (added.length) {
        const wrap = document.createElement("div"); wrap.className = "inline-picks";
        for (const a of added) { const s = document.createElement("span"); s.textContent = a.full; wrap.append(s); }
        pending.append(wrap);
      }
      turns.push({ role: "assistant", content: reply + (added.length ? "\n[Recommended: " + added.map((a) => a.id + " " + a.full).join("; ") + "]" : "") });
    } catch (e) {
      turns.pop();
      if (e?.code === "cancelled") pending.remove();
      else {
        pending.classList.remove("thinking"); pending.classList.add("err");
        pending.querySelector("span").textContent = errorCopy(e);
      }
    } finally {
      busy = false; sendBtn.textContent = "Send";
      updateMode();
      log.scrollTop = log.scrollHeight;
      box.focus();
    }
  }

  updateMode();
})();
