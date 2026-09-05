/* =====================================================
   CONFIGURACIÓN GOOGLE SHEETS / SHEETDB
===================================================== */


/*
    ESTE ES TU LINK
*/

const URL_BASE =
    'https://sheetdb.io/api/v1/zsjbjq52wombt';


/*
    NOMBRES DE LAS HOJAS

    CAMBIA ESTOS NOMBRES POR LOS REALES
    DE TU GOOGLE SHEETS.
*/

const HOJAS = {

    sets: 'Hoja 1',

    figuras: 'Hoja 2',

    otros: 'Hoja 3',

    portadas: 'Hoja 4'

};


/*
    Construir URL de cada hoja
*/

function obtenerURLHoja(nombreHoja) {

    return `${URL_BASE}?sheet=${encodeURIComponent(nombreHoja)}`;

}



/* =====================================================
   DATOS
===================================================== */

let datosCatalogo = {};



/* =====================================================
   CARGAR UNA HOJA
===================================================== */

async function cargarHoja(nombreHoja) {

    try {

        const respuesta =
            await fetch(
                obtenerURLHoja(nombreHoja)
            );


        if (!respuesta.ok) {

            throw new Error(
                `Error HTTP ${respuesta.status}`
            );

        }


        const datos =
            await respuesta.json();


        return datos;


    } catch (error) {

        console.error(
            `Error cargando ${nombreHoja}:`,
            error
        );


        return [];

    }

}



/* =====================================================
   CARGAR TODO EL CATALOGO
===================================================== */

async function cargarCatalogo() {

    const contenedor =
        document.getElementById(
            'contenido-productos'
        );


    try {

        /*
            Cargar las 3 hojas al mismo tiempo
        */

        const resultados =
            await Promise.all([

                cargarHoja(HOJAS.sets),

                cargarHoja(HOJAS.figuras),

                cargarHoja(HOJAS.otros),

                cargarHoja(HOJAS.portadas)

            ]);


        /*
            Guardamos los datos
        */

        datosCatalogo = {

            sets: resultados[0],

            figuras: resultados[1],

            otros: resultados[2],

            portadas: resultados[3]

        };

        /*
            Preparar Hero
        */

        prepararPortadas();

        iniciarHero();



        /*
            Crear interfaz
        */

        crearCategorias();

        crearSecciones();


    } catch (error) {

        console.error(error);


        contenedor.innerHTML = `

            <div class="cargando">

                No se pudo cargar el catálogo.

            </div>

        `;

    }

}



/* =====================================================
   NORMALIZAR PRODUCTO
===================================================== */

function obtenerProducto(producto) {

    /*
        Aquí usamos exactamente la lógica
        que ya estabas utilizando.
    */


    const titulo =

        producto.titulo ||

        producto.Titulo ||

        producto.title ||

        'Sin título';


    const precio =

        producto.precio ||

        producto.Precio ||

        0;


    const imagen =

        producto.imagen_url ||

        producto.imagen ||

        producto.Foto ||

        producto.foto ||

        'https://via.placeholder.com/500x500?text=FOTO';


    return {

        titulo: String(titulo),

        precio: String(precio),

        imagen: imagen

    };

}



/* =====================================================
   CREAR CATEGORIAS
===================================================== */

function crearCategorias() {

    const contenedor =
        document.getElementById(
            'categorias'
        );


    contenedor.innerHTML = '';


    const listaCategorias = [

        {
            id: 'sets',

            nombre: 'SETS'
        },

        {
            id: 'figuras',

            nombre: 'FIGURAS'
        },

        {
            id: 'otros',

            nombre: 'OTROS'
        }

    ];


    listaCategorias.forEach(
        (categoria, indice) => {

            const boton =
                document.createElement(
                    'button'
                );


            boton.className =
                'categoria-boton';


            if (indice === 0) {

                boton.classList.add(
                    'activo'
                );

            }


            boton.textContent =
                categoria.nombre;


            boton.addEventListener(
                'click',
                () => {

                    const seccion =
                        document.getElementById(
                            `seccion-${categoria.id}`
                        );


                    if (seccion) {

                        seccion.scrollIntoView({

                            behavior: 'smooth',

                            block: 'start'

                        });

                    }


                    /*
                        Marcar botón
                    */

                    document
                        .querySelectorAll(
                            '.categoria-boton'
                        )
                        .forEach(
                            b =>
                                b.classList.remove(
                                    'activo'
                                )
                        );


                    boton.classList.add(
                        'activo'
                    );

                }
            );


            contenedor.appendChild(
                boton
            );

        }
    );

}



/* =====================================================
   CREAR SECCIONES
===================================================== */

