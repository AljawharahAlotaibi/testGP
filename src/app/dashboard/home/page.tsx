"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Text,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody
} from "@chakra-ui/react";
import FeatureCard from "@/components/FeatureCard";
import dynamic from "next/dynamic";

// Dynamically import the Leaflet-based map
const MapDualSelector = dynamic(() => import("@/components/MapDualSelector"), {
  ssr: false, // no SSR for Leaflet
});

export default function HomePage() {
  const { data: session, status } = useSession();
  const businessName = session?.user?.businessName || "Guest";
  const googlePlaceId = session?.user?.googlePlaceId;
  const foursquareVenueId = session?.user?.foursquareVenueId;

  // For the location pop-up
  const { isOpen, onOpen, onClose } = useDisclosure();

  // If user has no location set, open the modal automatically
  useEffect(() => {
    if (status === "authenticated") {
      if (!googlePlaceId && !foursquareVenueId) {
        onOpen();
      }
    }
  }, [status, googlePlaceId, foursquareVenueId, onOpen]);

  // Store newly selected IDs from the map
  const [tempGoogleId, setTempGoogleId] = useState("");
  const [tempFoursquareId, setTempFoursquareId] = useState("");

  const handleSaveLocation = async () => {
    try {
      const res = await fetch("/api/user/save-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googlePlaceId: tempGoogleId,
          foursquareVenueId: tempFoursquareId,
        }),
      });
      if (!res.ok) {
        alert("Failed to save location. Please try again.");
        return;
      }
      alert("Location saved!");

      // Optional: Re-login to refresh session with new IDs
      // signIn("credentials", { email: session.user.email, password: "...", redirect: false });

      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving location");
    }
  };

  return (
    <Box maxW="7xl" mx="auto" py={6} px={6}>
      <Text fontSize="4xl" fontWeight="bold" color="white">
        Home
      </Text>
      <Text fontSize="lg" mt={2} color="white">
        Welcome {status === "authenticated" ? businessName : "Guest"}!
      </Text>

      <Flex mt={6} gap={4}>
        {/* Example: If you wanted a "Connect Google" button */}
        <Button colorScheme="blue" onClick={() => window.location.href = "/api/auth/connect-google"}>
          Connect Google Business
        </Button>

        {/* Manually open the location modal */}
        <Button colorScheme="green" onClick={onOpen}>
          Set / Update Business Location
        </Button>

        {/* A simple logout button */}
        <Button colorScheme="red" onClick={() => signOut()}>
          Logout
        </Button>
      </Flex>

      {/* Example Feature Cards */}
      <Box
        mt={10}
        display="grid"
        gridTemplateColumns={["1fr", null, "1fr 1fr 1fr"]}
        gap={10}
      >
        <FeatureCard
          title="Track Your Sales Performance"
          description="Detailed overview of sales..."
          icon="/stats.svg"
          buttonText="View Sales Dashboard"
        />
        <FeatureCard
          title="Understand Customer Feedback"
          description="Analyze customer reviews from Google Maps..."
          icon="/chat.svg"
          buttonText="View Reviews Dashboard"
        />
        <FeatureCard
          title="Boost Your Business with AI"
          description="AI-generated recommendations..."
          icon="/idea.svg"
          buttonText="Check Recommendations"
        />
      </Box>

      {/* Modal for picking location */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Your Business Location</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4}>
              Please select (optional) Google or Foursquare location for your
              business. Click on the map and choose from the dropdown(s).
            </Text>

            {/* Dynamic map with checkboxes */}
            <MapDualSelector
              onGooglePlaceSelect={(id) => setTempGoogleId(id)}
              onFoursquareSelect={(id) => setTempFoursquareId(id)}
            />

            <Flex justify="flex-end" mt={4}>
              <Button colorScheme="blue" onClick={handleSaveLocation}>
                Save
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}