/* =========================================================
   CATÁLOGO COMPLETO - SETS
========================================================= */


/* =========================================================
   VARIABLES
========================================================= */

let catalogoSets = [];

let setsFiltrados = [];


/* =========================================================
   ELEMENTOS
========================================================= */

const gridCatalogo =
    document.getElementById(
        "grid-catalogo"
    );


const buscador =
    document.getElementById(
        "buscador"
    );


const filtroCategoria =
    document.getElementById(
        "filtro-categoria"
    );


const textoResultados =
    document.getElementById(
        "texto-resultados"
    );


const sinResultados =
    document.getElementById(
        "sin-resultados"
    );


const limpiarBusqueda =
    document.getElementById(
        "limpiar-busqueda"
    );


const limpiarFiltros =
    document.getElementById(
        "limpiar-filtros"
    );


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        configurarMenu();

        cargarCatalogoSets();

    }
);


/* =========================================================
   MENU
========================================================= */

function configurarMenu() {

    const botonMenu =
        document.getElementById(
            "boton-menu"
        );


    const menuMovil =
        document.getElementById(
            "menu-movil"
        );


    if (
        !botonMenu ||
        !menuMovil
    ) {
        return;
    }


    botonMenu.addEventListener(
        "click",
        () => {

            const abierto =
                menuMovil.classList.toggle(
                    "abierto"
                );


            botonMenu.classList.toggle(
                "abierto",
                abierto
            );


            botonMenu.setAttribute(
                "aria-expanded",
                abierto
            );

        }
    );


    menuMovil
        .querySelectorAll("a")
        .forEach(
            enlace => {

                enlace.addEventListener(
                    "click",
                    () => {

                        menuMovil.classList.remove(
                            "abierto"
                        );

                        botonMenu.classList.remove(
                            "abierto"
                        );

                    }
                );

            }
        );

}


/* =========================================================
   CARGAR SETS
========================================================= */

async function cargarCatalogoSets() {

    try {

        mostrarCargando();


        /*
         * IMPORTANTE:
         *
         * SOLO SE CARGA LA HOJA SETS
         *
         * NO SE CARGA FIGURAS
         */

        catalogoSets =
            await cargarHoja(
                CONFIG.HOJAS.SETS
            );


        console.log(
            "SETS cargados:",
            catalogoSets
        );


        /*
         * SOLO PRODUCTOS DISPONIBLES
         */

        catalogoSets =
            catalogoSets.filter(
                producto => {

                    return esDisponible(
                        producto.disponible
                    );

                }
            );


        setsFiltrados =
            [...catalogoSets];


        crearCategorias();


        mostrarSets();


    } catch (error) {

        console.error(
            "Error cargando SETS:",
            error
        );


        mostrarError();

    }

}


/* =========================================================
   MOSTRAR CARGANDO
========================================================= */

function mostrarCargando() {

    if (!gridCatalogo) return;


    gridCatalogo.innerHTML = `

        <div class="estado-catalogo">

            <div class="loader"></div>

            <p>
                Cargando SETS...
            </p>

        </div>

    `;

}


/* =========================================================
   MOSTRAR ERROR
========================================================= */

function mostrarError() {

    if (!gridCatalogo) return;


    gridCatalogo.innerHTML = `

        <div class="estado-catalogo">

            <p>
                No se pudieron cargar los SETS.
            </p>

        </div>

    `;

}


/* =========================================================
   CREAR CATEGORIAS
========================================================= */

function crearCategorias() {

    if (!filtroCategoria) return;


    /*
     * OBTENER LAS CATEGORÍAS
     * DE LA COLUMNA "categoria"
     */

    const categorias =
        catalogoSets
            .map(
                producto =>
                    producto.categoria
            )
            .filter(
                categoria =>
                    categoria &&
                    categoria.trim() !== ""
            );


    /*
     * ELIMINAR REPETIDAS
     */

    const categoriasUnicas =
        [...new Set(categorias)]
            .sort(
                (a, b) =>
                    a.localeCompare(b)
            );


    /*
     * LIMPIAR SELECT
     */

    filtroCategoria.innerHTML = `

        <option value="todas">
            Todas las categorías
        </option>

    `;


    /*
     * CREAR OPCIONES
     */

    categoriasUnicas.forEach(
        categoria => {

            const opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                categoria;


            opcion.textContent =
                categoria;


            filtroCategoria.appendChild(
                opcion
            );

        }
    );

}


/* =========================================================
   MOSTRAR SETS
========================================================= */

