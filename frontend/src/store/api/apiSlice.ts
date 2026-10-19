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
        deleteMultipleCustomers: builder.mutation<void, number[]>({
            query: (ids) => ({
                url: '/customers/batch',
                method: 'DELETE',
                body: ids,
            }),
            invalidatesTags: ['Customer'], // Anında tabloyu yeniler
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
        deleteMultipleAccounts: builder.mutation<void, number[]>({
            query: (ids) => ({
                url: '/accounts/batch',
                method: 'DELETE',
                body: ids,
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
        deleteMultipleAddresses: builder.mutation<void, number[]>({
            query: (ids) => ({
                url: '/customer-addresses/batch',
                method: 'DELETE',
                body: ids,
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
        deleteMultipleContracts: builder.mutation<void, number[]>({
            query: (ids) => ({
                url: '/customer-contracts/batch',
                method: 'DELETE',
                body: ids,
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
        deleteMultipleBusinessHours: builder.mutation<void, number[]>({
            query: (ids) => ({
                url: '/business-hours/batch',
                method: 'DELETE',
                body: ids,
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
        deleteMultipleIpoApprovals: builder.mutation<void, number[]>({
            query: (ids) => ({
                url: '/ipo-approvals/batch',
                method: 'DELETE',
                body: ids,
            }),
            invalidatesTags: ['IpoProspectusApproval'],
        }),
        approveMultipleIpoApprovals: builder.mutation<void, number[]>({
            query: (ids) => ({
                url: '/ipo-approvals/batch-approve',
                method: 'PUT',
                body: ids,
            }),
            invalidatesTags: ['IpoProspectusApproval'], // Onaylandığı an tabloyu anında günceller
        }),

    }),
});

export const {
    useGetCustomersQuery,
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
    useDeleteMultipleCustomersMutation,

    useGetAccountsQuery,
    useCreateAccountMutation,
    useUpdateAccountMutation,
    useDeleteAccountMutation,
    useDeleteMultipleAccountsMutation,

    useGetAddressesQuery,
    useCreateAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,
    useDeleteMultipleAddressesMutation,

    useGetContractsQuery,
    useCreateContractMutation,
    useUpdateContractMutation,
    useDeleteContractMutation,
    useDeleteMultipleContractsMutation,

    useGetBusinessHoursQuery,
    useCreateBusinessHoursMutation,
    useUpdateBusinessHoursMutation,
    useDeleteBusinessHoursMutation,
    useDeleteMultipleBusinessHoursMutation,

    useGetIpoApprovalsQuery,
    useCreateIpoApprovalMutation,
    useUpdateIpoApprovalMutation,
    useDeleteIpoApprovalMutation,
    useDeleteMultipleIpoApprovalsMutation,
    useApproveMultipleIpoApprovalsMutation,
} = apiSlice;