# Heart Animation

A responsive HTML/CSS/JavaScript website that recreates the an "I love you" heart animation 

## Run locally

```bash
npm install
npm start
```

Open:

```text
http://localhost:10000
```

## Deploy on Render

1. Create a GitHub repository.
2. Upload this project.
3. In Render, choose **New → Web Service**.
4. Connect the GitHub repository.
5. Runtime: **Node**.
6. Build Command:

```text
npm install
```

7. Start Command:

```text
npm start
```

8. Deploy.

The server automatically uses Render's `PORT` environment variable.

## Files

- `public/index.html` — page structure
- `public/style.css` — visual design and responsive layout
- `public/script.js` — heart mathematics, repeated text, animation and controls
- `server.js` — Express server for Render
- `package.json` — Node dependencies and start command
