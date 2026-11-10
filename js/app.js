
/* =========================================
   VARIABLES GENERALES
========================================= */

let products = [];
let covers = [];

let selectedCategory = "Todas";
let currentView = "home";

let currentHeroIndex = 0;
let heroInterval = null;

let categoriesData = [];

let savedProducts = JSON.parse(
    localStorage.getItem(CONFIG.storageKey) || "[]"
);

let selectedProduct = null;

const productsGrid = document.getElementById("productsGrid");
const categoriesList = document.getElementById("categoriesList");

const searchInput = document.getElementById("searchInput");
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");

const productsTitle = document.getElementById("productsTitle");
const productsCount = document.getElementById("productsCount");
const emptyMessage = document.getElementById("emptyMessage");

const productModal = document.getElementById("productModal");
const modalContent = document.getElementById("modalContent");

const toast = document.getElementById("toast");


/* =========================================
   CONEXION GOOGLE SHEETS
========================================= */

function getSheetURL(sheetName) {

    return `https://docs.google.com/spreadsheets/d/${CONFIG.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;

}


/* =========================================
   LECTOR CSV
========================================= */

function parseCSV(text) {

    const rows = [];

    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {

        const char = text[i];
        const next = text[i + 1];

        if (char === '"') {

            if (insideQuotes && next === '"') {
                value += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }

        } else if (char === "," && !insideQuotes) {

            row.push(value);
            value = "";

        } else if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {

            if (char === "\r" && next === "\n") i++;

            row.push(value);

            if (row.some(cell => cell.trim() !== "")) {
                rows.push(row);
            }

            row = [];
            value = "";

        } else {

            value += char;

        }

    }

    if (value !== "" || row.length > 0) {
        row.push(value);
        rows.push(row);
    }

    return rows;

}


/* =========================================
   NORMALIZAR ENCABEZADOS
========================================= */

function normalizeHeader(header) {

    return header
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


/* =========================================
   OBTENER DATOS DE UNA HOJA
========================================= */

async function getSheetData(sheetName) {

    const response = await fetch(getSheetURL(sheetName), {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(
            `No se pudo consultar la hoja ${sheetName}`
        );
    }

    const csv = await response.text();

    if (
        csv.trim().startsWith("<!DOCTYPE") ||
        csv.trim().startsWith("<html")
    ) {
        throw new Error(
            "Google Sheets no permitió leer la información. Revisa los permisos de publicación."
        );
    }

    const rows = parseCSV(csv);

    if (!rows.length) return [];

    const headers = rows[0].map(normalizeHeader);

    return rows.slice(1).map(row => {

        const item = {};

        headers.forEach((header, index) => {
            item[header] = (row[index] || "").trim();
        });

        return item;

    });

}


/* =========================================
   CONVERSION DE DATOS
========================================= */

function parsePrice(value) {

    if (!value) return null;

    const cleaned = String(value)
        .replace(/mxn/gi, "")
        .replace(/\$/g, "")
        .replace(/,/g, "")
        .replace(/[^\d.-]/g, "");

    if (!cleaned) return null;

    const number = Number(cleaned);

    return Number.isFinite(number) ? number : null;

}


function isAvailable(value) {

    return [
        "true",
        "verdadero",
        "1",
        "si",
        "sí",
        "yes",
        "checked",
        "✓"
    ].includes(
        String(value).trim().toLowerCase()
    );

}


function formatPrice(value) {

    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: CONFIG.currency,
        maximumFractionDigits: 2
    }).format(value);

}


/* =========================================
   PREPARAR PRODUCTOS
========================================= */

function prepareProducts(data) {

    return data
        .filter(item => isAvailable(item.disponible))
        .map((item, index) => {

            const product = {

                id: `${item.titulo || index}_${item.foto || index}`,

                title: item.titulo || "Producto sin título",

                image: item.foto || "",

                category: item.categoria || "Otros",

                price: parsePrice(item.costo),

                description: item.descripcion || "Sin descripción disponible.",

                promo: item.promo || ""

            };

            return product;

        })
        .filter(product => product.image);

}


/* =========================================
   CARGAR CATALOGO
========================================= */


async function loadCatalog(silent = false) {

    if (!silent) {
        productsGrid.innerHTML = `
            <div class="loading-message">
                Cargando productos...
            </div>
        `;
    }

    try {

        const [productData, coverData, categoryData] =
            await Promise.all([

                getSheetData(CONFIG.sheets.products),

                getSheetData(CONFIG.sheets.covers),

                getSheetData(CONFIG.sheets.categories)

            ]);

        products = prepareProducts(productData);

        covers = coverData
            .map(item => ({
                image: item.foto || "",
                title: item.titulo || ""
            }))
            .filter(item => item.image);

        categoriesData = categoryData
            .map(item => ({
                name: item.categoria || "",
                image: item.foto || "",
                order: Number(item.orden) || 999
            }))
            .filter(item => item.name);

        categoriesData.sort((a, b) => a.order - b.order);

        renderCategories();

        renderHero();

        renderProducts();

        updateSavedCounter();

    } catch (error) {

        console.error("Error cargando catálogo:", error);

        if (!silent) {

            productsGrid.innerHTML = `
                <div class="loading-message">
                    <h3>No se pudo cargar el catálogo</h3>
                    <p>Revisa los permisos y nombres de tus hojas.</p>
                </div>
            `;

        }

    }

}



/* =========================================
   CATEGORIAS
========================================= */

function getCategoryIcon(category) {

    const icons = {

        "todas": "✦",
        "architecture": "✦",
        "batman": "✦",
        "brick head": "✦",
        "city": "✦",
        "star wars": "✦",
        "marvel": "✦",
        "harry potter": "✦",
        "technic": "✦",
        "ideas": "✦",
        "icons": "✦"

    };

    return icons[category.toLowerCase()] || "✦";

}



function renderCategories() {

    // Categorías obtenidas de los productos disponibles
    const uniqueCategories = [
        ...new Set(products.map(p => p.category))
    ];

    // Ordenar según la hoja Categorias
    uniqueCategories.sort((a, b) => {

        const categoryA = categoriesData.find(
            item => item.name.toLowerCase() === a.toLowerCase()
        );

        const categoryB = categoriesData.find(
            item => item.name.toLowerCase() === b.toLowerCase()
        );

        return (categoryA?.order ?? 999) -
               (categoryB?.order ?? 999);

    });

    const categories = ["Todas", ...uniqueCategories];

    categoriesList.innerHTML = categories.map(category => {

        const active = selectedCategory === category;

        const categoryInfo = categoriesData.find(
            item => item.name.toLowerCase() === category.toLowerCase()
        );

        let visual;

        if (category === "Todas") {

            visual = `
                <span class="category-icon">✦</span>
            `;

        } else if (categoryInfo?.image) {

            visual = `
                <span class="category-icon category-photo">
                    <img
                        src="${escapeHTML(categoryInfo.image)}"
                        alt="${escapeHTML(category)}"
                        loading="lazy"
                    >
                </span>
            `;

        } else {

            visual = `
                <span class="category-icon">
                    ${getCategoryIcon(category)}
                </span>
            `;

        }

        return `

            <button
                class="category-button ${active ? "active" : ""}"
                data-category="${escapeHTML(category)}"
            >

                ${visual}

                <span>${escapeHTML(category)}</span>

            </button>

        `;

    }).join("");

}



/* =========================================
   ESCAPAR TEXTO HTML
========================================= */

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

    })[char]);

}


/* =========================================
   FILTROS
========================================= */

function getFilteredProducts() {

    let result = [...products];

    const search = searchInput.value
        .trim()
        .toLowerCase();

    const min = minPrice.value !== ""
        ? Number(minPrice.value)
        : null;

    const max = maxPrice.value !== ""
        ? Number(maxPrice.value)
        : null;


    // BUSCADOR

    if (search) {

        result = result.filter(product => {

            return product.title
                .toLowerCase()
                .includes(search);

        });

    }


    // CATEGORIAS

    if (selectedCategory !== "Todas") {

        result = result.filter(product => {

            return product.category === selectedCategory;

        });

    }


    // GUARDADOS

    if (currentView === "saved") {

        result = result.filter(product => {

            return savedProducts.includes(product.id);

        });

    }


    // PRECIO MINIMO

    if (min !== null && Number.isFinite(min)) {

        result = result.filter(product => {

            return product.price !== null &&
                product.price >= min;

        });

    }


    // PRECIO MAXIMO

    if (max !== null && Number.isFinite(max)) {

        result = result.filter(product => {

            return product.price !== null &&
                product.price <= max;

        });

    }

    return result;

}


/* =========================================
   GENERAR TARJETAS
========================================= */

function renderProducts() {

    const filteredProducts = getFilteredProducts();

    productsCount.textContent =
        `${filteredProducts.length} productos encontrados`;


    if (currentView === "saved") {

        productsTitle.textContent = "Mis productos guardados";

    } else if (selectedCategory !== "Todas") {

        productsTitle.textContent = selectedCategory;

    } else {

        productsTitle.textContent = "Todos los productos";

    }


    if (filteredProducts.length === 0) {

        productsGrid.innerHTML = "";

        emptyMessage.hidden = false;

        return;

    }

    emptyMessage.hidden = true;


    productsGrid.innerHTML = filteredProducts.map(product => {

        const isSaved = savedProducts.includes(product.id);

        return `

            <article
                class="product-card"
                data-id="${escapeHTML(product.id)}"
                tabindex="0"
                role="button"
                aria-label="Ver ${escapeHTML(product.title)}"
            >

                <div class="product-image-container">

                    <img
                        class="product-image"
                        src="${escapeHTML(product.image)}"
                        alt="${escapeHTML(product.title)}"
                        loading="lazy"
                    >

                    ${product.promo ? `

                        <span class="promo-label">
                            ${escapeHTML(product.promo)}
                        </span>

                    ` : ""}

                    <button
                        class="favorite-button ${isSaved ? "saved" : ""}"
                        data-favorite="${escapeHTML(product.id)}"
                        aria-label="Guardar producto"
                        aria-pressed="${isSaved}"
                    >
                        ${isSaved ? "♥" : "♡"}
                    </button>

                </div>

                <div class="product-info">

                    <span class="product-category">
                        ${escapeHTML(product.category)}
                    </span>

                    <h3 class="product-title">
                        ${escapeHTML(product.title)}
                    </h3>

                    ${product.price !== null ? `

                        <div class="product-price">
                            ${formatPrice(product.price)}
                        </div>

                    ` : `

                        <div class="consult-price">
                            Consultar precio
                        </div>

                    `}

                </div>

            </article>

        `;

    }).join("");

}


/* =========================================
   FAVORITOS LOCALES
========================================= */

function toggleFavorite(id) {

    if (savedProducts.includes(id)) {

        savedProducts = savedProducts.filter(
            productId => productId !== id
        );

        showToast("Producto eliminado de guardados");

    } else {

        savedProducts.push(id);

        showToast("Producto agregado a guardados");

    }

    localStorage.setItem(
        CONFIG.storageKey,
        JSON.stringify(savedProducts)
    );

    updateSavedCounter();

    renderProducts();

}


function updateSavedCounter() {

    const counter = document.getElementById("savedCounter");

    counter.textContent = savedProducts.length;

}


/* =========================================
   MODAL DE PRODUCTOS
========================================= */

function openProduct(id) {

    const product = products.find(p => p.id === id);

    if (!product) return;

    selectedProduct = product;

    const isSaved = savedProducts.includes(product.id);

    modalContent.innerHTML = `

        <div class="modal-product-layout">

            <div class="modal-product-image">

                <img
                    src="${escapeHTML(product.image)}"
                    alt="${escapeHTML(product.title)}"
                >

            </div>

            <div class="modal-product-info">

                <span class="product-category">
                    ${escapeHTML(product.category)}
                </span>

                <h2>
                    ${escapeHTML(product.title)}
                </h2>

                ${product.price !== null ? `

                    <div class="product-price">
                        ${formatPrice(product.price)}
                    </div>

                ` : `

                    <div class="consult-price">
                        Consultar precio por privado
                    </div>

                `}

                ${product.promo ? `

                    <p class="consult-price">
                        ${escapeHTML(product.promo)}
                    </p>

                ` : ""}

                <div class="modal-description">
                    ${escapeHTML(product.description)}
                </div>

                <button
                    class="modal-favorite"
                    id="modalFavorite"
                >
                    ${isSaved
                        ? "♥ Quitar de guardados"
                        : "♡ Guardar producto"
                    }
                </button>

            </div>

        </div>

    `;

    productModal.classList.add("open");

    document.body.style.overflow = "hidden";

}


function closeModal() {

    productModal.classList.remove("open");

    document.body.style.overflow = "";

    selectedProduct = null;

}


/* =========================================
   CARRUSEL HERO
========================================= */

function renderHero() {

    clearInterval(heroInterval);

    const image = document.getElementById("heroImage");

    const title = document.getElementById("heroTitle");

    const dots = document.getElementById("heroDots");

    if (!covers.length) {

        image.removeAttribute("src");

        image.alt = "No hay portadas disponibles";

        title.textContent = "Bienvenido a nuestro catálogo";

        dots.innerHTML = "";

        return;

    }

    //currentHeroIndex = 0;

    dots.innerHTML = covers.map((cover, index) => `

        <button
            class="hero-dot ${index === 0 ? "active" : ""}"
            data-dot="${index}"
            aria-label="Ir a portada ${index + 1}"
        ></button>

    `).join("");


    showHeroSlide();

    if (covers.length > 1) {

        heroInterval = setInterval(() => {

            currentHeroIndex =
                (currentHeroIndex + 1) % covers.length;

            showHeroSlide();

        }, 10000);

    }

}


function showHeroSlide() {

    if (!covers.length) return;

    const cover = covers[currentHeroIndex];

    const image = document.getElementById("heroImage");

    image.src = cover.image;

    image.alt = cover.title || "Portada del catálogo";

    
    document.querySelectorAll(".hero-dot").forEach((dot, index) => {

        dot.classList.toggle(
            "active",
            index === currentHeroIndex
        );

    });

}


function changeHero(direction) {

    if (covers.length <= 1) return;

    currentHeroIndex = (
        currentHeroIndex + direction + covers.length
    ) % covers.length;

    showHeroSlide();

    clearInterval(heroInterval);

    heroInterval = setInterval(() => {

        currentHeroIndex =
            (currentHeroIndex + 1) % covers.length;

        showHeroSlide();

    }, 10000);

}


/* =========================================
   NOTIFICACIONES
========================================= */

let toastTimeout;

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);

}


/* =========================================
   EVENTOS
========================================= */

// Seleccionar categoría

categoriesList.addEventListener("click", event => {

    const button = event.target.closest("[data-category]");

    if (!button) return;

    selectedCategory = button.dataset.category;

    currentView = "home";

    updateNavigation();

    renderCategories();

    renderProducts();

});


// Abrir modal

productsGrid.addEventListener("click", event => {

    const favorite = event.target.closest("[data-favorite]");

    if (favorite) {

        event.stopPropagation();

        toggleFavorite(favorite.dataset.favorite);

        return;

    }

    const card = event.target.closest(".product-card");

    if (card) {

        openProduct(card.dataset.id);

    }

});


// Accesibilidad para tarjetas

productsGrid.addEventListener("keydown", event => {

    if (event.key !== "Enter" && event.key !== " ") return;

    if (event.target.closest("button")) return;

    const card = event.target.closest(".product-card");

    if (card) {

        event.preventDefault();

        openProduct(card.dataset.id);

    }

});


// Buscador

searchInput.addEventListener("input", renderProducts);


// Precio

minPrice.addEventListener("input", renderProducts);

maxPrice.addEventListener("input", renderProducts);


// Modal

document.getElementById("modalClose")
    .addEventListener("click", closeModal);


productModal.addEventListener("click", event => {

    if (event.target === productModal) {

        closeModal();

    }

});


document.addEventListener("keydown", event => {

    if (event.key === "Escape") closeModal();

});


// Favoritos dentro del modal

modalContent.addEventListener("click", event => {

    if (event.target.id === "modalFavorite" && selectedProduct) {

        toggleFavorite(selectedProduct.id);

        const id = selectedProduct.id;

        openProduct(id);

    }

});


// Carrusel

document.getElementById("heroPrev")
    .addEventListener("click", () => changeHero(-1));


document.getElementById("heroNext")
    .addEventListener("click", () => changeHero(1));


document.getElementById("heroDots")
    .addEventListener("click", event => {

        const dot = event.target.closest("[data-dot]");

        if (!dot) return;

        currentHeroIndex = Number(dot.dataset.dot);

        showHeroSlide();

        clearInterval(heroInterval);

        if (covers.length > 1) {

            heroInterval = setInterval(() => {

                currentHeroIndex =
                    (currentHeroIndex + 1) % covers.length;

                showHeroSlide();

            }, 10000);

        }

    });


// Navegación inferior

document.querySelector(".bottom-nav")
    .addEventListener("click", event => {

        const button = event.target.closest("[data-view]");

        if (!button) return;

        const view = button.dataset.view;

        if (view === "home") {

            currentView = "home";

            selectedCategory = "Todas";

            searchInput.value = "";

            minPrice.value = "";

            maxPrice.value = "";

            renderCategories();

            window.scrollTo({ top: 0, behavior: "smooth" });

        }

        if (view === "figures") {

            currentView = "home";

            selectedCategory = "Todas";

            renderCategories();

            document.getElementById("categoriesSection")
                .scrollIntoView({ behavior: "smooth" });

        }

        if (view === "saved") {

            currentView = "saved";

            selectedCategory = "Todas";

            document.getElementById("productsSection")
                .scrollIntoView({ behavior: "smooth" });

        }

        updateNavigation();

        renderProducts();

    });


// Logo

document.getElementById("brandHome")
    .addEventListener("click", event => {

        event.preventDefault();

        currentView = "home";

        selectedCategory = "Todas";

        searchInput.value = "";

        minPrice.value = "";

        maxPrice.value = "";

        renderCategories();

        updateNavigation();

        renderProducts();

        window.scrollTo({ top: 0, behavior: "smooth" });

    });


// Limpiar filtros

document.getElementById("clearFilters")
    .addEventListener("click", () => {

        searchInput.value = "";

        minPrice.value = "";

        maxPrice.value = "";

        selectedCategory = "Todas";

        if (currentView !== "saved") {

            currentView = "home";

        }

        renderCategories();

        updateNavigation();

        renderProducts();

    });


/* =========================================
   ACTUALIZAR NAVEGACION
========================================= */

function updateNavigation() {

    document.querySelectorAll(".nav-item").forEach(button => {

        const view = button.dataset.view;

        button.classList.toggle(

            "active",

            (view === "saved" && currentView === "saved") ||

            (view === "home" && currentView === "home" &&
                selectedCategory === "Todas") ||

            (view === "figures" && false)

        );

    });

}


/* =========================================
   INICIAR
========================================= */

loadCatalog();



/* =========================================
   ACTUALIZACION AUTOMATICA
========================================= */

// Primera carga
loadCatalog(false);

// Actualizar información sin interrumpir
// la navegación del cliente.

setInterval(() => {

    loadCatalog(true);

}, CONFIG.refreshInterval);
