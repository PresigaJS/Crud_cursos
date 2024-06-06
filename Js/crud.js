document.addEventListener("DOMContentLoaded", function() {
    const formAgregar = document.getElementById("form-agregar");
    const formEditar = document.getElementById("form-editar");
    const cuerpoTabla = document.getElementById("cuerpo-tabla");
    let cursos = []; // Array para almacenar los cursos
    const path = window.location.pathname;
    let storageKey = "";
    
    if (path.includes('curso.html')) {
        storageKey = "cursosProgramacion";
    } else if (path.includes('cursodb.html')) {
        storageKey = "cursosBaseDatos";
    } else if (path.includes('matematicas.html')) {
        storageKey = "cursosMatematicas";
    }
    
    // Cargar cursos almacenados localmente al cargar la página
    if (localStorage.getItem(storageKey)) {
        cursos = JSON.parse(localStorage.getItem(storageKey));
        cursos.forEach(curso => {
            actualizarTablaCursos(curso);
        });
    }
    
    function guardarCursosEnNuevoJSON() {
        // Convertir el arreglo de cursos a formato JSON
        const jsonString = JSON.stringify(cursos);
        // Guardar el JSON en el nuevo archivo JSON
        fetch('/guardar-nuevos-cursos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonString
        })
        .then(response => response.json())
        .then(data => {
            console.log('Cursos guardados en el nuevo archivo JSON:', data);
        })
        .catch(error => {
            console.error('Error al guardar cursos en el nuevo archivo JSON:', error);
        });
    }
    
    formAgregar.addEventListener("submit", function(event) {
        event.preventDefault(); // Evita el envío del formulario por defecto
    
        // Obtener datos del formulario
        const titulo = formAgregar.querySelector("#titulo").value;
        const lenguaje = formAgregar.querySelector("#lenguaje").value;
        const vistas = parseInt(formAgregar.querySelector("#vistas").value);
        const nivel = formAgregar.querySelector("#nivel").value;
        const estado = formAgregar.querySelector("#estado").checked;
    
        // Crear objeto curso (aquí simulo que se genera un ID automáticamente)
        const nuevoCurso = {
            id: Date.now(), // Generar un ID único basado en la fecha actual
            titulo: titulo,
            lenguaje: lenguaje,
            vistas: vistas,
            nivel: nivel,
            estado: estado
        };
    
        // Agregar el nuevo curso al array de cursos
        cursos.push(nuevoCurso);
    
        // Guardar el array de cursos en el almacenamiento local del navegador
        localStorage.setItem(storageKey, JSON.stringify(cursos));
    
        // Guardar el array de cursos en el nuevo archivo JSON
        guardarCursosEnNuevoJSON();
    
        // Limpiar el formulario después de agregar el curso
        formAgregar.reset();
    
        // Actualizar la tabla de cursos mostrando el nuevo curso agregado
        actualizarTablaCursos(nuevoCurso);
    });

    // Escuchar clics en la tabla para manejar los botones de editar y eliminar
    cuerpoTabla.addEventListener("click", function(event) {
        const target = event.target;

        // Verificar si el botón clicado es de editar
        if (target.classList.contains("editar-curso")) {
            const idCurso = parseInt(target.getAttribute("data-id"));
            const curso = cursos.find(curso => curso.id === idCurso);
            if (curso) {
                // Mostrar los datos del curso en el formulario de edición
                formEditar.querySelector("#id-editar").value = curso.id;
                formEditar.querySelector("#titulo-editar").value = curso.titulo;
                formEditar.querySelector("#lenguaje-editar").value = curso.lenguaje;
                formEditar.querySelector("#vistas-editar").value = curso.vistas;
                formEditar.querySelector("#nivel-editar").value = curso.nivel;
                formEditar.querySelector("#estado-editar").checked = curso.estado;

                // Mostrar el formulario de edición
                formEditar.style.display = "block";
            }
        }

        // Verificar si el botón clicado es de eliminar
        if (target.classList.contains("eliminar-curso")) {
            const idCurso = parseInt(target.getAttribute("data-id"));
            const index = cursos.findIndex(curso => curso.id === idCurso);
            if (index !== -1) {
                // Eliminar el curso del array de cursos
                cursos.splice(index, 1);

                // Actualizar los cursos en el almacenamiento local del navegador
                localStorage.setItem(storageKey, JSON.stringify(cursos));

                // Eliminar la fila de la tabla correspondiente al curso eliminado
                target.closest("tr").remove();
            }
        }
    });

    // Manejar envío del formulario de edición
    formEditar.addEventListener("submit", function(event) {
        event.preventDefaut();

        // Obtener datos del formulario de edición
        const id = parseInt(formEditar.querySelector("#id-editar").value);
        const titulo = formEditar.querySelector("#titulo-editar").value;
        const lenguaje = formEditar.querySelector("#lenguaje-editar").value;
        const vistas = parseInt(formEditar.querySelector("#vistas-editar").value);
        const nivel = formEditar.querySelector("#nivel-editar").value;
        const estado = formEditar.querySelector("#estado-editar").checked;

        // Encontrar el curso correspondiente en el array de cursos
        const cursoIndex = cursos.findIndex(curso => curso.id === id);
        if (cursoIndex !== -1) {
            // Eliminar la fila anterior correspondiente al curso en la tabla
            const filaAnterior = cuerpoTabla.querySelector(`tr[data-id="${id}"]`);
            if (filaAnterior) {
                filaAnterior.remove();
            }

            // Actualizar los datos del curso en el array
            cursos[cursoIndex] = {
                id: id,
                titulo: titulo,
                lenguaje: lenguaje,
                vistas: vistas,
                nivel: nivel,
                estado: estado
            };

            // Actualizar los cursos en el almacenamiento local del navegador
            localStorage.setItem(storageKey, JSON.stringify(cursos));

            // Actualizar la tabla de cursos
            actualizarTablaCursos(cursos[cursoIndex]);

            // Ocultar el formulario de edición
            formEditar.style.display = "none";
        }
    });

    // Manejar cancelación de edición
    document.getElementById("cancelar-edicion").addEventListener("click", function(event) {
        event.preventDefault();
        // Ocultar el formulario de edición
        formEditar.style.display = "none";
    });

    function actualizarTablaCursos(curso) {
        const fila = document.createElement("tr");
        fila.setAttribute("data-id", curso.id);
        fila.innerHTML = `
            <td>${curso.id}</td>
            <td>${curso.titulo}</td>
            <td>${curso.lenguaje}</td>
            <td>${curso.vistas}</td>
            <td>${curso.nivel}</td>
            <td>${curso.estado ? "Activo" : "Inactivo"}</td>
            <td>
                <button class="editar-curso" data-id="${curso.id}">Editar</button>
                <button class="eliminar-curso" data-id="${curso.id}">Eliminar</button>
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    }
    
});