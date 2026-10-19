import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Tip Tanımlaması
export interface CustomerOption {
    customerId: number;
    firstName: string;
    lastName: string;
    trIdentityNo: string;
}

export const customerApi = createApi({
    reducerPath: 'customerApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8080/api/customers' }),
    tagTypes: ['Customer'],
    endpoints: (builder) => ({
        // Lookup verilerini çeken Query
        getCustomerLookup: builder.query<CustomerOption[], void>({
            query: () => '/lookup',
            // Veriyi 5 dakika boyunca Redux hafızasında tutar, tekrar tekrar istek atmaz
            keepUnusedDataFor: 300,
        }),

        deleteMultipleCustomers: builder.mutation<void, number[]>({
            query: (ids) => ({
                url: '/batch',
                method: 'DELETE',
                body: ids,
            }),
            invalidatesTags: ['Customer'], // Silme bitince tabloyu otomatik yeniler
        }),
    }),
});

export const { useGetCustomerLookupQuery, useDeleteMultipleCustomersMutation } = customerApi;