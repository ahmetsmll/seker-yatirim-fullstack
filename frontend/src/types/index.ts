// 1. Müşteri (Customer) Modeli
export interface Customer {
    id?: number;                  // bigint, null değil (PK)[cite: 8]
    customerId: number;           // bigint, null değil[cite: 8]
    createdDate?: string;         // datetime2(7), null değil[cite: 8]
    birthDate?: string;           // date, null[cite: 8]
    birthPlace?: string;          // varchar(255), null[cite: 8]
    cellPhoneNumber?: string;     // varchar(255), null[cite: 8]
    customerClass?: string;       // varchar(255), null[cite: 8]
    customerType?: string;        // varchar(255), null[cite: 8]
    emailAddress?: string;        // varchar(255), null[cite: 8]
    firstName?: string;           // varchar(255), null[cite: 8]
    gender?: string;              // varchar(255), null[cite: 8]
    lastName?: string;            // varchar(255), null[cite: 8]
    lastSyncStatus?: string;      // varchar(255), null[cite: 8]
    lastSyncedAt?: string;        // datetime2(7), null[cite: 8]
    middleName?: string;          // varchar(255), null[cite: 8]
    trIdentityNo?: string;        // varchar(255), null[cite: 8]
    updatedDate?: string;         // datetime2(7), null[cite: 8]
}

// 2. Hesap (Account) Modeli
export interface Account {
    id?: number;                  // bigint, null değil (PK)[cite: 6]
    createdDate?: string;         // datetime2(7), null değil[cite: 6]
    accountId?: string;           // varchar(255), null[cite: 6]
    accountVerificationStatus?: string; // varchar(255), null[cite: 6]
    branchId?: number;            // int, null[cite: 6]
    custodianMessage?: string;     // varchar(255), null[cite: 6]
    customerId?: number;          // bigint, null[cite: 6]
    customerRefId?: number;       // bigint, null[cite: 6]
    defaultAccount?: boolean;     // bit, null[cite: 6]
    fullname?: string;            // varchar(255), null[cite: 6]
    isOwnerOrPartner?: boolean;   // bit, null[cite: 6]
    updatedDate?: string;         // datetime2(7), null[cite: 6]
}

// 3. Müşteri Adresi (CustomerAddress) Modeli
export interface CustomerAddress {
    id?: number;                  // bigint, null değil (PK)[cite: 9]
    addressKey: string;           // varchar(255), null değil[cite: 9]
    addressType: string;          // varchar(255), null değil[cite: 9]
    contactAddress: boolean;      // bit, null değil[cite: 9]
    createdDate?: string;         // datetime2(7), null değil[cite: 9]
    customerId: number;           // bigint, null değil[cite: 9]
    customerRefId: number;        // bigint, null değil[cite: 9]
    address?: string;             // varchar(255), null[cite: 9]
    countryId?: number;           // int, null[cite: 9]
    domesticCityId?: string;      // varchar(255), null[cite: 9]
    domesticDistrictId?: number;  // int, null[cite: 9]
    faxNumber?: string;           // varchar(255), null[cite: 9]
    foreignCity?: string;         // varchar(255), null[cite: 9]
    phoneNumber?: string;         // varchar(255), null[cite: 9]
    postalCode?: string;          // varchar(255), null[cite: 9]
    updatedDate?: string;         // datetime2(7), null[cite: 9]
}

// 4. Müşteri Sözleşmesi (CustomerContract) Modeli
export interface CustomerContract {
    id?: number;                  // bigint, null değil (PK)[cite: 10]
    contractTypeId: number;       // int, null değil[cite: 10]
    contractVersion: number;      // int, null değil[cite: 10]
    createdDate?: string;         // datetime2(7), null değil[cite: 10]
    customerRefId: number;        // bigint, null değil[cite: 10]
    approvedDate?: string;        // date, null[cite: 10]
    contractStatus?: number;      // int, null[cite: 10]
    updatedDate?: string;         // datetime2(7), null[cite: 10]
}

// 5. Mesai Saatleri (BusinessHours) Modeli
export interface BusinessHours {
    id?: number;                  // bigint, null değil (PK)[cite: 7]
    createdDate?: string;         // datetime2(7), null değil[cite: 7]
    endTime: string;              // time(7), null değil[cite: 7]
    lunchBreakEnabled: boolean;   // bit, null değil[cite: 7]
    startTime: string;            // time(7), null değil[cite: 7]
    lunchEndTime?: string;        // time(7), null[cite: 7]
    lunchStartTime?: string;      // time(7), null[cite: 7]
    updatedDate?: string;         // datetime2(7), null[cite: 7]
}

// 6. Halka Arz İzahname Onayı (IpoProspectusApproval) Modeli
export interface IpoProspectusApproval {
    id?: number;                  // bigint, null değil (PK)[cite: 11]
    approved: boolean;            // bit, null değil[cite: 11]
    createdDate?: string;         // datetime2(7), null değil[cite: 11]
    customerId: number;           // bigint, null değil[cite: 11]
    ipoId: number;                // bigint, null değil[cite: 11]
    approvedAt?: string;          // datetime2(7), null[cite: 11]
    clientIp?: string;            // varchar(255), null[cite: 11]
    deviceId?: string;            // varchar(255), null[cite: 11]
    updatedDate?: string;         // datetime2(7), null[cite: 11]
}

export interface IpoApproval {
    id?: number;
    customerId: number;
    ipoId: number;
    approved: boolean;
    approvedAt?: string;
    clientIp?: string;
    deviceId?: string;
}