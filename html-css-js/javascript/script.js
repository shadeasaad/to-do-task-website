let toggle = document.querySelector(".night-mode");
let moonIcon = document.getElementById("icon-moon");
let sunIcon = document.getElementById("icon-sun");
let dark = false;
const DARK_MODE_KEY = "tasknet-dark-mode";

function applyDarkMode(isDark) {
  dark = isDark;
  document.body.classList.toggle("dark", dark);
  moonIcon.style.display = dark ? "none" : "block";
  sunIcon.style.display = dark ? "block" : "none";
}

toggle.addEventListener("click", () => {
  applyDarkMode(!dark);
  try {
    localStorage.setItem(DARK_MODE_KEY, JSON.stringify(dark));
  } catch (err) {
    console.error("Could not save dark mode:", err);
  }
});

function restoreDarkMode() {
  try {
    const raw = localStorage.getItem(DARK_MODE_KEY);
    if (raw === null) return;
    applyDarkMode(JSON.parse(raw));
  } catch (err) {
    console.error("Could not restore dark mode:", err);
  }
}

let allBtn = document.getElementById("all-btn");
let activeBtn = document.getElementById("active-btn");
let completedBtn = document.getElementById("completed-btn");
let currentSection = "all";
const SECTION_KEY = "tasknet-section";

function setSection(section, btnEl) {
  currentSection = section;
  [allBtn, activeBtn, completedBtn].forEach((b) => b.classList.remove("active-btn"));
  btnEl.classList.add("active-btn");
  try {
    localStorage.setItem(SECTION_KEY, section);
  } catch (err) {
    console.error("Could not save section:", err);
  }
  applyFilters();
}

function restoreSection() {
  let saved = "all";
  try {
    saved = localStorage.getItem(SECTION_KEY) || "all";
  } catch (err) {
    console.error("Could not restore section:", err);
  }
  if (saved === "active") setSection("active", activeBtn);
  else if (saved === "completed") setSection("completed", completedBtn);
  else setSection("all", allBtn);
}

allBtn.addEventListener("click", () => setSection("all", allBtn));
activeBtn.addEventListener("click", () => setSection("active", activeBtn));
completedBtn.addEventListener("click", () => setSection("completed", completedBtn));


let themeBtn = document.getElementById("theme-btn");
let themeDropdown = document.getElementById("theme-dropdown");
let swatches = document.querySelectorAll(".swatch");

themeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  themeDropdown.classList.toggle("active");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".theme-wrapper")) {
    themeDropdown.classList.remove("active");
  }
});

function applyAccent(accent, accentHover) {
  document.body.style.setProperty("--accent", accent);
  document.body.style.setProperty("--accent-hover", accentHover);
}

swatches.forEach((swatch) => {
  swatch.addEventListener("click", () => {
    swatches.forEach((s) => s.classList.remove("active"));
    swatch.classList.add("active");
    const accent = swatch.dataset.accent;
    const accentHover = swatch.dataset.accentHover;
    applyAccent(accent, accentHover);
    try {
      localStorage.setItem("tasknet-accent", JSON.stringify({ accent, accentHover }));
    } catch (err) {
      console.error("Could not save accent color:", err);
    }
    themeDropdown.classList.remove("active");
  });
});

function restoreAccent() {
  try {
    const raw = localStorage.getItem("tasknet-accent");
    if (!raw) return;
    const { accent, accentHover } = JSON.parse(raw);
    applyAccent(accent, accentHover);
    swatches.forEach((s) => s.classList.toggle("active", s.dataset.accent === accent));
  } catch (err) {
    console.error("Could not restore accent color:", err);
  }
}


function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

let searchBar = document.getElementById("search-bar");
searchBar.addEventListener("input", debounce(applyFilters, 200));

let clearSearchBtn = document.getElementById("clear-search-btn");
clearSearchBtn.addEventListener("click", () => {
  searchBar.value = "";
  applyFilters();
  searchBar.focus();
});

let viewAllBtn = document.getElementById("view-all-btn");
viewAllBtn.addEventListener("click", () => setSection("all", allBtn));


let addBtn = document.getElementById("add-btn");
let emptyAddBtn = document.getElementById("empty-add-btn");
let overlay = document.querySelector(".overlay");
let addTaskScreen = document.querySelector(".add-task-screen:not(.edit-task-screen):not(.delete-confirm-screen)");
let cancelBtn = document.querySelector("#cancel");

