
/* =====================================================
   NAZABRICKS - CATALOGO INDEPENDIENTE DE PIEZAS
   Google Sheets + JavaScript
===================================================== */


/* =====================================================
   1. CONFIGURACION
===================================================== */

const PIEZAS_CONFIG = {

    spreadsheetId: "10RL1vJswTYJqF6gzfNIZe1TpxxiurOtZAqWMGiJsw4o",

    categoriesSheet: "Categorias",

    refreshInterval: 300000,

    storageKey: "nazabricks_piezas_guardadas"

};


/* =====================================================
   2. ELEMENTOS HTML
===================================================== */

const elements = {

    search: document.getElementById("searchInput"),

    clearSearch: document.getElementById("clearSearch"),

    mainCategoryFilter: document.getElementById("mainCategoryFilter"),

    subcategoryFilter: document.getElementById("subcategoryFilter"),

    clearFilters: document.getElementById("clearFilters"),

    categoriesGrid: document.getElementById("categoriesGrid"),

    subcategoriesList: document.getElementById("subcategoriesList"),

    subcategoryDescription: document.getElementById("subcategoryDescription"),

    productsGrid: document.getElementById("productsGrid"),

    productsTitle: document.getElementById("productsTitle"),

    productsCount: document.getElementById("productsCount"),

    emptyState: document.getElementById("emptyState"),

    savedSection: document.getElementById("savedSection"),

    savedProductsGrid: document.getElementById("savedProductsGrid"),

    savedEmptyState: document.getElementById("savedEmptyState"),

    welcomeSection: document.getElementById("welcomeSection"),

    categoriesSection: document.getElementById("categoriesSection"),

    subcategoriesSection: document.getElementById("subcategoriesSection"),

    productsSection: document.getElementById("productsSection"),

    productModal: document.getElementById("productModal"),

    modalContent: document.getElementById("modalContent"),

    modalClose: document.getElementById("modalClose"),

    modalOverlay: document.getElementById("modalOverlay"),

    savedCounter: document.getElementById("savedCounter"),

    savedHeaderButton: document.getElementById("savedHeaderButton"),

    savedNavButton: document.getElementById("savedNavButton"),

    explorePiecesButton: document.getElementById("explorePiecesButton"),

    emptyClearFilters: document.getElementById("emptyClearFilters"),

    toastContainer: document.getElementById("toastContainer")

};


/* =====================================================
   3. VARIABLES GLOBALES
===================================================== */

let mainCategories = [];

let allPieces = [];

let savedPieces = [];

let selectedMainCategory = "Todas";

let selectedSubcategory = "Todas";

let currentView = "home";

let currentPiece = null;

let isLoading = false;


/* =====================================================
   4. FUNCIONES AUXILIARES
===================================================== */

// Evitar que los textos de Google Sheets
// puedan alterar el HTML de la página.

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const entities = {

            "&": "&amp;",

            "<": "&lt;",

            ">": "&gt;",

            '"': "&quot;",

            "'": "&#039;"

        };

        return entities[character];

    });

}


// Normalizar nombres de columnas.

function normalizeText(value) {

    return String(value ?? "")

        .trim()

        .toLowerCase()

        .normalize("NFD")

        .replace(/[\u0300-\u036f]/g, "");

}


// Obtener una URL segura de imagen.

function safeImageURL(url) {

    const value = String(url ?? "").trim();

    try {

        const parsed = new URL(value);

        if (
            parsed.protocol === "https:" ||
            parsed.protocol === "http:"
        ) {

            return parsed.href;

        }

    } catch (error) {

        return "";

    }

    return "";

}


// Determinar si una casilla está marcada.

function isAvailable(value) {

    if (value === true || value === 1) {

        return true;

    }

    const normalized = normalizeText(value);

    return [

        "true",

        "verdadero",

        "1",

        "si",

        "yes",

        "checked"

    ].includes(normalized);

}


// Leer valores de un objeto sin importar
// si el encabezado tiene mayúsculas o acentos.

function getField(row, field) {

    const target = normalizeText(field);

    const key = Object.keys(row).find(item => {

        return normalizeText(item) === target;

    });

    return key ? row[key] : "";

}


