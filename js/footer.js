/* =========================================
   FOOTER
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* Año automático */

    const anio = document.getElementById("anio-footer");

    if (anio) {
        anio.textContent = new Date().getFullYear();
    }


    /* Animación de entrada */

    const elementos = document.querySelectorAll(
        ".punto-entrega, .social-boton"
    );

    const observador = new IntersectionObserver(
        (entradas) => {

            entradas.forEach((entrada) => {

                if (entrada.isIntersecting) {

                    entrada.target.classList.add("footer-visible");

                    observador.unobserve(entrada.target);

                }

            });

        },
        {
            threshold: 0.15
        }
    );


    elementos.forEach((elemento) => {

        elemento.classList.add("footer-animacion");

        observador.observe(elemento);

    });

});