let low = document.querySelector("#low");
let medium = document.querySelector("#medium");
let high = document.querySelector("#high");

function makeKeyboardClickable(el) {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      el.click();
    }
  });
}

function openAddModal() {
  addTaskScreen.classList.add("active");
  overlay.classList.add("active");
}

function closeModal() {
  addTaskScreen.classList.remove("active");
  overlay.classList.remove("active");
  low.classList.remove("priority-active");
  high.classList.remove("priority-active");
  medium.classList.add("priority-active");
}

addBtn.addEventListener("click", openAddModal);
emptyAddBtn.addEventListener("click", openAddModal);

cancelBtn.addEventListener("click", closeModal);

addTaskScreen.querySelector(".head").addEventListener("click", (e) => {
  if (e.target.closest(".fa-x")) closeModal();
});
addTaskScreen.querySelector(".head").addEventListener("keydown", (e) => {
  if (e.target.closest(".fa-x") && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    closeModal();
  }
});

overlay.addEventListener("click", () => {
  if (addTaskScreen.classList.contains("active")) closeModal();
  if (editTaskScreen.classList.contains("active")) closeEditModal();
  if (deleteConfirmScreen.classList.contains("active")) closeDeleteModal();
  if (deleteAllConfirmScreen.classList.contains("active")) closeDeleteAllModal();
});

low.addEventListener("click", () => {
  low.classList.add("priority-active");
  medium.classList.remove("priority-active");
  high.classList.remove("priority-active");
});

medium.addEventListener("click", () => {
  medium.classList.add("priority-active");
  low.classList.remove("priority-active");
  high.classList.remove("priority-active");
});

high.addEventListener("click", () => {
  high.classList.add("priority-active");
  low.classList.remove("priority-active");
  medium.classList.remove("priority-active");
});

[low, medium, high].forEach(makeKeyboardClickable);


function wireDateSegments(inputs) {
  inputs.forEach((input, i, all) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^0-9]/g, "");
      if (input.value.length === input.maxLength && all[i + 1]) {
        all[i + 1].focus();
      }
    });
  });
}

function clampDateSegment(input, min, max) {
  input.addEventListener("blur", () => {
    if (input.value === "") return;
    let num = parseInt(input.value, 10);
    if (isNaN(num)) {
      input.value = "";
      return;
    }
    num = Math.min(max, Math.max(min, num));
    input.value = String(num).padStart(2, "0");
  });
}

wireDateSegments([
  document.querySelector("#third-input"),
  document.querySelector("#second-input"),
  document.querySelector("#first-input"),
]);
clampDateSegment(document.querySelector("#third-input"), 1, 12);
clampDateSegment(document.querySelector("#second-input"), 1, 31);

let category = document.querySelector("#second-dropdown");
const title = document.querySelector("#title-input");
const description = document.querySelector("#description-input");
const input1 = document.querySelector("#third-input");
const input2 = document.querySelector("#second-input");
const input3 = document.querySelector("#first-input");

function buildPriorityBadge(priority) {
  if (priority === "low") {
    return `<div class="low-priority">
                <i class="fa-solid fa-circle"></i>
                <p class="low-priority-text">Low</p>
              </div>`;
  } else if (priority === "high") {
    return `<div class="high-priority">
                <i class="fa-solid fa-circle"></i>
                <p class="high-priority-text">high</p>
              </div>`;
  }
  return `<div class="priority">
                <i class="fa-solid fa-circle"></i>
                <p class="priority-text">medium</p>
              </div>`;
}

function categoryIconClass(category) {
  if (category === "personal") return "fa-user";
  if (category === "shopping") return "fa-cart-shopping";
  return "fa-briefcase";
}

