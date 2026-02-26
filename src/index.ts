import express from "express"; //web server framework
import path from "path"; //works with path files
import { fileURLToPath } from "url";

//create express app and set port
const app = express();
const PORT = process.env.PORT || 3000;

//figures out what folder this file is in (src) and then goes up one level to find public folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//functions that run before routes
//read json and data from requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//look in public folder for static files (html, css, js)
app.use(express.static(path.join(__dirname, "..", "public")));

//home route
app.get("/", (req, res) => {
  res.send(`<h1>Express is running on port ${PORT}</h1>`);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});