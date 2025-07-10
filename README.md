# ✨ storybookify

> The zero-config, plug-and-play Storybook story generator for React projects!

---

## 🚀 What is storybookify?

**storybookify** is a command-line tool that automatically generates Storybook stories for all your React components — no setup or boilerplate required.

Just point it at your components folder, and it will:

- Scan your components
- Create up-to-date `.stories.tsx` files
- Start Storybook for you (zero extra steps!)

---

## ✨ Features

- ⚡️ **Zero-config**: Works out of the box with sensible defaults
- 🧠 **Smart scanning**: Finds all your React components automatically
- 📝 **Generates stories**: Creates/updates stories for each component
- 🧹 **Cleans up**: Removes old/unneeded stories
- 🎨 **Polished CLI output**: Colorful, friendly logs and a summary table
- 💻 **Single-command workflow**: `npx storybookify` does everything

---

## 🛠️ Installation

You can use storybookify **without installing globally** via [npx](https://www.npmjs.com/package/npx):

```sh
npx storybookify
```

Or, to install globally for repeated use:

```sh
npm install -g storybookify
```

---

## ⚙️ Usage

**1. In your React app:**

(Optional) Create a `storybookify.config.js` in your project root:

```js
export default {
  componentsDir: "./src/components", // Where your components live
  exclude: ["**/*.test.tsx", "**/__mocks__/**", "**/deprecated/**"],
  include: ["**/*.tsx", "**/*.jsx"],
};
```

Then run:

```sh
npx storybookify
```

or

```sh
storybookify
```

**2. What happens next?**

- 🗂️ All stories are generated inside your library's storybook-app/src/stories
- 🚀 Storybook starts automatically — open http://localhost:6006 in your browser!

---

## 📝 Example Output

```sh
✨ storybookify ✨ — The zero-config, plug-and-play Storybook generator!

🧭 Scanning components in: src/components
✔ Found 10 components.

📝 Generating stories...
✔ Button
✔ Card
...

┌────────────┬──────────────────────────────────────────────┐
│ Component  │ Story File                                   │
├────────────┼──────────────────────────────────────────────┤
│ Button     │ storybook-app/src/stories/Button.stories.tsx │
│ Card       │ storybook-app/src/stories/Card.stories.tsx   │
└────────────┴──────────────────────────────────────────────┘

🎉 All stories generated! (10 components)

🚀 Starting Storybook...
✨ All done! Storybook is running ✨
Visit http://localhost:6006/ to view your Storybook.
```

---

## 🧩 CLI Options

| Option                 | Description                           | Default                    |
| ---------------------- | ------------------------------------- | -------------------------- |
| `-c, --components-dir` | Path to your components directory     | `src/components`           |
| `--config`             | Path to your storybookify config file | `./storybookify.config.js` |

**Example:**

```sh
npx storybookify --components-dir ./src/ui
```

---

## 💡 Tips

- No config needed for typical projects — just run and go!
- For advanced use, customize your `storybookify.config.js`.

---

## 🩹 Troubleshooting

- `Components directory not found`:
  Check your config path, and ensure your components folder exists.

---

## 🤝 Contributing

Found a bug? Have an idea for a feature?
We love contributions! Open an issue or PR at
https://github.com/priyankapakhale/storybookify

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

**Built with ❤️ by [@priyankapakhale](https://github.com/priyankapakhale)**