function isOverdue(data) {
  if (data.checked) return false;
  if (!data.month || !data.day || !data.year) return false;
  const due = new Date(
    `${data.year}-${String(data.month).padStart(2, "0")}-${String(data.day).padStart(2, "0")}`
  );
  if (isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

function currentAddPriority() {
  if (low.classList.contains("priority-active")) return "low";
  if (high.classList.contains("priority-active")) return "high";
  return "medium";
}

function renderCardInner(data) {
  const date = `${data.month}/${data.day}/${data.year}`;
  const checkedClass = data.checked ? "checked" : "";
  const linedClass = data.checked ? "lined" : "";
  const doneHtml = data.checked
    ? `<div class="done show"><i class="fa-solid fa-check"></i>done</div>`
    : "";
  const editDisabledClass = data.checked ? "disabled" : "";
  const overdueClass = isOverdue(data) ? "overdue" : "";

  return `
    <div class="card-header">
      <div class="check-box ${checkedClass}" role="button" tabindex="0" aria-pressed="${data.checked}" aria-label="Mark task as ${data.checked ? "incomplete" : "complete"}"></div>
      <p class="card-head ${linedClass}">${data.title}</p>
      ${buildPriorityBadge(data.priority)}
      <div class="card-btns">
        <button class="edit-btn ${editDisabledClass}" aria-label="Edit task"><i class="fa-solid fa-pen"></i></button>
        <button class="delete-btn" aria-label="Delete task"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
    <p class="description ${linedClass}">${data.description}</p>
    <div class="category-date">
      <div class="category">
        <p class="category-text">
          <i class="fa-solid ${categoryIconClass(data.category)} category-icon"></i>
          <span class="category-text">${data.category}</span>
        </p>
      </div>
      <div class="date-container">
        <p class="date ${overdueClass}"><i class="fa-solid fa-calendar-days"></i>${date}</p>
      </div>
      ${doneHtml}
    </div>
  `;
}

function addTask() {
  const priority = currentAddPriority();

  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.priority = priority;
  card.dataset.category = category.value;
  card.dataset.month = input1.value;
  card.dataset.day = input2.value;
  card.dataset.year = input3.value;

  card.innerHTML = renderCardInner({
    title: title.value,
    description: description.value,
    priority,
    category: category.value,
    month: input1.value,
    day: input2.value,
    year: input3.value,
    checked: false,
  });

  return card;
}

let list = document.querySelector(".task-list");
let taskCount = document.getElementById("task-count");
let emptyState = document.getElementById("empty-state");
let noResultsState = document.getElementById("no-results-state");
let sectionEmptyState = document.getElementById("section-empty-state");
let sectionEmptyIcon = document.getElementById("section-empty-icon");
let sectionEmptyHeader = document.getElementById("section-empty-header");
let sectionEmptyDescription = document.getElementById("section-empty-description");
let deleteAllBtn = document.getElementById("delete-all-btn");

function updateTaskUI() {
  const count = list.querySelectorAll(".card").length;

  taskCount.textContent = `tasks ${count}`;
  taskCount.classList.toggle("active", count > 0);

  deleteAllBtn.classList.toggle("active", count > 0);
}

function applyFilters() {
  const searchTerm = searchBar.value.trim().toLowerCase();
  const cards = Array.from(list.querySelectorAll(".card"));
  let visibleCount = 0;

  cards.forEach((card) => {
    const isChecked = card.querySelector(".check-box").classList.contains("checked");

    const matchesSection =
      currentSection === "all"
        ? true
        : currentSection === "active"
        ? !isChecked
        : isChecked; 

    const titleText = card.querySelector(".card-head").textContent.toLowerCase();
    const descText = card.querySelector(".description").textContent.toLowerCase();
    const matchesSearch = !searchTerm || titleText.includes(searchTerm) || descText.includes(searchTerm);

    const visible = matchesSection && matchesSearch;
    card.style.display = visible ? "" : "none";
    if (visible) visibleCount++;
  });

  const totalCount = cards.length;

  if (totalCount === 0) {
    emptyState.classList.add("active");
    noResultsState.classList.remove("active");
    sectionEmptyState.classList.remove("active");
  } else if (visibleCount === 0 && searchTerm) {
    emptyState.classList.remove("active");
    noResultsState.classList.add("active");
    sectionEmptyState.classList.remove("active");
  } else if (visibleCount === 0) {
    emptyState.classList.remove("active");
    noResultsState.classList.remove("active");
    if (currentSection === "active") {
      sectionEmptyIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
      sectionEmptyHeader.textContent = "No active tasks";
      sectionEmptyDescription.textContent = "Everything is either done or not started yet";
    } else {
      sectionEmptyIcon.innerHTML = '<i class="fa-solid fa-hourglass-half"></i>';
      sectionEmptyHeader.textContent = "No completed tasks yet";
      sectionEmptyDescription.textContent = "Finish a task and it'll show up here";
    }
    sectionEmptyState.classList.add("active");
  } else {
    emptyState.classList.remove("active");
    noResultsState.classList.remove("active");
    sectionEmptyState.classList.remove("active");
  }
}


const STORAGE_KEY = "tasknet-tasks";

function serializeCard(card) {
  return {
    title: card.querySelector(".card-head").textContent,
    description: card.querySelector(".description").textContent,
    priority: card.dataset.priority || "medium",
    category: card.dataset.category || "work",
    month: card.dataset.month || "",
    day: card.dataset.day || "",
    year: card.dataset.year || "",
    checked: card.querySelector(".check-box").classList.contains("checked"),
  };
}

function saveTasksToStorage() {
  try {
    const cards = Array.from(list.querySelectorAll(".card"));
    const data = cards.map(serializeCard);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Could not save tasks:", err);
  }
}

function buildCardFromData(data) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.priority = data.priority;
  card.dataset.category = data.category;
  card.dataset.month = data.month;
  card.dataset.day = data.day;
  card.dataset.year = data.year;
  card.innerHTML = renderCardInner(data);
  return card;
}

function loadTasksFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return;
    data.forEach((taskData) => {
      list.appendChild(buildCardFromData(taskData));
    });
  } catch (err) {
    console.error("Could not load tasks:", err);
  }
}

