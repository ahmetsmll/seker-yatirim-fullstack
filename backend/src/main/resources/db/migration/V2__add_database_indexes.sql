-- Customer Tablosu İndeksleri
CREATE INDEX idx_customer_tr_identity ON customer(tr_identity_no);
CREATE INDEX idx_customer_email ON customer(email_address);

-- Account Tablosu İndeksleri
CREATE INDEX idx_account_customer_id ON account(customer_id);
CREATE INDEX idx_account_customer_ref_id ON account(customer_ref_id);
CREATE INDEX idx_account_account_id ON account(account_id);

-- Customer Address Tablosu İndeksleri
CREATE INDEX idx_customer_address_customer_id ON customer_address(customer_id);
CREATE INDEX idx_customer_address_customer_ref_id ON customer_address(customer_ref_id);

-- Customer Contract Tablosu İndeksleri (Müşteri Ref ID ve Sözleşme Durumu için Çoklu İndeks)
CREATE INDEX idx_customer_contract_ref_status ON customer_contract(customer_ref_id, contract_status);

-- IPO Prospectus Approval Tablosu İndeksleri (Müşteri ID ve Halka Arz ID sorguları için)
CREATE INDEX idx_ipo_approval_customer_ipo ON ipo_prospectus_approval(customer_id, ipo_id);