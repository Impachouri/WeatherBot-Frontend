import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  useColorModeValue,
  useBreakpointValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useToast,
  Image
} from '@chakra-ui/react';
import { Outlet, Link } from 'react-router-dom';
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import axios from 'axios';
import { useStore } from './useStore';


function UserProfile({ setAuthData, authData }) {

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState('');
  const [weatherValue, setWeatherValue] = useState('');
  const url = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    async function fetchWeatherKey() {
      try {
        const response = await axios.get(`${url}/api/weather-key`);
        setWeatherValue(response.data);
      } catch (error) {
        toast({
          position: 'top-right',
          description: 'Error in fetching API key.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
        console.error('Error in fetching API key -', error);
      }
    }

    if (isOpen) {
      fetchWeatherKey();
    }
  }, [isOpen, value]);


  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'value') {
      setValue(value);
    }
  };


  const updateEnvVariable = () => {
    if (!value) {
      showToast('Value cannot be empty.', 'warning');
      // showWarningToast('Value cannot be empty.');
      return;
    }

    const url = import.meta.env.VITE_SERVER_URL;

    axios.post(`${url}/api/update-env-variable`, { value })
      .then((response) => {
        if (response.data.message === 'Value cannot be empty.') {
          showToast('Value cannot be empty.', 'warning');
          return;
        }

        showToast('Successfully updated API key.', 'success');
        setValue('');
        console.log(response.data.message);
      })
      .catch((error) => {
        showToast('Error in updating value.', 'error');
      });
  };


  const showToast = (message, status) => {
    toast({
      position: 'top-right',
      description: message,
      status,
      duration: 4000,
      isClosable: true,
    });
  };


  // const updateEnvVariable = () => {
  //   if (!value) {
  //     toast({
  //       position: 'top-right',
  //       description: 'Value cannot be empty.',
  //       status: 'warning',
  //       duration: 4000,
  //       isClosable: true,
  //     });
  //     return;
  //   }

  //   const url = import.meta.env.VITE_SERVER_URL;
  //   axios
  //     .post(`${url}/api/update-env-variable`, { value })
  //     .then((response) => {
  //       if (response.data.message === 'Value cannot be empty.') {
  //         toast({
  //           position: 'top-right',
  //           description: 'Value cannot be empty.',
  //           status: 'warning',
  //           duration: 4000,
  //           isClosable: true,
  //         });
  //         return;
  //       }
  //       toast({
  //         position: 'top-right',
  //         description: 'Successfully updated API key.',
  //         status: 'success',
  //         duration: 4000,
  //         isClosable: true,
  //       });
  //       setValue('');
  //       console.log(response.data.message);
  //     })
  //     .catch((error) => {
  //       toast({
  //         position: 'top-right',
  //         description: 'Error in updating value.',
  //         status: 'error',
  //         duration: 4000,
  //         isClosable: true,
  //       });
  //       console.error('Error updating environment variable', error);
  //     });
  // };


  return (
    <>
      <Text fontSize='2xl' color={'blue.400'} as={'b'} m={'5px'}>
        {authData.data.name}
      </Text>
      <Button
        onClick={onOpen}
        as={'a'}
        fontSize={'sm'}
        fontWeight={600}
        color={'white'}
        bg={'blue.400'}
        href={'#'}
        _hover={{
          bg: 'blue.200',
        }}
      >
        API KEY
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Weather API Key</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              rounded={'lg'}
              bg={useColorModeValue('white', 'gray.700')}
              boxShadow={'lg'}
              p={8}>
              <Stack spacing={4}>
                <FormControl id="apikey">
                  <FormLabel>Current value</FormLabel>
                  <Input type="text" isReadOnly={true} value={weatherValue} />
                </FormControl>
                <FormControl id="newKey">
                  <FormLabel>New API value</FormLabel>
                  <Input type="text"
                    name="value"
                    value={value}
                    onChange={handleInputChange}
                    placeholder="Enter variable value"
                  />
                </FormControl>
                <Stack spacing={10}>
                  <Button
                    onClick={updateEnvVariable}
                    bg={'blue.400'}
                    color={'white'}
                    _hover={{
                      bg: 'blue.500',
                    }}>
                    Update
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Button
        onClick={() => {
          googleLogout();
          localStorage.removeItem("AuthData");
          setAuthData(null);
          window.location.reload();
        }}>
        Logout
      </Button>
    </>
  );
}

function LoginError({ onLogin }) {
  const toast = useToast();
  return (
    <>
      {toast({
        position: 'top-right',
        description: "You are not an authorised Admin.",
        status: 'error',
        duration: 4000,
        isClosable: true,
      })}
      <GoogleLogin
        onSuccess={onLogin}
        onError={onLogin}
        useOneTap
      />
    </>
  );
}

function Navbar() {

  const setAuthData = useStore((state) => state.setAuthData);
  const authData = useStore((state) => state.authData);
  const toast = useToast();

  // Functions for handling login success and error
  const handleLoginSuccess = async (credentialResponse) => {
    console.log(credentialResponse);
    const url = import.meta.env.VITE_SERVER_URL
    const { data } = await axios.post(`${url}/login`, {
      token: credentialResponse.credential,
    });
    localStorage.setItem("AuthData", JSON.stringify(data));
    setAuthData(data);
    // try {
    //   const { data } = await axios.post("http://localhost:3000/login", {
    //     token: credentialResponse.credential,
    //   });
    //   localStorage.setItem("AuthData", JSON.stringify(data));
    //   setAuthData(data);
    // } catch (error) {
    //   console.error("Login Failed", error);
    //   toast({
    //     position: 'top-right',
    //     description: "Yor are not authorised Admin",
    //     status: 'error',
    //     duration: 4000,
    //     isClosable: true,
    //   })
    // }
  };

  const handleLoginError = () => {
    console.error("Login Failed", error);
    toast({
      position: 'top-right',
      description: "Unable to login, please try again.",
      status: 'error',
      duration: 4000,
      isClosable: true,
    })
  }

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
      >
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            color={useColorModeValue('gray.800', 'white')}
          >
            <Link to={''}>
              <Image boxSize='70px' src="telegramLogo.png"></Image>
            </Link>
          </Text>
        </Flex>
        <Stack
          flex={{ base: 1, md: 1 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >
          {authData ? (
            authData.message === 'success' ? (
              <UserProfile
                authData={authData}
                setAuthData={setAuthData}
              />
            ) : (
              <LoginError onLogin={handleLoginSuccess} />
            )
          ) : (
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              useOneTap
            />
          )}
        </Stack>
      </Flex>
      <Outlet />
    </Box>
  );
}

export default Navbar;
