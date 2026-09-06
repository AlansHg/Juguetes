/* =====================================================
   CONFIGURACIÓN GENERAL
===================================================== */


/*
    ID DE TU GOOGLE SHEETS
*/

const GOOGLE_SHEET_ID =
    "1PsIS4-p4fXwRx-8zfyxRf6OCLSGA92lavCqXERi7NDY";


/*
    NOMBRES EXACTOS DE LAS HOJAS
*/

const HOJA_1 =
    "Hoja 1";

const HOJA_2 =
    "Hoja 2";

const HOJA_3 =
    "Hoja 3";

const HOJA_4 =
    "Hoja 4";


/*
    TIEMPO DEL HERO

    10000 = 10 segundos
*/

const TIEMPO_HERO =
    10000;


/* =====================================================
   ELEMENTOS
===================================================== */

const pantallaBienvenida =
    document.getElementById(
        "pantalla-bienvenida"
    );


const botonMenu =
    document.getElementById(
        "boton-menu"
    );


const menuMovil =
    document.getElementById(
        "menu-movil"
    );


const categorias =
    document.getElementById(
        "categorias"
    );


const contenidoProductos =
    document.getElementById(
        "contenido-productos"
    );


const heroSlider =
    document.getElementById(
        "hero-slider"
    );


const heroPuntos =
    document.getElementById(
        "hero-puntos"
    );


const heroAnterior =
    document.getElementById(
        "hero-anterior"
    );


const heroSiguiente =
    document.getElementById(
        "hero-siguiente"
    );


/* =====================================================
   VARIABLES DEL HERO
===================================================== */

let portadas = [];

let portadaActual = 0;

let intervaloHero = null;


/* =====================================================
   MENU MOVIL
===================================================== */

botonMenu.addEventListener(
    "click",
    () => {

        const abierto =
            menuMovil.classList.toggle(
                "abierto"
            );


        botonMenu.classList.toggle(
            "abierto"
        );


        botonMenu.setAttribute(
            "aria-expanded",
            abierto
        );

    }
);


/*
    Cerrar menú al seleccionar
*/

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

                    botonMenu.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        }
    );


/* =====================================================
   GOOGLE SHEETS JSONP
===================================================== */


/*
    Esta función carga una hoja
    directamente desde Google Sheets.

    NO utiliza fetch.

    Por eso evitamos el problema CORS.
*/

function cargarHoja(
    nombreHoja
) {

    return new Promise(
        (
            resolver,
            rechazar
        ) => {


            const callback =
                "googleSheetsCallback_" +
                Date.now() +
                "_" +
                Math.floor(
                    Math.random() * 10000
                );


            /*
                Crear callback global
            */

            window[callback] =
                function(respuesta) {

                    try {

                        const tabla =
                            respuesta.table;


                        const columnas =
                            tabla.cols;


                        const filas =
                            tabla.rows;


                        /*
                            Convertimos la tabla
                            en objetos.
                        */

                        const datos =
                            filas.map(
                                fila => {

                                    const objeto = {};


                                    columnas.forEach(
                                        (
                                            columna,
                                            indice
                                        ) => {

                                            const nombre =
                                                (
                                                    columna.label ||
                                                    columna.id ||
                                                    ""
                                                ).trim();


                                            const celda =
                                                fila.c[
                                                    indice
                                                ];


                                            objeto[
                                                nombre
                                            ] =
                                                celda
                                                ? celda.v
                                                : "";

                                        }
                                    );


                                    return objeto;

                                }
                            );


                        /*
                            Resolver Promise
                        */

                        resolver(
                            datos
                        );


                    } catch (error) {

                        rechazar(
                            error
                        );

                    }


                    /*
                        Limpiar callback
                    */

                    delete window[
                        callback
                    ];

                };


            /*
                Crear script
            */

            const script =
                document.createElement(
                    "script"
                );


            /*
                URL Google Visualization
            */

            const url =
                "https://docs.google.com/spreadsheets/d/" +
                GOOGLE_SHEET_ID +
                "/gviz/tq?" +
                "sheet=" +
                encodeURIComponent(
                    nombreHoja
                ) +
                "&tqx=" +
                encodeURIComponent(
                    "out:json;responseHandler:" +
                    callback
                );


            console.log(
                "Cargando:",
                nombreHoja
            );


            script.src =
                url;


            /*
                Error de conexión
            */

            script.onerror =
                function() {

                    delete window[
                        callback
                    ];


                    rechazar(
                        new Error(
                            "No se pudo cargar " +
                            nombreHoja
                        )
                    );

                };


            document.body.appendChild(
                script
            );

        }
    );

}


