'use client';

import React from 'react';
import { NativeSelect, Skeleton, Text, Stack } from '@chakra-ui/react';
import { useGetCustomerLookupQuery } from '@/store/api/customerApi';

interface CustomerSelectProps {
    value: string | number;
    onChange: (value: string) => void;
    isInvalid?: boolean;
    isDisabled?: boolean;
}

export const CustomerSelect: React.FC<CustomerSelectProps> = ({
                                                                  value,
                                                                  onChange,
                                                                  isInvalid = false,
                                                                  isDisabled = false,
                                                              }) => {

    // RTK Query ile veriyi çekiyoruz
    const { data: customers, isLoading, isError } = useGetCustomerLookupQuery();

    // 1. Durum: Yüklenme anı (Skeleton Görünümü)
    if (isLoading) {
        return <Skeleton height="40px" borderRadius="md" />;
    }

    // 2. Durum: Hata anı
    if (isError) {
        return (
            <Text color="red.500" fontSize="sm">
                Müşteri listesi alınamadı. Lütfen sayfayı yenileyin.
            </Text>
        );
    }

    // 3. Durum: Başarılı Veri Akışı
    return (
        <NativeSelect.Root invalid={isInvalid} disabled={isDisabled}>
            <NativeSelect.Field
                placeholder="-- Müşteri Seçiniz --"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {customers?.map((customer) => (
                    <option key={customer.customerId} value={customer.customerId}>
                        {customer.firstName} {customer.lastName} — TCKN: {customer.trIdentityNo}
                    </option>
                ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
        </NativeSelect.Root>
    );
};