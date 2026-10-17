const CONTACTS_KEY = 'rescue_trusted_contacts';
const MAX_CONTACTS = 5;

// Load contacts from LocalStorage
function getContacts() {
  const contacts = localStorage.getItem(CONTACTS_KEY);
  return contacts ? JSON.parse(contacts) : [];
}

// Save contacts to LocalStorage
function saveContacts(contacts) {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

// Add a new contact
function addContact(contact) {
  const contacts = getContacts();
  if (contacts.length >= MAX_CONTACTS) {
    alert('Maximum 5 contacts allowed');
    return false;
  }
  contacts.push({
    id: Date.now().toString(),
    ...contact
  });
  saveContacts(contacts);
  renderContacts();
  return true;
}

// Delete a contact
function deleteContact(id) {
  let contacts = getContacts();
  contacts = contacts.filter(c => c.id !== id);
  saveContacts(contacts);
  renderContacts();
}

// Render contact list
function renderContacts() {
  const contactsList = document.getElementById('contacts-list');
  const emptyState = document.getElementById('empty-contacts');
  const contacts = getContacts();

  if (contacts.length === 0) {
    contactsList.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    contactsList.innerHTML = contacts.map(contact => `
      <div class="contact-card">
        <div class="contact-avatar">${contact.name.charAt(0).toUpperCase()}</div>
        <div class="contact-info">
          <h4>${contact.name} <span class="status-badge">${navigator.onLine ? 'WhatsApp Ready' : 'SMS Ready'}</span></h4>
          <p>${contact.phone} • ${contact.relation}</p>
        </div>
        <button class="delete-btn" onclick="deleteContact('${contact.id}')" aria-label="Delete contact">
          🗑️
        </button>
      </div>
    `).join('');
  }
}

// Modal Handlers
function openAddModal() {
  document.getElementById('contact-modal').classList.add('active');
  document.getElementById('modal-title').textContent = 'Add Trusted Contact';
}

function closeModal() {
  document.getElementById('contact-modal').classList.remove('active');
  document.getElementById('contact-form').reset();
}

// Init Contacts feature
document.addEventListener('DOMContentLoaded', () => {
  renderContacts();

  document.getElementById('add-contact-btn').addEventListener('click', openAddModal);

  document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const contact = {
      name: document.getElementById('contact-name').value,
      phone: document.getElementById('contact-phone').value,
      relation: document.getElementById('contact-relation').value
    };
    if (addContact(contact)) {
      closeModal();
    }
  });
});
