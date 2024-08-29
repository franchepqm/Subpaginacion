import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, query, getDocs, orderBy, limit, startAfter } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const blogList = document.getElementById('blogList');
const itemsPerPage = 4; // Número de blogs por página
let currentPage = 1;
let lastVisible = null;

async function loadBlogs(page = 1) {
    blogList.innerHTML = ''; // Limpiar la lista antes de cargar los nuevos elementos

    const queryConstraints = [
        orderBy('timestamp', 'desc'),
        limit(itemsPerPage)
    ];

    if (page > 1 && lastVisible) {
        queryConstraints.push(startAfter(lastVisible));
    }

    const blogsQuery = query(collection(firestore, 'blogs'), ...queryConstraints);
    const snapshot = await getDocs(blogsQuery);

    snapshot.docs.forEach((doc, index) => {
        const blog = doc.data();
        const truncatedDescription = blog.descripcion.length > 420 ? blog.descripcion.substring(0, 420) + '...' : blog.descripcion;
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <section id="listsection">
                <div id="imagenblog">
                    <img src="${blog.imagenUrl}" alt="${blog.titulo}">
                </div>
                <div id="textsection">
                    <h3><a href="blogselected.html?itemId=${doc.id}&coleccion=blogs">${blog.titulo}</a></h3>
                    <p>${truncatedDescription}</p>
                    <p id="timestamp"><small>Publicado en: ${new Date(blog.timestamp.toDate()).toLocaleString()}</small></p>
                </div>
            </section>
        `;
        blogList.appendChild(listItem);

        if (index === snapshot.docs.length - 1) {
            lastVisible = doc;
        }
    });

    updatePaginationControls(page, snapshot.size);
}

function updatePaginationControls(page, fetchedItemsCount) {
    currentPage = page;
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');

    prevButton.disabled = (page === 1);
    nextButton.disabled = (fetchedItemsCount < itemsPerPage);

    document.getElementById('pageNumbers').textContent = `Página ${page}`;
}

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        lastVisible = null; // Reiniciar el puntero de paginación
        loadBlogs(currentPage - 1);
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    loadBlogs(currentPage + 1);
});

document.addEventListener('DOMContentLoaded', () => {
    loadBlogs(); // Cargar la primera página
});
