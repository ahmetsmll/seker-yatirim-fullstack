'use client';

import { Box, VStack, Text, HStack, Separator } from '@chakra-ui/react';
import { FiUsers, FiCreditCard, FiMapPin, FiFileText, FiClock, FiCheckSquare } from 'react-icons/fi';
import Link from 'next/link';

const menuItems = [
    { name: 'Müşteriler', icon: FiUsers, href: '/customers' },
    { name: 'Hesaplar', icon: FiCreditCard, href: '/accounts' },
    { name: 'Adresler', icon: FiMapPin, href: '/addresses' },
    { name: 'Sözleşmeler', icon: FiFileText, href: '/contracts' },
    { name: 'Mesai Saatleri', icon: FiClock, href: '/business-hours' },
    { name: 'Halka Arz Onayları', icon: FiCheckSquare, href: '/ipo-approvals' },
];

export function Sidebar() {
    return (
        <Box w="260px" bg="gray.900" color="white" h="100vh" p={5} pos="fixed" left={0} top={0}>
            <Link href="/">
                <Text fontSize="xl" fontWeight="bold" color="red.400" mb={6}>
                    Şeker Yatırım
                </Text>
            </Link>
            <Separator mb={6} borderColor="gray.700" />
            <VStack align="stretch" gap={2}>
                {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <Link key={item.name} href={item.href}>
                            <HStack
                                p={3}
                                borderRadius="md"
                                _hover={{ bg: 'red.500', color: 'white' }}
                                transition="all 0.2s"
                                cursor="pointer"
                            >
                                <IconComponent size={18} />
                                <Text fontWeight="medium">{item.name}</Text>
                            </HStack>
                        </Link>
                    );
                })}
            </VStack>
        </Box>
    );
}