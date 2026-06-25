"use client";

import { useEffect, useRef } from "react";
import { useFleetStore } from "@/store/fleetStore";

const ROUTES = [
  {
    id: "red",
    color: "#b91c1c", // Red
    label: "สายสีแดง (Line 1)",
    labelShort: "Red",
    points: [
      [13.79186, 100.318783],
      [13.791797, 100.318654],
      [13.796735, 100.318633],
      [13.796727, 100.318278],
      [13.798748, 100.31832],
      [13.798696, 100.319854],
      [13.800821, 100.320004],
      [13.800779, 100.320358],
      [13.799237, 100.320347],
      [13.799123, 100.323907],
      [13.796748, 100.323885],
      [13.796696, 100.327295],
      [13.794514, 100.327426],
      [13.794447, 100.326927],
      [13.794369, 100.326927],
      [13.794317, 100.327442],
      [13.787987, 100.327441],
      [13.788154, 100.325396],
      [13.787842, 100.325321],
      [13.787769, 100.322608],
      [13.791779, 100.322705],
      [13.791842, 100.318705]
    ] as [number, number][],
  },
  {
    id: "blue",
    color: "#1e3a8a", // Blue
    label: "สายสีน้ำเงิน (Line 2)",
    labelShort: "Blue",
    points: [
      [13.79203, 100.318808],
      [13.791998, 100.318786],
      [13.792665, 100.317617],
      [13.79553, 100.317575],
      [13.796727, 100.318196],
      [13.798827, 100.318215],
      [13.798807, 100.319968],
      [13.800768, 100.320061],
      [13.800716, 100.320297],
      [13.796852, 100.320157],
      [13.796831, 100.321583],
      [13.799102, 100.321541],
      [13.799071, 100.323835],
      [13.796675, 100.323792],
      [13.796644, 100.327213],
      [13.794508, 100.327373],
      [13.794467, 100.32688],
      [13.794321, 100.326816],
      [13.794279, 100.327406],
      [13.791747, 100.327427],
      [13.791964, 100.318868]
    ] as [number, number][],
  },
  {
    id: "green",
    color: "#15803d", // Green
    label: "สายสีเขียว (Line 3)",
    labelShort: "Green",
    points: [
      [13.79207, 100.318867],
      [13.792029, 100.318899],
      [13.796758, 100.318878],
      [13.796747, 100.322984],
      [13.795279, 100.322941],
      [13.79527, 100.3255],
      [13.796681, 100.325532],
      [13.79664, 100.326556],
      [13.796593, 100.327161],
      [13.794515, 100.327295],
      [13.794509, 100.326759],
      [13.794275, 100.326775],
      [13.794259, 100.327311],
      [13.791853, 100.327345],
      [13.792045, 100.318907]
    ] as [number, number][],
  },
];

