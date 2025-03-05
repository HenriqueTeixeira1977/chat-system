const BASE_URL = 'https://chat-system-backend.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    setupNavigation();
    setupMenuToggle();

    // Restante do código sem mudanças
    const messageForm = document.getElementById('messageForm');
    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = document.getElementById('message').value;
        try {
            const response = await fetch(`${BASE_URL}/send-messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                alert('Mensagens enviadas com sucesso!');
                messageForm.reset();
            } else {
                throw new Error(data.error || 'Erro ao enviar mensagem');
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            alert(`Erro: ${error.message}`);
        }
    });

    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName').value;
        const phone = document.getElementById('contactPhone').value;
        const email = document.getElementById('contactEmail').value || null;
        try {
            const response = await fetch(`${BASE_URL}/contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, email })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                alert('Contato adicionado com sucesso!');
                contactForm.reset();
                if (document.getElementById('contacts').classList.contains('active')) {
                    loadContacts();
                }
                loadDashboard();
            } else {
                throw new Error(data.error || 'Erro ao adicionar contato');
            }
        } catch (error) {
            console.error('Erro ao adicionar contato:', error);
            alert(`Erro: ${error.message}`);
        }
    });

    document.getElementById('saveEditContact').addEventListener('click', async () => {
        const id = document.getElementById('editContactId').value;
        const name = document.getElementById('editContactName').value;
        const phone = document.getElementById('editContactPhone').value;
        const email = document.getElementById('editContactEmail').value || null;
        try {
            const response = await fetch(`${BASE_URL}/contacts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, email })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                alert('Contato atualizado com sucesso!');
                bootstrap.Modal.getInstance(document.getElementById('editContactModal')).hide();
                loadContacts();
                loadDashboard();
            } else {
                throw new Error(data.error || 'Erro ao atualizar contato');
            }
        } catch (error) {
            console.error('Erro ao atualizar contato:', error);
            alert(`Erro: ${error.message}`);
        }
    });
});

async function loadDashboard() {
    try {
        const response = await fetch(`${BASE_URL}/contacts`);
        const contacts = await response.json();
        document.getElementById('contacts-count').textContent = `${contacts.length} contatos cadastrados`;
        document.getElementById('whatsapp-status').textContent = 'Conectado';
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        document.getElementById('contacts-count').textContent = 'Erro ao carregar';
        document.getElementById('whatsapp-status').textContent = 'Desconectado';
    }
}

async function loadContacts() {
    try {
        const response = await fetch(`${BASE_URL}/contacts`);
        const contacts = await response.json();
        const contactsList = document.getElementById('contactsList');
        contactsList.innerHTML = contacts.map(contact => `
            <div class="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                <span class="col-12 col-md-8">${contact.name} - ${contact.phone}${contact.email ? ` - ${contact.email}` : ''}</span>
                <div class="col-12 col-md-4 text-md-end mt-2 mt-md-0">
                    <button class="btn btn-sm btn-warning me-2" onclick="editContact(${contact.id}, '${contact.name}', '${contact.phone}', '${contact.email || ''}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteContact(${contact.id})">Excluir</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar contatos:', error);
        document.getElementById('contactsList').innerHTML = '<div class="list-group-item text-danger">Erro ao carregar contatos</div>';
    }
}

function setupNavigation() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.list-group-item');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                    if (sectionId === 'contacts') loadContacts();
                }
            });
            if (window.innerWidth < 768) {
                toggleSidebar();
            }
        });
    });
}

function setupMenuToggle() {
    const toggleButton = document.getElementById('menu-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleSidebar);
    } else {
        console.error('Botão toggle não encontrado!');
    }
}

function toggleSidebar() {
    document.getElementById('wrapper').classList.toggle('toggled');
    document.getElementById('sidebar-wrapper').classList.toggle('active');
}

function editContact(id, name, phone, email) {
    document.getElementById('editContactId').value = id;
    document.getElementById('editContactName').value = name;
    document.getElementById('editContactPhone').value = phone;
    document.getElementById('editContactEmail').value = email;
    new bootstrap.Modal(document.getElementById('editContactModal')).show();
}

async function deleteContact(id) {
    if (confirm('Tem certeza que deseja excluir este contato?')) {
        try {
            const response = await fetch(`${BASE_URL}/contacts/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (response.ok && data.success) {
                alert('Contato excluído com sucesso!');
                loadContacts();
                loadDashboard();
            } else {
                throw new Error(data.error || 'Erro ao excluir contato');
            }
        } catch (error) {
            console.error('Erro ao excluir contato:', error);
            alert(`Erro: ${error.message}`);
        }
    }
}