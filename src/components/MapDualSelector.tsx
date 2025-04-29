"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import {
  Box,
  Text,
  Select as ChakraSelect,
  FormControl,
  FormLabel,
  VStack,
  Checkbox,
  HStack
} from "@chakra-ui/react";
import "leaflet/dist/leaflet.css";

interface MapDualSelectorProps {
  onGooglePlaceSelect: (placeId: string) => void;
  onFoursquareSelect: (venueId: string) => void;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapDualSelector({
  onGooglePlaceSelect,
  onFoursquareSelect,
}: MapDualSelectorProps) {
  // Checkboxes to toggle whether the user wants to see Google or FS
  const [useGoogle, setUseGoogle] = useState(false);
  const [useFoursquare, setUseFoursquare] = useState(false);

  const [googlePlaces, setGooglePlaces] = useState<any[]>([]);
  const [foursquareVenues, setFoursquareVenues] = useState<any[]>([]);

  const [selectedGoogleId, setSelectedGoogleId] = useState("");
  const [selectedFsqId, setSelectedFsqId] = useState("");

  useEffect(() => {
    // Fix Leaflet’s default icon path
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      iconUrl: "/leaflet/marker-icon.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    });
  }, []);

  // Initial map center
  const defaultCenter = { lat: 24.7136, lng: 46.6753 }; // Riyadh, for example

  const handleMapClick = async (lat: number, lng: number) => {
    // Clear existing selections whenever a new map click occurs
    setSelectedGoogleId("");
    setSelectedFsqId("");
    onGooglePlaceSelect("");
    onFoursquareSelect("");

    // We’ll fetch from both APIs in case user decides to check either box
    try {
      // Fetch Google
      const gRes = await fetch(`/api/google/search?lat=${lat}&lng=${lng}`);
      const gData = await gRes.json();
      let gPlaces = gData.places || [];

      // Sort Google places by name
      gPlaces = gPlaces.sort((a: any, b: any) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );
      setGooglePlaces(gPlaces);
    } catch (err) {
      console.error("Error fetching Google places:", err);
      setGooglePlaces([]);
    }

    try {
      // Fetch Foursquare
      const fRes = await fetch(`/api/foursquare/search?lat=${lat}&lng=${lng}`);
      const fData = await fRes.json();
      let fsqVenues = fData.venues || [];

      // Sort FS venues by name
      fsqVenues = fsqVenues.sort((a: any, b: any) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );
      setFoursquareVenues(fsqVenues);
    } catch (err) {
      console.error("Error fetching Foursquare venues:", err);
      setFoursquareVenues([]);
    }
  };

  // Handlers for selecting a place from the dropdown
  const handleGoogleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const placeId = e.target.value;
    setSelectedGoogleId(placeId);
    onGooglePlaceSelect(placeId);
  };

  const handleFoursquareSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const venueId = e.target.value;
    setSelectedFsqId(venueId);
    onFoursquareSelect(venueId);
  };

  return (
    <Box>
      {/* The map */}
      <Box w="100%" h="300px" mb="4">
        <MapContainer
          center={[defaultCenter.lat, defaultCenter.lng]}
          zoom={12}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler onClick={handleMapClick} />
        </MapContainer>
      </Box>

      <VStack align="start" spacing={4}>
        {/* Checkboxes for each provider */}
        <HStack>
          <Checkbox
            isChecked={useGoogle}
            onChange={(e) => setUseGoogle(e.target.checked)}
          >
            Use Google
          </Checkbox>
          <Checkbox
            isChecked={useFoursquare}
            onChange={(e) => setUseFoursquare(e.target.checked)}
          >
            Use Foursquare
          </Checkbox>
        </HStack>

        {/* If "Use Google" is checked and we have places from Google */}
        {useGoogle && googlePlaces.length > 0 && (
          <FormControl>
            <FormLabel>Pick a Google Place:</FormLabel>
            <ChakraSelect
              placeholder="Select a place"
              value={selectedGoogleId}
              onChange={handleGoogleSelect}
            >
              {googlePlaces.map((place) => (
                <option key={place.place_id} value={place.place_id}>
                  {place.name} ({place.place_id})
                </option>
              ))}
            </ChakraSelect>
          </FormControl>
        )}

        {/* If "Use Foursquare" is checked and we have venues from FS */}
        {useFoursquare && foursquareVenues.length > 0 && (
          <FormControl>
            <FormLabel>Pick a Foursquare Venue:</FormLabel>
            <ChakraSelect
              placeholder="Select a venue"
              value={selectedFsqId}
              onChange={handleFoursquareSelect}
            >
              {foursquareVenues.map((venue) => (
                <option key={venue.fsq_id} value={venue.fsq_id}>
                  {venue.name} ({venue.fsq_id})
                </option>
              ))}
            </ChakraSelect>
          </FormControl>
        )}

        {/* If neither returns any results or the user hasn't clicked the map yet */}
        {googlePlaces.length === 0 && foursquareVenues.length === 0 && (
          <Text fontSize="sm" color="gray.500">
            Click on the map to load nearby restaurants, cafes, coffee shops, or bistros.
          </Text>
        )}
      </VStack>
    </Box>
  );
}