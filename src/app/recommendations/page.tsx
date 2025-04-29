"use client";
import { useState, useEffect } from "react";
import { Box, Text, Button, Input, Stack, useToast, Container } from "@chakra-ui/react";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState("2024-01-01");
  const [toDate, setToDate] = useState("2025-01-01");
  const toast = useToast();

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch("/api/get-recommendations");
        const data = await response.json();

        if (response.ok) {
          setRecommendations(data.recommendations);
          filterRecommendationsByDuration(data.recommendations);
        } else {
          setError(data.error || "Something went wrong.");
        }
      } catch (error: unknown) {
        setError("Failed to fetch recommendations.");
      }
    }

    fetchRecommendations();
  }, []);

  const filterRecommendationsByDuration = (data: any[]) => {
    const filtered = data.filter(
      (rec) => rec.date >= fromDate && rec.date <= toDate
    );
    setFilteredRecommendations(filtered);
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(e.target.value);
    filterRecommendationsByDuration(recommendations);
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToDate(e.target.value);
    filterRecommendationsByDuration(recommendations);
  };

  return (
    <Container maxW="7xl" p={4}>
      <Box
        bg="white"
        borderRadius="lg"
        shadow="lg"
        p={8}
        mb={6}
        display="flex"
        flexDirection="column"
      >
        <Stack direction="row" justify="space-between" align="center" mb={6}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Recommendations
          </Text>

          <Stack direction="row" spacing={4}>
            <Text color="gray.600">From:</Text>
            <Input
              type="date"
              value={fromDate}
              onChange={handleFromDateChange}
              width="180px"
              size="sm"
              colorScheme="purple"
            />
            <Text color="gray.600">To:</Text>
            <Input
              type="date"
              value={toDate}
              onChange={handleToDateChange}
              width="180px"
              size="sm"
              colorScheme="purple"
            />
          </Stack>
        </Stack>

        <Text color="gray.600" mb={6} textAlign="center">
          Recommendations generated from Cohere for the reviews received in the
          specified duration.
        </Text>

        <Stack spacing={6}>
          {error && (
            <Box
              bg="red.50"
              color="red.700"
              p={4}
              borderRadius="md"
              borderWidth="1px"
              mb={4}
            >
              {error}
            </Box>
          )}

          {filteredRecommendations.length === 0 ? (
            <Text color="gray.500" textAlign="center">
              No recommendations available for the selected duration.
            </Text>
          ) : (
            filteredRecommendations.map((rec, index) => (
              <Box
                key={index}
                bg="white"
                borderRadius="xl"
                p={6}
                boxShadow="xl"
                mb={4}
                borderWidth="1px"
                borderColor="gray.200"
                maxH="400px" // Set a max height for the card
                overflowY="auto" // Enable scroll when content overflows
              >
                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                  {rec.title}
                </Text>
                <Text color="gray.600" mt={2}>
                  <strong>Problem:</strong> {rec.problem}
                </Text>
                <Text color="gray.600" mt={2}>
                  <strong>Recommendation:</strong> {rec.recommendation}
                </Text>
              </Box>
            ))
          )}

          <Button
            colorScheme="purple"
            size="lg"
            width="full"
            mt={4}
            onClick={() => {
              toast({
                title: "Recommendation Data",
                description: "Recommendations are filtered successfully.",
                status: "success",
                duration: 4000,
                isClosable: true,
              });
            }}
          >
            Refresh Recommendations
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
