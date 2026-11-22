# BeeBloom 2 🐝
A tablet-first, voice-first spelling preparation coach. Original implementation inspired by the learning flows discussed for SchoolWordList, Read Steps and Spelling Quest; no third-party application code copied. Version 1 remains separate.

## Launch
Enable GitHub Pages from main, / (root), or run python -m http.server 5173 locally. No build step or API keys. Use Safari on iPad or Chrome/Edge on desktop.

## Architecture
- curriculum.js: curated pattern lessons and separate transfer examples.
- engine.js: deterministic scheduling, scoring, oral transcript parsing and learning metrics.
- speech.js: browser speech adapters, US voice preferences, optional recording recognition.
- app.js: guided student journey and parent controls.
- style.css: responsive tablet-first design.
- tests.html: browser-based pure engine regression tests.

## Privacy and limits
Import the official PDF privately on the device; the copyrighted list is not committed. Browser speech recognition may process audio remotely; no audio retained by this app. Parent controls are not password protected. Progress is local to this app origin/path, with JSON backup. The application is not an official judge. Confirm recognized letters before scoring. Native speech may collapse letters into words: such results must not be scored automatically. No cloud AI voice is bundled. Transfer results are first attempts on words not previously presented in this app, not proof the learner has never encountered the word elsewhere.

## Learning model
A daily adventure uses recall, one pattern mini-lesson, related practice and fresh transfer probes. Review intervals follow confirmed performance. Mastery requires successful unassisted recall on three distinct days, with at least seven days between first and last success since the latest miss. Separate parent measures for listed coverage/mastery, first unseen probes, pattern evidence and active duration. No single readiness score.
