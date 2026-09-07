/* =========================================================
   PORTADAS / HERO
========================================================= */

let portadas = [];

let portadaActual = 0;

let intervaloHero = null;


/* =========================================================
   CARGAR PORTADAS
========================================================= */

async function cargarPortadas() {

    try {

        portadas =
            await cargarHoja(
                CONFIG.HOJAS.PORTADAS
            );


        console.log(
            "PORTADAS:",
            portadas
        );


        crearHero();


    } catch (error) {

        console.error(
            "No se pudieron cargar las portadas:",
            error
        );


        mostrarErrorHero();

    }

}


/* =========================================================
   CREAR HERO
========================================================= */

function crearHero() {

    const slider =
        document.getElementById(
            "hero-slider"
        );


    const puntos =
        document.getElementById(
            "hero-puntos"
        );


    if (!slider || !puntos) {

        return;

    }


    slider.innerHTML = "";

    puntos.innerHTML = "";


    /* =====================================================
       FILTRAR PORTADAS ACTIVAS
    ===================================================== */

    let portadasActivas =
        portadas.filter(
            portada =>
                esActivo(portada.activo)
        );


    /* =====================================================
       ORDENAR
    ===================================================== */

    portadasActivas.sort(
        (a, b) => {

            const ordenA =
                parseInt(
                    a.orden || 9999
                );


            const ordenB =
                parseInt(
                    b.orden || 9999
                );


            return ordenA - ordenB;

        }
    );


    portadas =
        portadasActivas;


    /* =====================================================
       NO HAY PORTADAS
    ===================================================== */

    if (
        portadas.length === 0
    ) {

        slider.innerHTML = `

            <div class="hero-sin-portadas">

                No hay portadas disponibles.

            </div>

        `;

        return;

    }


    /* =====================================================
       CREAR PORTADAS
    ===================================================== */

    portadas.forEach(
        (portada, index) => {

            const imagen =
                portada.imagen;


            if (!imagen) {

                return;

            }


            const slide =
                document.createElement(
                    "div"
                );


            slide.className =
                "hero-slide";


            if (
                index === 0
            ) {

                slide.classList.add(
                    "activo"
                );

            }


            slide.innerHTML = `

                <img
                    src="${imagen}"
                    alt="Promoción ${index + 1}"
                    loading="${
                        index === 0
                            ? "eager"
                            : "lazy"
                    }"
                >

            `;


            slider.appendChild(
                slide
            );


            /* =================================================
               PUNTO
            ================================================= */

            const punto =
                document.createElement(
                    "button"
                );


            punto.className =
                "hero-punto";


            if (
                index === 0
            ) {

                punto.classList.add(
                    "activo"
                );

            }


            punto.setAttribute(
                "aria-label",
                `Ir a portada ${index + 1}`
            );


            punto.addEventListener(
                "click",
                () => {

                    cambiarPortada(
                        index
                    );


                    reiniciarHero();

                }
            );


            puntos.appendChild(
                punto
            );

        }
    );


    portadaActual = 0;


    configurarBotonesHero();

    iniciarHero();

}


/* =========================================================
   COMPROBAR ACTIVO
========================================================= */

function esActivo(valor) {

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
        texto === "activo"

    );

}


/* =========================================================
   BOTONES DEL HERO
========================================================= */

function configurarBotonesHero() {

    const anterior =
        document.getElementById(
            "hero-anterior"
        );


    const siguiente =
        document.getElementById(
            "hero-siguiente"
        );


    if (anterior) {

        anterior.onclick = () => {

            cambiarPortada(
                portadaActual - 1
            );


            reiniciarHero();

        };

    }


    if (siguiente) {

        siguiente.onclick = () => {

            cambiarPortada(
                portadaActual + 1
            );


            reiniciarHero();

        };

    }

}


/* =========================================================
   CAMBIAR PORTADA
========================================================= */

function cambiarPortada(indice) {

    const slides =
        document.querySelectorAll(
            ".hero-slide"
        );


    const puntos =
        document.querySelectorAll(
            ".hero-punto"
        );


    if (
        slides.length === 0
    ) {

        return;

    }


    /* LOOP */

    if (
        indice < 0
    ) {

        indice =
            slides.length - 1;

    }


    if (
        indice >= slides.length
    ) {

        indice = 0;

    }


    slides.forEach(
        slide =>
            slide.classList.remove(
                "activo"
            )
    );


    puntos.forEach(
        punto =>
            punto.classList.remove(
                "activo"
            )
    );


    slides[indice].classList.add(
        "activo"
    );


    if (
        puntos[indice]
    ) {

        puntos[indice].classList.add(
            "activo"
        );

    }


    portadaActual =
        indice;

}


/* =========================================================
   INICIAR HERO AUTOMÁTICO
========================================================= */

function iniciarHero() {

    detenerHero();


    if (
        portadas.length <= 1
    ) {

        return;

    }


    intervaloHero =
        setInterval(
            () => {

                cambiarPortada(
                    portadaActual + 1
                );

            },
            CONFIG.HERO.duracion
        );

}


/* =========================================================
   REINICIAR HERO
========================================================= */

function reiniciarHero() {

    iniciarHero();

}


/* =========================================================
   DETENER HERO
========================================================= */

function detenerHero() {

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


/* =========================================================
   ERROR
========================================================= */

function mostrarErrorHero() {

    const slider =
        document.getElementById(
            "hero-slider"
        );


    if (!slider) return;


    slider.innerHTML = `

        <div class="hero-sin-portadas">

            No se pudieron cargar las portadas.

        </div>

    `;

}