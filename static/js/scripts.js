let heroToEditId;

document.addEventListener("DOMContentLoaded", () => {
    fetchSuperheroes();

    document.getElementById("BtnAgregar").addEventListener("click", () => {
        clearForm();
        openModal(); 
    });

    document.getElementById("btnGuardar").addEventListener("click", () => {
        const id = heroToEditId; 
        if (id) {
            updateSuperheroe(id);
        } else {
            createSuperheroe();
        }
    });
});

function fetchSuperheroes() {
    fetch('http://127.0.0.1:5000/superheroes')
        .then(response => response.json())
        .then(superheroes => {
            const tbody = document.getElementById("listaSuperheroes");
            tbody.innerHTML = '';
            superheroes.forEach(hero => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${hero.nombre}</td>
                    <td>${hero.habilidad}</td>
                    <td>${hero.compania}</td>
                    <td><img src="${hero.imagen}" width="150" alt="Imagen de ${hero.nombre}"></td>
                    <td>${hero.genero}</td>
                    <td>${hero.descripcion}</td>
                    <td>
                        <button class="btn btn-warning" onclick="editSuperheroe(${hero.id})">Editar</button>
                        <button class="btn btn-danger" onclick="confirmDeleteSuperheroe(${hero.id})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        });
}

function createSuperheroe() {
    const superheroe = getFormData();
    fetch('http://127.0.0.1:5000/superheroes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(superheroe)
    })
    .then(response => response.json())
    .then(() => {
        fetchSuperheroes();
        closeModal();
    });
}

function updateSuperheroe(id) {
    const superheroe = getFormData();
    fetch(`http://127.0.0.1:5000/superheroes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(superheroe)
    })
    .then(response => response.json())
    .then(() => {
        fetchSuperheroes();
        closeModal();
        heroToEditId = null; 
    })
    .catch(error => {
        console.error('Error al actualizar el superhéroe:', error);
    });
}

function confirmDeleteSuperheroe(id) {
    if (confirm("¿Estás seguro de eliminar este superhéroe?")) {
        deleteSuperheroe(id);
    }
}

function deleteSuperheroe(id) {
    fetch(`http://127.0.0.1:5000/superheroes/${id}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(() => fetchSuperheroes());
}

function editSuperheroe(id) {
    fetch(`http://127.0.0.1:5000/superheroes/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.status);
            }
            return response.json();
        })
        .then(superhero => {
            document.getElementById('nombreHeroe').value = superhero.nombre;
            document.getElementById('habilidadHeroe').value = superhero.habilidad;
            document.getElementById('companiaHeroe').value = superhero.compania;
            document.getElementById('generoHeroe').value = superhero.genero;
            document.getElementById('imagenHeroe').value = superhero.imagen;
            document.getElementById('descripcionHeroe').value = superhero.descripcion;

            heroToEditId = superhero.id;
            document.getElementById("btnGuardar").dataset.id = superhero.id; 
            document.getElementById("btnGuardar").innerText = 'Actualizar Superhéroe'; 

            openModal(); 
        })
        .catch(error => {
            console.error('Error al obtener el superhéroe:', error);
        });
}

function getFormData() {
    return {
        nombre: document.getElementById("nombreHeroe").value,
        habilidad: document.getElementById("habilidadHeroe").value,
        compania: document.getElementById("companiaHeroe").value,
        genero: document.getElementById("generoHeroe").value,
        imagen: document.getElementById("imagenHeroe").value,
        descripcion: document.getElementById("descripcionHeroe").value,
    };
}

function clearForm() {
    document.getElementById("nombreHeroe").value = '';
    document.getElementById("habilidadHeroe").value = '';
    document.getElementById("companiaHeroe").value = '';
    document.getElementById("generoHeroe").value = '';
    document.getElementById("imagenHeroe").value = '';
    document.getElementById("descripcionHeroe").value = '';
    heroToEditId = null; 
    document.getElementById("btnGuardar").innerText = 'Guardar'; 
}

function openModal() {
    const modal = new bootstrap.Modal(document.getElementById('modalHeroe'));
    modal.show();
}

function closeModal() {
    const modalElement = document.getElementById('modalHeroe');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide();
    }
}