/* =====================================================
   5. CONEXION CON GOOGLE SHEETS
===================================================== */

async function getSheetData(sheetName) {

    const url =

        `https://docs.google.com/spreadsheets/d/${PIEZAS_CONFIG.spreadsheetId}/gviz/tq` +

        `?sheet=${encodeURIComponent(sheetName)}` +

        `&tqx=out:json`;

    const response = await fetch(url, {

        method: "GET",

        cache: "no-store"

    });

    if (!response.ok) {

        throw new Error(
            `Error HTTP ${response.status} al leer ${sheetName}`
        );

    }

    const responseText = await response.text();

    // Google devuelve una respuesta JSONP.
    // Extraemos el JSON que viene dentro.

    const start = responseText.indexOf("{");

    const end = responseText.lastIndexOf("}");

    if (start === -1 || end === -1) {

        throw new Error(
            `Respuesta inválida de Google Sheets: ${sheetName}`
        );

    }

    const json = JSON.parse(

        responseText.substring(start, end + 1)

    );

    if (json.status !== "ok") {

        throw new Error(
            `Google Sheets no pudo leer la pestaña ${sheetName}`
        );

    }

    const table = json.table;

    const headers = table.cols.map(column => column.label.trim());

    return table.rows.map(row => {

        const object = {};

        row.c.forEach((cell, index) => {

            const header = headers[index];

            if (!header) return;

            object[header] = cell

                ? (cell.v ?? cell.f ?? "")

                : "";

        });

        return object;

    });

}


/* =====================================================
   6. CARGAR CATEGORIAS PRINCIPALES
===================================================== */

async function loadMainCategories() {

    const rows = await getSheetData(
        PIEZAS_CONFIG.categoriesSheet
    );

    mainCategories = rows

        .filter(row => {

            return isAvailable(
                getField(row, "Disponible")
            );

        })

        .map((row, index) => {

            return {

                name: String(
                    getField(row, "Categoria")
                ).trim(),

                image: safeImageURL(
                    getField(row, "Foto")
                ),

                order: Number(
                    getField(row, "Orden")
                ) || 999,

                originalIndex: index

            };

        })

        .filter(category => category.name)

        .sort((a, b) => {

            return a.order - b.order ||

                a.originalIndex - b.originalIndex;

        });

}


/* =====================================================
   7. CARGAR PIEZAS DE TODAS LAS PESTAÑAS
===================================================== */

async function loadAllPieces() {

    const results = await Promise.all(

        mainCategories.map(async category => {

            try {

                const rows = await getSheetData(category.name);

                return rows

                    .filter(row => {

                        return isAvailable(
                            getField(row, "Disponible")
                        );

                    })

                    .map(row => {

                        const title = String(
                            getField(row, "Titulo")
                        ).trim();

                        const image = safeImageURL(
                            getField(row, "Foto")
                        );

                        const subcategory = String(
                            getField(row, "Categoria")
                        ).trim();

                        if (!title || !image) {

                            return null;

                        }

                        return {

                            id: [

                                category.name,

                                title,

                                image

                            ].join("::"),

                            mainCategory: category.name,

                            subcategory: subcategory || "Otros",

                            title: title,

                            image: image

                        };

                    })

                    .filter(Boolean);

            } catch (error) {

                console.error(

                    `Error leyendo la categoría ${category.name}:`,

                    error

                );

                return [];

            }

        })

    );

    allPieces = results.flat();

}


/* =====================================================
   8. CARGA GENERAL
===================================================== */

