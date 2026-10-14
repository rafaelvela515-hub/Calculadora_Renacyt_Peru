# Calculadora RENACYT

Herramienta web gratuita para estimar la calificación y el nivel en el **RENACYT** (CONCYTEC, Perú), planificar el ascenso y llevar el historial del avance.

**Sitio:** https://rafaelvela515-hub.github.io/Calculadora_Renacyt_Peru/

> Herramienta educativa, independiente y **referencial**. La calificación oficial la realiza solo el CONCYTEC mediante CTI Vitae, con verificación documentaria.

## Qué hace

- **Calcula** puntaje y nivel según el Reglamento RENACYT (RP N.° 090-2021-CONCYTEC-P, Anexo N.° 1, Tablas 1 a 3), con sus topes y requisitos obligatorios.
- **Importa tu ficha de CTI Vitae** con el enlace público (o subiendo el HTML guardado): lee formación, artículos con su cuartil, propiedad intelectual y asesorías, y te deja revisar cada producto antes de aplicarlo.
- **Plan de ascenso y simulador:** qué te falta para el siguiente nivel respetando los topes, y qué pasaría si sumas productos.
- **Historial:** capturas de tu avance con gráfico, comparación y exportación (JSON y CSV).
- **PDF:** descarga la evaluación y el historial.
- **Comunidad (opcional y anónima):** aporta tu resultado para métricas agregadas. Sin nombre ni correo; las instituciones con menos de 5 participantes no se publican.
- **Sugerencias:** buzón para proponer mejoras.

## Privacidad

Lo que ingresas se guarda en tu navegador. Además, cada consulta se registra de forma anónima (nivel, puntajes y cantidades; sin nombre, institución ni identificadores) en una hoja privada del administrador, solo para medir el uso; no se muestra en la página. Aportar con tu institución en *Comunidad* o escribir una sugerencia es voluntario. Detalle en la pestaña *Reglamento y ayuda*.

## Estructura

| Ruta | Contenido |
|---|---|
| `index.html` | Toda la aplicación (HTML, CSS y JavaScript en un solo archivo). |
| `vendor/` | jsPDF y jsPDF-AutoTable (MIT), usados solo para el PDF. |
| `google-apps-script/` | Backend opcional en Google Apps Script (aportes, métricas, sugerencias y lectura de CTI Vitae) e instrucciones. |
| `PUBLICAR.md` | Guía de publicación en GitHub Pages. |
| `og-image.png` | Imagen de vista previa al compartir (1200×630). |
| `scripts/build-sjr.js` | Convierte el listado anual de SCImago en `sjr-quartiles.json` (ver «Cuartil de SCImago»). |
| `sjr-quartiles.json` | (Opcional, generado) Cuartil más reciente de SCImago por revista. Si no existe, la página funciona igual. |
| `logo.svg` | Logo del encabezado: lleva siempre a la pantalla de inicio. |
| `sitemap.xml` | Mapa del sitio para buscadores. |
| `LICENSE` | Licencia MIT. |

## Configuración (objeto `CONFIG` de `index.html`)

| Ajuste | Qué hace |
|---|---|
| `maxProductionAgeYears` | Antigüedad máxima, en años, de artículos, libros y capítulos para que sumen. `null` = sin límite (valor actual). Con `7`: al importar una ficha de CTI Vitae, las producciones con año anterior a (año actual − 7) quedan «sin contar» con un aviso, y se muestra un aviso en la calculadora. La persona puede reclasificarlas. |
| `sjrFile` | Nombre del archivo de cuartiles de SCImago (`sjr-quartiles.json`). |

**Sobre la antigüedad.** El Reglamento vigente (RP 090-2021-CONCYTEC-P, Anexo N.° 1) no fija una antigüedad máxima para la producción: cuenta «toda la trayectoria» (los artículos sin cuartil, SciELO y proceedings, y los libros y capítulos, tienen un tope de 10 puntos cada grupo). El límite de «últimos 7 años» (niveles II y III) pertenecía al reglamento anterior. Por eso queda apagado; actívalo solo si CONCYTEC lo incorpora o lo aclara en una norma.

## Cuartil de SCImago

Cuando la ficha de CTI Vitae no trae el cuartil de un artículo, la página puede completarlo con el **cuartil más reciente de SCImago** de esa revista (cruce por el nombre) y lo deja marcado en ámbar con la nota «tomado de la última calificación de SCImago, no del año de publicación». Si la revista no aparece, el artículo sigue como «sin cuartil» con el botón para consultarla en SCImago.

SCImago bloquea las descargas automáticas, así que el listado se baja a mano una vez al año:

1. Entra a <https://www.scimagojr.com/journalrank.php>, elige el año y pulsa **Download data** (archivo CSV).
2. Ejecuta `node scripts/build-sjr.js ruta/al/archivo.csv 2025` (el segundo dato es el año de la edición).
3. Sube el `sjr-quartiles.json` generado junto con `index.html`.

Datos: SCImago Journal & Country Rank (<https://www.scimagojr.com/>).

## Autor

**Rafael Segundo Vela-Paredes**: doctorando en Nutrición (UNALM, programa PROCIENCIA) · Facultad de Industrias Alimentarias, UNAP.
[ORCID 0000-0001-7255-6209](https://orcid.org/0000-0001-7255-6209) · [Scopus 57200699171](https://www.scopus.com/authid/detail.uri?authorId=57200699171)

## Licencia

El código de este repositorio se publica bajo la [licencia MIT](LICENSE): puedes usarlo, copiarlo, modificarlo y redistribuirlo, incluso con fines comerciales, conservando el aviso de copyright.

- Las librerías de `vendor/` (jsPDF y jsPDF-AutoTable) son de terceros y conservan su propia licencia MIT.
- «RENACYT», «CTI Vitae» y el contenido del reglamento pertenecen al CONCYTEC; esta herramienta es independiente y no tiene vínculo oficial con esa institución.

## Sugerencias y errores

Usa la pestaña *Sugerencias* del sitio o abre un *issue* en este repositorio.
