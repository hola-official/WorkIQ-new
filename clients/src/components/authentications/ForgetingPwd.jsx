import {
  Button,
  FormControl,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { useAxiosInstance } from "/api/axios";
import useShowToast from "../../hooks/useShowToast";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const ForgetingPwd = () => {
  const [email, setEmail] = useState("");
  const axiosInstance = useAxiosInstance();
  const {showToast} = useShowToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axiosInstance.post(
        "/auth/reset-password",
        JSON.stringify({ email })
      );
      if (!response) {
        console.log(response.error)
      }
      showToast('success', 'Reset password link sent to your email', 'success');
      // setTimeout(()=>{navigate('/login')},2000);
      navigate('/activate-form')
    } catch (error) {
      if (error?.response?.status === 404) {
        showToast(
          "Error",
          "You need to be registered",
          "error"
        );
      }
      console.log(error.response);
    }
  }

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack
        spacing={4}
        w={'full'}
        maxW={'md'}
        bg={useColorModeValue('white', 'gray.700')}
        rounded={'xl'}
        boxShadow={'lg'}
        p={6}
        my={12}>
        <Heading lineHeight={1.1} fontSize={{ base: '2xl', md: '3xl' }}>
          Forgot your password?
        </Heading>
        <Text
          fontSize={{ base: 'sm', sm: 'md' }}
          color={useColorModeValue('gray.800', 'gray.400')}>
          You&apos;ll get an email with a reset link
        </Text>

        <FormControl id="email">
          <Input
            placeholder="your-email@example.com"
            _placeholder={{ color: 'gray.500' }}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </FormControl>
        <Stack spacing={6}>
          <Button
            bg={'blue.400'}
            color={'white'}
            type='submit'
            onClick={handleSubmit}
            _hover={{
              bg: 'blue.500',
            }}>
            Request Reset
          </Button>
        </Stack>
      </Stack>
    </Flex>
  )
}

export default ForgetingPwd