const BASE_URL = 'https://chat-system-backend.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    setupNavigation();

    const messageForm = document.getElementById('messageForm');
    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = document.getElementById('message').value.trim();
        if (!message) return;
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
                loadDashboard();
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
        const name = document.getElementById('contactName').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();
        const email = document.getElementById('contactEmail').value.trim() || null;
        if (!name || !phone) return;
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
        const name = document.getElementById('editContactName').value.trim();
        const phone = document.getElementById('editContactPhone').value.trim();
        const email = document.getElementById('editContactEmail').value.trim() || null;
        if (!name || !phone) return;
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
        const contactsResponse = await fetch(`${BASE_URL}/contacts`);
        if (!contactsResponse.ok) throw new Error('Erro ao buscar contatos');
        const contacts = await contactsResponse.json();
        document.getElementById('contacts-count').textContent = `${contacts.length} contatos cadastrados`;

        const messagesResponse = await fetch(`${BASE_URL}/messages`);
        if (!messagesResponse.ok) {
            document.getElementById('messages-sent').textContent = 'N/A';
        } else {
            const messages = await messagesResponse.json();
            document.getElementById('messages-sent').textContent = `${messages.length} mensagens`;
        }

        document.getElementById('whatsapp-status').textContent = 'Conectado';
        document.getElementById('dashboard').classList.add('active'); // Garante que o dashboard seja visível
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        document.getElementById('contacts-count').textContent = 'Erro ao carregar';
        document.getElementById('messages-sent').textContent = 'Erro ao carregar';
        document.getElementById('whatsapp-status').textContent = 'Desconectado';
    }
}

async function loadContacts() {
    try {
        const response = await fetch(`${BASE_URL}/contacts`);
        if (!response.ok) throw new Error('Erro ao buscar contatos');
        const contacts = await response.json();
        const contactsList = document.getElementById('contactsList');
        contactsList.innerHTML = contacts.length > 0 ? contacts.map(contact => `
            <div class="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                <span class="col-12 col-md-8">${contact.name} - ${contact.phone}${contact.email ? ` - ${contact.email}` : ''}</span>
                <div class="col-12 col-md-4 text-md-end mt-2 mt-md-0">
                    <button class="btn btn-sm btn-warning me-2" onclick="editContact(${contact.id}, '${contact.name}', '${contact.phone}', '${contact.email || ''}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteContact(${contact.id})">Excluir</button>
                </div>
            </div>
        `).join('') : '<div class="list-group-item text-muted">Nenhum contato cadastrado</div>';
    } catch (error) {
        console.error('Erro ao carregar contatos:', error);
        document.getElementById('contactsList').innerHTML = '<div class="list-group-item text-danger">Erro ao carregar contatos</div>';
    }
}

function setupNavigation() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.getAttribute('data-section'));
        });
    });
}

function navigateTo(sectionId) {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
            if (sectionId === 'contacts') loadContacts();
            else if (sectionId === 'dashboard') loadDashboard();
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });

    if (window.innerWidth < 768) {
        const navbarToggler = document.querySelector('.navbar-toggler');
        if (navbarToggler && !navbarToggler.classList.contains('collapsed')) {
            navbarToggler.click();
        }
    }
}

function editContact(id, name, phone, email) {
    document.getElementById('editContactId').value = id;
    document.getElementById('editContactName').value = name;
    document.getElementById('editContactPhone').value = phone;
    document.getElementById('editContactEmail').value = email;
    new bootstrap.Modal(document.getElementById('editContactModal')).show();
}

async function deleteContact(id) {
    if (!confirm('Tem certeza que deseja excluir este contato?')) return;
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