/* =====================================================
   FUNCIONES PARA BUSCAR COLUMNAS
===================================================== */


/*
    Permite encontrar columnas
    aunque cambies mayúsculas/minúsculas.
*/

function obtenerCampo(
    objeto,
    nombres,
    valorDefault = ""
) {

    for (
        const nombre of nombres
    ) {

        if (
            objeto[nombre] !== undefined &&
            objeto[nombre] !== null &&
            objeto[nombre] !== ""
        ) {

            return objeto[nombre];

        }

    }


    /*
        búsqueda ignorando mayúsculas
    */

    const claves =
        Object.keys(
            objeto
        );


    for (
        const clave of claves
    ) {

        const claveNormalizada =
            clave
                .toLowerCase()
                .trim();


        for (
            const nombre of nombres
        ) {

            if (
                claveNormalizada ===
                nombre
                    .toLowerCase()
                    .trim()
            ) {

                return objeto[
                    clave
                ];

            }

        }

    }


    return valorDefault;

}


/* =====================================================
   HERO
===================================================== */

async function cargarPortadas() {

    try {

        const datos =
            await cargarHoja(
                HOJA_4
            );


        console.log(
            "Portadas:",
            datos
        );


        /*
            Filtrar únicamente
            portadas activas.
        */

        portadas =
            datos.filter(
                portada => {

                    const activo =
                        obtenerCampo(
                            portada,
                            [
                                "Activo",
                                "activo"
                            ]
                        );


                    return (
                        String(
                            activo
                        )
                        .toLowerCase()
                        .trim() ===
                        "si"
                        ||
                        String(
                            activo
                        )
                        .toLowerCase()
                        .trim() ===
                        "sí"
                        ||
                        String(
                            activo
                        ).trim() ===
                        "1"
                        ||
                        String(
                            activo
                        )
                        .toLowerCase()
                        .trim() ===
                        "true"
                    );

                }
            );


        /*
            Ordenar
        */

        portadas.sort(
            (
                a,
                b
            ) => {

                const ordenA =
                    Number(
                        obtenerCampo(
                            a,
                            [
                                "Orden",
                                "orden"
                            ],
                            9999
                        )
                    );


                const ordenB =
                    Number(
                        obtenerCampo(
                            b,
                            [
                                "Orden",
                                "orden"
                            ],
                            9999
                        )
                    );


                return (
                    ordenA -
                    ordenB
                );

            }
        );


        /*
            Eliminar filas
            sin imagen
        */

        portadas =
            portadas.filter(
                portada => {

                    const imagen =
                        obtenerCampo(
                            portada,
                            [
                                "Imagen",
                                "imagen",
                                "Foto",
                                "foto",
                                "URL",
                                "url"
                            ]
                        );


                    return (
                        imagen &&
                        String(
                            imagen
                        ).trim() !== ""
                    );

                }
            );


        crearHero();


    } catch (error) {

        console.error(
            "Error cargando portadas:",
            error
        );


        heroSlider.innerHTML = `

            <div class="hero-sin-portadas">

                No se pudieron cargar
                las portadas.

            </div>

        `;

    }

}


/* =====================================================
   CREAR HERO
===================================================== */

