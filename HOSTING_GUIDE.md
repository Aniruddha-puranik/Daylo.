# Host Daylo with GitHub and Vercel

This setup uses GitHub to store and version the project, and Vercel to build and host the Next.js app. GitHub Pages is not suitable for this app as-is because the assistant uses a server-side Next.js API route.

## Before you begin

- Create a GitHub account and a Vercel account. You can sign in to Vercel with GitHub.
- Install [Git](https://git-scm.com/downloads) if it is not already installed.
- Rotate the OpenRouter API key that was shared during development. Use the newly created key only in Vercel's environment variable settings and your private local `.env.local` file.
- Keep this repository private while the app has no authentication or request limits. The assistant endpoint uses your server-side key, and a public app could allow others to consume the model quota.

## 1. Prepare the project

1. Open the `UI` folder in VS Code. It is the folder containing `package.json` and this guide.
2. In the VS Code terminal, install dependencies and check the app locally:

   ```powershell
   npm install
   npm test
   npm run typecheck
   npm run build
   ```

3. Confirm `.env.local` and `.env` are not staged or committed. `.gitignore` excludes `.env*` while keeping `.env.example`.
4. Check `.env.example` contains only a placeholder. Never paste the actual API key into that file, source code, GitHub, or a `NEXT_PUBLIC_` variable.

## 2. Push the project to GitHub

Create an empty GitHub repository. Do not initialize it with a README if you already have this project README. Then, from the `UI` folder, run:

```powershell
git init
git add .
git status
```

Review `git status`. Make sure `.env`, `.env.local`, and any other secret files are absent. Then commit and connect the GitHub repository (replace the URL with your repository URL):

```powershell
git commit -m "Prepare Daylo for hosting"
git branch -M main
git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-REPOSITORY.git
git push -u origin main
```

If the folder is already a Git repository or already has a remote, do not run `git init` or add a second `origin`; inspect `git status` and `git remote -v` first.

## 3. Deploy with Vercel

1. In Vercel, choose **Add New → Project** and import the GitHub repository.
2. Set **Root Directory** to `UI` if the repository contains this app inside a `UI` subfolder. If the repository itself is the `UI` folder, leave the root as `.`.
3. Let Vercel detect Next.js. The build command is `npm run build`; the output setting should remain the Next.js default.
4. In the project's **Settings → Environment Variables**, add:

   | Name | Value |
   | --- | --- |
   | `OPENROUTER_API_KEY` | Your newly rotated OpenRouter key |
   | `OPENROUTER_MODEL` | Optional; for example `minimax/minimax-m3.1-flash:free` |

   Add the key to **Production** and, if you will test preview deployments, **Preview**. Do not prefix it with `NEXT_PUBLIC_`.

5. Select **Deploy**. Vercel builds the project and provides a preview URL. Later pushes to the connected branch trigger new deployments.

## 4. Verify the deployment

- Open the Vercel URL on desktop and mobile sizes.
- Check that the landing page and workspace navigation load.
- Open **Settings → AI & Privacy**, choose a free model, and send a harmless test prompt. A reply should identify the model that actually answered; the selected model is tried first, followed by free fallbacks when needed.
- If the assistant says it is not configured, check the Vercel environment variable name and that it is enabled for the deployed environment. After changing a variable, redeploy.
- Check Vercel's deployment logs for build or server-function errors. Never print or paste the API key into logs or support messages.
- Optionally add a custom domain in Vercel's project settings and follow its DNS instructions.

## Current product limits

Daylo currently stores tasks, notes, goals, habits, settings, and conversations in each user's browser. Data does not sync between devices or browsers. The app does not yet have accounts, a shared database, authentication, or rate limiting. Before inviting multiple users or posting the URL publicly, add authentication, server-side data storage with per-user access controls, and API request limits.

Free OpenRouter models can be rate-limited or unavailable. Model fallbacks improve availability, but they cannot guarantee a response when the whole free pool is unavailable.
