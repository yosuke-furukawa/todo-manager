function submitTodo() {
    const form = document.getElementById("form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = e.target.title.value;
        await fetch("/todos", { method: "POST", body: JSON.stringify({
            title
        })});
        e.target.title.value = "";
    });
}

async function listTodos() {
    const todosElement = document.getElementById("todos");
    const res = await fetch("/todos", { method: "GET" });
    const todos = await res.json();
    for (const todo of todos) {
        const li = document.createElement("li");
        li.className = "todo-listitem";
        const div = document.createElement("div");
        div.title = "todo title";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = todo.id;
        const label = document.createElement("label");
        label.htmlFor = todo.id;
        label.textContent = todo.title;
        div.append(checkbox, label);
        li.appendChild(div);
        todosElement.appendChild(li);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    submitTodo();
    await listTodos();
});