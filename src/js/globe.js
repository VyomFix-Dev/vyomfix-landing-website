/**
 * VyomFix Globe Visualization using Globe.GL
 * Futuristic particle/hex Earth with orbital paths and dynamic arcs.
 */

(function () {
    'use strict';

    function initGlobe() {
        const container = document.getElementById('hero-globe-container');
        if (!container) return;

        // Clear existing static canvas if any (globe.gl creates its own)
        const oldCanvas = document.getElementById('globe-canvas');
        if (oldCanvas) oldCanvas.remove();

        // ── Sizing Logic ──
        function getSize() {
            const heroSection = document.getElementById('hero');
            if (heroSection) {
                const rect = heroSection.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    return { w: rect.width, h: rect.height };
                }
            }
            return { w: window.innerWidth, h: window.innerHeight };
        }

        const { w: initW, h: initH } = getSize();

        // ── Color Palette ──
        const COLORS = {
            primary: '#3B82F6',     // Electric Blue
            secondary: '#8B5CF6',   // Neon Purple
            accent: '#22D3EE',      // Cyan
            background: 'rgba(0,0,0,0)', // Transparent so CSS gradient shows behind
            hexLand: '#22D3EE',     // Cyan matrix for land
            arcStart: '#3B82F6',
            arcEnd: '#22D3EE',
            atmosphere: '#3B82F6'
        };

        // ── Generate Dynamic Arc Data (Network) ──
        // Central hub (e.g., USA/Equator) orchestrating global operations
        const NUM_ARCS = 25;
        const hub = { lat: 28.5, lng: -80.5 }; // Space Coast, Florida approx
        
        const arcsData = [...Array(NUM_ARCS).keys()].map(() => {
            // Random destinations globally
            const endLat = (Math.random() - 0.5) * 140; // -70 to 70
            const endLng = (Math.random() - 0.5) * 360; // -180 to 180
            return {
                startLat: hub.lat,
                startLng: hub.lng,
                endLat: endLat,
                endLng: endLng,
                color: [COLORS.arcStart, COLORS.arcEnd],
                time: Math.random() * 2 // Random start offset for animations
            };
        });

        // ── Initialize Globe.GL ──
        const world = Globe({ animateIn: true })
            (container)
            .width(initW)
            .height(initH)
            .backgroundColor(COLORS.background)
            .showGlobe(false) // Hide solid globe to show only hexes (dot-matrix look)
            .showAtmosphere(true)
            .atmosphereColor(COLORS.atmosphere)
            .atmosphereAltitude(0.15)
            
            // ── Hex/Dot Matrix Landmass ──
            .hexPolygonsData([]) // Wil load geojson dynamically below
            .hexPolygonResolution(3) // Resolution of the hex grid (higher = smaller hexes)
            .hexPolygonMargin(0.4) // Increased space between hexes for a dot-matrix look
            .hexPolygonColor(() => COLORS.hexLand)
            .hexPolygonAltitude(0.005)

            // ── Arcs (Orbital/Flight Paths) ──
            .arcsData(arcsData)
            .arcColor('color')
            .arcDashLength(0.4)
            .arcDashGap(0.2)
            .arcDashInitialGap(e => e.time)
            .arcDashAnimateTime(2000)
            .arcAltitude(e => Math.max(0.1, Math.min(0.6, Math.abs(e.startLng - e.endLng) * 0.005)));

        // Remove the default starfield image as we want a clean tech background
        world.globeImageUrl('');
        world.bumpImageUrl('');

        // ── Load GeoJSON for Countries ──
        fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then(countries => {
                world.hexPolygonsData(countries.features);
            })
            .catch(err => console.error("Could not load country data for globe:", err));

        // ── Camera & Controls ──
        world.pointOfView({ lat: 20, lng: -50, altitude: 2.2 }, 0); // Initial position
        
        const controls = world.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.6;
        controls.enableZoom = false; // Disable zoom to prevent user breaking the hero layout
        controls.enablePan = false;

        // ── Add Custom Orbital Rings (Three.js integration) ──
        const scene = world.scene();
        
        // We need to wait for Three.js (which Globe.gl exposes implicitly via its dependencies, 
        // but since we bundle it, we can create standard Three objects if window.THREE is available, 
        // or just rely on globe.gl's built-in layers). 
        // For simplicity and stability without raw Three.js, we rely purely on Globe.gl API.

        // ── Resize Handling ──
        function onResize() {
            const { w, h } = getSize();
            world.width(w);
            world.height(h);
        }
        window.addEventListener('resize', onResize);
        setTimeout(onResize, 100); // Force layout eval

        // Speed modulation based on scroll (optional polish)
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const vh = window.innerHeight;
            if (scrollY < vh) {
                controls.autoRotateSpeed = 0.6 + (scrollY / vh) * 1.5;
            } else {
                controls.autoRotateSpeed = 0.2;
            }
        });
    }

    // Wait for the Globe object to be injected by the CDN
    if (typeof Globe !== 'undefined') {
        requestAnimationFrame(() => requestAnimationFrame(initGlobe));
    } else {
        window.addEventListener('load', () => {
            requestAnimationFrame(() => requestAnimationFrame(initGlobe));
        });
    }

})();
