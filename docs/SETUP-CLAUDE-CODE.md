# SETUP — arranque en Claude Code

Todos los comandos y repos de acá fueron verificados contra la fuente real (GitHub/docs oficial), no copiados sin chequear.

## 1. Crear el proyecto
```
npx create-next-app@latest . --typescript --tailwind --app
npx shadcn@latest init
```

## 2. Instalar las skills (en este orden)
```
npx skills add anthropics/skills@frontend-design -g -y
pnpm dlx skills add shadcn/ui
npx skills add vercel-labs/agent-skills
npx impeccable install
```
`vercel-labs/agent-skills` trae de un saque: `web-design-guidelines` (100+ reglas de accesibilidad/UX/performance), `react-best-practices`, y `react-view-transitions` (animaciones nativas de página).

## 3. Inicializar el sistema de diseño
```
/impeccable init
```
Cuando pregunte por audiencia/producto/marca, pasarle el contenido de `PRODUCT.md` y `DESIGN.md` (ya están armados en esta carpeta) en vez de contestar desde cero — así no se pierde nada de lo que ya definimos.

## 4. Conectar Sanity (panel de la clienta)
```
npm create sanity@latest
```
Schema mínimo: nombre, marca, categoría (árabe/Natura/nicho), precio, stock, fotos, descripción.

## 5. Construir en este orden (según DESIGN.md)
1. Loader cinemático
2. Hero con producto (foto fija + zoom/parallax por ahora)
3. Riel de navegación lateral
4. Grilla de producto
5. Sección de reveal de comparación (confianza, no fórmula)
6. Checkout con Mercado Pago Checkout Pro
7. Conectar Sanity a la grilla/ficha de producto

## 6. Deploy
```
netlify deploy
```
Dominio: comprar `.com.ar` en NIC Argentina (~AR$8.500/año, chequear valor vigente) cuando el nombre de marca esté definido.

## Referencia de diseño
Usar `playground-estilos.html` (en esta misma carpeta) como punto de partida visual — ya tiene paleta, tipografía, grilla y botón magnético implementados y funcionando.