function crearHero() {

    heroSlider.innerHTML = "";

    heroPuntos.innerHTML = "";


    /*
        Si no existen portadas
    */

    if (
        portadas.length === 0
    ) {

        heroSlider.innerHTML = `

            <div class="hero-sin-portadas">

                No hay portadas activas.

            </div>

        `;


        heroAnterior.style.display =
            "none";

        heroSiguiente.style.display =
            "none";

        return;

    }


    /*
        Mostrar flechas
    */

    heroAnterior.style.display =
        "";

    heroSiguiente.style.display =
        "";


    /*
        Crear slides
    */

    portadas.forEach(
        (
            portada,
            indice
        ) => {


            const imagen =
                obtenerCampo(
                    portada,
                    [
                        "Imagen",
                        "imagen",
                        "Foto",
                        "foto",
                        "URL",
                        "url"
                    ]
                );


            const slide =
                document.createElement(
                    "div"
                );


            slide.className =
                "hero-slide";


            if (
                indice === 0
            ) {

                slide.classList.add(
                    "activo"
                );

            }


            slide.innerHTML = `

                <img
                    src="${imagen}"
                    alt="Portada ${indice + 1}"
                    draggable="false"
                >

            `;


            heroSlider.appendChild(
                slide
            );


            /*
                Crear punto
            */

            const punto =
                document.createElement(
                    "button"
                );


            punto.className =
                "hero-punto";


            if (
                indice === 0
            ) {

                punto.classList.add(
                    "activo"
                );

            }


            punto.setAttribute(
                "aria-label",
                "Ir a portada " +
                (indice + 1)
            );


            punto.addEventListener(
                "click",
                () => {

                    irAPortada(
                        indice
                    );

                }
            );


            heroPuntos.appendChild(
                punto
            );

        }
    );


    /*
        Iniciar automático
    */

    iniciarHeroAutomatico();

}


/* =====================================================
   CAMBIAR PORTADA
===================================================== */

function irAPortada(
    indice
) {

    if (
        portadas.length === 0
    ) {

        return;

    }


    /*
        Mantener índice circular
    */

    if (
        indice >=
        portadas.length
    ) {

        indice = 0;

    }


    if (
        indice < 0
    ) {

        indice =
            portadas.length - 1;

    }


    portadaActual =
        indice;


    const slides =
        document.querySelectorAll(
            ".hero-slide"
        );


    const puntos =
        document.querySelectorAll(
            ".hero-punto"
        );


    slides.forEach(
        (
            slide,
            i
        ) => {

            slide.classList.toggle(
                "activo",
                i === portadaActual
            );

        }
    );


    puntos.forEach(
        (
            punto,
            i
        ) => {

            punto.classList.toggle(
                "activo",
                i === portadaActual
            );

        }
    );

}


/* =====================================================
   SIGUIENTE
===================================================== */

function siguientePortada() {

    irAPortada(
        portadaActual + 1
    );

    reiniciarHeroAutomatico();

}


/* =====================================================
   ANTERIOR
===================================================== */

function anteriorPortada() {

    irAPortada(
        portadaActual - 1
    );

    reiniciarHeroAutomatico();

}


/* =====================================================
   HERO AUTOMATICO
===================================================== */

function iniciarHeroAutomatico() {

    detenerHeroAutomatico();


    if (
        portadas.length <= 1
    ) {

        return;

    }


    intervaloHero =
        setInterval(
            () => {

                irAPortada(
                    portadaActual + 1
                );

            },
            TIEMPO_HERO
        );

}


/* =====================================================
   DETENER AUTOMATICO
===================================================== */

function detenerHeroAutomatico() {

    if (
        intervaloHero
    ) {

        clearInterval(
            intervaloHero
        );

        intervaloHero =
            null;

    }

}


/* =====================================================
   REINICIAR AUTOMATICO
===================================================== */

function reiniciarHeroAutomatico() {

    iniciarHeroAutomatico();

}


/* =====================================================
   BOTONES HERO
===================================================== */

heroSiguiente.addEventListener(
    "click",
    siguientePortada
);


heroAnterior.addEventListener(
    "click",
    anteriorPortada
);


/* =====================================================
   SWIPE MOVIL
===================================================== */

let touchInicioX =
    0;

let touchFinalX =
    0;


heroSlider.addEventListener(
    "touchstart",
    event => {

        touchInicioX =
            event.changedTouches[0]
                .screenX;

    },
    {
        passive: true
    }
);


