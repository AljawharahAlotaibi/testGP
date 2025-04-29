// app/register/page.tsx
"use client";
import { signIn } from "next-auth/react";
import React, { useState, useEffect, FormEvent, useRef } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Circle,
  Select,
  List,
  ListItem,
  ListIcon,
  Link as ChakraLink,
  Avatar
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { FaPen } from 'react-icons/fa'; // Pin icon from react-icons
import dynamic from "next/dynamic";
const MapDualSelector = dynamic(() => import("@/components/MapDualSelector"), {
  ssr: false,
});

interface PhoneCodeOption {
  label: string;
  value: string;
}

interface PwChecks {
  length: boolean;
  upper: boolean;
  digit: boolean;
  special: boolean;
}

const validatePassword = (pwd: string): PwChecks => {
  return {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    digit: /\d/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
};

const RegisterPage: React.FC = () => {
  // -----------------------------
  // Steps
  // -----------------------------
  const [currentStep, setCurrentStep] = useState<number>(1);

  // -----------------------------
  // Step 1 (required fields)
  // -----------------------------
  const [email, setEmail] = useState<string>('');
  const [phoneCode, setPhoneCode] = useState<string>('KSA+966');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

  // -----------------------------
  // Step 2 (optional fields)
  // -----------------------------
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>(''); 
  const [businessName, setBusinessName] = useState<string>('');
  const [menuFile, setMenuFile] = useState<File | null>(null);
  // New fields for map-based location selection
  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [foursquareVenueId, setFoursquareVenueId] = useState("");

  // -----------------------------
  // UI State
  // -----------------------------
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Predefined phone code options
  const phoneCodeOptions: PhoneCodeOption[] = [
    { label: 'KSA (+966)', value: 'KSA+966' },
    { label: 'UAE (+971)', value: 'UAE+971' },
    { label: 'USA (+1)',   value: 'USA+1'   },
    { label: 'UK (+44)',   value: 'UK+44'   },
  ];

  // -----------------------------
  // Password checks
  // -----------------------------
  const [pwChecks, setPwChecks] = useState<PwChecks>({
    length: false,
    upper: false,
    digit: false,
    special: false,
  });

  useEffect(() => {
    setPwChecks(validatePassword(password));
  }, [password]);

  const renderCheck = (conditionMet: boolean) =>
    conditionMet ? (
      <ListIcon as={CheckIcon} color="green.500" />
    ) : (
      <ListIcon as={CloseIcon} color="red.500" />
    );

  // -----------------------------
  // Step Indicator
  // -----------------------------
  const StepIndicator: React.FC = () => {
    const isStep1Active = currentStep >= 1;
    const isStep2Active = currentStep >= 2;
    return (
      <Flex align="center" justify="center" mb={6}>
        {/* Step 1 circle */}
        <Circle
          size="32px"
          bg={isStep1Active ? 'brand.500' : 'gray.300'}
          color="white"
          fontWeight="bold"
        >
          1
        </Circle>
        {/* line */}
        <Box
          flex="0 0 60px"
          height="2px"
          bg={isStep2Active ? 'brand.500' : 'gray.300'}
          mx={3}
        />
        {/* Step 2 circle */}
        <Circle
          size="32px"
          bg={isStep2Active ? 'brand.500' : 'gray.300'}
          color="white"
          fontWeight="bold"
        >
          2
        </Circle>
      </Flex>
    );
  };

  // -----------------------------
  // Step Handlers
  // -----------------------------
  const handleNextStep = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Basic required checks
    if (!email || !phoneNumber || !password || !confirmPassword) {
      setError('Please fill out all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const checks = validatePassword(password);
    const allPass = Object.values(checks).every(Boolean);
    if (!allPass) {
      setError('Password does not meet all requirements.');
      return;
    }
    if (!acceptedTerms) {
      setError('You must accept the terms & conditions.');
      return;
    }
    // Move to step 2
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setError('');
    setCurrentStep(1);
  };

  // -----------------------------
  // Profile Photo Handling
  // -----------------------------
  const hiddenFileInput = useRef<HTMLInputElement | null>(null);

  // Clicking the icon or avatar triggers the hidden file input
  const handleAvatarClick = () => {
    hiddenFileInput.current?.click();
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setProfilePhotoFile(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
    } else {
      setProfilePhotoFile(null);
      setProfilePhotoPreview('');
    }
  };

  // -----------------------------
  // Final Submit (Finish)
  // -----------------------------
  const handleFinish = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Combine phone code + phone number
      const phone = `${phoneCode}-${phoneNumber}`;

      // In real usage, you'd do a multipart/form-data post
      // to actually upload the files. 
      // For this example, we just send file names to /api/auth/register.
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone,
          password,
          acceptedTerms,
          businessName,
          // If we selected a file, use its name. Otherwise, empty string.
          profilePhotoPath: profilePhotoFile?.name || '',
          menuFilePath: menuFile?.name || '',
          googlePlaceId,
          foursquareVenueId,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed.');
        return;
      } 
      const result = await signIn("credentials", {
        redirect: false,  
        email,
        password,
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      window.location.href = "/dashboard/home";

    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------------------
  // Renders: Step 1 / Step 2
  // -----------------------------
  const renderStep1 = () => (
    <form onSubmit={handleNextStep}>
      {error && (
        <Text color="red.500" mb={4}>
          {error}
        </Text>
      )}
      <Stack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        {/* Phone code + phone number */}
        <Flex gap={2}>
          <FormControl w="180px" isRequired>
            <FormLabel>Code</FormLabel>
            <Select
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
            >
              {phoneCodeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Phone Number</FormLabel>
            <Input
              type="text"
              placeholder="e.g. 555123456"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </FormControl>
        </Flex>

        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password.length > 0 && (
            <Box mt={2} ml={1}>
              <Text fontSize="sm" mb={1} fontWeight="semibold">
                Password must have:
              </Text>
              <List spacing={1} fontSize="sm">
                <ListItem>
                  {renderCheck(pwChecks.length)} at least 8 characters
                </ListItem>
                <ListItem>
                  {renderCheck(pwChecks.upper)} at least one uppercase letter
                </ListItem>
                <ListItem>
                  {renderCheck(pwChecks.digit)} at least one digit
                </ListItem>
                <ListItem>
                  {renderCheck(pwChecks.special)} at least one special character
                </ListItem>
              </List>
            </Box>
          )}
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <Input
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FormControl>

        <Checkbox
          isChecked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
        >
          I agree to{' '}
          <ChakraLink
            href="/terms"
            color="brand.500"
            textDecoration="underline"
            _hover={{ textDecoration: 'underline' }}
          >
            terms & conditions
          </ChakraLink>
        </Checkbox>

        <Button type="submit" colorScheme="brand">
          Next
        </Button>
      </Stack>

      {/* Already have an account? Log in */}
      <Box textAlign="center" mt={4}>
        <Text>
          Already have an account?{' '}
          <ChakraLink href="/login" color="brand.500" textDecoration="underline">
            Log in
          </ChakraLink>
        </Text>
      </Box>
    </form>
  );

  const renderStep2 = () => (
    <Box>
      {error && (
        <Text color="red.500" mb={4}>
          {error}
        </Text>
      )}
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>Business Profile Photo (Optional)</FormLabel>
          <Box position="relative" display="inline-block" mb={2}>
            <Avatar
              size="2xl"
              src={profilePhotoPreview || '/default-profile.png'}
              cursor="pointer"
              onClick={handleAvatarClick}
            />
            <Box
              position="absolute"
              bottom="2"
              right="2"
              bg="white"
              borderRadius="full"
              boxShadow="md"
              p="2"
              cursor="pointer"
              onClick={handleAvatarClick}
            >
              <FaPen color="#6067f2" />
            </Box>
          </Box>
          <Input
            type="file"
            accept="image/*"
            ref={hiddenFileInput}
            onChange={handleProfilePhotoChange}
            display="none"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Business Name (Optional)</FormLabel>
          <Input
            type="text"
            placeholder="Your business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Menu (Optional)</FormLabel>
          <Input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setMenuFile(e.target.files?.[0] ?? null)}
          />
          {menuFile && (
            <Text fontSize="sm" mt={1}>
              Selected: {menuFile.name}
            </Text>
          )}
        </FormControl>

        {/* Map-based location selection */}
        <Box>
          <Text fontWeight="semibold" mb={2}>
            Select your location (Optional)
          </Text>
          <MapDualSelector
            onGooglePlaceSelect={(id) => setGooglePlaceId(id)}
            onFoursquareSelect={(id) => setFoursquareVenueId(id)}
          />
          <Text fontSize="sm" color="gray.600" mt={2}>
            Google Place ID: {googlePlaceId || 'None'}
          </Text>
          <Text fontSize="sm" color="gray.600">
            Foursquare Venue ID: {foursquareVenueId || 'None'}
          </Text>
        </Box>

        <Flex gap={3}>
          <Button variant="outline" onClick={handlePreviousStep}>
            Previous
          </Button>
          <Button colorScheme="brand" onClick={handleFinish} isLoading={isSubmitting}>
            Finish
          </Button>
        </Flex>
      </Stack>

      <Box textAlign="center" mt={4}>
        <Text>
          Already have an account?{' '}
          <ChakraLink href="/login" color="brand.500" textDecoration="underline">
            Log in
          </ChakraLink>
        </Text>
      </Box>
    </Box>
  );

  return (
    <Flex
      minH="100vh"
      bgGradient="radial-gradient(circle at center, #8085F5 0%, rgba(93, 93, 93, 0.94) 100%)"
      align="center"
      justify="center"
      p={4}
    >
      <Box
        w="full"
        maxW="1000px"
        bg="white"
        boxShadow="lg"
        rounded="md"
        overflow="hidden"
      >
        <Flex direction={{ base: 'column', md: 'row' }} align="stretch" w="full">
          {/* Left Section (Form) */}
          <Box
            flex={{ base: 'unset', md: 2 }}
            bg="gray.50"
            p={{ base: 6, md: 10 }}
          >
            <Heading as="h1" size="lg" mb={2} textAlign="center">
              Register
            </Heading>
            <Text fontSize="md" color="gray.600" textAlign="center" mb={6}>
              Register your business and start managing insights with ease
            </Text>

            <StepIndicator />

            <Heading as="h2" size="md" mb={6} textAlign="center">
              {currentStep === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
            </Heading>

            {currentStep === 1 ? renderStep1() : renderStep2()}
          </Box>

          {/* Right Section (Image/Welcome) */}
          <Box
            flex={{ base: 'unset', md: 1 }}
            bg="white"
            p={{ base: 6, md: 10 }}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box textAlign="center">
              <Text mb={4} fontSize="lg" fontWeight="bold">
                Welcome!
              </Text>
              <Box
                as="img"
                src="/signup.png"
                alt="Signup"
                maxW="280px"
                mx="auto"
                borderRadius="md"
              />
            </Box>
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
};

export default RegisterPage;