const app = require('./src/server.js');

const PORT = process.env.PORT || 7777;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