function crearSecciones() {

    const contenedor =
        document.getElementById(
            'contenido-productos'
        );


    contenedor.innerHTML = '';


    const categorias = [

        {
            id: 'sets',

            nombre: 'SETS'
        },

        {
            id: 'figuras',

            nombre: 'FIGURAS'
        },

        {
            id: 'otros',

            nombre: 'OTROS'
        }

    ];


    categorias.forEach(categoria => {


        const productos =
            datosCatalogo[
                categoria.id
            ] || [];


        const seccion =
            document.createElement(
                'section'
            );


        seccion.className =
            'seccion-productos';


        seccion.id =
            `seccion-${categoria.id}`;


        /*
            Titulo
        */

        const titulo =
            document.createElement(
                'h2'
            );


        titulo.className =
            'titulo-seccion';


        titulo.textContent =
            categoria.nombre;


        seccion.appendChild(
            titulo
        );


        /*
            Grid
        */

        const grid =
            document.createElement(
                'div'
            );


        grid.className =
            'grid-productos';


        /*
            SOLAMENTE 4 PRODUCTOS
        */

        productos
            .slice(0, 4)
            .forEach(producto => {


                const datos =
                    obtenerProducto(
                        producto
                    );


                const tarjeta =
                    document.createElement(
                        'article'
                    );


                tarjeta.className =
                    'tarjeta';


                tarjeta.innerHTML = `

                    <div class="tarjeta-imagen">

                        <img
                            src="${datos.imagen}"
                            alt="${datos.titulo}"
                            loading="lazy"
                        >

                    </div>


                    <div class="tarjeta-info">

                        <div class="tarjeta-titulo">

                            ${datos.titulo}

                        </div>


                        <div class="tarjeta-precio">

                            $${datos.precio}

                        </div>

                    </div>

                `;


                grid.appendChild(
                    tarjeta
                );

            });


        seccion.appendChild(
            grid
        );


        /*
            BOTON VER TODOS
        */

        const boton =
            document.createElement(
                'button'
            );


        boton.className =
            'boton-ver-todos';


        boton.textContent =
            `Ver todos ${categoria.nombre.toLowerCase()}`;


        boton.addEventListener(
            'click',
            () => {

                /*
                    Después aquí conectaremos
                    la página específica.
                */

                console.log(
                    `Abrir catálogo de ${categoria.nombre}`
                );

            }
        );


        seccion.appendChild(
            boton
        );


        contenedor.appendChild(
            seccion
        );

    });

}



/* =====================================================
   HERO DESDE GOOGLE SHEETS
===================================================== */

let portadas = [];

let indiceHero = 0;

let intervaloHero;


/*
    Convertimos el valor de "Activo"
    a verdadero o falso.

    Acepta:

    Sí
    Si
    SI
    TRUE
    true
    1
    Activo
*/

function portadaActiva(valor) {

    if (valor === undefined || valor === null) {

        return false;

    }


    const valorNormalizado =
        String(valor)
            .trim()
            .toLowerCase();


    return (

        valorNormalizado === 'sí' ||

        valorNormalizado === 'si' ||

        valorNormalizado === 'true' ||

        valorNormalizado === '1' ||

        valorNormalizado === 'activo'

    );

}


/*
    Preparar portadas
*/

function prepararPortadas() {

    const datos =
        datosCatalogo.portadas || [];


    /*
        Solamente portadas activas
    */

    portadas = datos

        .filter(portada => {

            return portadaActiva(
                portada.Activo ||
                portada.activo
            );

        })


        /*
            Convertir datos
        */

        .map(portada => {

            return {

                imagen:
                    portada.Imagen ||

                    portada.imagen ||

                    portada.Foto ||

                    portada.foto ||

                    '',


                orden:
                    Number(

                        portada.Orden ||

                        portada.orden ||

                        9999

                    )

            };

        })


        /*
            Eliminar imágenes vacías
        */

        .filter(portada => {

            return portada.imagen !== '';

        })


        /*
            Ordenar
        */

        .sort((a, b) => {

            return a.orden - b.orden;

        });


    /*
        Reiniciar índice
    */

    indiceHero = 0;


    /*
        Crear visualmente
    */

    crearHero();

}




const heroSlider =
    document.getElementById(
        'hero-slider'
    );


const heroPuntos =
    document.getElementById(
        'hero-puntos'
    );


/*let indiceHero = 0;*/


/*
    Crear Hero
*/

