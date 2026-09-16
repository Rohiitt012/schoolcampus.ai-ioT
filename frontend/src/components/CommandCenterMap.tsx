"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CommandCenterMapProps {
  buses: any[];
  cameras: any[];
  sensors: any[];
  incidents: any[];
}

export default function CommandCenterMap({
  buses,
  cameras,
  sensors,
  incidents,
}: CommandCenterMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: Cityville Campus Coordinates [28.675, 77.46]
      const map = L.map(mapContainerRef.current, {
        center: [28.675, 77.46],
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
      markersRef.current = L.layerGroup().addTo(map);
    }

    const markersGroup = markersRef.current;
    if (markersGroup) {
      markersGroup.clearLayers();

      // Custom Icons
      const createCustomIcon = (emoji: string, bgColor: string) =>
        L.divIcon({
          html: `<div style="background-color:${bgColor}; width:32px; height:32px; border-radius:50%; display:flex; items-center; justify-content:center; color:white; font-weight:bold; font-size:16px; border:2px solid white; box-shadow:0 4px 6px rgba(0,0,0,0.3); text-align:center; line-height:28px;">${emoji}</div>`,
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

      const busIcon = createCustomIcon("🚌", "#2563eb");
      const cameraIcon = createCustomIcon("📹", "#4f46e5");
      const sensorIcon = createCustomIcon("🌡️", "#0284c7");
      const incidentIcon = createCustomIcon("🚨", "#dc2626");

      // 1. Buses
      buses.forEach((b) => {
        const loc = b.locations?.[0];
        const lat = loc ? loc.latitude : 28.675;
        const lng = loc ? loc.longitude : 77.455;

        const marker = L.marker([lat, lng], { icon: busIcon }).bindPopup(`
          <div style="font-family:sans-serif; padding:4px;">
            <strong style="color:#2563eb;">Bus ${b.busNumber}</strong><br/>
            Driver: ${b.driver?.user?.name || "Driver"}<br/>
            Status: <strong>${b.status}</strong><br/>
            Speed: ${loc ? loc.speed : 0} km/h
          </div>
        `);
        markersGroup.addLayer(marker);
      });

      // 2. Cameras
      cameras.forEach((c, idx) => {
        const lat = 28.685 + idx * 0.005;
        const lng = 77.465 + idx * 0.005;

        const marker = L.marker([lat, lng], { icon: cameraIcon }).bindPopup(`
          <div style="font-family:sans-serif; padding:4px;">
            <strong style="color:#4f46e5;">${c.name}</strong><br/>
            ID: ${c.cameraId}<br/>
            Zone: ${c.zone}<br/>
            Type: ${c.cameraType}
          </div>
        `);
        markersGroup.addLayer(marker);
      });

      // 3. Sensors
      sensors.forEach((s, idx) => {
        const lat = 28.665 - idx * 0.004;
        const lng = 77.445 + idx * 0.006;

        const marker = L.marker([lat, lng], { icon: sensorIcon }).bindPopup(`
          <div style="font-family:sans-serif; padding:4px;">
            <strong style="color:#0284c7;">${s.name}</strong><br/>
            Sensor ID: ${s.sensorId}<br/>
            Reading: <strong>${s.latestReading || "N/A"}</strong>
          </div>
        `);
        markersGroup.addLayer(marker);
      });

      // 4. Incidents
      incidents.forEach((inc, idx) => {
        const lat = 28.67 + idx * 0.003;
        const lng = 77.458 + idx * 0.004;

        const marker = L.marker([lat, lng], { icon: incidentIcon }).bindPopup(`
          <div style="font-family:sans-serif; padding:4px;">
            <strong style="color:#dc2626;">🚨 EMERGENCY ${inc.incidentType}</strong><br/>
            Location: ${inc.location}<br/>
            Severity: ${inc.severity}<br/>
            Status: ${inc.status}
          </div>
        `);
        markersGroup.addLayer(marker);
      });
    }
  }, [buses, cameras, sensors, incidents]);

  return <div ref={mapContainerRef} className="w-full h-[450px] z-10" />;
}
