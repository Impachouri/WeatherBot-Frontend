import { useToast } from "@chakra-ui/react";

export const showToast = (message, status) => {

    return toast({
        position: 'top-right',
        description: message,
        status,
        duration: 4000,
        isClosable: true,
    });
};