let sortSelect = document.querySelector(".sort");
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
const SORT_KEY = "tasknet-sort";

function applySort() {
  const cards = Array.from(list.querySelectorAll(".card"));
  const sortBy = sortSelect.value;

  cards.sort((a, b) => {
    if (sortBy === "priority") {
      return (PRIORITY_RANK[a.dataset.priority] ?? 1) - (PRIORITY_RANK[b.dataset.priority] ?? 1);
    }

    if (sortBy === "alpha") {
      const titleA = a.querySelector(".card-head").textContent.trim().toLowerCase();
      const titleB = b.querySelector(".card-head").textContent.trim().toLowerCase();
      return titleA.localeCompare(titleB);
    }

    const dateA = new Date(`${a.dataset.year}-${a.dataset.month}-${a.dataset.day}`);
    const dateB = new Date(`${b.dataset.year}-${b.dataset.month}-${b.dataset.day}`);
    return dateA - dateB;
  });

  cards.forEach((card) => list.appendChild(card));
}

sortSelect.addEventListener("change", () => {
  try {
    localStorage.setItem(SORT_KEY, sortSelect.value);
  } catch (err) {
    console.error("Could not save sort:", err);
  }
  refreshUI();
});

function restoreSort() {
  try {
    const saved = localStorage.getItem(SORT_KEY);
    if (saved) sortSelect.value = saved;
  } catch (err) {
    console.error("Could not restore sort:", err);
  }
}

function refreshUI() {
  applySort();
  updateTaskUI();
  applyFilters();
  saveTasksToStorage();
}

let addCardBtn = document.getElementById("add-task");

title.addEventListener("input", () => {
  addCardBtn.disabled = title.value.trim() === "";
});

addCardBtn.addEventListener("click", () => {
  if (title.value.trim() === "") return;

  let newCard = addTask();
  list.appendChild(newCard);
  refreshUI();

  closeModal();
  title.value = "";
  description.value = "";
  input1.value = "";
  input2.value = "";
  input3.value = "";
  addCardBtn.disabled = true;
});

deleteAllBtn.addEventListener("click", openDeleteAllModal);

document.addEventListener("DOMContentLoaded", () => {
  restoreDarkMode();
  restoreAccent();
  restoreSort();
  loadTasksFromStorage();
  restoreSection();
  refreshUI();
});


let toast = document.getElementById("toast");
let toastMessage = document.getElementById("toast-message");
let toastUndoBtn = document.getElementById("toast-undo");
let toastTimer = null;
let pendingUndo = null;

function showToast(message, restoreFn) {
  clearTimeout(toastTimer);
  toastMessage.textContent = message;
  pendingUndo = restoreFn;
  toast.classList.add("active");
  toastTimer = setTimeout(() => {
    toast.classList.remove("active");
    pendingUndo = null;
  }, 5000);
}

toastUndoBtn.addEventListener("click", () => {
  if (!pendingUndo) return;
  clearTimeout(toastTimer);
  pendingUndo();
  pendingUndo = null;
  toast.classList.remove("active");
  refreshUI();
});