heroSlider.addEventListener(
    "touchend",
    event => {

        touchFinalX =
            event.changedTouches[0]
                .screenX;


        procesarSwipe();

    },
    {
        passive: true
    }
);


function procesarSwipe() {

    const diferencia =
        touchFinalX -
        touchInicioX;


    /*
        Si deslizó más de 50px
    */

    if (
        Math.abs(
            diferencia
        ) < 50
    ) {

        return;

    }


    if (
        diferencia < 0
    ) {

        siguientePortada();

    } else {

        anteriorPortada();

    }

}


/* =====================================================
   CARGAR CATALOGO
===================================================== */

async function cargarCatalogo() {

    try {

        /*
            Cargamos las 3 hojas
            al mismo tiempo.
        */

        const [
            datosHoja1,
            datosHoja2,
            datosHoja3
        ] =
            await Promise.all(
                [
                    cargarHoja(
                        HOJA_1
                    ),

                    cargarHoja(
                        HOJA_2
                    ),

                    cargarHoja(
                        HOJA_3
                    )
                ]
            );


        console.log(
            "Hoja 1:",
            datosHoja1
        );


        console.log(
            "Hoja 2:",
            datosHoja2
        );


        console.log(
            "Hoja 3:",
            datosHoja3
        );


        /*
            Crear secciones
        */

        const secciones = [

            {
                nombre: "Sets",
                datos: datosHoja1
            },

            {
                nombre: "Figuras",
                datos: datosHoja2
            },

            {
                nombre: "Otros",
                datos: datosHoja3
            }

        ];


        /*
            Crear categorías
        */

        crearCategorias(
            secciones
        );


        /*
            Crear productos
        */

        crearSecciones(
            secciones
        );


    } catch (error) {

        console.error(
            "Error cargando catálogo:",
            error
        );


        contenidoProductos.innerHTML = `

            <div class="error-catalogo">

                No se pudo cargar
                el catálogo.

                <br><br>

                Revisa la consola
                para obtener más información.

            </div>

        `;

    }

}


/* =====================================================
   CREAR CATEGORIAS
===================================================== */

function crearCategorias(
    secciones
) {

    categorias.innerHTML = "";


    secciones.forEach(
        (
            seccion,
            indice
        ) => {


            const boton =
                document.createElement(
                    "button"
                );


            boton.className =
                "categoria-boton";


            if (
                indice === 0
            ) {

                boton.classList.add(
                    "activo"
                );

            }


            boton.textContent =
                seccion.nombre;


            boton.addEventListener(
                "click",
                () => {

                    const destino =
                        document.getElementById(
                            "seccion-" +
                            indice
                        );


                    if (
                        destino
                    ) {

                        destino.scrollIntoView(
                            {
                                behavior:
                                    "smooth",
                                block:
                                    "start"
                            }
                        );

                    }


                    document
                        .querySelectorAll(
                            ".categoria-boton"
                        )
                        .forEach(
                            elemento => {

                                elemento.classList.remove(
                                    "activo"
                                );

                            }
                        );


                    boton.classList.add(
                        "activo"
                    );

                }
            );


            categorias.appendChild(
                boton
            );

        }
    );

}


/* =====================================================
   CREAR SECCIONES
===================================================== */

