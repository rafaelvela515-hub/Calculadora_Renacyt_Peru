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

Lo que ingresas se guarda solo en tu navegador. Solo se envía algo si marcas el consentimiento en *Comunidad* o escribes una sugerencia. Detalle en la pestaña *Reglamento y ayuda*.

## Estructura

| Ruta | Contenido |
|---|---|
| `index.html` | Toda la aplicación (HTML, CSS y JavaScript en un solo archivo). |
| `vendor/` | jsPDF y jsPDF-AutoTable (MIT), usados solo para el PDF. |
| `google-apps-script/` | Backend opcional en Google Apps Script (aportes, métricas, sugerencias y lectura de CTI Vitae) e instrucciones. |
| `PUBLICAR.md` | Guía de publicación en GitHub Pages. |
| `LICENSE` | Licencia MIT. |

## Autor

**Rafael Segundo Vela-Paredes**: doctorando en Nutrición (UNALM, programa PROCIENCIA) · Facultad de Industrias Alimentarias, UNAP.
[ORCID 0000-0001-7255-6209](https://orcid.org/0000-0001-7255-6209) · [Scopus 57200699171](https://www.scopus.com/authid/detail.uri?authorId=57200699171)

## Licencia

El código de este repositorio se publica bajo la [licencia MIT](LICENSE): puedes usarlo, copiarlo, modificarlo y redistribuirlo, incluso con fines comerciales, conservando el aviso de copyright.

- Las librerías de `vendor/` (jsPDF y jsPDF-AutoTable) son de terceros y conservan su propia licencia MIT.
- «RENACYT», «CTI Vitae» y el contenido del reglamento pertenecen al CONCYTEC; esta herramienta es independiente y no tiene vínculo oficial con esa institución.

## Sugerencias y errores

Usa la pestaña *Sugerencias* del sitio o abre un *issue* en este repositorio.