let deleteConfirmScreen = document.querySelector(".delete-confirm-screen");
let deleteTaskTitleEl = document.getElementById("delete-task-title");
let deleteCancelBtn = document.getElementById("delete-cancel");
let deleteConfirmBtn = document.getElementById("delete-confirm");
let cardPendingDelete = null;

function openDeleteModal(card) {
  cardPendingDelete = card;
  const titleText = card.querySelector(".card-head").textContent;
  deleteTaskTitleEl.textContent = `'${titleText}'`;
  deleteConfirmScreen.classList.add("active");
  overlay.classList.add("active");
}

function closeDeleteModal() {
  deleteConfirmScreen.classList.remove("active");
  overlay.classList.remove("active");
  cardPendingDelete = null;
}

deleteCancelBtn.addEventListener("click", closeDeleteModal);

deleteConfirmScreen.querySelector(".head").addEventListener("click", (e) => {
  if (e.target.closest(".fa-x")) closeDeleteModal();
});
deleteConfirmScreen.querySelector(".head").addEventListener("keydown", (e) => {
  if (e.target.closest(".fa-x") && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    closeDeleteModal();
  }
});

deleteConfirmBtn.addEventListener("click", () => {
  if (cardPendingDelete) {
    const card = cardPendingDelete;
    const nextSibling = card.nextSibling;
    const titleText = card.querySelector(".card-head").textContent;
    card.remove();
    refreshUI();
    showToast(`'${titleText}' deleted`, () => {
      if (nextSibling && nextSibling.parentNode === list) {
        list.insertBefore(card, nextSibling);
      } else {
        list.appendChild(card);
      }
    });
  }
  closeDeleteModal();
});

let deleteAllConfirmScreen = document.querySelector(".delete-all-confirm-screen");
let deleteAllCountEl = document.getElementById("delete-all-count");
let deleteAllCancelBtn = document.getElementById("delete-all-cancel");
let deleteAllConfirmBtn = document.getElementById("delete-all-confirm");

function openDeleteAllModal() {
  const count = list.querySelectorAll(".card").length;
  deleteAllCountEl.textContent = `All ${count} task${count === 1 ? "" : "s"}`;
  deleteAllConfirmScreen.classList.add("active");
  overlay.classList.add("active");
}

function closeDeleteAllModal() {
  deleteAllConfirmScreen.classList.remove("active");
  overlay.classList.remove("active");
}

deleteAllCancelBtn.addEventListener("click", closeDeleteAllModal);

deleteAllConfirmScreen.querySelector(".head").addEventListener("click", (e) => {
  if (e.target.closest(".fa-x")) closeDeleteAllModal();
});
deleteAllConfirmScreen.querySelector(".head").addEventListener("keydown", (e) => {
  if (e.target.closest(".fa-x") && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    closeDeleteAllModal();
  }
});

deleteAllConfirmBtn.addEventListener("click", () => {
  const cards = Array.from(list.querySelectorAll(".card"));
  cards.forEach((card) => card.remove());
  refreshUI();
  closeDeleteAllModal();
  showToast(`${cards.length} task${cards.length === 1 ? "" : "s"} deleted`, () => {
    cards.forEach((card) => list.appendChild(card));
  });
});

let editTaskScreen = document.querySelector(".edit-task-screen");
let editTitle = document.getElementById("edit-title-input");
let editDescription = document.getElementById("edit-description-input");
let editLow = document.getElementById("edit-low");
let editMedium = document.getElementById("edit-medium");
let editHigh = document.getElementById("edit-high");
let editCategory = document.getElementById("edit-second-dropdown");
let editMonth = document.getElementById("edit-third-input");
let editDay = document.getElementById("edit-second-input");
let editYear = document.getElementById("edit-first-input");
let editCancelBtn = document.getElementById("edit-cancel");
let saveEditBtn = document.getElementById("save-edit-btn");
let cardBeingEdited = null;

wireDateSegments([editMonth, editDay, editYear]);
clampDateSegment(editMonth, 1, 12);
clampDateSegment(editDay, 1, 31);

function setEditPriority(value) {
  [editLow, editMedium, editHigh].forEach((el) => el.classList.remove("priority-active"));
  if (value === "low") editLow.classList.add("priority-active");
  else if (value === "high") editHigh.classList.add("priority-active");
  else editMedium.classList.add("priority-active");
}

