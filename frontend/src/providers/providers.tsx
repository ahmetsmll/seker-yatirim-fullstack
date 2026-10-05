'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <ChakraProvider value={defaultSystem}>
                {children}
            </ChakraProvider>
        </Provider>
    );
}