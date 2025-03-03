const BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', () => {
    loadContacts();

    // Formulário de mensagens
    const messageForm = document.getElementById('messageForm');

    // No evento de envio de mensagens
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
                throw new Error(data.error || `Erro ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            alert(`Erro ao enviar mensagem: ${error.message}`);
        }
    });

    // Formulário de adicionar contatos
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
                loadContacts();
            } else {
                throw new Error(data.error || 'Erro ao adicionar contato');
            }
        } catch (error) {
            console.error('Erro ao adicionar contato:', error);
            alert(`Erro: ${error.message}`);
        }
    });

    // Botão de salvar edição
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
            } else {
                throw new Error(data.error || 'Erro ao atualizar contato');
            }
        } catch (error) {
            console.error('Erro ao atualizar contato:', error);
            alert(`Erro: ${error.message}`);
        }
    });
});

async function loadContacts() {
    try {
        const response = await fetch(`${BASE_URL}/contacts`);
        const contacts = await response.json();
        const contactsList = document.getElementById('contactsList');
        contactsList.innerHTML = contacts.map(contact => `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <span>${contact.name} - ${contact.phone}${contact.email ? ` - ${contact.email}` : ''}</span>
                <div>
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
            } else {
                throw new Error(data.error || 'Erro ao excluir contato');
            }
        } catch (error) {
            console.error('Erro ao excluir contato:', error);
            alert(`Erro: ${error.message}`);
        }
    }
}