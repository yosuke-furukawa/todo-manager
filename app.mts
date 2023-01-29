import { IncomingMessage, ServerResponse, createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createUser, existUser } from "./lib/users.mjs";
import { createSession, existSession, deleteSession } from "./lib/sessions.mjs";

const server = createServer();
const PORT = process.env.PORT ?? 3000;

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
    req.on("end", async () => {
        try {
            const [usernameKV, passwordKV] = data.split("&");
            const [_u, username] = usernameKV.split("=");
            const [_p, password] = passwordKV.split("=");
            const result = await existUser(username, password);
            if (!result) {
                res.statusCode = 401;
                res.end("Unauthorized, login failed.");
                return;
            }
            const { id } = await createSession(username);
            res.writeHead(302, {
                "Location": "/",
                "Set-Cookie": `session=${id}`
            });
            res.end();
        } catch (e) {
            console.error(e);
            res.statusCode = 500;
            res.end("Internal Server Error");
        }
    });
}

async function getRegister(req: IncomingMessage, res: ServerResponse) {
    const index = await readFile("./register.html");
    res.end(index);
}

async function postRegister(req: IncomingMessage, res: ServerResponse) {
    let data = "";
    req.on("data", (chunk) => {
        data += chunk;
    });
    req.on("end", async () => {
        try {
            const [usernameKV, passwordKV, passwordConfirmKV] = data.split("&");
            const [_u, username] = usernameKV.split("=");
            const [_p, password] = passwordKV.split("=");
            const [_pc, passwordConfirm] = passwordConfirmKV.split("=");
    
            if (password !== passwordConfirm) {
                res.statusCode = 400;
                res.end("password does not match password confirm."); 
                return;
            }
    
            await createUser(username, password);
            res.end("Created!!");          
        } catch (e) {
            console.error(e);
            res.statusCode = 500;
            res.end("Internal Server Error");
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

async function checkUser(req: IncomingMessage): Promise<string | null> {
    const rawCookie = req.headers.cookie;
    const cookies = rawCookie?.split("; ");
    if (!cookies || cookies.length === 0) {
        return null;
    }
    for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === "session") {
            const isExist = await existSession(value);
            if (isExist) {
                return value;
            }
            return null;
        }
    }
    return null;
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
        if (req.url === "/register" && req.method === "GET") {
            await getRegister(req, res);
            return;
        }
        if (req.url === "/register" && req.method === "POST") {
            await postRegister(req, res);
            return;
        }

        // 認可の処理
        const id = await checkUser(req);
        if (!id) {
            res.writeHead(302, {
                "Location": "/login"
            });
            res.end();
            return;
        }
        if (req.url === "/logout") {
            await deleteSession(id);
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