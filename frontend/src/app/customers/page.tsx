'use client';

import { useState, useMemo } from 'react';
import {
    Box,
    Heading,
    Button,
    Badge,
    Spinner,
    Input,
    VStack,
    HStack,
    Text,
    Table,
    Dialog,
    Field,
    SimpleGrid,
} from '@chakra-ui/react';
import { FiTrash2, FiPlus, FiEdit2, FiSearch, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import Fuse from 'fuse.js';
import {
    useGetCustomersQuery,
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
    useDeleteMultipleCustomersMutation
} from '@/store/api/apiSlice';
import { Customer } from '@/types';

export default function CustomersPage() {
    // RTK Query Hook'ları
    const { data: customers, isLoading, isError } = useGetCustomersQuery();
    const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
    const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
    const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();
    const [deleteMultipleCustomers, { isLoading: isBulkDeleting }] = useDeleteMultipleCustomersMutation();

    // State Yönetimi
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Tekil Silme Modalı State'leri
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

    // Toplu Silme State'leri (Kutucuk Seçimleri)
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

    // Sayfanın Ortasında Açılan İşlem Sonucu Modalı (Feedback Popup)
    const [feedbackModal, setFeedbackModal] = useState<{
        open: boolean;
        title: string;
        message: string;
        type: 'success' | 'delete';
    }>({
        open: false,
        title: '',
        message: '',
        type: 'success',
    });

    const triggerFeedback = (title: string, message: string, type: 'success' | 'delete' = 'success') => {
        setFeedbackModal({ open: true, title, message, type });
        // 3 saniye sonra otomatik kapanma
        setTimeout(() => {
            setFeedbackModal((prev) => ({ ...prev, open: false }));
        }, 3000);
    };

    const [formData, setFormData] = useState({
        customerId: '',
        firstName: '',
        lastName: '',
        emailAddress: '',
        cellPhoneNumber: '',
        trIdentityNo: '',
    });

    // --- KUTUCUK (CHECKBOX) SEÇİM MANTIKLARI ---
    const handleSelectRow = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSelectAll = () => {
        if (!customers) return;
        if (selectedIds.length === customers.length) {
            setSelectedIds([]);
        } else {
            const allIds = customers.map((c) => c.id).filter((id): id is number => id !== undefined);
            setSelectedIds(allIds);
        }
    };

    const handleConfirmBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        try {
            await deleteMultipleCustomers(selectedIds).unwrap();
            setIsBulkDeleteOpen(false);
            triggerFeedback(
                'Müşteriler Silindi',
                `Seçilen ${selectedIds.length} adet müşteri kaydı başarıyla silindi.`,
                'delete'
            );
            setSelectedIds([]);
        } catch (err) {
            console.error('Toplu silme başarısız:', err);
        }
    };

    // Mükerrer Kayıt Kontrol Mantığı
    const otherCustomers = customers?.filter((c) =>
        selectedCustomer ? c.customerId !== selectedCustomer.customerId : true
    ) || [];

    const isDuplicateCustomerId = Boolean(
        formData.customerId.trim() &&
        otherCustomers.some((c) => String(c.customerId) === formData.customerId.trim())
    );

    const isDuplicateEmail = Boolean(
        formData.emailAddress.trim() &&
        otherCustomers.some(
            (c) => c.emailAddress?.toLowerCase().trim() === formData.emailAddress.toLowerCase().trim()
        )
    );

    const isDuplicatePhone = Boolean(
        formData.cellPhoneNumber.trim() &&
        otherCustomers.some((c) => c.cellPhoneNumber?.trim() === formData.cellPhoneNumber.trim())
    );

    const isInvalidTcNo = Boolean(
        formData.trIdentityNo.trim() &&
        (formData.trIdentityNo.trim().length !== 11 || !/^\d+$/.test(formData.trIdentityNo.trim()))
    );

    const isInvalidPhone = Boolean(
        formData.cellPhoneNumber.trim() &&
        (formData.cellPhoneNumber.trim().length !== 11 || !/^\d+$/.test(formData.cellPhoneNumber.trim()))
    );

    const hasValidationErrors = isDuplicateCustomerId || isDuplicateEmail || isDuplicatePhone || isInvalidTcNo || isInvalidPhone;

    // Ekleme / Düzenleme Modalı Açma
    const handleOpenModal = (customer?: Customer) => {
        if (customer) {
            setSelectedCustomer(customer);
            setFormData({
                customerId: String(customer.customerId || ''),
                firstName: customer.firstName || '',
                lastName: customer.lastName || '',
                emailAddress: customer.emailAddress || '',
                cellPhoneNumber: customer.cellPhoneNumber || '',
                trIdentityNo: customer.trIdentityNo || '',
            });
        } else {
            setSelectedCustomer(null);
            setFormData({
                customerId: '',
                firstName: '',
                lastName: '',
                emailAddress: '',
                cellPhoneNumber: '',
                trIdentityNo: '',
            });
        }
        setIsOpen(true);
    };

    // Form Gönderme (Create & Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (hasValidationErrors) return;

        try {
            const payload = {
                ...formData,
                customerId: Number(formData.customerId),
                customerType: 'INDIVIDUAL',
                customerClass: 'GENERAL',
            };

            if (selectedCustomer && selectedCustomer.id) {
                await updateCustomer({
                    id: selectedCustomer.customerId,
                    ...payload,
                }).unwrap();
                setIsOpen(false);
                triggerFeedback(
                    'Müşteri Güncellendi',
                    'Müşteri bilgileri başarıyla güncellenmiştir.',
                    'success'
                );
            } else {
                await createCustomer(payload).unwrap();
                setIsOpen(false);
                triggerFeedback(
                    'Müşteri Kaydedildi',
                    'Yeni müşteri başarıyla sisteme eklenmiştir.',
                    'success'
                );
            }
        } catch (err) {
            console.error('İşlem sırasında hata oluştu:', err);
        }
    };

    // Silme Modalını Açma
    const handleOpenDeleteModal = (customer: Customer) => {
        setCustomerToDelete(customer);
        setIsDeleteOpen(true);
    };

    // Silme İşlemini Onaylama
    const handleConfirmDelete = async () => {
        if (!customerToDelete || !customerToDelete.customerId) return;

        try {
            await deleteCustomer(customerToDelete.customerId).unwrap();
            setIsDeleteOpen(false);
            triggerFeedback(
                'Müşteri Silindi',
                `Müşteri numarası "${customerToDelete.customerId}" olan kayıt başarıyla silindi.`,
                'delete'
            );
            setCustomerToDelete(null);
        } catch (err) {
            console.error('Silme başarısız:', err);
        }
    };

    // Arama Filtreleme Mantığı
    const fuse = useMemo(() => {
        if (!customers) return null;

        return new Fuse(customers, {
            keys: [
                { name: 'firstName', weight: 0.3 },
                { name: 'lastName', weight: 0.3 },
                { name: 'emailAddress', weight: 0.2 },
                { name: 'trIdentityNo', weight: 0.1 },
                { name: 'customerId', weight: 0.1 },
            ],
            threshold: 0.1,
            minMatchCharLength: 1,
        });
    }, [customers]);

    const filteredCustomers = useMemo(() => {
        if (!searchTerm.trim()) return customers || [];
        if (!fuse) return [];
        return fuse.search(searchTerm.trim()).map((result) => result.item);
    }, [searchTerm, fuse, customers]);

    if (isLoading) {
        return (
            <HStack justify="center" p={10}>
                <Spinner size="xl" color="red.500" />
            </HStack>
        );
    }

    if (isError) {
        return <Text color="red.500">Müşteriler yüklenirken bir hata oluştu!</Text>;
    }

    return (
        <Box position="relative">
            {/* Üst Başlık, Toplu Sil ve Ekle Butonları */}
            <HStack justify="space-between" mb={6}>
                <Heading size="lg" color="gray.800">
                    Müşteri Yönetimi
                </Heading>
                <HStack gap={3}>
                    {/* Yalnızca kutucuk seçimi yapıldığında gözüken Toplu Sil Butonu */}
                    {selectedIds.length > 0 && (
                        <Button
                            colorPalette="red"
                            variant="subtle"
                            onClick={() => setIsBulkDeleteOpen(true)}
                        >
                            <FiTrash2 style={{ marginRight: '8px' }} />
                            Seçilenleri Sil ({selectedIds.length})
                        </Button>
                    )}
                    <Button colorPalette="red" onClick={() => handleOpenModal()}>
                        <FiPlus style={{ marginRight: '8px' }} /> Yeni Müşteri Ekle
                    </Button>
                </HStack>
            </HStack>

            {/* Arama Çubuğu */}
            <Box mb={6} bg="white" p={4} rounded="lg" shadow="sm">
                <HStack gap={3}>
                    <FiSearch size={20} color="gray" />
                    <Input
                        placeholder="Ad, Soyad, T.C. No, E-Posta veya Müşteri No ile ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="outline"
                    />
                </HStack>
            </Box>

            {/* Müşteri Tablosu */}
            <Box bg="white" rounded="lg" shadow="sm" overflow="hidden" p={4}>
                <Table.Root variant="line" interactive>
                    <Table.Header bg="gray.100">
                        <Table.Row>
                            {/* TÜMÜNÜ SEÇ KUTUCUĞU */}
                            <Table.ColumnHeader width="50px">
                                <input
                                    type="checkbox"
                                    checked={Boolean(customers && customers.length > 0 && selectedIds.length === customers.length)}
                                    onChange={handleSelectAll}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                            </Table.ColumnHeader>
                            <Table.ColumnHeader>ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Müşteri No</Table.ColumnHeader>
                            <Table.ColumnHeader>Ad</Table.ColumnHeader>
                            <Table.ColumnHeader>Soyad</Table.ColumnHeader>
                            <Table.ColumnHeader>T.C. No</Table.ColumnHeader>
                            <Table.ColumnHeader>E-Posta</Table.ColumnHeader>
                            <Table.ColumnHeader>Telefon</Table.ColumnHeader>
                            <Table.ColumnHeader>Durum</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="center">İşlemler</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {filteredCustomers && filteredCustomers.length > 0 ? (
                            filteredCustomers.map((c) => {
                                const isSelected = c.id !== undefined && selectedIds.includes(c.id);
                                return (
                                    <Table.Row key={c.id} bg={isSelected ? 'red.50' : 'transparent'}>
                                        {/* TEKİL KUTUCUK (CHECKBOX) */}
                                        <Table.Cell>
                                            {c.id !== undefined && (
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(c.id!)}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                            )}
                                        </Table.Cell>
                                        <Table.Cell>{c.id}</Table.Cell>
                                        <Table.Cell fontWeight="bold">{c.customerId}</Table.Cell>
                                        <Table.Cell>{c.firstName}</Table.Cell>
                                        <Table.Cell>{c.lastName}</Table.Cell>
                                        <Table.Cell>{c.trIdentityNo || '-'}</Table.Cell>
                                        <Table.Cell>{c.emailAddress || '-'}</Table.Cell>
                                        <Table.Cell>{c.cellPhoneNumber || '-'}</Table.Cell>
                                        <Table.Cell>
                                            <Badge colorPalette={c.lastSyncStatus === 'SUCCESS' ? 'green' : 'red'}>
                                                {c.lastSyncStatus || 'ACTIVE'}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell textAlign="center">
                                            <HStack justify="center" gap={2}>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    colorPalette="blue"
                                                    onClick={() => handleOpenModal(c)}
                                                >
                                                    <FiEdit2 />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    colorPalette="red"
                                                    onClick={() => handleOpenDeleteModal(c)}
                                                >
                                                    <FiTrash2 />
                                                </Button>
                                            </HStack>
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })
                        ) : (
                            <Table.Row>
                                <Table.Cell colSpan={10} textAlign="center" py={6} color="gray.500">
                                    Arama kriterlerine uygun müşteri bulunamadı.
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table.Root>
            </Box>

            {/* Müşteri Ekleme / Düzenleme Modalı */}
            <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <Dialog.Backdrop bg="blackAlpha.600" />
                <Dialog.Positioner p={{ base: 3, md: 6 }}>
                    <Dialog.Content
                        rounded="xl"
                        shadow="2xl"
                        maxW={{ base: '92vw', md: '650px' }}
                        w="full"
                        mx="auto"
                        p={{ base: 3, md: 5 }}
                    >
                        <form onSubmit={handleSubmit}>
                            <Dialog.Header borderBottomWidth="1px" pb={3}>
                                <Dialog.Title fontSize={{ base: 'md', md: 'xl' }} fontWeight="bold">
                                    {selectedCustomer ? 'Müşteri Bilgilerini Güncelle' : 'Yeni Müşteri Ekle'}
                                </Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body py={4} maxH="65vh" overflowY="auto">
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                    <Field.Root required invalid={isDuplicateCustomerId}>
                                        <Field.Label fontWeight="medium">Müşteri No</Field.Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={formData.customerId}
                                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                            disabled={Boolean(selectedCustomer)}
                                        />
                                        {isDuplicateCustomerId && (
                                            <Text color="orange.600" fontSize="xs" mt={1}>
                                                ⚠️ Bu müşteri numarası zaten kayıtlı!
                                            </Text>
                                        )}
                                    </Field.Root>

                                    <Field.Root required>
                                        <Field.Label fontWeight="medium">T.C. Kimlik No</Field.Label>
                                        <Input
                                            value={formData.trIdentityNo}
                                            disabled={Boolean(selectedCustomer)}
                                            maxLength={11}
                                            onChange={(e) => {
                                                const onlyNums = e.target.value.replace(/\D/g, '');
                                                setFormData({ ...formData, trIdentityNo: onlyNums });
                                            }}
                                        />
                                        {isInvalidTcNo && (
                                            <Text color="orange.600" fontSize="xs" mt={1}>
                                                ⚠️ T.C. Kimlik Numarası 11 haneli olmalıdır!
                                            </Text>
                                        )}
                                    </Field.Root>

                                    <Field.Root required>
                                        <Field.Label fontWeight="medium">Ad</Field.Label>
                                        <Input
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </Field.Root>

                                    <Field.Root required>
                                        <Field.Label fontWeight="medium">Soyad</Field.Label>
                                        <Input
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </Field.Root>

                                    <Field.Root required invalid={isDuplicateEmail}>
                                        <Field.Label fontWeight="medium">E-Posta</Field.Label>
                                        <Input
                                            type="email"
                                            value={formData.emailAddress}
                                            onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                                        />
                                        {isDuplicateEmail && (
                                            <Text color="orange.600" fontSize="xs" mt={1}>
                                                ⚠️ Bu e-posta adresi zaten kayıtlı!
                                            </Text>
                                        )}
                                    </Field.Root>

                                    <Field.Root required invalid={isDuplicatePhone}>
                                        <Field.Label fontWeight="medium">Telefon</Field.Label>
                                        <Input
                                            placeholder={"0 5xx xxx xx xx"}
                                            value={formData.cellPhoneNumber}
                                            maxLength={11}
                                            onChange={(e) => {
                                                const onlyNums = e.target.value.replace(/\D/g, '');
                                                setFormData({ ...formData, cellPhoneNumber: onlyNums });
                                            }}
                                        />
                                        {isDuplicatePhone && (
                                            <Text color="orange.600" fontSize="xs" mt={1}>
                                                ⚠️ Bu telefon numarası zaten kayıtlı!
                                            </Text>
                                        )}
                                        {isInvalidPhone && !isDuplicatePhone && (
                                            <Text color="orange.600" fontSize="xs" mt={1}>
                                                ⚠️ Telefon numarası 11 haneli olmalıdır ve 0 ile başlamalıdır (Örn: 05xxxxxxxxx)
                                            </Text>
                                        )}
                                    </Field.Root>
                                </SimpleGrid>
                            </Dialog.Body>

                            <Dialog.Footer borderTopWidth="1px" pt={3}>
                                <HStack justify="flex-end" gap={3} w="full">
                                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                                        İptal
                                    </Button>
                                    <Button
                                        colorPalette="red"
                                        type="submit"
                                        loading={isCreating || isUpdating}
                                        disabled={hasValidationErrors}
                                    >
                                        {selectedCustomer ? 'Güncelle' : 'Kaydet'}
                                    </Button>
                                </HStack>
                            </Dialog.Footer>
                        </form>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

            {/* Tekil Silme Onay Modalı */}
            <Dialog.Root open={isDeleteOpen} onOpenChange={(e) => setIsDeleteOpen(e.open)}>
                <Dialog.Backdrop bg="blackAlpha.600" />
                <Dialog.Positioner p={{ base: 3, md: 6 }}>
                    <Dialog.Content rounded="xl" shadow="2xl" maxW="450px" w="full" mx="auto" p={3}>
                        <Dialog.Header borderBottomWidth="1px" pb={3}>
                            <HStack gap={2}>
                                <FiAlertTriangle size={22} color="#E53E3E" />
                                <Dialog.Title fontSize="lg" fontWeight="bold" color="red.600">
                                    Müşteri Silme Onayı
                                </Dialog.Title>
                            </HStack>
                        </Dialog.Header>

                        <Dialog.Body py={4}>
                            <Text fontSize="sm" color="gray.700">
                                <strong>Müşteri No: {customerToDelete?.customerId}</strong> (
                                {customerToDelete?.firstName} {customerToDelete?.lastName}) olan müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                            </Text>
                        </Dialog.Body>

                        <Dialog.Footer borderTopWidth="1px" pt={3}>
                            <HStack justify="flex-end" gap={3} w="full">
                                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                                    Vazgeç
                                </Button>
                                <Button
                                    colorPalette="red"
                                    onClick={handleConfirmDelete}
                                    loading={isDeleting}
                                >
                                    Evet, Sil
                                </Button>
                            </HStack>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

            {/* TOPLU SİLME ONAY MODALI */}
            <Dialog.Root open={isBulkDeleteOpen} onOpenChange={(e) => setIsBulkDeleteOpen(e.open)}>
                <Dialog.Backdrop bg="blackAlpha.600" />
                <Dialog.Positioner p={{ base: 3, md: 6 }}>
                    <Dialog.Content rounded="xl" shadow="2xl" maxW="450px" w="full" mx="auto" p={3}>
                        <Dialog.Header borderBottomWidth="1px" pb={3}>
                            <HStack gap={2}>
                                <FiAlertTriangle size={22} color="#E53E3E" />
                                <Dialog.Title fontSize="lg" fontWeight="bold" color="red.600">
                                    Toplu Müşteri Silme Onayı
                                </Dialog.Title>
                            </HStack>
                        </Dialog.Header>

                        <Dialog.Body py={4}>
                            <Text fontSize="sm" color="gray.700">
                                Seçmiş olduğunuz <strong>{selectedIds.length} adet</strong> müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                            </Text>
                        </Dialog.Body>

                        <Dialog.Footer borderTopWidth="1px" pt={3}>
                            <HStack justify="flex-end" gap={3} w="full">
                                <Button variant="outline" onClick={() => setIsBulkDeleteOpen(false)}>
                                    Vazgeç
                                </Button>
                                <Button
                                    colorPalette="red"
                                    onClick={handleConfirmBulkDelete}
                                    loading={isBulkDeleting}
                                >
                                    Evet, Hepsini Sil
                                </Button>
                            </HStack>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

            {/* SAYFANIN ORTASINDA AÇILAN BAŞARILI / İŞLEM SONUCU MODALI */}
            <Dialog.Root open={feedbackModal.open} onOpenChange={(e) => setFeedbackModal((prev) => ({ ...prev, open: e.open }))}>
                <Dialog.Backdrop bg="blackAlpha.600" />
                <Dialog.Positioner p={{ base: 3, md: 6 }}>
                    <Dialog.Content rounded="2xl" shadow="2xl" maxW="400px" w="full" mx="auto" p={6} textAlign="center">
                        <VStack gap={4}>
                            {feedbackModal.type === 'delete' ? (
                                <Box bg="red.100" color="red.600" p={4} rounded="full">
                                    <FiTrash2 size={36} />
                                </Box>
                            ) : (
                                <Box bg="green.100" color="green.600" p={4} rounded="full">
                                    <FiCheckCircle size={36} />
                                </Box>
                            )}

                            <Heading size="md" color="gray.800">
                                {feedbackModal.title}
                            </Heading>

                            <Text fontSize="sm" color="gray.600">
                                {feedbackModal.message}
                            </Text>

                            <Button
                                colorPalette={feedbackModal.type === 'delete' ? 'red' : 'green'}
                                w="full"
                                mt={2}
                                onClick={() => setFeedbackModal((prev) => ({ ...prev, open: false }))}
                            >
                                Tamam
                            </Button>
                        </VStack>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Box>
    );
}