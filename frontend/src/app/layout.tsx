import type { Metadata } from 'next';
import { Providers } from '@/providers/providers';
import { Sidebar } from '@/components/Sidebar';
import { Box } from '@chakra-ui/react';

export const metadata: Metadata = {
  title: 'Şeker Yatırım - API Yönetim Paneli',
  description: 'Spring Boot & Next.js Management Dashboard',
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="tr">
      <body style={{ margin: 0, backgroundColor: '#F7FAFC' }}>
      <Providers>
        <Box display="flex">
          <Sidebar />
          <Box ml="260px" w="calc(100% - 260px)" p={8} minH="100vh">
            {children}
          </Box>
        </Box>
      </Providers>
      </body>
      </html>
  );
}