function crearSecciones(
    secciones
) {

    contenidoProductos.innerHTML =
        "";


    secciones.forEach(
        (
            seccion,
            indice
        ) => {


            const seccionHTML =
                document.createElement(
                    "section"
                );


            seccionHTML.className =
                "seccion-productos";


            seccionHTML.id =
                "seccion-" +
                indice;


            /*
                Título
            */

            const titulo =
                document.createElement(
                    "h2"
                );


            titulo.className =
                "titulo-seccion";


            titulo.textContent =
                seccion.nombre;


            seccionHTML.appendChild(
                titulo
            );


            /*
                Grid
            */

            const grid =
                document.createElement(
                    "div"
                );


            grid.className =
                "grid-productos";


            /*
                Mostrar productos
            */

            seccion.datos.forEach(
                producto => {

                    const tarjeta =
                        crearTarjeta(
                            producto
                        );


                    grid.appendChild(
                        tarjeta
                    );

                }
            );


            /*
                Si no hay productos
            */

            if (
                seccion.datos.length === 0
            ) {

                grid.innerHTML = `

                    <p>
                        No hay productos
                        disponibles.
                    </p>

                `;

            }


            seccionHTML.appendChild(
                grid
            );


            /*
                Botón
            */

            const botonVerMas =
                document.createElement(
                    "button"
                );


            botonVerMas.className =
                "boton-ver-todos";


            botonVerMas.textContent =
                "Ver más";


            /*
                Por ahora no navega.
                Después aquí podemos
                poner la página correspondiente.
            */

            botonVerMas.addEventListener(
                "click",
                () => {

                    console.log(
                        "Ver más:",
                        seccion.nombre
                    );

                }
            );


            seccionHTML.appendChild(
                botonVerMas
            );


            contenidoProductos.appendChild(
                seccionHTML
            );

        }
    );

}


/* =====================================================
   CREAR TARJETA
===================================================== */

function crearTarjeta(
    producto
) {


    /*
        Datos
    */

    const titulo =
        obtenerCampo(
            producto,
            [
                "Titulo",
                "Título",
                "titulo",
                "title"
            ],
            "Sin título"
        );


    const precio =
        obtenerCampo(
            producto,
            [
                "Precio",
                "precio",
                "price"
            ],
            "0"
        );


    const imagen =
        obtenerCampo(
            producto,
            [
                "Foto",
                "foto",
                "Imagen",
                "imagen",
                "imagen_url",
                "URL",
                "url"
            ],
            ""
        );


    /*
        Crear tarjeta
    */

    const tarjeta =
        document.createElement(
            "article"
        );


    tarjeta.className =
        "tarjeta";


    /*
        Imagen
    */

    const contenedorImagen =
        document.createElement(
            "div"
        );


    contenedorImagen.className =
        "tarjeta-imagen";


    if (
        imagen
    ) {

        const img =
            document.createElement(
                "img"
            );


        img.src =
            imagen;


        img.alt =
            titulo;


        img.loading =
            "lazy";


        img.onerror =
            function() {

                this.style.display =
                    "none";

            };


        contenedorImagen.appendChild(
            img
        );

    }


    /*
        Información
    */

    const info =
        document.createElement(
            "div"
        );


    info.className =
        "tarjeta-info";


    const tituloElemento =
        document.createElement(
            "h3"
        );


    tituloElemento.className =
        "tarjeta-titulo";


    tituloElemento.textContent =
        titulo;


    const precioElemento =
        document.createElement(
            "div"
        );


    precioElemento.className =
        "tarjeta-precio";


    /*
        Formatear precio
    */

    let precioTexto =
        precio;


    if (
        precio !== "" &&
        !isNaN(
            Number(
                String(
                    precio
                )
                .replace(
                    /[$,]/g,
                    ""
                )
            )
        )
    ) {

        const numero =
            Number(
                String(
                    precio
                )
                .replace(
                    /[$,]/g,
                    ""
                )
            );


        precioTexto =
            numero.toLocaleString(
                "es-MX",
                {
                    minimumFractionDigits:
                        0,
                    maximumFractionDigits:
                        2
                }
            );

    }


    precioElemento.textContent =
        "$" +
        precioTexto;


    info.appendChild(
        tituloElemento
    );


    info.appendChild(
        precioElemento
    );


    tarjeta.appendChild(
        contenedorImagen
    );


    tarjeta.appendChild(
        info
    );


    return tarjeta;

}


/* =====================================================
   PANTALLA DE BIENVENIDA
===================================================== */

window.addEventListener(
    "load",
    () => {

        setTimeout(
            () => {

                pantallaBienvenida.classList.add(
                    "oculta"
                );

            },
            1800
        );

    }
);


/* =====================================================
   INICIALIZAR
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarPortadas();

        cargarCatalogo();

    }
);