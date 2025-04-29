"use client"; 

import { Box, Text, Input, Button, Link } from "@chakra-ui/react";


import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const token = searchParams.get("token");
  const token = searchParams ? searchParams.get("token") : null; // Safely access token
  

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  // const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or expired token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to login page on successful reset
        router.push("/login");
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (error: unknown) {
      setError("Failed to reset password.");
    }
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
      <Box bg="gray.50" shadow="lg"   w="500px" p={10}>
        <Text fontSize="4xl" fontWeight="semibold" color="gray.800" mb={6} textAlign="center">
          Reset Password
        </Text>
        <Text color="gray.600" mb={6} textAlign="center">
          Enter your new password below.
        </Text>

        <form onSubmit={handleSubmit}>
          <Text as="label" display="block" color="gray.700" fontSize="lg" fontWeight="medium" mb={2}>
            New Password<span style={{ color: "red" }}>*</span>
          </Text>
          <Input
            type="password"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            mb={4}
          />

          <Text as="label" display="block" color="gray.700" fontSize="lg" fontWeight="medium" mb={2}>
            Confirm Password<span style={{ color: "red" }}>*</span>
          </Text>
          <Input
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            mb={4}
          />

          {error && (
            <Text color="red.500" mb={4} textAlign="center">
              {error}
            </Text>
          )}

          <Button
            type="submit"
            colorScheme="brand"
            w="full"
            size="lg"
            // isLoading={loading}
            loadingText="Resetting..."
            // disabled={loading}
          >
            Reset Password
          </Button>
        </form>

        <Text color="gray.600" mt={6} textAlign="center">
          Remember your password? {" "}
          <Link href="/login" color="brand.500" _hover={{ color: "brand.700" }}>
            Go back to Login
          </Link>
        </Text>
      </Box>
    </Box>
  );
}





