# Beyond the Cloud — Interactive Spatial Exhibition

An interactive 3D Computer Networks demonstration built with React, TypeScript, Vite, Tailwind CSS, and Three.js.

## Windows Setup & Run Instructions

1. Extract `beyond-the-cloud-exhibition.zip` to a folder on your Windows machine (for example, `D:\beyond-the-cloud-exhibition`).
2. Open **Windows PowerShell** and navigate into the project directory:
   ```powershell
   cd D:\beyond-the-cloud-exhibition
   ```
3. If PowerShell blocks script execution, run:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
4. Install dependencies and start the development server:
   ```powershell
   npm install
   npm run dev
   ```
5. Open the local URL shown in the terminal (typically `http://localhost:5173`) in your browser.

## Presentation Controls

- **Environment Switcher (Top Right):** Move smoothly between **Workstation Origin**, **Data Center Hall**, **Edge Intersection**, and **Cloud & Edge Together**.
- **Direct Object Inspection:** Click the laptop, router, spine-leaf switch, compute racks, NVMe storage pool, traffic camera mast, curbside edge gateway, or traffic signal mast in the 3D scene to inspect its architectural role.
- **Simulation Transport (Bottom Bar):** Use **Transmit Request**, **Trace Internal Flow**, **Trigger Emergency Vehicle**, or **Run Dual Race** along with **Pause/Resume**, **Reset**, and the timeline scrubber.
- **Fullscreen Mode:** Click the expand icon in the top-right bar for 16:9 classroom projection.