function crearHero() {

    const heroSlider =
        document.getElementById(
            'hero-slider'
        );


    const heroPuntos =
        document.getElementById(
            'hero-puntos'
        );


    heroSlider.innerHTML = '';

    heroPuntos.innerHTML = '';


    /*
        Si no existen portadas
    */

    if (portadas.length === 0) {

        heroSlider.innerHTML = `

            <div class="hero-sin-portadas">

                No hay portadas disponibles.

            </div>

        `;

        return;

    }


    /*
        Crear cada portada
    */

    portadas.forEach(
        (portada, indice) => {


            const slide =
                document.createElement(
                    'div'
                );


            slide.className =
                'hero-slide';


            if (indice === 0) {

                slide.classList.add(
                    'activo'
                );

            }


            slide.innerHTML = `

                <img
                    src="${portada.imagen}"
                    alt="Portada ${indice + 1}"
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
                    'button'
                );


            punto.className =
                'hero-punto';


            punto.setAttribute(
                'aria-label',
                `Ir a portada ${indice + 1}`
            );


            if (indice === 0) {

                punto.classList.add(
                    'activo'
                );

            }


            punto.addEventListener(
                'click',
                () => {

                    indiceHero = indice;

                    actualizarHero();

                    reiniciarHero();

                }
            );


            heroPuntos.appendChild(
                punto
            );

        }
    );

}



/* =====================================================
   ACTUALIZAR HERO
===================================================== */

function actualizarHero() {

    const slides =
        document.querySelectorAll(
            '.hero-slide'
        );


    const puntos =
        document.querySelectorAll(
            '.hero-punto'
        );


    if (!slides.length) {

        return;

    }


    slides.forEach(
        (slide, indice) => {

            slide.classList.toggle(
                'activo',
                indice === indiceHero
            );

        }
    );


    puntos.forEach(
        (punto, indice) => {

            punto.classList.toggle(
                'activo',
                indice === indiceHero
            );

        }
    );

}



function siguienteHero() {

    if (portadas.length <= 1) {

        return;

    }


    indiceHero++;


    if (
        indiceHero >=
        portadas.length
    ) {

        indiceHero = 0;

    }


    actualizarHero();

}


function anteriorHero() {

    if (portadas.length <= 1) {

        return;

    }


    indiceHero--;


    if (indiceHero < 0) {

        indiceHero =
            portadas.length - 1;

    }


    actualizarHero();

}



/* =====================================================
   AUTOMATICO
===================================================== */

/*let intervaloHero;*/


function iniciarHero() {

    clearInterval(
        intervaloHero
    );


    if (portadas.length <= 1) {

        return;

    }


    intervaloHero =
        setInterval(
            siguienteHero,
            10000
        );

}


function reiniciarHero() {

    iniciarHero();

}


function reiniciarHero() {

    clearInterval(
        intervaloHero
    );


    iniciarHero();

}



/* =====================================================
   FLECHAS
===================================================== */

document
    .getElementById(
        'hero-siguiente'
    )
    .addEventListener(
        'click',
        () => {

            siguienteHero();

            reiniciarHero();

        }
    );


document
    .getElementById(
        'hero-anterior'
    )
    .addEventListener(
        'click',
        () => {

            anteriorHero();

            reiniciarHero();

        }
    );



/* =====================================================
   SWIPE
===================================================== */

let inicioTouch = 0;


heroSlider.addEventListener(
    'touchstart',
    evento => {

        inicioTouch =
            evento.touches[0].clientX;

    }
);


heroSlider.addEventListener(
    'touchend',
    evento => {

        const finalTouch =
            evento.changedTouches[0].clientX;


        const diferencia =
            inicioTouch - finalTouch;


        if (
            Math.abs(diferencia) < 50
        ) {

            return;

        }


        if (diferencia > 0) {

            siguienteHero();

        } else {

            anteriorHero();

        }


        reiniciarHero();

    }
);



/* =====================================================
   MENU MOVIL
===================================================== */

const botonMenu =
    document.getElementById(
        'boton-menu'
    );


const menuMovil =
    document.getElementById(
        'menu-movil'
    );


botonMenu.addEventListener(
    'click',
    () => {

        menuMovil.classList.toggle(
            'abierto'
        );

    }
);


document
    .querySelectorAll(
        '.menu-movil a'
    )
    .forEach(enlace => {

        enlace.addEventListener(
            'click',
            () => {

                menuMovil.classList.remove(
                    'abierto'
                );

            }
        );

    });



/* =====================================================
   BIENVENIDA
===================================================== */

window.addEventListener(
    'load',
    () => {

        setTimeout(
            () => {

                document
                    .getElementById(
                        'pantalla-bienvenida'
                    )
                    .classList.add(
                        'oculta'
                    );

            },
            1800
        );

    }
); 



/* =====================================================
   INICIAR
===================================================== */

crearHero();

iniciarHero();

cargarCatalogo();