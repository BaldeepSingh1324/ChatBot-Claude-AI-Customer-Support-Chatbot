// Demo mode: answers without any AI, so it costs nothing.
// It follows the same rules as the real bot (ask about needs first, then
// recommend in-stock catalog items) using simple keyword matching.
// It returns the same shape as the AI: { reply, image_notes, products: [{id, why}] }

window.createDemo = function (catalog) {
  const money = (n) => "A$" + n.toLocaleString("en-AU");
  const has = (text, words) => words.some((w) => text.includes(w));

  // Product groups the demo understands, with the follow-up questions for each.
  const GROUPS = [
    { label: "headphones", words: ["headphone", "earbud", "airpod", "noise cancel"],
      match: (p) => p.cat === "Audio" && /Headphones|AirPods/.test(p.name),
      ask: "- Where will you mostly use them: flights, the office, the gym, or around the house?\n- Roughly what's your budget?" },
    { label: "speakers", words: ["speaker", "smart speaker", "nest mini"],
      match: (p) => /Speaker/.test(p.name),
      ask: "- Is it for music outdoors (beach, camping) or a smart speaker for home?\n- Roughly what's your budget?" },
    { label: "laptops", words: ["laptop", "macbook", "notebook", "computer"],
      match: (p) => p.cat === "Laptops",
      ask: "- What will you mainly use it for: study, office work, or photo editing?\n- Roughly what's your budget?" },
    { label: "tablets", words: ["tablet", "ipad"],
      match: (p) => p.cat === "Tablets",
      ask: "- Who's it for, and what will they use it for: study, drawing, or videos?\n- Roughly what's your budget?" },
    { label: "vacuums", words: ["vacuum", "roomba", "hoover"],
      match: (p) => /Vacuum/.test(p.name),
      ask: "- Do you have pets, and are your floors mostly carpet or hard floors?\n- Roughly what's your budget?" },
    { label: "coffee machines", words: ["coffee", "espresso", "nespresso", "latte", "cappuccino"],
      match: (p) => /Coffee|Espresso/.test(p.name),
      ask: "- Do you want one-touch simple, or are you happy to learn some barista skills?\n- Roughly what's your budget?" },
    { label: "air fryers", words: ["air fryer", "airfryer", "fryer"],
      match: (p) => /Air Fryer/.test(p.name),
      ask: "- How many people do you usually cook for?\n- Roughly what's your budget?" },
    { label: "kettles", words: ["kettle"],
      match: (p) => /Kettle/.test(p.name),
      ask: "- Is a quiet boil or a large capacity more important to you?\n- Roughly what's your budget?" },
    { label: "electric toothbrushes", words: ["toothbrush"],
      match: (p) => /Toothbrush/.test(p.name),
      ask: "- Do you have sensitive teeth or gums?\n- Roughly what's your budget?" },
    { label: "hair dryers", words: ["hair dryer", "hairdryer"],
      match: (p) => /Hair Dryer/.test(p.name),
      ask: "- What's your hair type: fine, thick, or curly?\n- Roughly what's your budget?" },
    { label: "watches", words: ["watch", "garmin", "running", "fitness tracker"],
      match: (p) => /Watch/.test(p.name),
      ask: "- What do you want to track: running, swimming, or everyday fitness?\n- Roughly what's your budget?" },
    { label: "outdoor gear", words: ["bottle", "hydro flask", "backpack", "daypack", "hiking"],
      match: (p) => p.cat === "Fitness & outdoor" && !/Watch/.test(p.name),
      ask: "- What kind of trips: day hikes, the gym, or travel?\n- Roughly what's your budget?" },
    { label: "security cameras", words: ["camera", "security"],
      match: (p) => /Camera/.test(p.name),
      ask: "- Is it for indoors, and do you want to watch a pet, a baby, or the house?\n- Roughly what's your budget?" },
  ];

  let pending = null;      // group we asked questions about
  let lastGroup = null;    // group of the last recommendation
  let lastPicks = [];      // products in the last recommendation

  const findGroup = (t) => GROUPS.find((g) => has(t, g.words)) || null;
  const inStock = (g) => catalog.filter((p) => g.match(p) && p.stock > 0);

  function budgetOf(t) {
    const nums = [...t.matchAll(/\$?\s?(\d[\d,]*(?:\.\d+)?)\s*(k)?\b/g)]
      .map((m) => parseFloat(m[1].replace(/,/g, "")) * (m[2] ? 1000 : 1))
      .filter((n) => n >= 20);
    return nums.length ? Math.max(...nums) : null;
  }

  // Score products by how many of the customer's words appear in the description.
  function hintScore(p, t) {
    const hints = {
      "noise": /(?<!no )noise cancelling/i, "dog": /pet/i, "cat": /pet/i, "flight": /flight/i, "office": /office/i, "pet": /pet/i,
      "carpet": /vacuum/i, "hard floor": /hard floors/i, "milk": /milk/i, "latte": /milk/i,
      "simple": /no skill|one-touch/i, "easy": /no skill|one-touch|easy/i, "photo": /photo/i,
      "study": /study/i, "light": /light/i, "iphone": /iPhone/i, "sensitive": /sensitive/i,
      "kid": /kids/i, "outdoor": /waterproof/i, "beach": /waterproof/i, "camping": /waterproof/i,
      "smart": /voice|smart/i, "baby": /camera/i, "hik": /hiking/i, "gym": /gym/i,
    };
    let s = 0;
    for (const [word, re] of Object.entries(hints)) if (t.includes(word) && re.test(p.desc + " " + p.name)) s++;
    return s;
  }

  function recommend(group, t, maxPrice, cheaper = false) {
    let items = inStock(group);
    const budget = maxPrice ?? budgetOf(t);
    let overBudget = false;
    if (budget) {
      const within = items.filter((p) => cheaper ? p.price < budget : p.price <= budget * 1.05);
      if (within.length) items = within; else overBudget = true;
    }
    items = items
      .map((p) => ({ p, score: hintScore(p, t) * 10000 + (overBudget ? -p.price : p.price) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((x) => x.p);
    lastGroup = group; lastPicks = items; pending = null;

    if (!items.length) {
      return { reply: `Sorry, we don't have any ${group.label} in stock right now. Is there anything else I can help you find?`, image_notes: "", products: [] };
    }
    const lines = items.map((p) => `- ${p.brand} ${p.name} at ${money(p.price)}: ${p.desc}`).join("\n");
    const one = items.length === 1;
    const intro = cheaper
      ? (one ? "Here's a cheaper option:" : "Here are some cheaper options:")
      : overBudget
        ? `We don't have ${group.label} under ${money(budget)}, but ${one ? "this is the closest option" : "these are the closest options"}:`
        : `Thanks, that helps! Based on what you've told me, ${one ? "here's my pick" : "here are my picks"}:`;
    const outro = one ? "Would you like to know more about it, or see other options?" : "Would you like me to compare them, or look for something cheaper?";
    return {
      reply: `${intro}\n${lines}\n\n${outro}`,
      image_notes: "",
      products: items.map((p) => ({ id: p.id, why: p.desc })),
    };
  }

  function findProductByName(t) {
    return catalog.find((p) => t.includes((p.brand + " " + p.name).toLowerCase()) || t.includes(p.name.toLowerCase())) || null;
  }

  function respond(text, hasPhoto) {
    const t = text.toLowerCase();
    const photoNote = "\n\n(Demo mode can't look at photos. Add your API key at the top to try real image recognition: it can identify products, read labels and spot damage.)";

    // 1. "Tell me more about the ..." (from the product card button) or a named product
    const named = findProductByName(t);
    if (named) {
      if (named.stock <= 0) {
        const g = GROUPS.find((g) => g.match(named));
        const alt = g ? inStock(g).sort((a, b) => Math.abs(a.price - named.price) - Math.abs(b.price - named.price))[0] : null;
        return {
          reply: `Sorry, the ${named.brand} ${named.name} is out of stock at the moment.` +
            (alt ? ` A similar in-stock option is the ${alt.brand} ${alt.name} at ${money(alt.price)}: ${alt.desc}` : ""),
          image_notes: "", products: alt ? [{ id: alt.id, why: "Closest in-stock alternative." }] : [],
        };
      }
      return {
        reply: `The ${named.brand} ${named.name} is ${money(named.price)}. ${named.desc}\n\n` +
          (named.stock <= 3 ? `Heads up: only ${named.stock} left in stock. ` : "It's in stock. ") +
          "Would you like to compare it with something else?",
        image_notes: "", products: [{ id: named.id, why: named.desc }],
      };
    }

    // 2. Support: damaged items, returns, orders
    if (has(t, ["damage", "broken", "cracked", "faulty", "not working", "doesn't work", "dented", "smashed"])) {
      pending = null;
      return { reply: "I'm so sorry your item arrived damaged, that's really disappointing. Please don't use it if it might be unsafe.\n\nTo sort this out quickly, could you send me:\n- your order number\n- the date it was delivered\n- a photo of the damage, if you haven't already\n\nI'll then prepare a summary for our team so they can arrange a replacement or refund." + (hasPhoto ? photoNote : ""), image_notes: "", products: [] };
    }
    if (has(t, ["refund", "return", "exchange"])) {
      return { reply: "Happy to help with a return. Could you tell me your order number and the item you'd like to return? I'll pass the details to our team, who'll confirm the next steps by email.", image_notes: "", products: [] };
    }
    if (has(t, ["track", "where is my", "delivery", "shipping", "order status", "hasn't arrived", "not arrived"])) {
      return { reply: "I can't see order details from here, but our team can check for you. Could you share your order number and the email you ordered with? I'll prepare a summary so they can get back to you quickly.", image_notes: "", products: [] };
    }

    // 3. Browse: "what X do you sell / have", "show me X"
    const group = findGroup(t);
    if (group && has(t, ["what", "which", "show me", "list", "do you sell", "do you have", "browse", "options"]) && !budgetOf(t)) {
      const items = inStock(group);
      pending = group;
      if (!items.length) return { reply: `We don't have any ${group.label} in stock right now, sorry.`, image_notes: "", products: [] };
      return {
        reply: `Here are the ${group.label} we have in stock:\n` +
          items.map((p) => `- ${p.brand} ${p.name}: ${money(p.price)}`).join("\n") +
          `\n\nIf you tell me a bit about how you'll use it and your budget, I can help you choose.`,
        image_notes: "", products: items.slice(0, 3).map((p) => ({ id: p.id, why: p.desc })),
      };
    }

    // 4. Cheaper follow-up
    if (has(t, ["cheaper", "less expensive", "lower price"]) && lastGroup && lastPicks.length) {
      const min = Math.min(...lastPicks.map((p) => p.price));
      if (min <= Math.min(...inStock(lastGroup).map((p) => p.price))) {
        return { reply: `That's already our most affordable option for ${lastGroup.label}. Would you like help with anything else?`, image_notes: "", products: [] };
      }
      return recommend(lastGroup, t, min - 1, true);
    }

    // 5. Product request: ask first, recommend once we know the budget
    if (group) {
      if (budgetOf(t) || has(t, ["just pick", "you choose", "any is fine", "doesn't matter"])) return recommend(group, t);
      pending = group;
      return { reply: `Happy to help you find the right ${group.label}! Two quick questions so I pick well:\n${group.ask}`, image_notes: "", products: [] };
    }
    if (pending) return recommend(pending, t);   // the customer is answering our questions

    // 6. Photo with nothing else to go on
    if (hasPhoto) {
      return { reply: "Thanks for the photo!" + photoNote.replace("\n\n", " ") + "\n\nIn the meantime, tell me in words what you're looking for or what's wrong, and I'll help.", image_notes: "", products: [] };
    }

    // 7. Greetings and fallback
    if (/^(hi|hello|hey|g'day|good (morning|afternoon|evening))\b/.test(t)) {
      return { reply: "Hi there, welcome to Support Desk! I can help you find products like headphones, laptops, coffee machines or vacuums, or sort out a problem with an order. What can I do for you?", image_notes: "", products: [] };
    }
    return {
      reply: "I'm the demo version, so I only understand a few things. Try asking me to:\n- find headphones, a laptop, a vacuum or a coffee machine\n- show what we sell in a category\n- help with a damaged item, a return or a delivery\n\nAdd your Claude API key at the top to chat with the real AI about anything.",
      image_notes: "", products: [],
    };
  }

  // Wait a moment so it feels like a real assistant. Can be cancelled with Stop.
  return {
    reply(text, hasPhoto, signal) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve(respond(text, hasPhoto)), 700);
        signal?.addEventListener("abort", () => { clearTimeout(timer); reject({ code: "cancelled" }); });
      });
    },
    respond, // exposed for testing
  };
};
