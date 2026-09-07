/* =========================================================
   GOOGLE SHEETS
   Comunicación y lectura de hojas
========================================================= */


/* =========================================================
   CREAR URL DE UNA HOJA
========================================================= */

function obtenerURLHoja(nombreHoja) {

    return `https://docs.google.com/spreadsheets/d/${CONFIG.ID_SHEET}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(nombreHoja)}`;

}


/* =========================================================
   CARGAR HOJA
========================================================= */

async function cargarHoja(nombreHoja) {

    const url =
        obtenerURLHoja(nombreHoja);


    console.log(
        `Cargando hoja: ${nombreHoja}`
    );


    try {

        const respuesta =
            await fetch(url);


        if (!respuesta.ok) {

            throw new Error(
                `Error HTTP ${respuesta.status}`
            );

        }


        const csv =
            await respuesta.text();


        return convertirCSV(csv);


    } catch (error) {

        console.error(
            `Error cargando ${nombreHoja}:`,
            error
        );


        throw error;

    }

}


/* =========================================================
   CONVERTIR CSV A OBJETOS
========================================================= */

function convertirCSV(csv) {

    const filas = [];

    let fila = [];

    let campo = "";

    let dentroComillas = false;


    for (
        let i = 0;
        i < csv.length;
        i++
    ) {

        const caracter =
            csv[i];

        const siguiente =
            csv[i + 1];


        /* COMILLAS */

        if (
            caracter === '"' &&
            dentroComillas &&
            siguiente === '"'
        ) {

            campo += '"';

            i++;

        }


        /* ABRIR / CERRAR COMILLAS */

        else if (
            caracter === '"'
        ) {

            dentroComillas =
                !dentroComillas;

        }


        /* COMA */

        else if (
            caracter === "," &&
            !dentroComillas
        ) {

            fila.push(campo);

            campo = "";

        }


        /* SALTO DE LÍNEA */

        else if (

            (
                caracter === "\n" ||
                caracter === "\r"
            )

            &&
            !dentroComillas

        ) {

            if (
                caracter === "\r" &&
                siguiente === "\n"
            ) {

                i++;

            }


            fila.push(campo);

            campo = "";


            if (
                fila.some(
                    valor =>
                        valor.trim() !== ""
                )
            ) {

                filas.push(fila);

            }


            fila = [];

        }


        /* CARÁCTER NORMAL */

        else {

            campo += caracter;

        }

    }


    /* =====================================================
       ÚLTIMA FILA
    ===================================================== */

    if (
        campo !== "" ||
        fila.length > 0
    ) {

        fila.push(campo);


        if (
            fila.some(
                valor =>
                    valor.trim() !== ""
            )
        ) {

            filas.push(fila);

        }

    }


    if (
        filas.length === 0
    ) {

        return [];

    }


    /* =====================================================
       ENCABEZADOS
    ===================================================== */

    const encabezados =
        filas[0].map(
            encabezado =>

                encabezado
                    .trim()
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(
                        /[\u0300-\u036f]/g,
                        ""
                    )

        );


    /* =====================================================
       CREAR OBJETOS
    ===================================================== */

    return filas
        .slice(1)
        .map(fila => {

            const objeto = {};


            encabezados.forEach(
                (
                    encabezado,
                    index
                ) => {

                    objeto[encabezado] =

                        fila[index] !== undefined

                            ? fila[index].trim()

                            : "";

                }
            );


            return objeto;

        });

}