# PatCh.BaGs × React Bits — Original Lanyard

**Original upstream:** https://reactbits.dev/components/lanyard  
**Source:** https://github.com/DavidHDev/react-bits/blob/main/src/content/Components/Lanyard/Lanyard.jsx

This directory contains an imported copy of the **original free React Bits Lanyard** component, not a CSS simulation. All of its THREE.js rendering, procedural badge geometry, rope simulation, throwing, swinging and flip logic are retained.

## Adaptations for this existing static HTML storefront

- `Lanyard.js`: retains upstream simulation and renderer. The React import was made explicit, its sole JSX return was written as `React.createElement`, and its CSS import was removed so it can be loaded directly by the browser as a module without a build pipeline.
- `lanyard-mount.js`: mounts the original component into a React island immediately below the unchanged site navbar.
- `../reactbits-lanyard.css`: full-width frameless mounting styles and visible fallback.
- `../assets/reactbits/patch-tag-front.svg` and `patch-tag-back.svg`: PatCh.BaGs artwork for the real component's `frontImage` and `backImage` props.

The public site uses a browser **import map** for pinned versions of React 19.2.0 and three 0.180.0 through esm.sh. React DOM is loaded via the same React instance. A network connection and device WebGL support are required for the live 3D effect. An ordinary brand-mark fallback is displayed if the 3D canvas cannot initialize.

The new banner is placed directly underneath the existing sticky navbar and does **not** alter the navbar markup, the existing hero, product pages, ecommerce flows, or any other animation.

## Third-party licensing

React Bits free component source is licensed for website/client projects subject to the upstream MIT + Commons Clause license and applicable third-party licenses. Do not sell the source as a standalone component library. Maintain upstream attribution when modifying or redistributing the site.

## Optional production hardening

For improved performance, package React/React DOM/three locally with Vite/esbuild as an isolated island and serve built assets through GitHub Pages. This would remove the runtime CDN dependency. Do not turn the rest of the existing storefront into a React application.