async function loadPieces(silent = false) {

    if (isLoading) return;

    isLoading = true;

    try {

        await loadMainCategories();

        await loadAllPieces();

        // Comprobar si la categoría seleccionada
        // sigue existiendo.

        if (

            selectedMainCategory !== "Todas" &&

            !mainCategories.some(category => {

                return category.name === selectedMainCategory;

            })

        ) {

            selectedMainCategory = "Todas";

            selectedSubcategory = "Todas";

        }

        // Comprobar si la subcategoría sigue existiendo.

        if (

            selectedSubcategory !== "Todas" &&

            !getSubcategories().includes(selectedSubcategory)

        ) {

            selectedSubcategory = "Todas";

        }

        renderCategories();

        updateCategorySelect();

        renderSubcategories();

        renderProducts();

        renderSavedCounter();

        if (!silent) {

            console.log("Catálogo de piezas cargado correctamente.");

            console.log("Categorías:", mainCategories);

            console.log("Piezas:", allPieces);

        }

    } catch (error) {

        console.error("Error general del catálogo:", error);

        if (!silent) {

            elements.productsGrid.innerHTML = `

                <div class="loading-message">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    No se pudo conectar con Google Sheets.

                    Comprueba los permisos del documento.

                </div>

            `;

        }

        showToast(
            "No se pudo actualizar el catálogo.",
            "error"
        );

    } finally {

        isLoading = false;

    }

}


/* =====================================================
   9. MOSTRAR CATEGORIAS
===================================================== */

function renderCategories() {

    const categories = [

        {

            name: "Todas",

            image: ""

        },

        ...mainCategories

    ];

    elements.categoriesGrid.innerHTML = categories.map(category => {

        const active =

            selectedMainCategory === category.name;

        let imageHTML;

        if (category.name === "Todas") {

            imageHTML = `

                <div class="category-image category-all-image">

                    <i class="fa-solid fa-layer-group"></i>

                </div>

            `;

        } else {

            imageHTML = `

                <div class="category-image">

                    <img

                        src="${escapeHTML(category.image)}"

                        alt="${escapeHTML(category.name)}"

                        loading="lazy"

                    >

                </div>

            `;

        }

        return `

            <button

                type="button"

                class="category-card ${active ? "active" : ""}"

                data-category="${escapeHTML(category.name)}"

            >

                ${imageHTML}

                <div class="category-name">

                    ${escapeHTML(category.name)}

                </div>

            </button>

        `;

    }).join("");

}


/* =====================================================
   10. ACTUALIZAR SELECT DE CATEGORIAS
===================================================== */

function updateCategorySelect() {

    elements.mainCategoryFilter.innerHTML = `

        <option value="Todas">

            Todas las categorías

        </option>

        ${mainCategories.map(category => `

            <option value="${escapeHTML(category.name)}">

                ${escapeHTML(category.name)}

            </option>

        `).join("")}

    `;

    elements.mainCategoryFilter.value = selectedMainCategory;

}


/* =====================================================
   11. OBTENER SUBCATEGORIAS
===================================================== */

function getSubcategories() {

    let result = allPieces;

    if (selectedMainCategory !== "Todas") {

        result = result.filter(piece => {

            return piece.mainCategory === selectedMainCategory;

        });

    }

    return [...new Set(

        result.map(piece => piece.subcategory)

    )].sort((a, b) => a.localeCompare(b));

}


/* =====================================================
   12. MOSTRAR SUBCATEGORIAS
===================================================== */

function renderSubcategories() {

    const subcategories = [

        "Todas",

        ...getSubcategories()

    ];

    elements.subcategoryDescription.textContent =

        selectedMainCategory === "Todas"

            ? "Subcategorías de todas las categorías."

            : `Subcategorías de ${selectedMainCategory}.`;


    elements.subcategoryFilter.innerHTML = subcategories.map(item => {

        return `

            <option value="${escapeHTML(item)}">

                ${item === "Todas"

                    ? "Todas las subcategorías"

                    : escapeHTML(item)

                }

            </option>

        `;

    }).join("");

    elements.subcategoryFilter.value = selectedSubcategory;


    elements.subcategoriesList.innerHTML = subcategories.map(item => {

        const active = selectedSubcategory === item;

        return `

            <button

                type="button"

                class="subcategory-button ${active ? "active" : ""}"

                data-subcategory="${escapeHTML(item)}"

            >

                ${escapeHTML(item)}

            </button>

        `;

    }).join("");

}


/* =====================================================
   13. FILTRAR PIEZAS
===================================================== */