editLow.addEventListener("click", () => setEditPriority("low"));
editMedium.addEventListener("click", () => setEditPriority("medium"));
editHigh.addEventListener("click", () => setEditPriority("high"));

[editLow, editMedium, editHigh].forEach(makeKeyboardClickable);

function openEditModal(card) {
  const isDone = card.querySelector(".check-box").classList.contains("checked");
  if (isDone) return; 

  cardBeingEdited = card;

  editTitle.value = card.querySelector(".card-head").textContent;
  editDescription.value = card.querySelector(".description").textContent;
  editCategory.value = card.dataset.category || "work";
  setEditPriority(card.dataset.priority || "medium");
  editMonth.value = card.dataset.month || "";
  editDay.value = card.dataset.day || "";
  editYear.value = card.dataset.year || "";

  editTaskScreen.classList.add("active");
  overlay.classList.add("active");
  saveEditBtn.disabled = editTitle.value.trim() === "";
}

function closeEditModal() {
  editTaskScreen.classList.remove("active");
  overlay.classList.remove("active");
  cardBeingEdited = null;
}

editCancelBtn.addEventListener("click", closeEditModal);

editTaskScreen.querySelector(".head").addEventListener("click", (e) => {
  if (e.target.closest(".fa-x")) closeEditModal();
});
editTaskScreen.querySelector(".head").addEventListener("keydown", (e) => {
  if (e.target.closest(".fa-x") && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    closeEditModal();
  }
});

editTitle.addEventListener("input", () => {
  saveEditBtn.disabled = editTitle.value.trim() === "";
});

saveEditBtn.addEventListener("click", () => {
  if (!cardBeingEdited || editTitle.value.trim() === "") return;

  const priority = editLow.classList.contains("priority-active")
    ? "low"
    : editHigh.classList.contains("priority-active")
    ? "high"
    : "medium";

  const data = {
    title: editTitle.value,
    description: editDescription.value,
    priority,
    category: editCategory.value,
    month: editMonth.value,
    day: editDay.value,
    year: editYear.value,
    checked: false,
  };

  cardBeingEdited.dataset.priority = data.priority;
  cardBeingEdited.dataset.category = data.category;
  cardBeingEdited.dataset.month = data.month;
  cardBeingEdited.dataset.day = data.day;
  cardBeingEdited.dataset.year = data.year;
  cardBeingEdited.innerHTML = renderCardInner(data);

  closeEditModal();
  refreshUI();
});


list.addEventListener("keydown", (e) => {
  const checkbox = e.target.closest(".check-box");
  if (checkbox && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    checkbox.click();
  }
});

list.addEventListener("click", (e) => {
  const checkbox = e.target.closest(".check-box");
  const deleteBtn = e.target.closest(".delete-btn");
  const editBtn = e.target.closest(".edit-btn");

  if (checkbox) {
    checkbox.classList.toggle("checked");

    const card = checkbox.closest(".card");
    const categoryDate = card.querySelector(".category-date");
    const cardHead = card.querySelector(".card-head");
    const description = card.querySelector(".description");
    const editButton = card.querySelector(".edit-btn");
    const isChecked = checkbox.classList.contains("checked");

    checkbox.setAttribute("aria-pressed", String(isChecked));
    checkbox.setAttribute("aria-label", `Mark task as ${isChecked ? "incomplete" : "complete"}`);

    let done = categoryDate.querySelector(".done");

    if (isChecked) {
      if (!done) {
        done = document.createElement("div");
        done.classList.add("done");
        done.innerHTML = `<i class="fa-solid fa-check"></i>done`;
        categoryDate.appendChild(done);
      }
      requestAnimationFrame(() => done.classList.add("show"));

      cardHead.classList.add("lined");
      description.classList.add("lined");
      editButton.classList.add("disabled");
    } else {
      cardHead.classList.remove("lined");
      description.classList.remove("lined");
      editButton.classList.remove("disabled");

      if (done) {
        done.classList.remove("show");
        done.addEventListener("transitionend", () => done.remove(), {
          once: true,
        });
      }
    }

    refreshUI();
  }

  if (deleteBtn) {
    openDeleteModal(deleteBtn.closest(".card"));
  }

  if (editBtn) {
    openEditModal(editBtn.closest(".card"));
  }
});