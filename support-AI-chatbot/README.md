# Chatbot (Claude Bot): AI Customer Support Chatbot

An AI customer service chatbot for an online store. It can:

- Answer customer questions: damaged items, returns, deliveries and general support.
- Recognise images: customers can send a photo of a product, a label or damage (live mode).
- Recommend products from the store's catalog: it asks about needs and budget first, then suggests in-stock items only.

It runs entirely in the browser, so it can be hosted for free on GitHub Pages. No server needed.

## Two modes

Demo mode | Live AI mode 
| How to use | Works straight away | Click **Add API key** and paste your own Claude API key |
| Answers come from | Pre-written logic in `demo.js` | Claude, with the rules in `prompt.js` |
| Understands | Common requests (headphones, laptops, vacuums, coffee machines, damaged items, returns...) | Anything |
| Photos | Not analysed | Identifies products, reads labels, spots damage |
| Cost | Free | Billed to the visitor's own Anthropic account |

Every visitor uses their own key. If you host this page, nobody can use your key or run up your bill.

## Project structure 

File | What it does |
| `index.html` | The page layout |
| `style.css` | Colours, fonts, dark mode and the phone layout |
| `app.js` | Chat logic, product cards, API key settings and calls to Claude |
| `demo.js` | The scripted demo-mode answers |
| `prompt.js` | The AI's instructions, example conversations and reply format |
| `catalog.js` | The store's product database |

## Run it on your computer

Download the project and double-click `index.html`. That's it.


## Use the real AI

1. Create an API key at [console.anthropic.com](https://console.anthropic.com). Usage is billed to your account, so consider setting a monthly spending limit there.
2. Open the chatbot, click **Add API key**, paste the key and click **Save key**.
3. To switch back to demo mode, open **Settings** and click **Remove key**.

The key is saved only in your browser (localStorage) and sent only to `api.anthropic.com`. Don't save it on a shared computer.

## Change the products

Edit `catalog.js`. Each product looks like this:

```js
{
  "id": "P005",
  "brand": "Sony",
  "name": "WH-1000XM5 Wireless Noise Cancelling Headphones",
  "cat": "Audio",
  "price": 549,
  "stock": 8,
  "desc": "Class-leading noise cancelling and comfort for flights and offices."
}
```

- Give every product a unique `id`.
- Set `stock` to `0` to mark it out of stock. The bot won't recommend it.
- Both modes use the same catalog. New categories need a matching entry in `GROUPS` in `demo.js` for demo mode to understand them.

## Change the bot's behaviour

- **Live mode:** edit `prompt.js` (role, steps, rules, example conversations).
- **Demo mode:** edit `demo.js` (keywords, questions and replies).

## How the product safety check works

The AI replies in JSON with product IDs. Before showing a card, `app.js` looks up each ID in the catalog and skips anything that doesn't exist or is out of stock, so the bot can only ever show items the store really sells.

## License
MIT
