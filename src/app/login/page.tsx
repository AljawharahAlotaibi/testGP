"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Button,
  Input,
  Box,
  Text,
  Link,
  Checkbox,
  useToast,
} from "@chakra-ui/react";

import { useRouter } from "next/navigation"; 
import { signIn } from "next-auth/react";  

export default function Login() {
  const router = useRouter(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isClient, setIsClient] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Prevents hydration mismatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const result = await signIn("credentials", {
      redirect: false,  
      email,
      password,
      callbackUrl: "/dashboard/home",
    });

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess("Login successful!");
      toast({
        title: "Login successful!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/dashboard/home"); 
     
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
      <Box
        bg="white"
        shadow="lg"
        w="800px"
        maxW="4xl"
        overflow="hidden"
        display="flex"
      >
        {/* Left Side - Login Form */}
        <Box w="50%" bg="gray.50" p={10}>
          <Text
            fontSize="4xl"
            fontWeight="semibold"
            color="gray.800"
            mb={6}
            textAlign="center"
          >
            Welcome Back
          </Text>
          <Text color="gray.600" mb={6} textAlign="center">
            Log in to access your dashboard and stay on top of your business
            performance.
          </Text>

          {error && (
            <Text color="red.500" textAlign="center">
              {error}
            </Text>
          )}
          {success && (
            <Text color="green.500" textAlign="center">
              {success}
            </Text>
          )}

          <form onSubmit={handleSubmit}>
            <Text
              as="label"
              display="block"
              color="gray.700"
              fontSize="lg"
              fontWeight="medium"
              mb={2}
            >
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

            <Text
              as="label"
              display="block"
              color="gray.700"
              fontSize="lg"
              fontWeight="medium"
              mb={2}
            >
              Password<span style={{ color: "red" }}>*</span>
            </Text>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              mb={4}
            />

            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={6}
            >
              <Checkbox colorScheme="brand">Remember me</Checkbox>
              <Link
                href="/forgot-password"
                color="brand.500"
                _hover={{ color: "brand.700" }}
              >
                Forgot Password?
              </Link>
            </Box>

            <Button type="submit" colorScheme="brand" w="full" size="lg">
              Log in
            </Button>
          </form>

          <Text color="gray.600" mt={6} textAlign="center">
            Don’t have an account?{" "}
            <Link
              href="/register"
              color="brand.500"
              _hover={{ color: "brand.700" }}
            >
              Register
            </Link>
          </Text>
        </Box>

        {/* Right Side - Image */}
        <Box
          w="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={8}
        >
          <Image
            src="/login-pic.png"
            alt="Luxury Illustration"
            width={300}
            height={300}
            style={{ objectFit: "contain" }}
          />
        </Box>
      </Box>
    </Box>
  );
}
