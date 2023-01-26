import { IncomingMessage, ServerResponse, createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const server = createServer();
const PORT = process.env.PORT ?? 3000;

const users = [ {username: "test", password: "test"} ];

const sessions: Array<{ username: string }> = [];

const extensions: Record<string, string | undefined> = {
    ".js": "text/javascript",
    ".css": "text/css"
};

server.listen(PORT, () => {
    console.log(`Listen on ${PORT}`);
});

async function getLogin(req: IncomingMessage, res: ServerResponse) {
    const index = await readFile("./login.html");
    res.end(index);
}

async function postLogin(req: IncomingMessage, res: ServerResponse) {
    let data = "";
    req.on("data", (chunk) => {
        data += chunk;
    });
    req.on("end", () => {
        const [usernameKV, passwordKV] = data.split("&");
        const [_u, username] = usernameKV.split("=");
        const [_p, password] = passwordKV.split("=");
        if (users.some((user) => user.username === username && user.password === password)) {
            let id = sessions.push({ username: username }) - 1;
            res.writeHead(302, {
                "Location": "/",
                "Set-Cookie": `session=${id}`
            });
            res.end();
            return;
        } else {
            res.statusCode = 401;
            res.end("Unauthorized");
        } 
    });
}

async function getIndex(req: IncomingMessage, res: ServerResponse) {
    const index = await readFile("./index.html");
    res.end(index);
}

async function getStaticFiles(req: IncomingMessage, res: ServerResponse, url: string) {
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

async function checkUser(req: IncomingMessage): Promise<boolean> {
    const rawCookie = req.headers.cookie;
    const cookies = rawCookie?.split("; ");
    if (cookies?.some((cookie) => {
        const [key, value] = cookie.split("=");
        return key === "session" && sessions.length > Number(value) && sessions[Number(value)];
    })) {
        return true;
    }
    return false;
}

server.on("request", async (req: IncomingMessage, res: ServerResponse) => {
    try {
        if (req.url?.startsWith("/public") && req.method === "GET") {
            await getStaticFiles(req, res, req.url);
            return;
        }

        if (req.url === "/login" && req.method === "GET") {
            await getLogin(req, res);
            return;
        }
        if (req.url === "/login" && req.method === "POST") {
            await postLogin(req, res);
            return;
        }

        // 認可の処理
        const isOk = await checkUser(req);
        if (!isOk) {
            res.writeHead(302, {
                "Location": "/login"
            });
            res.end();
            return;
        }

        if (req.url === "/" && req.method === "GET") {
            await getIndex(req, res);
        } else {
            res.statusCode = 404;
            res.end("Not Found");
        }
    } catch(e) {
        console.error(e);
        res.statusCode = 500;
        res.end(e);
    }
});