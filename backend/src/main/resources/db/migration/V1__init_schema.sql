-- 1. Customer Tablosu
CREATE TABLE customer (
                          id BIGSERIAL PRIMARY KEY,
                          created_date TIMESTAMP NOT NULL,
                          updated_date TIMESTAMP,
                          customer_id BIGINT NOT NULL UNIQUE,
                          first_name VARCHAR(255),
                          last_name VARCHAR(255),
                          middle_name VARCHAR(255),
                          email_address VARCHAR(255),
                          cell_phone_number VARCHAR(50),
                          tr_identity_no VARCHAR(11),
                          birth_date DATE,
                          birth_place VARCHAR(255),
                          gender VARCHAR(50),
                          customer_type VARCHAR(50),
                          customer_class VARCHAR(50),
                          last_sync_status VARCHAR(50),
                          last_synced_at TIMESTAMP
);

-- 2. Account Tablosu
CREATE TABLE account (
                         id BIGSERIAL PRIMARY KEY,
                         created_date TIMESTAMP NOT NULL,
                         updated_date TIMESTAMP,
                         account_id VARCHAR(100),
                         branch_id INT,
                         customer_id BIGINT,
                         default_account BOOLEAN,
                         fullname VARCHAR(255),
                         customer_ref_id BIGINT,
                         account_verification_status VARCHAR(50),
                         custodian_message VARCHAR(255),
                         is_owner_or_partner BOOLEAN
);

-- 3. Customer Address Tablosu
CREATE TABLE customer_address (
                                  id BIGSERIAL PRIMARY KEY,
                                  created_date TIMESTAMP NOT NULL,
                                  updated_date TIMESTAMP,
                                  address TEXT,
                                  address_key VARCHAR(100) NOT NULL UNIQUE,
                                  address_type VARCHAR(50) NOT NULL,
                                  contact_address BOOLEAN NOT NULL,
                                  customer_id BIGINT NOT NULL,
                                  domestic_city_id VARCHAR(50),
                                  domestic_district_id INT,
                                  foreign_city VARCHAR(255),
                                  phone_number VARCHAR(50),
                                  customer_ref_id BIGINT NOT NULL,
                                  country_id INT,
                                  fax_number VARCHAR(50),
                                  postal_code VARCHAR(20)
);

-- 4. Customer Contract Tablosu
CREATE TABLE customer_contract (
                                   id BIGSERIAL PRIMARY KEY,
                                   created_date TIMESTAMP NOT NULL,
                                   updated_date TIMESTAMP,
                                   approved_date DATE,
                                   contract_status INT,
                                   contract_type_id INT NOT NULL,
                                   contract_version NUMERIC(5, 2) NOT NULL,
                                   customer_ref_id BIGINT NOT NULL
);

-- 5. Business Hours Tablosu
CREATE TABLE business_hours (
                                id BIGSERIAL PRIMARY KEY,
                                created_date TIMESTAMP NOT NULL,
                                updated_date TIMESTAMP,
                                start_time TIME NOT NULL,
                                end_time TIME NOT NULL,
                                lunch_break_enabled BOOLEAN NOT NULL,
                                lunch_start_time TIME,
                                lunch_end_time TIME
);

-- 6. IPO Prospectus Approval Tablosu
CREATE TABLE ipo_prospectus_approval (
                                         id BIGSERIAL PRIMARY KEY,
                                         created_date TIMESTAMP NOT NULL,
                                         updated_date TIMESTAMP,
                                         approved BOOLEAN NOT NULL,
                                         approved_at TIMESTAMP,
                                         client_ip VARCHAR(50),
                                         customer_id BIGINT NOT NULL,
                                         device_id VARCHAR(255),
                                         ipo_id BIGINT NOT NULL
);