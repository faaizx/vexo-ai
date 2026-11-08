const serverless = require('serverless-http');
const app = require('../../web/server/server');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
    // Normalize URL path so Express routes match properly when invoked via Netlify Function redirects
    if (event.path.startsWith('/.netlify/functions/api')) {
        const sub = event.path.replace(/^\/\.netlify\/functions\/api/, '');
        event.path = sub.startsWith('/api') ? sub : `/api${sub}`;
    }
    return await handler(event, context);
};
