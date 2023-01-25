import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
const server = createServer();
const PORT = process.env.PORT ?? 3000;
const extensions = {
    ".js": "text/javascript",
    ".css": "text/css"
};
server.listen(PORT, () => {
    console.log(`Listen on ${PORT}`);
});
async function getIndex(req, res) {
    const index = await readFile("./index.html");
    res.end(index);
}
async function getStaticFiles(req, res, url) {
    const file = await readFile(path.resolve(path.join(".", url)));
    const ext = extensions[path.extname(url)];
    if (!ext) {
        res.statusCode = 404;
        res.end("not found");
        return;
    }
    res.writeHead(200, {
        "Content-Type": extensions[path.extname(url)]
    });
    res.end(file);
}
server.on("request", async (req, res) => {
    try {
        if (req.url === "/" && req.method === "GET") {
            await getIndex(req, res);
        }
        else if (req.url?.startsWith("/public") && req.method === "GET") {
            await getStaticFiles(req, res, req.url);
        }
        else {
            res.statusCode = 404;
            res.end("Not Found");
        }
    }
    catch (e) {
        console.error(e);
        res.statusCode = 500;
        res.end(e);
    }
});
