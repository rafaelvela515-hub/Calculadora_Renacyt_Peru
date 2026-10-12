# Conectar la calculadora con Google Sheets

Toma unos 10 minutos y no cuesta nada. Al terminar, los aportes anónimos llegan a **tu** hoja de cálculo y la pestaña *Comunidad* muestra las métricas.

## 1. Crear la hoja y el script

1. Entra a <https://sheets.google.com> con la cuenta que será dueña de los datos y crea una hoja en blanco. Nómbrala, por ejemplo, `Calculadora RENACYT - registros`.
2. Menú **Extensiones → Apps Script**.
3. Borra el código que aparece y pega **todo** el contenido de `Code.gs`. Guarda (ícono de disquete).

La pestaña `Registros` con sus encabezados se crea sola con el primer aporte.

## 2. Publicarlo como aplicación web

1. Botón **Implementar → Nueva implementación**.
2. Engranaje → tipo **Aplicación web**.
3. Configura:
   - **Ejecutar como:** *Yo*
   - **Quién tiene acceso:** *Cualquier usuario*
4. Pulsa **Implementar** y autoriza los permisos (Google avisará que la app no está verificada: es tu propio script, elige *Avanzado → Ir a…*).
5. Copia la **URL de la aplicación web**. Termina en `/exec`.

> "Cualquier usuario" significa que cualquiera puede **enviar** un aporte o pedir las métricas agregadas. Nadie puede leer tu hoja: el script solo devuelve agregados, nunca filas.

## 3. Pegar la URL en la página

Abre `index.html`, busca el bloque `CONFIG` y pega la URL:

```js
const CONFIG = {
  endpoint: "https://script.google.com/macros/s/XXXXXXXX/exec",
  appVersion: 1
};
```

Sube el archivo actualizado a GitHub Pages. El botón *Enviar aporte anónimo* se activa solo.

## 4. Tus datos de autor

En el mismo `index.html`, bloque `AUTHOR`, completa `orcid` y `scopus`. Mientras estén vacíos no se muestran.

## 5. Probar

1. Abre la página publicada, ve a **Comunidad**, marca el consentimiento y envía un aporte.
2. Revisa que aparezca una fila en la pestaña `Registros` de tu hoja.
3. Las métricas se actualizan cada 5 minutos como máximo (caché).

## Sugerencias de mejora

La pestaña *Sugerencias* guarda cada mensaje en una pestaña nueva de tu hoja llamada **`Sugerencias`** (se crea sola con la primera). Columnas: fecha, id del navegador, tipo, mensaje, valoración (1 a 5), correo, acepta contacto, pestaña de origen, versión y **estado**.

- **Cómo revisarlas.** Abre la hoja y filtra por `tipo` (error, mejora, idea, reglamento, otro). Cambia el `estado` a mano (`nuevo` → `en curso` → `resuelto`) para llevar el control.
- **Correo.** Es opcional y solo se guarda si la persona marca el consentimiento. Úsalo únicamente para responder esa sugerencia y bórralo cuando la cierres.
- **Retiro.** El botón «Retirar mis aportes» también borra las sugerencias de ese navegador. Si alguien te pide borrar la suya y ya no tiene su navegador, elimina su fila a mano.
- **Antispam.** Máximo 3 sugerencias al día por navegador, texto idéntico descartado, campo trampa para bots, mensajes de 10 a 1500 caracteres y fórmulas neutralizadas (`=`, `+`, `-`, `@` al inicio).
- **Sin servidor conectado.** El botón de enviar queda desactivado y se ofrece «Copiar texto» para que la persona lo mande por otro medio.

## Lectura automática de CTI Vitae (opcional)

La pestaña *Importar CTI Vitae* lee la ficha pública con el enlace. Como CTI Vitae no permite que otra web lea sus páginas desde el navegador, esa consulta la hace este mismo script (`ctiFetch_` en `Code.gs`).

- **Permiso nuevo.** Esta función necesita «Conectarse a un servicio externo». Al publicar la nueva versión, Google te pedirá **autorizar de nuevo**. Es normal.
- **Qué hace y qué no.** Solo acepta un número de investigador (`id_investigador`), consulta únicamente `ctivitae.concytec.gob.pe`, no sigue redirecciones, no guarda nada y está limitada a 20 consultas por minuto en total.
- **Plan B sin servidor.** Si la consulta falla, cada persona puede guardar su ficha (Ctrl+S → «Página web, solo HTML») y subirla en la misma pestaña. Eso se procesa solo en su navegador y no necesita este script.
- **No probado contra Google real.** El lector se probó con una ficha real descargada y el script en un entorno simulado, pero no se pudo comprobar que el servidor de Google logre conectarse al de CONCYTEC (algunos sitios públicos del Estado rechazan conexiones de Google). Pruébalo con tu propio enlace tras publicar.
- **Términos de uso.** No se pudo leer la página de términos de CTI Vitae y no hay `robots.txt`. La consulta es puntual, la inicia la persona usuaria y se limita a su propia ficha; aun así, si vas a difundir la herramienta, conviene avisar al CONCYTEC.

## Actualización: procedencia y país de la institución

