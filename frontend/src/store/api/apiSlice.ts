import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
    Customer,
    Account,
    CustomerAddress,
    CustomerContract,
    BusinessHours,
    IpoProspectusApproval,
} from '@/types';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8080/api' }),
    tagTypes: [
        'Customer',
        'Account',
        'CustomerAddress',
        'CustomerContract',
        'BusinessHours',
        'IpoProspectusApproval',
    ],
    endpoints: (builder) => ({
        // --- 1. CUSTOMER ENDPOINTS ---
        getCustomers: builder.query<Customer[], void>({
            query: () => '/customers',
            providesTags: ['Customer'],
        }),
        createCustomer: builder.mutation<Customer, Partial<Customer>>({
            query: (body) => ({
                url: '/customers',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Customer'],
        }),
        updateCustomer: builder.mutation<Customer, Partial<Customer>>({
            query: ({ id, ...body }) => ({
                url: `/customers/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Customer'],
        }),
        deleteCustomer: builder.mutation<void, number>({
            query: (id) => ({
                url: `/customers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Customer'],
        }),

        // --- 2. ACCOUNT ENDPOINTS ---
        getAccounts: builder.query<Account[], void>({
            query: () => '/accounts',
            providesTags: ['Account'],
        }),
        createAccount: builder.mutation<Account, Partial<Account>>({
            query: (body) => ({
                url: '/accounts',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Account'],
        }),
        updateAccount: builder.mutation<Account, Partial<Account>>({
            query: ({ id, ...body }) => ({
                url: `/accounts/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Account'],
        }),
        deleteAccount: builder.mutation<void, number>({
            query: (id) => ({
                url: `/accounts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Account'],
        }),

        // --- 3. CUSTOMER ADDRESS ENDPOINTS ---
        getAddresses: builder.query<CustomerAddress[], void>({
            query: () => '/customer-addresses',
            providesTags: ['CustomerAddress'],
        }),
        createAddress: builder.mutation<CustomerAddress, Partial<CustomerAddress>>({
            query: (body) => ({
                url: '/customer-addresses',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['CustomerAddress'],
        }),
        updateAddress: builder.mutation<CustomerAddress, Partial<CustomerAddress>>({
            query: ({ id, ...body }) => ({
                url: `/customer-addresses/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['CustomerAddress'],
        }),
        deleteAddress: builder.mutation<void, number>({
            query: (id) => ({
                url: `/customer-addresses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['CustomerAddress'],
        }),

        // --- 4. CUSTOMER CONTRACT ENDPOINTS ---
        getContracts: builder.query<CustomerContract[], void>({
            query: () => '/customer-contracts',
            providesTags: ['CustomerContract'],
        }),
        createContract: builder.mutation<CustomerContract, Partial<CustomerContract>>({
            query: (body) => ({
                url: '/customer-contracts',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['CustomerContract'],
        }),
        updateContract: builder.mutation<CustomerContract, Partial<CustomerContract>>({
            query: ({ id, ...body }) => ({
                url: `/customer-contracts/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['CustomerContract'],
        }),
        deleteContract: builder.mutation<void, number>({
            query: (id) => ({
                url: `/customer-contracts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['CustomerContract'],
        }),

        // --- 5. BUSINESS HOURS ENDPOINTS ---
        getBusinessHours: builder.query<BusinessHours[], void>({
            query: () => '/business-hours',
            providesTags: ['BusinessHours'],
        }),
        createBusinessHours: builder.mutation<BusinessHours, Partial<BusinessHours>>({
            query: (body) => ({
                url: '/business-hours',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['BusinessHours'],
        }),
        updateBusinessHours: builder.mutation<BusinessHours, Partial<BusinessHours>>({
            query: ({ id, ...body }) => ({
                url: `/business-hours/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['BusinessHours'],
        }),
        deleteBusinessHours: builder.mutation<void, number>({
            query: (id) => ({
                url: `/business-hours/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['BusinessHours'],
        }),

        // --- 6. IPO APPROVAL ENDPOINTS ---
        getIpoApprovals: builder.query<IpoProspectusApproval[], void>({
            query: () => '/ipo-approvals',
            providesTags: ['IpoProspectusApproval'],
        }),
        createIpoApproval: builder.mutation<IpoProspectusApproval, Partial<IpoProspectusApproval>>({
            query: (body) => ({
                url: '/ipo-approvals',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['IpoProspectusApproval'],
        }),
        updateIpoApproval: builder.mutation<IpoProspectusApproval, Partial<IpoProspectusApproval>>({
            query: ({ id, ...body }) => ({
                url: `/ipo-approvals/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['IpoProspectusApproval'],
        }),
        deleteIpoApproval: builder.mutation<void, number>({
            query: (id) => ({
                url: `/ipo-approvals/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['IpoProspectusApproval'],
        }),
    }),
});

export const {
    useGetCustomersQuery,
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,

    useGetAccountsQuery,
    useCreateAccountMutation,
    useUpdateAccountMutation,
    useDeleteAccountMutation,

    useGetAddressesQuery,
    useCreateAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,

    useGetContractsQuery,
    useCreateContractMutation,
    useUpdateContractMutation,
    useDeleteContractMutation,

    useGetBusinessHoursQuery,
    useCreateBusinessHoursMutation,
    useUpdateBusinessHoursMutation,
    useDeleteBusinessHoursMutation,

    useGetIpoApprovalsQuery,
    useCreateIpoApprovalMutation,
    useUpdateIpoApprovalMutation,
    useDeleteIpoApprovalMutation,
} = apiSlice;