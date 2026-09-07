/* =========================================================
   APP PRINCIPAL
   Funciones generales del sitio
========================================================= */


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciarAplicacion
);


async function iniciarAplicacion() {

    console.log(
        "Iniciando catálogo..."
    );


    /* =====================================================
       FUNCIONES GENERALES
    ===================================================== */

    iniciarBienvenida();

    configurarMenu();


    /* =====================================================
       LIMPIAR CONTENEDOR
    ===================================================== */

    const contenedor =
        document.getElementById(
            "contenido-productos"
        );


    if (contenedor) {

        contenedor.innerHTML = "";

    }


    /* =====================================================
       CARGAR CATÁLOGO
    ===================================================== */

    try {

        await cargarPortadas();

        await cargarSets();

        await cargarFiguras();


        configurarNavegacionCategorias();


        console.log(
            "Catálogo cargado correctamente."
        );


    } catch (error) {

        console.error(
            "Error general:",
            error
        );

    }

}


/* =========================================================
   BIENVENIDA
========================================================= */

function iniciarBienvenida() {

    const pantalla =
        document.getElementById(
            "pantalla-bienvenida"
        );


    if (!pantalla) return;


    setTimeout(
        () => {

            pantalla.classList.add(
                "oculta"
            );

        },
        1800
    );

}


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


    if (!boton || !menu) {

        return;

    }


    boton.addEventListener(
        "click",
        () => {

            const abierto =
                menu.classList.toggle(
                    "abierto"
                );


            boton.classList.toggle(
                "abierto",
                abierto
            );


            boton.setAttribute(
                "aria-expanded",
                abierto
            );

        }
    );


    /* =====================================================
       CERRAR AL SELECCIONAR OPCIÓN
    ===================================================== */

    const enlaces =
        menu.querySelectorAll(
            "a"
        );


    enlaces.forEach(
        enlace => {

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

        }
    );

}


/* =========================================================
   NAVEGACIÓN DE CATEGORÍAS
========================================================= */

function configurarNavegacionCategorias() {

    const contenedor =
        document.getElementById(
            "categorias"
        );


    if (!contenedor) return;


    contenedor.innerHTML = "";


    crearBotonCategoria(
        contenedor,
        "SETS",
        "seccion-sets"
    );


    crearBotonCategoria(
        contenedor,
        "FIGURAS",
        "seccion-figuras"
    );

}


/* =========================================================
   CREAR BOTÓN DE CATEGORÍA
========================================================= */

function crearBotonCategoria(
    contenedor,
    nombre,
    idSeccion
) {

    const boton =
        document.createElement(
            "button"
        );


    boton.className =
        "categoria-boton";


    boton.textContent =
        nombre;


    boton.addEventListener(
        "click",
        () => {

            const seccion =
                document.getElementById(
                    idSeccion
                );


            if (!seccion) return;


            seccion.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });


            activarCategoria(
                boton
            );

        }
    );


    contenedor.appendChild(
        boton
    );

}


/* =========================================================
   CATEGORÍA ACTIVA
========================================================= */

function activarCategoria(
    botonActivo
) {

    document
        .querySelectorAll(
            ".categoria-boton"
        )
        .forEach(
            boton => {

                boton.classList.remove(
                    "activo"
                );

            }
        );


    botonActivo.classList.add(
        "activo"
    );

}