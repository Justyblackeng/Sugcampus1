# SUG Website — Deploy Guide

## What changed
Posted updates now save to the server (Netlify Blobs, via `netlify/functions/updates.js`)
instead of only appearing in the poster's own browser. Every visitor now sees the same
updates, and they persist across refreshes and redeploys.

- `GET  /api/updates` — anyone can read the saved updates (used to populate the page on load)
- `POST /api/updates` — requires a logged-in Netlify Identity user (adds an update)
- `DELETE /api/updates?id=...` — requires a logged-in Netlify Identity user (removes one)

## One-time deploy setup

**Deploy via Git (GitHub/GitLab/Bitbucket), not drag-and-drop.**
Drag-and-drop deploys skip the install step, so the `@netlify/blobs` package
the function needs wouldn't be there. Connecting a repo is one extra step but
Netlify then builds it correctly every time automatically.

1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site → Import an existing project** → pick the repo.
   - Build command: leave blank
   - Publish directory: `.`
   - Netlify will auto-detect `netlify/functions` and install `@netlify/blobs` for you.
3. Deploy.
4. **Site configuration → Identity → Enable Identity** (as before).
5. **Identity → Registration preferences → Invite only** (recommended).
6. **Identity → Invite users** → add your officers' emails.

Netlify Blobs itself needs no separate toggle — it's available automatically
once the site is deployed on Netlify.

## Test it
1. Visit `yoursite.netlify.app/?admin=1`
2. Log in with an invited officer email.
3. Post an update → open the site in an incognito window (not logged in) →
   the update should be there too.

## Notes / things to consider next
- Anyone who successfully logs in (i.e. any invited officer) can currently
  post and delete updates — there's no separate "editor vs admin" role yet.
  If you want that, Netlify Identity supports role metadata and the function
  can check `user.app_metadata.roles`.
- There's no "delete from the UI" button yet, only the API supports it —
  ask if you'd like a delete button added to each card for logged-in admins.
- Uploaded banner images are stored as base64 data URLs, so very large images
  will make each update heavier to load. Fine for now; worth revisiting if
  posts start including big photos.
