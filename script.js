const books = [];
const RENDER_EVENT = "render-book";
const bookCollection = "BOOK_COLLECTION";
const ongoingBookCollection = "ONGOING_BOOK";
const completedBookCollection = "COMPLETED_BOOK";

window.addEventListener("load", function () {
  if (typeof Storage !== "undefined") {
    if (localStorage.getItem(ongoingBookCollection) === null) {
      localStorage.setItem(ongoingBookCollection, "");
    }
    if (localStorage.getItem(completedBookCollection) === null) {
      localStorage.setItem(completedBookCollection, "");
    }
    if (localStorage.getItem(bookCollection) === null) {
      localStorage.setItem(bookCollection, "");
    }
  } else {
    alert("Browser yang Anda gunakan tidak mendukung Web Storage");
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const ongoingReadList = document.getElementById("readOngoingList");
  ongoingReadList.innerHTML = "";

  const completedReadList = document.getElementById("readCompleteList");
  completedReadList.innerHTML = "";

  booksAll = JSON.parse(localStorage.getItem(bookCollection));

  for (const bookItem of booksAll) {
    const bookElement = makeBookItem(bookItem);
    if (!bookItem.isCompleted) {
      ongoingReadList.append(bookElement);
    } else {
      completedReadList.append(bookElement);
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
});

function addBook() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = Number(document.getElementById("inputBookYear").value);
  const isCompleted = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    bookTitle,
    author,
    year,
    isCompleted
  );
  books.push(bookObject);
  localStorage.setItem(bookCollection, JSON.stringify(books));

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, bookTitle, author, year, isCompleted) {
  return {
    id,
    bookTitle,
    author,
    year,
    isCompleted,
  };
}

function markBookCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function markBookOngoing(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function deleteBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) return bookItem;
  }

  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function makeBookItem(bookObject) {
  const titleText = document.createElement("h3");
  titleText.innerText = bookObject.bookTitle;

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
    deleteBook(bookObject.id);
  });

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action");
  actionContainer.append(finishButton, deleteButton);

  const bookContainer = document.createElement("article");
  bookContainer.classList.add("book-item");
  bookContainer.append(titleText, authorText, yearText, actionContainer);
  bookContainer.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    finishButton.innerText = "Belum selesai dibaca";

    finishButton.addEventListener("click", function () {
      markBookOngoing(bookObject.id);
    });
  } else {
    finishButton.innerText = "Selesai dibaca";

    finishButton.addEventListener("click", function () {
      markBookCompleted(bookObject.id);
    });
  }

  return bookContainer;
}
