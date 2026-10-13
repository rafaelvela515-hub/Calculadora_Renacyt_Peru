# Publicar la Calculadora RENACYT

**Estado (12-oct-2026):** el paso 2 ya está hecho y verificado. `index.html` tiene tu URL del script en `CONFIG.endpoint` y se probó contra el servicio real de Google: lectura de CTI Vitae, métricas, aportes, sugerencias, retiro y validaciones. Solo quedan el **paso 1** (proteger la hoja) y el **paso 3** (subir a GitHub Pages).

> Si algún día cambias `Code.gs`, debes crear una **nueva versión** de la implementación (Implementar → Administrar implementaciones → lápiz → Nueva versión). La URL no cambia.

## Qué subir

| Archivo o carpeta | ¿Subir? |
|---|---|
| `index.html` | **Sí** |
| `vendor/` (librerías del PDF) | **Sí** |
| `google-apps-script/` y este archivo | Opcional. No contienen claves ni el ID de tu hoja. |

## Paso 1 · Proteger la hoja

La hoja guardará correos opcionales y sugerencias. Ábrela, pulsa **Compartir → Acceso general** y déjala en **Restringido** (solo tú). El script funciona igual: lo ejecuta tu cuenta y no necesita que la hoja sea pública.

## Paso 2 · Conectar la hoja (10 minutos)

1. Abre tu hoja → **Extensiones → Apps Script**.
2. Borra el código de ejemplo y pega todo el contenido de `google-apps-script/Code.gs`. Guarda.
3. **Implementar → Nueva implementación → Aplicación web.** Ejecutar como: *Yo*. Quién tiene acceso: *Cualquier usuario*.
4. Autoriza los permisos (hoja de cálculo y «conectarse a un servicio externo»). Google avisará que la app no está verificada: es tu propio script, elige *Avanzado → Ir a…*.
5. Copia la **URL de la aplicación web** (termina en `/exec`).
6. En `index.html`, busca `CONFIG` y pégala:

```js
const CONFIG = {
  endpoint: "https://script.google.com/macros/s/XXXXXXXX/exec",
  appVersion: 1
};
```

También puedes pasarme la URL y la pongo yo.

## Paso 3 · GitHub Pages

1. Crea un repositorio público en GitHub (por ejemplo `calculadora-renacyt`).
2. Sube `index.html` y la carpeta `vendor/`.
3. **Settings → Pages →** *Deploy from a branch* → rama `main`, carpeta `/ (root)` → Save.
4. En un par de minutos queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`. El de este proyecto: `https://rafaelvela515-hub.github.io/Calculadora_Renacyt_Peru/`.

## Compartir e indexar (opcional pero recomendado)

La página ya trae lo necesario para que **WhatsApp, X, Facebook, Telegram y LinkedIn** muestren una tarjeta con título, descripción e imagen (`og-image.png`), un botón **Compartir** en el encabezado, y datos para buscadores (etiqueta canónica, datos estructurados y `sitemap.xml`).

Para que **Google** la encuentre antes (lo puedes hacer solo tú, con tu cuenta):

1. Entra a <https://search.google.com/search-console> y agrega una propiedad de tipo **Prefijo de URL** con `https://rafaelvela515-hub.github.io/Calculadora_Renacyt_Peru/`.
2. Verifica la propiedad con el método **Etiqueta HTML**: Google te da una etiqueta `<meta name="google-site-verification" content="…">`. Pásamela y la agrego a `index.html`.
3. En *Sitemaps*, envía `sitemap.xml`.
4. Opcional: repite en Bing Webmaster Tools (<https://www.bing.com/webmasters>).

Para **refrescar la vista previa** cuando cambies el texto o la imagen: WhatsApp, X y Facebook guardan una copia por enlace. En Facebook usa el *Depurador de uso compartido* (<https://developers.facebook.com/tools/debug/>) y pulsa «Volver a extraer»; en WhatsApp basta con compartir el enlace añadiendo `?v=2` al final.

**Instagram** no permite compartir enlaces desde una página web. El botón Compartir incluye «Copiar enlace» para pegarlo en historias, biografía o mensajes (en los mensajes, Instagram sí muestra la tarjeta).

## Prueba de humo (5 minutos, ya publicada)

1. **Calculadora:** pulsa *Probar con datos de ejemplo*; debe dar 22.5 pts, Nivel VII.
2. **CTI Vitae:** pega tu enlace (`…id_investigador=33295`) y pulsa *Leer mi ficha*. Debe leer 30 producciones, 3 registros de propiedad intelectual y 8 asesorías.
   Si falla, el servidor de Google no logró conectarse con CONCYTEC: usa la subida del archivo guardado y avísame.
3. **Comunidad:** marca el consentimiento y envía un aporte. Debe aparecer una fila en la pestaña `Registros` de tu hoja.
4. **Sugerencias:** envía una. Debe aparecer en la pestaña `Sugerencias`.
5. **PDF:** pulsa *Descargar PDF*; deben salir 2 páginas.
6. Borra tus filas de prueba en la hoja y usa *Retirar mis aportes* para comprobar que también funciona.

## Antes de difundir

- **Términos de CTI Vitae:** no pude leerlos. La consulta es puntual, la inicia la persona y solo acepta un número de investigador; aun así, avisa al CONCYTEC si la vas a promocionar.
- **Datos autodeclarados:** las métricas de la comunidad no están verificadas. El panel lo indica.
- **Reglamento:** la tabla de puntajes sigue la RP 090-2021-CONCYTEC-P. Si el CONCYTEC publica un reglamento nuevo, hay que revisar `TYPES` y `LEVELS` en `index.html`.
