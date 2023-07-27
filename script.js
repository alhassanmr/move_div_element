let table = null; // Declare table as a global variable
let draggedBox = null;
let stateStack = []; // Stack to store the states

document.addEventListener("DOMContentLoaded", () => {
  table = document.getElementById("dragDropTable"); // Assign the table inside the event listener

  // Convert the NodeList to an array using the spread operator
  const boxes = [...document.querySelectorAll(".box")];

  table.addEventListener("dragstart", handleDragStart);
  table.addEventListener("dragover", handleDragOver);
  table.addEventListener("dragenter", handleDragEnter);
  table.addEventListener("dragleave", handleDragLeave);
  table.addEventListener("drop", handleDrop);
  table.addEventListener("dragend", handleDragEnd);

  // "Add Row" button functionality
  const addRowBtn = document.getElementById("addRowBtn");
  addRowBtn.addEventListener("click", () => {
    const newRow = document.createElement("tr");
    for (let i = 0; i < 3; i++) {
      const newCell = document.createElement("td");
      const newBox = document.createElement("div");
      const boxNumber = table.rows.length * 100 + i * 100;
      newBox.classList.add("box");
      newBox.draggable = true;
      newBox.dataset.id = boxNumber;
      newBox.style.backgroundColor = getRandomColor();
      newBox.innerText = boxNumber;
      newCell.appendChild(newBox);
      newRow.appendChild(newCell);
      boxes.push(newBox);
      newBox.addEventListener("dragstart", handleDragStart);
      newBox.addEventListener("dragover", handleDragOver);
      newBox.addEventListener("dragenter", handleDragEnter);
      newBox.addEventListener("dragleave", handleDragLeave);
      newBox.addEventListener("drop", handleDrop);
      newBox.addEventListener("dragend", handleDragEnd);
    }
    table.appendChild(newRow);

    // Save the state after adding the row
    saveState();
  });

  function handleDragStart(event) {
    if (event.target.classList.contains("box")) {
      draggedBox = event.target;
      event.dataTransfer.setData("text/plain", draggedBox.dataset.id);
      draggedBox.classList.add("fade");

      // Save the state before the drag starts
      saveState();
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDragEnter(event) {
    event.preventDefault();
    if (
      event.target.classList.contains("box") ||
      event.target.nodeName === "TD"
    ) {
      event.target.classList.add("hovered");
    }
  }

  function handleDragLeave(event) {
    if (
      event.target.classList.contains("box") ||
      event.target.nodeName === "TD"
    ) {
      event.target.classList.remove("hovered");
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain");
    const targetId = event.target.dataset.id;

    if (!sourceId || !targetId || sourceId === targetId) {
      return;
    }

    // Swap the boxes between source and target cells
    const targetCell = event.target.closest("td");
    const sourceCell = draggedBox.parentElement;

    // Get the child divs from both source and target cells
    const sourceChildDiv = sourceCell.querySelector(".box");
    const targetChildDiv = targetCell.querySelector(".box");

    // Check if the sourceChildDiv and targetChildDiv exist before accessing their properties
    if (!sourceChildDiv || !targetChildDiv) {
      return;
    }

    // Set the transform property to move the boxes smoothly
    sourceChildDiv.style.transform = `translateX(${
      targetChildDiv.offsetLeft - sourceChildDiv.offsetLeft
    }px) translateY(${targetChildDiv.offsetTop - sourceChildDiv.offsetTop}px)`;
    targetChildDiv.style.transform = `translateX(${
      sourceChildDiv.offsetLeft - targetChildDiv.offsetLeft
    }px) translateY(${sourceChildDiv.offsetTop - targetChildDiv.offsetTop}px)`;

    // After the transition, reset the transform property and perform the swap
    setTimeout(() => {
      sourceCell.appendChild(targetChildDiv);
      targetCell.appendChild(sourceChildDiv);
      sourceChildDiv.style.transform = "";
      targetChildDiv.style.transform = "";
      // Save the state after the drop action is completed
      saveState();
    }, 1000); // Duration of the CSS transition in milliseconds (1 second)
  }

  function handleDragEnd() {
    if (draggedBox) {
      draggedBox.classList.remove("fade");
      draggedBox = null;
    }
  }

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // "Undo" button functionality
  const undoBtn = document.getElementById("undoBtn");
  undoBtn.addEventListener("click", handleUndo);

  function handleUndo() {
    if (stateStack.length === 0) {
      alert("Nothing to undo.");
      return;
    }

    const prevState = stateStack.pop();
    restoreState(prevState);

    // Re-attach the event listeners to the cells and boxes
    const boxes = document.querySelectorAll(".box");
    const tableCells = document.querySelectorAll("td");

    boxes.forEach((box) => {
      box.addEventListener("dragstart", handleDragStart);
      box.addEventListener("dragover", handleDragOver);
      box.addEventListener("dragenter", handleDragEnter);
      box.addEventListener("dragleave", handleDragLeave);
      box.addEventListener("dragend", handleDragEnd);
    });

    tableCells.forEach((cell) => {
      cell.addEventListener("drop", handleDrop);
      cell.addEventListener("dragenter", handleDragEnter);
      cell.addEventListener("dragleave", handleDragLeave);
    });
  }

  function saveState() {
    const tableClone = table.cloneNode(true);
    stateStack.push(tableClone);
  }

  function restoreState(state) {
    table.parentNode.replaceChild(state, table);
    table = state;
  }
});
