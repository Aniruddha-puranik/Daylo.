# Daylo

Daylo is a responsive personal productivity app with a local-first demo workspace and an optional server-side OpenRouter assistant.

For production hosting, see the [GitHub and Vercel deployment guide](HOSTING_GUIDE.md).

## VS Code install and run guide

1. Install [Node.js 20.9 or later](https://nodejs.org/) and [Visual Studio Code](https://code.visualstudio.com/). Restart VS Code after installing Node.js so its terminal can find `node` and `npm`.
2. In VS Code, choose **File → Open Folder…** and open the folder containing this README and `package.json`.
3. Open **Terminal → New Terminal**. Check the tools are available:

   ```powershell
   node --version
   npm --version
   ```

4. Install the app dependencies:

   ```powershell
   npm install
   ```

5. In the VS Code Explorer, copy `.env.example` and name the copy `.env.local`. Add your OpenRouter key to `OPENROUTER_API_KEY` in `.env.local`. Keep this file private; it is excluded by `.gitignore`. Never put the key in a `NEXT_PUBLIC_` variable or in frontend code. You can skip this step to run Daylo without AI.
6. Start the development server in the terminal:

   ```powershell
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser. Press **Ctrl+C** in the terminal to stop the server.

To create and run the production build from VS Code, use `npm run build` and then `npm start` in the terminal.

## Run locally

1. Install Node.js 20.9 or later.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env.local` and set `OPENROUTER_API_KEY` on your local server. Never use a `NEXT_PUBLIC_` variable for this key.
4. Run `npm run dev`, then visit `http://localhost:3000`.

The app works without an AI key. AI requests show a setup message until the key is configured. `OPENROUTER_MODEL` accepts only the free model IDs listed in `app/api/assistant/route.ts`; the default is `minimax/minimax-m3.1-flash:free`. You can choose another allowed free model in **Settings → AI & Privacy**.

## Data and integration boundaries

Tasks, notes, goals, habit checkmarks, assistant chat, and focus timer state are stored in this browser's local storage. There is no authentication, cloud sync, PostgreSQL database, or user isolation in this demo build. Do not use it for multiple users or sensitive records. Settings can clear local demo data.

The AI endpoint runs server-side and sends the recent conversation plus a small selection of incomplete tasks and goals to OpenRouter. Free model providers may have their own retention and usage policies; avoid confidential data. The endpoint only returns text. It does not execute model instructions or mutate application data.

Calendar is an internal task preview. Device-wide screen-time data is unavailable to an ordinary browser, so Daylo does not fabricate it. Automation Studio can save recurring task rules locally and create their task while Daylo is open at the configured time; browser automation cannot reliably run while the app is closed, so that requires a background server scheduler. Authentication, production database, real reminders/notifications, external calendar sync, and server scheduling remain to be configured before production multi-user use.

## Build

Run `npm test` for the unit and app-flow suite, `npm run typecheck` for the TypeScript check, and `npm run build` to create a production build. Then run `npm start` to serve it. GSAP powers reduced-motion-aware page entrances, landing-page scroll reveals, and assistant minimize motion. Assistant conversations, profile name, selected free model, and appearance are saved in local storage.
