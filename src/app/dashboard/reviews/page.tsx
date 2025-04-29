"use client";

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
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
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const MapDualSelector = dynamic(() => import("@/components/MapDualSelector"), {
  ssr: false
});

// The analyzed review type:
type AnalyzedReview = {
  _id: string;
  source: "google" | "foursquare";
  placeId: string;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  authorName?: string;
  rating?: number;
  // store real date from your DB
  reviewDate?: string; // or Date
};

export default function ReviewsPage() {
  const { data: session, status } = useSession();

  const [reviews, setReviews] = useState<AnalyzedReview[]>([]);
  const [filter, setFilter] = useState<"all"|"positive"|"neutral"|"negative">("all");

  // For the pop-up
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Selected from the Map
  const [tempGoogleId, setTempGoogleId] = useState("");
  const [tempFoursquareId, setTempFoursquareId] = useState("");

  // If user has no location, open modal
  useEffect(() => {
    if (status === "authenticated") {
      const gId = session?.user?.googlePlaceId;
      const fId = session?.user?.foursquareVenueId;
      if (!gId && !fId) {
        onOpen();
      }
    }
  }, [status, session, onOpen]);

  // On mount, also fetch the analyzed reviews
  useEffect(() => {
    if (status === "authenticated") {
      loadAnalyzedReviews();
    }
  }, [status]);

  async function loadAnalyzedReviews() {
    try {
      const res = await fetch("/api/reviews/analyzed"); // your route returning final data
      if (!res.ok) {
        console.error("Failed to load analyzed reviews");
        return;
      }
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  }

  // Called after user picks location in the modal
  async function handleSaveLocation() {
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
        alert("Failed to save location");
        return;
      }
      alert("Location saved. Reload or re-signIn to refresh your session!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving location");
    }
  }

  // "Fetch More" means fetch raw from google/foursquare, then analyze
  async function handleFetchMore() {
    try {
      // (Pseudo) fetch from google
      const gRes = await fetch("/api/google/fetch-and-store-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // pass placeId if needed
        body: JSON.stringify({ placeId: session?.user.googlePlaceId }),
      });
      // fetch from fs
      const fRes = await fetch("/api/foursquare/fetch-and-store-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueId: session?.user.foursquareVenueId }),
      });

      // then analyze
      const analyzeRes = await fetch("/api/reviews/analyze", { method: "POST" });
      if (!analyzeRes.ok) {
        console.error("Failed to analyze");
      }

      // reload final
      await loadAnalyzedReviews();
    } catch (err) {
      console.error(err);
    }
  }

  // Filter
  const filteredReviews = filter === "all"
    ? reviews
    : reviews.filter(r => r.sentiment === filter);

  const counts = {
    positive: reviews.filter(r => r.sentiment === "positive").length,
    neutral: reviews.filter(r => r.sentiment === "neutral").length,
    negative: reviews.filter(r => r.sentiment === "negative").length,
  };

  const pieData = {
    labels: ["Positive", "Negative", "Neutral"],
    datasets: [
      {
        data: [counts.positive, counts.negative, counts.neutral],
        backgroundColor: ["#22c55e", "#ef4444", "#eab308"],
      },
    ],
  };

  // Build monthly sentiment dataset dynamically
  const monthlySentiments = reviews.reduce((acc, review) => {
    const month = new Date(review.text).toLocaleString('default', { month: 'short' }); // 'Apr'
    if (!acc[month]) {
      acc[month] = { positive: 0, neutral: 0, negative: 0 };
    }
    acc[month][review.sentiment]++;
    return acc;
  }, {} as Record<string, { positive: number; neutral: number; negative: number }>);


  // monthly data
  const monthlyData = reviews.reduce((acc, rev) => {
    if (!rev.reviewDate) return acc;
    const d = new Date(rev.reviewDate);
    const mon = d.toLocaleString("default", { month: "short" });
    if (!acc[mon]) acc[mon] = { positive: 0, neutral: 0, negative: 0 };
    acc[mon][rev.sentiment]++;
    return acc;
  }, {} as Record<string,{positive: number; neutral: number; negative: number}>);

  const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthLabels = monthOrder.filter(m => monthlyData[m]);
  const barData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Neutral',
        backgroundColor: '#eab308',
        data: monthLabels.map(month => monthlySentiments[month]?.neutral || 0),
      },
      {
        label: 'Negative',
        backgroundColor: '#ef4444',
        data: monthLabels.map(month => monthlySentiments[month]?.negative || 0),
      },
      {
        label: 'Positive',
        backgroundColor: '#22c55e',
        data: monthLabels.map(month => monthlySentiments[month]?.positive || 0),
      },
    ],
  };

  return (
    <Box p={4}>
      <Text fontSize="3xl" fontWeight="bold" color="white" textAlign="center">
        Reviews Dashboard
      </Text>

      {/* Filter buttons */}
      <Flex justify="center" gap={4} mt={6} mb={4}>
        {["all","positive","neutral","negative"].map(f => (
          <Button
            key={f}
            onClick={() => setFilter(f as any)}
          >
            {f}
          </Button>
        ))}
      </Flex>

      <Flex justify="center" mb={6}>
        <Button colorScheme="blue" onClick={handleFetchMore}>
          Fetch More Reviews
        </Button>
      </Flex>

      <Flex gap={6}>
        {/* list of reviews */}
        <Box flex="1" maxH="500px" overflowY="auto">
          {filteredReviews.map(r => {
            const borderColor = r.sentiment === "positive"
              ? "border-green-500"
              : r.sentiment === "neutral"
              ? "border-yellow-400"
              : "border-red-500";
            return (
              <Box
                key={r._id}
                className={`bg-white text-black p-4 rounded border-l-4 mb-3 ${borderColor}`}
              >
                <Text fontWeight="semibold">{r.authorName || "Anonymous"}</Text>
                <Text fontSize="sm">{r.text}</Text>
                {r.reviewDate && (
                  <Text fontSize="xs" color="gray.600">
                    {new Date(r.reviewDate).toLocaleDateString()}
                  </Text>
                )}
              </Box>
            );
          })}
        </Box>

        {/* charts */}
        <Box flex="1" display="flex" flexDir="column" gap={4}>
          <Box bg="white" p={4} rounded="md" textColor="black">
            <Text fontWeight="bold" mb={2}>Sentiment Distribution</Text>
            <Pie data={pieData} />
          </Box>
          <Box bg="white" p={4} rounded="md" textColor="black">
            <Text fontWeight="bold" mb={2}>Reviews Over Time</Text>
            <Bar data={barData} />
          </Box>
        </Box>
      </Flex>

      {/* 
        The location modal 
        Same style as your "HomePage" snippet 
      */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Your Business Location</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4}>
              Please select Google or Foursquare location for your business. 
              Click on the map and choose from the dropdown(s).
            </Text>

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
