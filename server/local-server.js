const app = require('./functions/server.js');

const { createProxyMiddleware } = require('http-proxy-middleware');

app.use(
  '/.netlify/functions/server',
  createProxyMiddleware({
    target: 'https://nftlooker-server.netlify.app',
    changeOrigin: true,
  })
);

const PORT = process.env.PORT || 7777;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
