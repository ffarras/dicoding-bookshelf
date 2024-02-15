const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";
const ongoingReadList = document.getElementById("readOngoingList");
const completedReadList = document.getElementById("readCompleteList");

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(RENDER_EVENT, function () {
  ongoingReadList.innerHTML = "Tidak ada buku";
  completedReadList.innerHTML = "Tidak ada buku";

  for (const bookItem of books) {
    const bookElement = makeBookItem(bookItem);
    if (!bookItem.isComplete) {
      ongoingReadList.innerHTML = "";
      ongoingReadList.append(bookElement);
    } else {
      completedReadList.innerHTML = "";
      completedReadList.append(bookElement);
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  const searchForm = document.getElementById("searchBook");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBook() {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = Number(document.getElementById("inputBookYear").value);
  const isComplete = document.getElementById("inputBookIsComplete").checked;

  const id = +new Date();
  const bookObject = { id, title, author, year, isComplete };
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function markBookStatus(bookId, status) {
  const bookTarget = books.find((book) => book.id === bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = status;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function changeSubmitButtonText() {
  const submitText = document.getElementById("submitText");
  const isCompleted = document.getElementById("inputBookIsComplete").checked;

  if (isCompleted) {
    submitText.innerText = "Selesai dibaca";
  } else {
    submitText.innerText = "Belum selesai dibaca";
  }
}

function searchBook() {
  const searchValue = document.getElementById("searchBookTitle").value;
  ongoingReadList.innerHTML = "";
  completedReadList.innerHTML = "";

  if (searchValue) {
    const results = books.filter((book) =>
      book.title.toLowerCase().includes(searchValue.toLowerCase())
    );

    for (const result of results) {
      const bookResult = makeBookItem(result);
      if (!result.isComplete) {
        ongoingReadList.append(bookResult);
      } else {
        completedReadList.append(bookResult);
      }
    }
  } else document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBookItem(bookObject) {
  const titleText = document.createElement("h3");
  titleText.innerText = bookObject.title;

  const authorText = document.createElement("span");
  authorText.innerText = `Penulis: ${bookObject.author}`;

  const yearText = document.createElement("span");
  yearText.innerText = `Tahun: ${bookObject.year}`;

  const finishButton = document.createElement("button");
  finishButton.classList.add("finish");

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete");
  deleteButton.innerText = "Hapus Buku";

  deleteButton.addEventListener("click", function () {
    if (confirm("Are you sure to delete this book?")) {
      deleteBook(bookObject.id);
    }
  });

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action");
  actionContainer.append(finishButton, deleteButton);

  const bookContainer = document.createElement("article");
  bookContainer.classList.add("book-item");
  bookContainer.append(titleText, authorText, yearText, actionContainer);
  bookContainer.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isComplete) {
    finishButton.innerText = "Belum selesai dibaca";

    finishButton.addEventListener("click", function () {
      markBookStatus(bookObject.id, false);
    });
  } else {
    finishButton.innerText = "Selesai dibaca";

    finishButton.addEventListener("click", function () {
      markBookStatus(bookObject.id, true);
    });
  }

  return bookContainer;
}