export function LeafletMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const { drivers } = useFleetStore();

  useEffect(() => {
    if (!mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((mapRef.current as any)._leaflet_id) return;

    let L: typeof import("leaflet");
    let map: import("leaflet").Map;
    let animationInterval: NodeJS.Timeout;

    (async () => {
      if (!mapRef.current) return;

      L = (await import("leaflet")).default;
      
      // Remove default icon url to prevent 404s
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!mapRef.current || (mapRef.current as any)._leaflet_id) return;

      const campusBounds = L.latLngBounds(
        L.latLng(13.785, 100.315), // SouthWest
        L.latLng(13.803, 100.330)  // NorthEast
      );

      const isDesktop = window.innerWidth >= 768;
      const initialZoom = isDesktop ? 15.7 : 14.5;

      map = L.map(mapRef.current, {
        center: [13.7934, 100.3225],
        zoom: initialZoom,
        minZoom: 14.5,
        zoomSnap: 0.1,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 20,
        wheelDebounceTime: 20,
        maxBounds: campusBounds,
        maxBoundsViscosity: 1.0,
        zoomControl: false,
        attributionControl: false,
      });

      const panes = map.getPanes();
      const paneZIndexMap: Record<string, number> = {
        mapPane:     1,
        tilePane:    2,
        shadowPane:  5,
        overlayPane: 4,
        markerPane:  6,
        tooltipPane: 7,
        popupPane:   7,
      };
      Object.entries(paneZIndexMap).forEach(([name, z]) => {
        const el = panes[name as keyof typeof panes] as HTMLElement | undefined;
        if (el) el.style.zIndex = String(z);
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OSM &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      const busMarkers: { 
        marker: import('leaflet').Marker, 
        route: any, 
        progress: number, 
        speed: number, 
        direction: number 
      }[] = [];

      ROUTES.forEach((route) => {
        const closedPoints = [...route.points, route.points[0]];
        
        L.polyline(closedPoints, {
          color: 'white',
          weight: 7,
          opacity: 0.8,
          smoothFactor: 1,
        }).addTo(map);

        const polyline = L.polyline(closedPoints, {
          color: route.color,
          weight: 4,
          opacity: 0.9,
          smoothFactor: 1,
        }).addTo(map);

        polyline.bindPopup(`<b>${route.label}</b>`);

        // Bus Stops
        route.points.forEach((point, index) => {
          const prefix = route.id === "red" ? "R" : route.id === "blue" ? "B" : "G";
          const stopCode = prefix + (index + 1);
          
          const stopIcon = L.divIcon({
            className: "",
            iconSize: [28, 18],
            html: `
              <div style="
                width: 100%;
                height: 100%;
                background: ${route.color};
                color: white;
                font-size: 10px;
                font-weight: bold;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1.5px solid white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                font-family: sans-serif;
              ">${stopCode}</div>
            `,
            iconAnchor: [14, 9],
          });
          L.marker(point, { icon: stopIcon, interactive: false }).addTo(map);
        });

        // Map route.id to driver route string
        const routeIdMap: Record<string, string> = {
          red: "Line 1",
          blue: "Line 2",
          green: "Line 3",
        };
        const routeDrivers = drivers.filter(d => d.route === routeIdMap[route.id] && d.status === "Active");

        // Buses
        for(let i=0; i<5; i++) {
          const driver = routeDrivers.length > 0 ? routeDrivers[i % routeDrivers.length] : null;

          const busHtml = L.divIcon({
            className: "",
            html: `
              <div class="bus-icon-container" style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                <div class="bus-icon-inner" style="
                  background: white;
                  border: 3px solid ${route.color};
                  color: ${route.color};
                  width: 26px;
                  height: 26px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 50%;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                  z-index: 10;
                  transition: transform 0.1s linear;
                ">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                </div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });
          
          const marker = L.marker(route.points[0], { icon: busHtml, zIndexOffset: 1000 }).addTo(map);
          
          if (driver) {
            marker.bindPopup(`
              <div style="font-family: sans-serif; text-align: center; padding: 4px;">
                <b style="font-size: 13px;">${driver.name} ${driver.surname}</b><br/>
                <span style="font-size: 11px; color: #64748b;">รหัส: ${driver.code}</span><br/>
                <span style="font-size: 11px; font-weight: bold; color: ${route.color};">รถ: ${driver.vehicle}</span>
              </div>
            `, { closeButton: false, offset: [0, -10] });
          }

          busMarkers.push({
            marker,
            route,
            progress: i * 0.20,
            speed: 0.00015 + (Math.random() * 0.00010), // Realistic, slower speed
            direction: 1
          });
        }
      });


      function getPointOnRoute(points: [number, number][], progress: number): [number, number] {
        const totalSegments = points.length - 1;
        let scaledProgress = progress * totalSegments;
        
        // Loop routes
        if (scaledProgress >= totalSegments) {
          scaledProgress = scaledProgress % totalSegments;
        }
        if (scaledProgress < 0) {
          scaledProgress = totalSegments + (scaledProgress % totalSegments);
        }

        const segmentIndex = Math.floor(scaledProgress);
        const segmentProgress = scaledProgress - segmentIndex;
        
        const p1 = points[segmentIndex];
        const p2 = points[segmentIndex + 1] || points[0];
        
        return [
          p1[0] + (p2[0] - p1[0]) * segmentProgress,
          p1[1] + (p2[1] - p1[1]) * segmentProgress
        ];
      }

      animationInterval = setInterval(() => {
        busMarkers.forEach(b => {
          const oldPos = getPointOnRoute(b.route.points, b.progress);
          
          b.progress += b.speed;
          if (b.progress >= 1) {
            b.progress = 0;
          }
          
          const newPos = getPointOnRoute(b.route.points, b.progress);
          b.marker.setLatLng(newPos);

          const dLat = newPos[0] - oldPos[0];
          const dLng = newPos[1] - oldPos[1];
          
          if (Math.abs(dLat) > 0.000001 || Math.abs(dLng) > 0.000001) {
            let angle = Math.atan2(dLng, dLat) * 180 / Math.PI;
            const el = b.marker.getElement();
            if (el) {
              const inner = el.querySelector('.bus-icon-inner') as HTMLElement;
              if (inner) {
                inner.style.transform = `rotate(${angle}deg)`;
              }
            }
          }
        });
      }, 50);

      mapInstanceRef.current = map;
    })();

    return () => {
      if (animationInterval) clearInterval(animationInterval);
      const m = mapInstanceRef.current;
      if (m) {
        m.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <style>{`
        .leaflet-control-container { z-index: 900 !important; } 
        .leaflet-control-attribution { display: none !important; }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
      <div ref={mapRef} className="absolute inset-0 bg-[#f1f5f9]" />
    </div>
  );
}
