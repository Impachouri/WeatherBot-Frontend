import {
    Box,
    Button,
    Input,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Tooltip,
    useToast,
} from "@chakra-ui/react";
import { NotAllowedIcon, DeleteIcon } from '@chakra-ui/icons';
import axios from 'axios';
import React, { useEffect, useState } from "react";
import { useStore } from './useStore';

const Admin = () => {
    const toast = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);

    const authData = useStore((state) => state.authData);
    const url = import.meta.env.VITE_SERVER_URL;

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const highlightSearchTerm = (text, searchTerm) => {
        const regex = new RegExp(searchTerm, 'gi');
        return text.replace(regex, match => `<mark style="background-color: orange; font-weight: bold;">${match}</mark>`);
    };

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${url}/users`);
            setUsers(response.data);
        } catch (error) {
            console.log("Error in fetching users", error);
        }
    };

    const blockUser = async (id, data) => {
        if (id) {
            const updatedUsers = users.map((user) =>
                user._id === id ? { ...user, isBlock: data } : user
            );

            setUsers(updatedUsers);

            axios
                .put(`${url}/users/${id}`, { isBlock: `${data}` })
                .then((response) => {
                    if (response.status === 200) {
                        toast({
                            position: 'top-right',
                            title: data === true ? 'Blocked.' : 'Unblocked',
                            description: 'User blocked from Subscription',
                            status: 'success',
                            duration: 4000,
                            isClosable: true,
                        });
                    }
                })
                .catch((error) => {
                    toast({
                        position: 'top-right',
                        description: 'Failed to block.',
                        status: 'error',
                        duration: 4000,
                        isClosable: true,
                    });
                    console.log('Error:', error);
                });
        }
    };

    const deleteUser = async (id) => {
        if (id) {
            const updatedUsers = users.filter((user) => user._id !== id);

            setUsers(updatedUsers);

            axios
                .delete(`${url}/users/${id}`)
                .then((response) => {
                    if (response.status === 200) {
                        toast({
                            position: 'top-right',
                            title: 'Deleted.',
                            description: 'User Deleted.',
                            status: 'success',
                            duration: 4000,
                            isClosable: true,
                        });
                    }
                })
                .catch((error) => {
                    toast({
                        position: 'top-right',
                        description: 'Failed to Delete.',
                        status: 'error',
                        duration: 4000,
                        isClosable: true,
                    });
                    console.log('Error:', error);
                });
        }
    };


    useEffect(() => {
        fetchUser();
    }, []);

    if (!authData || authData.message !== 'success') {
        return (
            <Box py={'20%'} px={'40%'}>
                <Text>Please Login First.</Text>
            </Box>
        );
    }


    return (
        <Box m={'50px'}>
            <Box display="flex" justifyContent="flex-end" alignItems="center">
                <Box flex="1/8" mr={6}>
                    <Input placeholder="Search" value={searchQuery} onChange={handleSearch} />
                </Box>
            </Box>
            <Box borderWidth="1px" borderRadius="lg" mx={6} my={15} overflow="auto">
                <TableContainer>
                    <Table variant='simple'>
                        <Thead>
                            <Tr color='teal.500'>
                                <Th>ChatId</Th>
                                <Th>City</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {users.map((user) => (
                                <Tr key={user.createdAt}>
                                    <Td>{user.chatId}</Td>
                                    <Td>
                                        <span dangerouslySetInnerHTML={{ __html: highlightSearchTerm(user.city, searchQuery) }} />
                                    </Td>
                                    <Td>
                                        <Tooltip label='Block Subscription'>
                                            <Button mx={'5px'} onClick={() => blockUser(user._id, !user.isBlock)} color={user.isBlock ? 'red' : 'green'}>
                                                <NotAllowedIcon />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip label='Delete User'>
                                            <Button onClick={() => deleteUser(user._id)} color='red'>
                                                <DeleteIcon />
                                            </Button>
                                        </Tooltip>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default Admin;
