/* =========================================================
   CATÁLOGO COMPLETO - FIGURAS
========================================================= */


/* =========================================================
   VARIABLES
========================================================= */

let figuras = [];

let figurasFiltradas = [];


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        configurarMenu();

        cargarFiguras();

        configurarBuscador();

        configurarFiltroCategoria();

        configurarBotones();

    }
);


/* =========================================================
   MENU
========================================================= */

function configurarMenu() {

    const boton =
        document.getElementById(
            "boton-menu"
        );


    const menu =
        document.getElementById(
            "menu-movil"
        );


    if (!boton || !menu) return;


    boton.addEventListener(
        "click",
        () => {

            const abierto =
                menu.classList.toggle(
                    "abierto"
                );


            boton.classList.toggle(
                "abierto"
            );


            boton.setAttribute(
                "aria-expanded",
                abierto
            );

        }
    );


    menu.querySelectorAll("a")
        .forEach(enlace => {

            enlace.addEventListener(
                "click",
                () => {

                    menu.classList.remove(
                        "abierto"
                    );

                    boton.classList.remove(
                        "abierto"
                    );

                    boton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        });

}


/* =========================================================
   CARGAR FIGURAS
========================================================= */

async function cargarFiguras() {

    const grid =
        document.getElementById(
            "grid-catalogo"
        );


    try {

        /*
         * IMPORTANTE:
         *
         * AQUÍ SOLAMENTE CARGAMOS
         * LA HOJA FIGURAS.
         *
         * NO SE CARGA SETS.
         * NO SE CARGA PORTADAS.
         */

        figuras =
            await cargarHoja(
                CONFIG.HOJAS.FIGURAS
            );


        console.log(
            "FIGURAS CARGADAS:",
            figuras
        );


        /*
         * SOLO PRODUCTOS DISPONIBLES
         */

        figuras =
            figuras.filter(
                figura => {

                    return esDisponible(
                        figura.disponible
                    );

                }
            );


        /*
         * COPIA PARA LOS FILTROS
         */

        figurasFiltradas =
            [...figuras];


        /*
         * CREAR CATEGORÍAS
         */

        crearCategorias();


        /*
         * MOSTRAR PRODUCTOS
         */

        mostrarFiguras();


    } catch (error) {

        console.error(
            "Error cargando FIGURAS:",
            error
        );


        if (grid) {

            grid.innerHTML = `

                <div class="estado-catalogo">

                    <p>
                        No se pudieron cargar las figuras.
                    </p>

                </div>

            `;

        }

    }

}


/* =========================================================
   CREAR CATEGORÍAS
========================================================= */

function crearCategorias() {

    const select =
        document.getElementById(
            "filtro-categoria"
        );


    if (!select) return;


    /*
     * OBTENER CATEGORÍAS ÚNICAS
     */

    const categorias =
        figuras
            .map(
                figura =>
                    figura.categoria
            )
            .filter(
                categoria =>
                    categoria &&
                    categoria.trim() !== ""
            );


    const categoriasUnicas =
        [...new Set(
            categorias.map(
                categoria =>
                    categoria.trim()
            )
        )];


    /*
     * ORDEN ALFABÉTICO
     */

    categoriasUnicas.sort(
        (a, b) =>
            a.localeCompare(
                b,
                "es",
                {
                    sensitivity: "base"
                }
            )
    );


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


            select.appendChild(
                opcion
            );

        }
    );

}


/* =========================================================
   BUSCADOR
========================================================= */

function configurarBuscador() {

    const buscador =
        document.getElementById(
            "buscador"
        );


    if (!buscador) return;


    /*
     * SE EJECUTA CON CADA LETRA
     */

    buscador.addEventListener(
        "input",
        () => {

            aplicarFiltros();

        }
    );

}


/* =========================================================
   FILTRO DE CATEGORÍA
========================================================= */

function configurarFiltroCategoria() {

    const select =
        document.getElementById(
            "filtro-categoria"
        );


    if (!select) return;


    select.addEventListener(
        "change",
        () => {

            aplicarFiltros();

        }
    );

}


/* =========================================================
   APLICAR FILTROS
========================================================= */

