import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createUser, existUser } from "./lib/users.mjs";
import { createSession, getSession, deleteSession } from "./lib/sessions.mjs";
import { createTodo, listTodos, removeTodo, updateTodo } from "./lib/todos.mjs";
const server = createServer();
const PORT = process.env.PORT ?? 3000;
const extensions = {
    ".js": "text/javascript",
    ".css": "text/css"
};
server.listen(PORT, () => {
    console.log(`Listen on ${PORT}`);
});
async function getLogin(req, res) {
    const index = await readFile("./login.html");
    res.end(index);
}
async function postLogin(req, res) {
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
        }
        catch (e) {
            console.error(e);
            res.statusCode = 500;
            res.end("Internal Server Error");
        }
    });
}
async function getRegister(req, res) {
    const index = await readFile("./register.html");
    res.end(index);
}
async function postRegister(req, res) {
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
        }
        catch (e) {
            console.error(e);
            res.statusCode = 500;
            res.end("Internal Server Error");
        }
    });
}
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
async function checkUser(req) {
    const rawCookie = req.headers.cookie;
    const cookies = rawCookie?.split("; ");
    if (!cookies || cookies.length === 0) {
        return null;
    }
    for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === "session") {
            const session = await getSession(value);
            if (session) {
                return session;
            }
            return null;
        }
    }
    return null;
}
async function postTodo(req, res, session) {
    let data = "";
    req.on("data", (chunk) => {
        data += chunk;
    });
    req.on("end", async () => {
        const todo = JSON.parse(data);
        console.log(todo);
        const result = await createTodo(todo.title, session.username);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
    });
}
async function putTodo(req, res, session) {
    const id = req.url?.substring("/todos/".length);
    console.log(id);
    let data = "";
    req.on("data", (chunk) => {
        data += chunk;
    });
    req.on("end", async () => {
        const todo = JSON.parse(data);
        todo.id = id;
        console.log(todo);
        await updateTodo(todo);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(todo));
    });
}
async function deleteTodo(req, res, session) {
    const id = req.url?.substring("/todos/".length);
    console.log(id);
    if (!id) {
        res.statusCode = 400;
        res.end("Bad Request");
        return;
    }
    await removeTodo(id);
    res.statusCode = 204;
    res.end();
}
async function getTodos(req, res, session) {
    const todos = await listTodos(session.username);
    res.writeHead(200, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify(todos));
}
server.on("request", async (req, res) => {
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
        const session = await checkUser(req);
        if (!session) {
            res.writeHead(302, {
                "Location": "/login"
            });
            res.end();
            return;
        }
        if (req.url === "/logout") {
            await deleteSession(session.id);
            res.writeHead(302, {
                "Location": "/login"
            });
            res.end();
            return;
        }
        if (req.url === "/todos" && req.method === "POST") {
            await postTodo(req, res, session);
            return;
        }
        if (req.url === "/todos" && req.method === "GET") {
            await getTodos(req, res, session);
            return;
        }
        if (req.url?.startsWith("/todos") && req.method === "PUT") {
            await putTodo(req, res, session);
            return;
        }
        if (req.url?.startsWith("/todos") && req.method === "DELETE") {
            await deleteTodo(req, res, session);
            return;
        }
        if (req.url === "/" && req.method === "GET") {
            await getIndex(req, res);
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
