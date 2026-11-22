# Beyond the Cloud

A browser based interactive 3D exhibition for a Computer Networks lab. The scenes are built from procedural Three.js geometry and run locally in the browser. Network timing and paths are illustrative, not live measurements.

## Windows setup

Install Node.js 20 or newer. In PowerShell, open the extracted project folder and run:

```powershell
npm install
npm run dev
```

Open the local address printed by Vite (usually `http://localhost:5173`). To create the static production build, run `npm run build`; to preview it locally, run `npm run preview`.

## Live demonstration

1. Choose **Enter the Network** to reveal the exhibition controls.
2. Use the top navigation to visit **Workstation Origin**, **Data Center Hall**, **Edge Intersection**, or **Cloud & Edge Together**.
3. Select **Transmit Request**, **Trace Internal Flow**, **Trigger Emergency Vehicle**, or **Run Dual Race** to start that scene's animation. You can also click highlighted physical components to inspect them.
4. Use **Pause/Resume**, **Step**, **Reset**, or the timeline to control the simulation. In the edge scene, switch **Cloud Sync** on or off; local signal processing still occurs in the visualization.
5. Use the fullscreen control for classroom projection.

Keyboard controls: **Space** starts or pauses, **Right Arrow** advances the simulation, and **F** toggles fullscreen. Avoid pressing these while a button or timeline control is focused.

The site responds to browser resizing, honors reduced-motion preferences, and displays a fallback message if WebGL cannot start. Cloud and edge paths are illustrative; actual latency depends on distance, routing, congestion, processing, and the systems involved.