function aplicarFiltros() {

    const buscador =
        document.getElementById(
            "buscador"
        );


    const select =
        document.getElementById(
            "filtro-categoria"
        );


    const texto =
        buscador
            ? buscador.value
                .toLowerCase()
                .trim()
            : "";


    const categoria =
        select
            ? select.value
            : "todas";


    figurasFiltradas =
        figuras.filter(
            figura => {


                /*
                 * BUSCAR
                 */

                const titulo =
                    String(
                        figura.titulo || ""
                    )
                    .toLowerCase();


                const categoriaFigura =
                    String(
                        figura.categoria || ""
                    )
                    .toLowerCase();


                const coincideTexto =

                    titulo.includes(texto) ||

                    categoriaFigura.includes(texto);


                /*
                 * FILTRO CATEGORÍA
                 */

                const coincideCategoria =

                    categoria === "todas" ||

                    String(
                        figura.categoria || ""
                    ).trim() === categoria;


                return (
                    coincideTexto &&
                    coincideCategoria
                );

            }
        );


    mostrarFiguras();

}


/* =========================================================
   MOSTRAR FIGURAS
========================================================= */

function mostrarFiguras() {

    const grid =
        document.getElementById(
            "grid-catalogo"
        );


    const sinResultados =
        document.getElementById(
            "sin-resultados"
        );


    const textoResultados =
        document.getElementById(
            "texto-resultados"
        );


    if (!grid) return;


    grid.innerHTML = "";


    /*
     * ACTUALIZAR CONTADOR
     */

    if (textoResultados) {

        textoResultados.textContent =

            figurasFiltradas.length === 1

                ? "1 figura disponible"

                : `${figurasFiltradas.length} figuras disponibles`;

    }


    /*
     * SIN RESULTADOS
     */

    if (
        figurasFiltradas.length === 0
    ) {

        grid.style.display =
            "none";


        if (sinResultados) {

            sinResultados.classList.add(
                "visible"
            );

        }


        return;

    }


    /*
     * MOSTRAR GRID
     */

    grid.style.display =
        "grid";


    if (sinResultados) {

        sinResultados.classList.remove(
            "visible"
        );

    }


    /*
     * CREAR TARJETAS
     */

    figurasFiltradas.forEach(
        figura => {

            grid.appendChild(
                crearTarjetaFigura(
                    figura
                )
            );

        }
    );

}


/* =========================================================
   CREAR TARJETA
========================================================= */

function crearTarjetaFigura(
    figura
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
        figura.titulo ||
        "Sin título";


    const precio =
        figura.precio ||
        "0";


    const categoria =
        figura.categoria ||
        "Sin categoría";


    const cantidad =
        figura.cantidad ||
        "0";


    const imagen =
        figura.foto ||
        "https://via.placeholder.com/500";


    /*
     * HTML
     */

    tarjeta.innerHTML = `

        <div class="tarjeta-catalogo-imagen">

            <img
                src="${imagen}"
                alt="${titulo}"
                loading="lazy"
            >

        </div>


        <div class="tarjeta-catalogo-info">


            <span class="tarjeta-catalogo-categoria">

                ${categoria}

            </span>


            <h2 class="tarjeta-catalogo-titulo">

                ${titulo}

            </h2>


            <div class="tarjeta-catalogo-pie">


                <strong class="tarjeta-catalogo-precio">

                    $${precio}

                </strong>


                <span class="tarjeta-catalogo-cantidad">

                    ${cantidad} disponibles

                </span>


            </div>


        </div>

    `;


    /*
     * ANIMACIÓN
     */

    tarjeta.style.opacity =
        "0";


    tarjeta.style.transform =
        "translateY(20px)";


    requestAnimationFrame(
        () => {

            tarjeta.style.transition =
                "opacity .4s ease, transform .4s ease";


            tarjeta.style.opacity =
                "1";


            tarjeta.style.transform =
                "translateY(0)";

        }
    );


    return tarjeta;

}


/* =========================================================
   BOTONES
========================================================= */

function configurarBotones() {

    const limpiarBusqueda =
        document.getElementById(
            "limpiar-busqueda"
        );


    const limpiarFiltros =
        document.getElementById(
            "limpiar-filtros"
        );


    /*
     * LIMPIAR BUSCADOR
     */

    if (limpiarBusqueda) {

        limpiarBusqueda.addEventListener(
            "click",
            () => {

                const buscador =
                    document.getElementById(
                        "buscador"
                    );


                if (buscador) {

                    buscador.value = "";

                }


                aplicarFiltros();

            }
        );

    }


    /*
     * LIMPIAR TODO
     */

    if (limpiarFiltros) {

        limpiarFiltros.addEventListener(
            "click",
            () => {

                const buscador =
                    document.getElementById(
                        "buscador"
                    );


                const select =
                    document.getElementById(
                        "filtro-categoria"
                    );


                if (buscador) {

                    buscador.value = "";

                }


                if (select) {

                    select.value =
                        "todas";

                }


                aplicarFiltros();

            }
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

        texto === "disponible" ||

        texto === "activo"

    );

}