function getFilteredPieces() {

    let result = [...allPieces];

    const search = elements.search.value

        .trim()

        .toLowerCase();


    // FILTRAR CATEGORIA PRINCIPAL

    if (selectedMainCategory !== "Todas") {

        result = result.filter(piece => {

            return piece.mainCategory === selectedMainCategory;

        });

    }


    // FILTRAR SUBCATEGORIA

    if (selectedSubcategory !== "Todas") {

        result = result.filter(piece => {

            return piece.subcategory === selectedSubcategory;

        });

    }


    // BUSCAR POR TITULO O CATEGORIA

    if (search) {

        result = result.filter(piece => {

            return (

                piece.title.toLowerCase().includes(search) ||

                piece.mainCategory.toLowerCase().includes(search) ||

                piece.subcategory.toLowerCase().includes(search)

            );

        });

    }

    return result;

}


/* =====================================================
   14. TARJETA DE PRODUCTO
===================================================== */

function createPieceCard(piece) {

    const isSaved = savedPieces.includes(piece.id);

    return `

        <article

            class="product-card"

            data-piece-id="${escapeHTML(piece.id)}"

        >

            <button

                type="button"

                class="product-save-button ${isSaved ? "saved" : ""}"

                data-save-id="${escapeHTML(piece.id)}"

                aria-label="${isSaved ? "Quitar de guardados" : "Guardar pieza"}"

                aria-pressed="${isSaved}"

            >

                <i class="${isSaved

                    ? "fa-solid fa-bookmark"

                    : "fa-regular fa-bookmark"

                }"></i>

            </button>


            <div class="product-image-container">

                <img

                    class="product-image"

                    src="${escapeHTML(piece.image)}"

                    alt="${escapeHTML(piece.title)}"

                    loading="lazy"

                >

            </div>


            <div class="product-info">

                <span class="product-category">

                    ${escapeHTML(piece.mainCategory)}

                    ·

                    ${escapeHTML(piece.subcategory)}

                </span>


                <h3 class="product-title">

                    ${escapeHTML(piece.title)}

                </h3>

            </div>

        </article>

    `;

}


/* =====================================================
   15. MOSTRAR PRODUCTOS
===================================================== */

function renderProducts() {

    const filtered = getFilteredPieces();

    elements.productsTitle.textContent =

        selectedMainCategory === "Todas"

            ? "Todas las piezas"

            : selectedMainCategory;


    elements.productsCount.textContent =

        `${filtered.length} piezas encontradas`;


    elements.productsGrid.innerHTML = filtered

        .map(createPieceCard)

        .join("");


    elements.emptyState.hidden = filtered.length > 0;


    elements.productsGrid.querySelectorAll("img").forEach(img => {

        img.addEventListener("error", () => {

            img.style.opacity = "0.2";

            img.alt = "Imagen no disponible";

        }, { once: true });

    });


    if (currentView === "saved") {

        renderSavedPieces();

    }

}


/* =====================================================
   16. SISTEMA DE GUARDADOS LOCAL
===================================================== */

function loadSavedPieces() {

    try {

        const stored = localStorage.getItem(
            PIEZAS_CONFIG.storageKey
        );

        const parsed = stored ? JSON.parse(stored) : [];

        savedPieces = Array.isArray(parsed)

            ? parsed.filter(item => typeof item === "string")

            : [];

    } catch (error) {

        console.error("Error leyendo guardados:", error);

        savedPieces = [];

    }

}


function saveSavedPieces() {

    try {

        localStorage.setItem(

            PIEZAS_CONFIG.storageKey,

            JSON.stringify(savedPieces)

        );

    } catch (error) {

        console.error("No se pudieron guardar las piezas:", error);

        showToast(
            "No se pudo guardar en este navegador.",
            "error"
        );

    }

}


function toggleSavedPiece(id) {

    const index = savedPieces.indexOf(id);

    if (index >= 0) {

        savedPieces.splice(index, 1);

        showToast("Pieza eliminada de guardados.");

    } else {

        savedPieces.push(id);

        showToast("Pieza guardada correctamente.", "success");

    }

    saveSavedPieces();

    renderSavedCounter();

    renderProducts();

    renderSavedPieces();

    // Actualizar modal si está abierta.

    if (currentPiece && currentPiece.id === id) {

        renderPieceModal(currentPiece);

    }

}


/* =====================================================
   17. CONTADOR DE GUARDADOS
===================================================== */

