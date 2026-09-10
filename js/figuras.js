/* =========================================================
   CATEGORÍA: FIGURAS
========================================================= */


/* =========================================================
   VARIABLES
========================================================= */

let productosFiguras = [];


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const CONFIG_FIGURAS = {

    nombre: "FIGURAS",

    hoja: CONFIG.HOJAS.FIGURAS,

    idSeccion: "seccion-figuras",

    productosIniciales:
        CONFIG.CATALOGO.productosIniciales

};


/* =========================================================
   CARGAR FIGURAS
========================================================= */

async function cargarFiguras() {

    try {

        productosFiguras =
            await cargarHoja(
                CONFIG_FIGURAS.hoja
            );


        console.log(
            "FIGURAS:",
            productosFiguras
        );


        crearSeccionFiguras();


    } catch (error) {

        console.error(
            "Error cargando FIGURAS:",
            error
        );

    }

}


/* =========================================================
   CREAR SECCIÓN
========================================================= */

function crearSeccionFiguras() {

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
        CONFIG_FIGURAS.idSeccion;


    seccion.innerHTML = `

        <h2 class="titulo-seccion">
            ${CONFIG_FIGURAS.nombre}
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


    mostrarFiguras(
        seccion
    );


    configurarBotonFiguras(
        seccion
    );

}


/* =========================================================
   MOSTRAR FIGURAS
========================================================= */

function mostrarFiguras(seccion) {

    const grid =
        seccion.querySelector(
            ".grid-productos"
        );


    if (!grid) return;


    grid.innerHTML = "";


    const figuras =
        productosFiguras
            .filter(figura =>
                figura.disponible
                    ? esDisponible(
                        figura.disponible
                    )
                    : true
            )
            .slice(
                -CONFIG_FIGURAS.productosIniciales
            )
            .reverse();


    if (
        figuras.length === 0
    ) {

        grid.innerHTML = `

            <div class="cargando">

                No hay FIGURAS disponibles.

            </div>

        `;

        return;

    }


    figuras.forEach(
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
   TARJETA FIGURA
========================================================= */

function crearTarjetaFigura(figura) {

    const tarjeta =
        document.createElement(
            "article"
        );


    tarjeta.className =
        "tarjeta";


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


            <div class="tarjeta-categoria">

                ${categoria}

            </div>


            <div class="tarjeta-cantidad">

                Disponibles: ${cantidad}

            </div>

        </div>

    `;


    return tarjeta;

}


/* =========================================================
   BOTÓN VER MÁS
========================================================= */

function configurarBotonFiguras(seccion) {

    const boton =
        seccion.querySelector(
            ".boton-ver-todos"
        );


    if (!boton) return;


    boton.addEventListener(
        "click",
        () => {

            window.location.href =
                "catalogo-figuras.html";

        }
    );

}

