# LocalNotes — Material Web dev setup

This repository was updated to use Material Web (Google's Material You) components with a Vite dev setup.

Quick start

1. Clone the repo and open the project folder.
2. Install dependencies:

```bash
npm install
```

3. Run the dev server:

```bash
npm run dev
```

4. Open the URL shown by Vite (usually http://localhost:5173).

Build for production

```bash
npm run build
npm run preview
```

Notes

- Material Web components are installed as npm packages and imported via bare module specifiers in index.html. Vite resolves these during development and bundling.
- For now, text inputs (title/content) are native elements to preserve the existing app.js logic. We can migrate to Material Web textfields later if you'd like.