function renderSavedCounter() {

    elements.savedCounter.textContent = savedPieces.length;

}


/* =====================================================
   18. MOSTRAR GUARDADOS
===================================================== */

function renderSavedPieces() {

    const savedProducts = allPieces.filter(piece => {

        return savedPieces.includes(piece.id);

    });


    elements.savedProductsGrid.innerHTML = savedProducts

        .map(createPieceCard)

        .join("");


    elements.savedEmptyState.hidden = savedProducts.length > 0;


    elements.savedProductsGrid.querySelectorAll("img").forEach(img => {

        img.addEventListener("error", () => {

            img.style.opacity = "0.2";

            img.alt = "Imagen no disponible";

        }, { once: true });

    });

}


/* =====================================================
   19. ABRIR MODAL
===================================================== */

function openPieceModal(id) {

    const piece = allPieces.find(item => item.id === id);

    if (!piece) return;

    currentPiece = piece;

    renderPieceModal(piece);

    elements.productModal.classList.add("open");

    elements.productModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

}


function renderPieceModal(piece) {

    const isSaved = savedPieces.includes(piece.id);

    elements.modalContent.innerHTML = `

        <div class="modal-product-layout">


            <div class="modal-product-image">

                <img

                    src="${escapeHTML(piece.image)}"

                    alt="${escapeHTML(piece.title)}"

                >

            </div>


            <div class="modal-product-info">


                <span class="product-category">

                    ${escapeHTML(piece.mainCategory)}

                </span>


                <h2>

                    ${escapeHTML(piece.title)}

                </h2>


                <div class="modal-detail">

                    <span>Categoría principal</span>

                    <strong>

                        ${escapeHTML(piece.mainCategory)}

                    </strong>

                </div>


                <div class="modal-detail">

                    <span>Subcategoría</span>

                    <strong>

                        ${escapeHTML(piece.subcategory)}

                    </strong>

                </div>


                <p>

                    Consulta con nosotros para obtener información

                    sobre esta pieza y su disponibilidad.

                </p>


                <button

                    type="button"

                    class="modal-save-button ${isSaved ? "saved" : ""}"

                    data-save-id="${escapeHTML(piece.id)}"

                >

                    <i class="${isSaved

                        ? "fa-solid fa-bookmark"

                        : "fa-regular fa-bookmark"

                    }"></i>

                    ${isSaved

                        ? "Eliminar de guardados"

                        : "Guardar pieza"

                    }

                </button>


            </div>

        </div>

    `;

}


function closePieceModal() {

    elements.productModal.classList.remove("open");

    elements.productModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

    currentPiece = null;

}


/* =====================================================
   20. CAMBIAR ENTRE VENTANAS
===================================================== */

function setView(view) {

    currentView = view;

    const isSaved = view === "saved";


    elements.welcomeSection.hidden = isSaved;

    elements.categoriesSection.hidden = isSaved;

    elements.subcategoriesSection.hidden = isSaved;

    elements.productsSection.hidden = isSaved;

    elements.savedSection.hidden = !isSaved;


    document.querySelectorAll(".bottom-nav-item").forEach(item => {

        item.classList.remove("active");

    });


    const activeButton = document.querySelector(

        `.bottom-nav-item[data-local-view="${view}"]`

    );

    if (activeButton) {

        activeButton.classList.add("active");

    }


    if (isSaved) {

        renderSavedPieces();

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    } else {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

}


/* =====================================================
   21. NOTIFICACIONES
===================================================== */

function showToast(message, type = "success") {

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.textContent = message;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 2800);

}


/* =====================================================
   22. LIMPIAR FILTROS
===================================================== */

function clearAllFilters() {

    selectedMainCategory = "Todas";

    selectedSubcategory = "Todas";

    elements.search.value = "";

    elements.clearSearch.classList.remove("visible");

    elements.mainCategoryFilter.value = "Todas";

    elements.subcategoryFilter.value = "Todas";

    renderCategories();

    renderSubcategories();

    renderProducts();

}


/* =====================================================
   23. EVENTOS DE CATEGORIAS
===================================================== */