function mostrarSets() {

    if (!gridCatalogo) return;


    gridCatalogo.innerHTML = "";


    /*
     * SIN PRODUCTOS
     */

    if (
        setsFiltrados.length === 0
    ) {

        mostrarSinResultados();

        return;

    }


    ocultarSinResultados();


    /*
     * CREAR TARJETAS
     */

    setsFiltrados.forEach(
        producto => {

            const tarjeta =
                crearTarjetaSet(
                    producto
                );


            gridCatalogo.appendChild(
                tarjeta
            );

        }
    );


    actualizarContador();

}


/* =========================================================
   CREAR TARJETA
========================================================= */

function crearTarjetaSet(
    producto
) {

    const tarjeta =
        document.createElement(
            "article"
        );


    tarjeta.className =
        "tarjeta-catalogo";


    /*
     * DATOS
     */

    const titulo =
        producto.titulo ||
        "Sin título";


    const precio =
        producto.precio ||
        "Consultar";


    const imagen =
        producto.foto ||
        "https://via.placeholder.com/500";


    /*
     * HTML
     */

    tarjeta.innerHTML = `

        <div class="tarjeta-imagen">

            <img
                src="${imagen}"
                alt="${titulo}"
                loading="lazy"
            >

        </div>


        <div class="tarjeta-info">

            <h2 class="tarjeta-titulo">

                ${titulo}

            </h2>


            <div class="tarjeta-precio">

                ${precio}

            </div>

        </div>

    `;


    return tarjeta;

}


/* =========================================================
   BUSCADOR EN TIEMPO REAL
========================================================= */

if (buscador) {

    buscador.addEventListener(
        "input",
        aplicarFiltros
    );

}


/* =========================================================
   FILTRO CATEGORIA
========================================================= */

if (filtroCategoria) {

    filtroCategoria.addEventListener(
        "change",
        aplicarFiltros
    );

}


/* =========================================================
   APLICAR FILTROS
========================================================= */

function aplicarFiltros() {

    const texto =
        buscador
            ? buscador.value
                .toLowerCase()
                .trim()
            : "";


    const categoria =
        filtroCategoria
            ? filtroCategoria.value
            : "todas";


    setsFiltrados =
        catalogoSets.filter(
            producto => {


                /*
                 * BUSQUEDA
                 */

                const titulo =
                    String(
                        producto.titulo || ""
                    )
                    .toLowerCase();


                const coincideTexto =
                    titulo.includes(
                        texto
                    );


                /*
                 * CATEGORIA
                 */

                const categoriaProducto =
                    String(
                        producto.categoria || ""
                    )
                    .trim();


                const coincideCategoria =

                    categoria === "todas"

                        ? true

                        : categoriaProducto === categoria;


                return (
                    coincideTexto &&
                    coincideCategoria
                );

            }
        );


    mostrarSets();

}


/* =========================================================
   LIMPIAR BUSQUEDA
========================================================= */

if (limpiarBusqueda) {

    limpiarBusqueda.addEventListener(
        "click",
        () => {

            if (buscador) {

                buscador.value = "";

            }


            aplicarFiltros();


            if (buscador) {

                buscador.focus();

            }

        }
    );

}


/* =========================================================
   LIMPIAR TODOS LOS FILTROS
========================================================= */

if (limpiarFiltros) {

    limpiarFiltros.addEventListener(
        "click",
        () => {

            if (buscador) {

                buscador.value = "";

            }


            if (filtroCategoria) {

                filtroCategoria.value =
                    "todas";

            }


            aplicarFiltros();

        }
    );

}


/* =========================================================
   CONTADOR
========================================================= */

function actualizarContador() {

    if (!textoResultados) return;


    const cantidad =
        setsFiltrados.length;


    if (cantidad === 1) {

        textoResultados.textContent =
            "1 SET disponible";

    } else {

        textoResultados.textContent =
            `${cantidad} SETS disponibles`;

    }

}


/* =========================================================
   SIN RESULTADOS
========================================================= */

function mostrarSinResultados() {

    if (sinResultados) {

        sinResultados.classList.add(
            "visible"
        );

    }


    if (textoResultados) {

        textoResultados.textContent =
            "0 SETS encontrados";

    }

}


/* =========================================================
   OCULTAR SIN RESULTADOS
========================================================= */

function ocultarSinResultados() {

    if (sinResultados) {

        sinResultados.classList.remove(
            "visible"
        );

    }

}


/* =========================================================
   DISPONIBILIDAD
========================================================= */

function esDisponible(valor) {

    const texto =
        String(
            valor || ""
        )
        .toLowerCase()
        .trim();


    return (

        texto === "si" ||

        texto === "sí" ||

        texto === "true" ||

        texto === "1" ||

        texto === "disponible"

    );

}