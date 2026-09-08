/* =========================================================
   CATEGORÍA: SETS
========================================================= */


/* =========================================================
   VARIABLES
========================================================= */

let productosSets = [];


/* =========================================================
   CONFIGURACIÓN DE LA CATEGORÍA
========================================================= */

const CONFIG_SETS = {

    nombre: "SETS",

    hoja: CONFIG.HOJAS.SETS,

    idSeccion: "seccion-sets",

    productosIniciales:
        CONFIG.CATALOGO.productosIniciales

};


/* =========================================================
   CARGAR SETS
========================================================= */

async function cargarSets() {

    try {

        productosSets =
            await cargarHoja(
                CONFIG_SETS.hoja
            );


        console.log(
            "SETS:",
            productosSets
        );


        crearSeccionSets();


    } catch (error) {

        console.error(
            "Error cargando SETS:",
            error
        );

    }

}


/* =========================================================
   CREAR SECCIÓN
========================================================= */

function crearSeccionSets() {

    const contenedor =
        document.getElementById(
            "contenido-productos"
        );


    if (!contenedor) return;


    const seccion =
        document.createElement(
            "section"
        );


    seccion.className =
        "seccion-productos";


    seccion.id =
        CONFIG_SETS.idSeccion;


    seccion.innerHTML = `

        <h2 class="titulo-seccion">
            ${CONFIG_SETS.nombre}
        </h2>

        <div class="grid-productos">
        </div>

        <button
            class="boton-ver-todos"
            type="button"
        >
            Ver más
        </button>

    `;


    contenedor.appendChild(
        seccion
    );


    mostrarSets(
        seccion
    );


    configurarBotonSets(
        seccion
    );

}


/* =========================================================
   MOSTRAR PRODUCTOS
========================================================= */

function mostrarSets(seccion) {

    const grid =
        seccion.querySelector(
            ".grid-productos"
        );


    if (!grid) return;


    grid.innerHTML = "";


    const productos =
        productosSets
            .filter(producto =>
                producto.disponible
                    ? esDisponible(
                        producto.disponible
                    )
                    : true
            )
            .slice(
                -CONFIG_SETS.productosIniciales
            )
            .reverse();


    if (
        productos.length === 0
    ) {

        grid.innerHTML = `

            <div class="cargando">

                No hay SETS disponibles.

            </div>

        `;

        return;

    }


    productos.forEach(
        producto => {

            grid.appendChild(
                crearTarjetaSets(
                    producto
                )
            );

        }
    );

}


/* =========================================================
   TARJETA DE SET
========================================================= */

function crearTarjetaSets(producto) {

    const tarjeta =
        document.createElement(
            "article"
        );


    tarjeta.className =
        "tarjeta";


    const titulo =
        producto.titulo ||
        "Sin título";


    const precio =
        producto.precio ||
        "0";


    const imagen =
        producto.foto ||
        "https://via.placeholder.com/500";


    const tituloCorto =
        titulo.length > 28

            ? titulo.substring(
                0,
                28
            ) + "..."

            : titulo;


    tarjeta.innerHTML = `

        <div class="tarjeta-imagen">

            <img
                src="${imagen}"
                alt="${titulo}"
                loading="lazy"
            >

        </div>


        <div class="tarjeta-info">

            <div class="tarjeta-titulo">

                ${tituloCorto}

            </div>


            <div class="tarjeta-precio">

                ${precio}

            </div>

        </div>

    `;


    return tarjeta;

}


/* =========================================================
   DISPONIBILIDAD
========================================================= */

function esDisponible(valor) {

    const texto =
        String(valor || "")
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


/* =========================================================
   BOTÓN VER MÁS
========================================================= */

function configurarBotonSets(seccion) {

    const boton =
        seccion.querySelector(
            ".boton-ver-todos"
        );


    if (!boton) return;


    boton.addEventListener(
        "click",
        () => {

            window.location.href =
                "catalogo.html";

        }
    );

}