elements.categoriesGrid.addEventListener("click", event => {

    const button = event.target.closest("[data-category]");

    if (!button) return;

    selectedMainCategory = button.dataset.category;

    selectedSubcategory = "Todas";

    elements.mainCategoryFilter.value = selectedMainCategory;

    renderCategories();

    renderSubcategories();

    renderProducts();

    elements.productsSection.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

});


/* =====================================================
   24. EVENTOS DE SUBCATEGORIAS
===================================================== */

elements.subcategoriesList.addEventListener("click", event => {

    const button = event.target.closest("[data-subcategory]");

    if (!button) return;

    selectedSubcategory = button.dataset.subcategory;

    elements.subcategoryFilter.value = selectedSubcategory;

    renderSubcategories();

    renderProducts();

});


/* =====================================================
   25. EVENTOS DE SELECT
===================================================== */

elements.mainCategoryFilter.addEventListener("change", () => {

    selectedMainCategory = elements.mainCategoryFilter.value;

    selectedSubcategory = "Todas";

    renderCategories();

    renderSubcategories();

    renderProducts();

});


elements.subcategoryFilter.addEventListener("change", () => {

    selectedSubcategory = elements.subcategoryFilter.value;

    renderSubcategories();

    renderProducts();

});


/* =====================================================
   26. BUSCADOR EN TIEMPO REAL
===================================================== */

elements.search.addEventListener("input", () => {

    elements.clearSearch.classList.toggle(

        "visible",

        elements.search.value.length > 0

    );

    renderProducts();

});


elements.clearSearch.addEventListener("click", () => {

    elements.search.value = "";

    elements.clearSearch.classList.remove("visible");

    renderProducts();

    elements.search.focus();

});


/* =====================================================
   27. BOTONES LIMPIAR
===================================================== */

elements.clearFilters.addEventListener("click", clearAllFilters);

elements.emptyClearFilters.addEventListener("click", clearAllFilters);


/* =====================================================
   28. EVENTOS DE TARJETAS
===================================================== */

function handleProductGridClick(event) {

    const saveButton = event.target.closest("[data-save-id]");

    if (saveButton) {

        event.stopPropagation();

        toggleSavedPiece(saveButton.dataset.saveId);

        return;

    }

    const card = event.target.closest("[data-piece-id]");

    if (!card) return;

    openPieceModal(card.dataset.pieceId);

}


elements.productsGrid.addEventListener(

    "click",

    handleProductGridClick

);


elements.savedProductsGrid.addEventListener(

    "click",

    handleProductGridClick

);


/* =====================================================
   29. CERRAR MODAL
===================================================== */

elements.modalClose.addEventListener(

    "click",

    closePieceModal

);


elements.modalOverlay.addEventListener(

    "click",

    closePieceModal

);


document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        closePieceModal();

    }

});


/* =====================================================
   30. EVENTOS DE GUARDADOS
===================================================== */

elements.savedHeaderButton.addEventListener("click", () => {

    setView("saved");

});


elements.savedNavButton.addEventListener("click", () => {

    setView("saved");

});


elements.explorePiecesButton.addEventListener("click", () => {

    setView("home");

});


/* =====================================================
   31. NAVEGACION INFERIOR
===================================================== */

document.querySelectorAll(".bottom-nav-item").forEach(button => {

    if (button.id === "savedNavButton") return;

    button.addEventListener("click", event => {

        // Solo manejamos las ventanas internas.
        // Los enlaces externos siguen funcionando.

        const view = button.dataset.localView;

        if (!view) return;

        event.preventDefault();

        if (view === "home") {

            clearAllFilters();

        }

        setView(view);

    });

});


/* =====================================================
   32. ACTUALIZACION AUTOMATICA
===================================================== */

async function refreshPiecesCatalog() {

    await loadPieces(true);

}


// Actualizar cada 5 minutos sin recargar
// la página ni regresar al inicio.

setInterval(() => {

    refreshPiecesCatalog();

}, PIEZAS_CONFIG.refreshInterval);


/* =====================================================
   33. INICIAR CATALOGO
===================================================== */

async function initializePiecesCatalog() {

    loadSavedPieces();

    renderSavedCounter();

    await loadPieces(false);

    console.log("NazaBricks Piezas iniciado.");

}


initializePiecesCatalog();

