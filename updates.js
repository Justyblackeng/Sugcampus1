// /api/updates  (mapped via netlify.toml redirect to this function)
//
// GET    -> returns the list of saved updates (public, no login needed)
// POST   -> adds a new update (requires a signed-in Netlify Identity user)
// DELETE -> removes an update by id (requires a signed-in Netlify Identity user)
//
// Storage: Netlify Blobs — a key/value store that comes with every Netlify
// site automatically. Nothing to enable in the dashboard for this part;
// it just works once the site is deployed on Netlify.
//
// Auth: when the browser sends the visitor's Netlify Identity token in the
// "Authorization: Bearer <token>" header, Netlify verifies it for you and
// hands back the logged-in user as context.clientContext.user. If that's
// missing, the request is rejected.

const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'sug-updates';
const KEY = 'updates';

exports.handler = async (event, context) => {
  const store = getStore(STORE_NAME);

  // ── Read the current list ──
  if (event.httpMethod === 'GET') {
    const list = (await store.get(KEY, { type: 'json' })) || [];
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(list),
    };
  }

  // ── Add a new update (officers only) ──
  if (event.httpMethod === 'POST') {
    const user = context.clientContext && context.clientContext.user;
    if (!user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Not signed in.' }) };
    }

    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: 'Bad request body.' }) };
    }

    if (!body.title || !body.excerpt) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Title and summary are required.' }) };
    }

    const list = (await store.get(KEY, { type: 'json' })) || [];
    const item = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      title: body.title,
      excerpt: body.excerpt,
      cat: body.cat || 'announcement',
      author: body.author || user.email,
      date: body.date || new Date().toISOString().split('T')[0],
      feature: !!body.feature,
      imgSrc: body.imgSrc || '',
      postedBy: user.email,
      postedAt: new Date().toISOString(),
    };

    list.unshift(item);
    await store.set(KEY, JSON.stringify(list));

    return {
      statusCode: 201,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(item),
    };
  }

  // ── Delete an update (officers only) ──
  if (event.httpMethod === 'DELETE') {
    const user = context.clientContext && context.clientContext.user;
    if (!user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Not signed in.' }) };
    }
    const id = event.queryStringParameters && event.queryStringParameters.id;
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing id.' }) };
    }
    let list = (await store.get(KEY, { type: 'json' })) || [];
    list = list.filter((u) => u.id !== id);
    await store.set(KEY, JSON.stringify(list));
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed.' }) };
};
