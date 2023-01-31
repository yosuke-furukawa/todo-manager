function submitTodo() {
    const form = document.getElementById("form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = e.target.title.value;
        if (!title) {
            return;
        }
        const res = await fetch("/todos", { method: "POST", body: JSON.stringify({
            title
        })});
        const todo = await res.json();
        const todosElement = document.getElementById("todos");
        const li = createTodoListItem(todo);
        todosElement.appendChild(li);
        e.target.title.value = "";
    });
}

async function handleUpdate(e) {
    const id = e.target.getAttribute("data-todo-id");
    const ans = prompt("Input TODO Title: ");
    if (ans) {
        await fetch(`/todos/${id}`, { method: "PUT", body: JSON.stringify({ title: ans }) });
        const label = document.getElementById(`label-${id}`);
        label.textContent = ans;
    }
    console.log(ans);
}

async function handleDelete(e) {
    const id = e.target.getAttribute("data-todo-id");
    const ans = confirm("Are you sure?");
    if (ans) {
        await fetch(`/todos/${id}`, { method: "DELETE" });
        const li = document.getElementById(`listitem-${id}`);
        const todosElement = document.getElementById("todos");
        todosElement.removeChild(li);
    }
    console.log(ans);
}

async function handleCheck(e) {
    console.log(e.target.checked);
    console.log(e.target.id);
    const checked = e.target.checked;
    const id = e.target.id;
    const label = document.getElementById(`label-${id}`);
    if (e.target.checked) {
        label.setAttribute("style", "text-decoration: line-through;");
    } else {
        label.removeAttribute("style");
    }
    await fetch(`/todos/${id}`, { method: "PUT", body: JSON.stringify({ done: checked }) });
}

function createTodoListItem(todo) {
    const li = document.createElement("li");
    li.className = "todo-listitem";
    li.id = `listitem-${todo.id}`;
    const div = document.createElement("div");
    div.title = "todo title";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = todo.id;
    checkbox.addEventListener("click", handleCheck);
    const label = document.createElement("label");
    label.htmlFor = todo.id;
    label.id = `label-${todo.id}`;
    label.textContent = todo.title;
    if (todo.done) {
        checkbox.checked = true;
        label.setAttribute("style", "text-decoration: line-through;");
    }
    const updateButton = document.createElement("input");
    updateButton.type = "button";
    updateButton.setAttribute("data-todo-id", todo.id);
    updateButton.value = "update";
    updateButton.addEventListener("click", handleUpdate);
    const deleteButton = document.createElement("input");
    deleteButton.type = "button";
    deleteButton.setAttribute("data-todo-id", todo.id);
    deleteButton.value = "delete";
    deleteButton.addEventListener("click", handleDelete);
    div.append(checkbox, label, updateButton, deleteButton);
    li.appendChild(div);
    return li;
}

async function listTodos() {
    const todosElement = document.getElementById("todos");
    const res = await fetch("/todos", { method: "GET" });
    const todos = await res.json();
    for (const todo of todos) {
        const li = createTodoListItem(todo);
        todosElement.appendChild(li);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    submitTodo();
    await listTodos();
});