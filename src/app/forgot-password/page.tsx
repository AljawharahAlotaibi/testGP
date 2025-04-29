"use client";
import { useState } from "react";
import { Box, Text, Input, Button, Link } from "@chakra-ui/react";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      console.log(email);
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Password reset link sent successfully. Check your email.");
      } else {
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setMessage("Error sending request. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <Box
      bgGradient="radial-gradient(circle at center, #8085F5 0%, rgba(93, 93, 93, 0.94) 100%)"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={12}
      px={{ base: 4, sm: 6, lg: 8 }}
    >
      <Box bg="gray.50" shadow="lg"  w="500px" p={10}>
        <Text fontSize="4xl" fontWeight="semibold" color="gray.800" mb={6} textAlign="center">
          Forgot Password?
        </Text>
        <Text color="gray.600" mb={6} textAlign="center">
          Enter your email to receive a password reset link.
        </Text>

        <form onSubmit={handleSubmit}>
          <Text as="label" display="block" color="gray.700" fontSize="lg" fontWeight="medium" mb={2}>
            Email<span style={{ color: "red" }}>*</span>
          </Text>
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            mb={4}
          />

          <Button
            type="submit"
            colorScheme="brand"
            w="full"
            size="lg"
            isLoading={loading}
            loadingText="Sending..."
            disabled={loading}
          >
            Send Reset Link
          </Button>
        </form>

        {message && (
          <Text mt={4} textAlign="center" color="gray.700">
            {message}
          </Text>
        )}

        <Text color="gray.600" mt={6} textAlign="center">
          Remember your password?{" "}
          <Link href="/login" color="brand.500" _hover={{ color: "brand.700" }}>
            Go back to Login
          </Link>
        </Text>
      </Box>
    </Box>
  );
}