La página ya no pide «gran área de conocimiento». En su lugar, la persona indica si su institución es **nacional** o **extranjera** (con país) y elige el nombre de una lista basada en el reporte de investigadores RENACYT. Para que el servidor guarde y muestre esos datos hay que **actualizar el script** (la página funciona igual si no lo haces, pero la procedencia y el país no quedan registrados).

1. En tu hoja: **Extensiones → Apps Script**, reemplaza todo el contenido por el nuevo `Code.gs` y guarda.
2. **Implementar → Administrar implementaciones →** lápiz → *Versión:* **Nueva versión → Implementar**. La URL no cambia.
3. No hace falta tocar la hoja: al primer aporte nuevo se completan solas las cabeceras `origen_institucion` y `pais_institucion` (columnas P y Q). Las filas anteriores no se modifican.

Qué cambia en los datos:

- Se agregan 2 columnas al final: `origen_institucion` (`nacional` / `extranjera`) y `pais_institucion` (solo si es extranjera y está en la lista de países).
- La columna `area` se conserva por compatibilidad, pero queda vacía en los aportes nuevos.
- El nombre de la institución admite hasta 100 caracteres (antes 80).
- El panel de métricas pasa de «por gran área» a «procedencia de la institución» y «país de las instituciones extranjeras» (este último solo con 5 o más participantes).

## Instituciones propuestas por la comunidad

Si una persona no encuentra su institución en la lista, la escribe y puede pulsar **«Proponer para la lista»**. También se propone sola cuando alguien envía un aporte anónimo con una institución que no estaba en la lista. Cada propuesta queda en una pestaña nueva de tu hoja, **`Instituciones`** (se crea sola), y la lista crece para todos con tu control.

**Cuándo se muestra a los demás:**

- Automáticamente, cuando **2 personas distintas** (dos navegadores distintos) escriben la misma institución. Se detecta aunque la escriban con otras mayúsculas, sin tildes o sin las siglas entre paréntesis.
- De inmediato, si tú escribes **`aprobada`** en la columna `estado`.
- Nunca, si escribes **`rechazada`** (además esa propuesta no vuelve a aparecer aunque más personas la escriban, y quien la propone no se entera).

**Cómo moderar (2 minutos cada cierto tiempo):**

1. Abre la pestaña `Instituciones`. Columnas: `clave`, `nombre`, `origen` (nacional/extranjera), `pais`, `n_personas`, `clientes`, fechas y `estado`.
2. Ordena por `n_personas` o por `ultima_fecha` para ver lo más reciente.
3. Corrige faltas en la columna `nombre` si hace falta (es lo que verán las personas).
4. Escribe `aprobada` o `rechazada` en `estado`. Vacío = se publica solo al llegar a 2 personas.
5. Los cambios llegan a las personas usuarias en un máximo de 12 horas (la lista se guarda en el navegador de cada persona y el servidor la refresca cada 10 minutos).

**Protecciones incorporadas:** no se aceptan nombres con enlaces, correos, fórmulas, de menos de 4 letras ni de más de 100 caracteres; las extranjeras exigen un país válido; máximo 5 propuestas nuevas por navegador al día; y al usar «Retirar mis aportes», la persona también retira su voto en las instituciones que propuso (si se queda sin votos, se elimina la fila). La lista pública solo contiene nombres y países, nada personal.

**Importante:** esta función y la de procedencia/país vienen en el mismo `Code.gs` nuevo. Basta una sola actualización: pega el código y crea una **Nueva versión** de la implementación.

## Si cambias `Code.gs` más adelante

Debes crear una **nueva versión**: *Implementar → Administrar implementaciones → editar (lápiz) → Versión: Nueva versión → Implementar*. La URL no cambia.

## Qué protege el script

| Medida | Efecto |
|---|---|
| Validación estricta de cada campo y coherencia `total = formación + producción + asesoría` | Rechaza datos inventados o malformados |
| Máximo 5 aportes por navegador al día y detección de duplicados (10 min) | Frena el spam sin pedir cuentas |
| Campo trampa invisible (honeypot) | Descarta bots simples |
| Texto que empieza con `= + - @` se neutraliza | Evita inyección de fórmulas en la hoja |
| No se publica ningún grupo con menos de 5 personas (institución, y todo el detalle si hay menos de 5 participantes en total) | Evita identificar a alguien por su institución |
| Cada persona cuenta una vez (su aporte más reciente) | Los aportes repetidos no inflan el total |
| Retiro de aportes por identificador del navegador | Cumple el derecho de supresión |

## Límites que conviene conocer

- Los datos son **autodeclarados**. Alguien puede mentir; las métricas son orientativas, no estadística oficial.
- Si se reinstala el navegador o se borra su almacenamiento, esa persona pierde su identificador y ya no podrá retirar aportes anteriores (seguirían en tu hoja, anónimos). Si alguien te pide borrar sus datos, puedes eliminar su fila a mano.
- Google Apps Script tiene cuotas diarias gratuitas. Para miles de aportes por día conviene migrar a Firebase o Supabase.
- Si recoges datos de personas en el Perú, aplica la Ley N.° 29733 de Protección de Datos Personales. El aporte es anónimo y con consentimiento, pero si más adelante pides correo o nombre, necesitarás un aviso de privacidad formal y, según el caso, registrar el banco de datos ante la Autoridad Nacional de Protección de Datos Personales.
