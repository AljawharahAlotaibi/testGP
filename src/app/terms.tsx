// pages/terms.tsx
import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const TermsPage: React.FC = () => {
  return (
    <Box p={8} maxW="800px" mx="auto">
      <Heading as="h1" mb={4}>
        Terms & Conditions
      </Heading>
      <Text mb={4}>
        {/* 
          Replace the placeholder text below with your real Terms & Conditions.
          You can break them into headings, paragraphs, lists, etc.
        */}
        These Terms & Conditions (“Terms”) govern your access to and use of our services. 
        By using our service, you agree to be bound by these Terms...
      </Text>

      <Heading as="h2" size="md" mt={6} mb={2}>
        1. Introduction
      </Heading>
      <Text mb={4}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu massa...
      </Text>

      <Heading as="h2" size="md" mt={6} mb={2}>
        2. Your obligations
      </Heading>
      <Text mb={4}>
        Aenean feugiat lacus at vehicula semper. Sed at neque at justo ullamcorper...
      </Text>

      {/* ...and so forth... */}
    </Box>
  );
};

export default TermsPage;