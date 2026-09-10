const input = document.querySelector('#favchap');
const button = document.querySelector('button');
const list = document.querySelector('#list');

// no dupes
function isDuplicate(value) {
  for (let item of list.children) {
    if (item.firstChild.textContent === value) {
      return true;
    }
  }
  return false;
}

button.addEventListener('click', function() {
  let value = input.value.trim();

  if (value === "") {
    input.focus();
    return;
  }

  if (isDuplicate(value)) {
    input.focus();
    return;
  }

  // Create new list item
  const li = document.createElement('li'); // 'li'/name doesn't have to match the constant
  li.textContent = value;

  // Delete button
  const deleteButton = document.createElement('button');
  deleteButton.textContent = '❌';
  deleteButton.classList.add('delete'); // 'del is a strikethrough
  deleteButton.setAttribute("aria-label", "Delete chapter");
  deleteButton.addEventListener('click', function () {
    list.removeChild(li);
    input.focus();
  });

  li.appendChild(deleteButton);
  list.appendChild(li);

  // Reset input
  input.value = "";
  input.focus();
});