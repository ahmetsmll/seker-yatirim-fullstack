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
    NativeSelect,
} from '@chakra-ui/react';
import { FiTrash2, FiPlus, FiEdit2, FiSearch, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import Fuse from 'fuse.js';
import {
    useGetAddressesQuery,
    useCreateAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,
} from '@/store/api/apiSlice';
import { CustomerAddress } from '@/types';

export default function AddressesPage() {
    // RTK Query Hook'ları
    const { data: addresses, isLoading, isError } = useGetAddressesQuery();
    const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
    const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
    const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();

    // State Yönetimi
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null);

    // Silme Modalı State'leri
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<CustomerAddress | null>(null);

    // Sayfa Ortasındaki Bildirim Modalı State'i
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
        setTimeout(() => {
            setFeedbackModal((prev) => ({ ...prev, open: false }));
        }, 3000);
    };

    // Form State'i
    const [formData, setFormData] = useState({
        customerId: '',
        customerRefId: '',
        addressKey: '',
        addressType: 'HOME',
        address: '',
        domesticCityId: '',
        postalCode: '',
        phoneNumber: '',
    });

    // Mükerrer Adres Anahtarı Kontrolü (Düzenlenen adres hariç tutulur)
    const otherAddresses = addresses?.filter((a) =>
        selectedAddress ? a.id !== selectedAddress.id : true
    ) || [];

    const isDuplicateAddressKey = Boolean(
        formData.addressKey.trim() &&
        otherAddresses.some(
            (a) => a.addressKey?.toLowerCase().trim() === formData.addressKey.toLowerCase().trim()
        )
    );

    // Telefon numarası kontrolü (isteğe bağlı doldurulursa 11 hane kontrolü)
    const isInvalidPhone = Boolean(
        formData.phoneNumber.trim() &&
        (formData.phoneNumber.trim().length !== 11 || !/^\d+$/.test(formData.phoneNumber.trim()))
    );

    const hasValidationErrors = isDuplicateAddressKey || isInvalidPhone;

    // Fuse.js Bulanık Arama Yapılandırması
    const fuse = useMemo(() => {
        if (!addresses) return null;

        return new Fuse(addresses, {
            keys: [
                { name: 'addressKey', weight: 0.35 },
                { name: 'address', weight: 0.3 },
                { name: 'customerId', weight: 0.15 },
                { name: 'addressType', weight: 0.1 },
                { name: 'domesticCityId', weight: 0.1 },
            ],
            threshold: 0.3,
            includeScore: true,
            minMatchCharLength: 1,
        });
    }, [addresses]);

    const filteredAddresses = useMemo(() => {
        if (!searchTerm.trim()) return addresses || [];
        if (!fuse) return [];
        return fuse.search(searchTerm.trim()).map((res) => res.item);
    }, [searchTerm, fuse, addresses]);

    // Modal Açma (Ekle / Düzenle)
    const handleOpenModal = (addressObj?: CustomerAddress) => {
        if (addressObj) {
            setSelectedAddress(addressObj);
            setFormData({
                customerId: String(addressObj.customerId || ''),
                customerRefId: String(addressObj.customerRefId || addressObj.customerId || ''),
                addressKey: addressObj.addressKey || '',
                addressType: addressObj.addressType || 'HOME',
                address: addressObj.address || '',
                domesticCityId: addressObj.domesticCityId || '',
                postalCode: addressObj.postalCode || '',
                phoneNumber: addressObj.phoneNumber || '',
            });
        } else {
            setSelectedAddress(null);
            setFormData({
                customerId: '',
                customerRefId: '',
                addressKey: '',
                addressType: 'HOME',
                address: '',
                domesticCityId: '',
                postalCode: '',
                phoneNumber: '',
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
                customerId: Number(formData.customerId),
                customerRefId: Number(formData.customerRefId || formData.customerId),
                addressKey: formData.addressKey,
                addressType: formData.addressType,
                address: formData.address,
                domesticCityId: formData.domesticCityId,
                postalCode: formData.postalCode,
                phoneNumber: formData.phoneNumber,
                contactAddress: selectedAddress ? selectedAddress.contactAddress : true,
            };

            if (selectedAddress && selectedAddress.id) {
                await updateAddress({
                    id: selectedAddress.id,
                    ...payload,
                }).unwrap();
                setIsOpen(false);
                triggerFeedback(
                    'Adres Güncellendi',
                    'Adres bilgileri başarıyla güncellenmiştir.',
                    'success'
                );
            } else {
                await createAddress(payload).unwrap();
                setIsOpen(false);
                triggerFeedback(
                    'Adres Eklendi',
                    'Yeni adres başarıyla sisteme kaydedilmiştir.',
                    'success'
                );
            }
        } catch (err) {
            console.error('İşlem sırasında hata oluştu:', err);
        }
    };

    // Silme Modalını Açma
    const handleOpenDeleteModal = (addressObj: CustomerAddress) => {
        setAddressToDelete(addressObj);
        setIsDeleteOpen(true);
    };

    // Silme Onayı
    const handleConfirmDelete = async () => {
        if (!addressToDelete || !addressToDelete.id) return;

        try {
            await deleteAddress(addressToDelete.id).unwrap();
            setIsDeleteOpen(false);
            triggerFeedback(
                'Adres Silindi',
                `Adres Anahtarı "${addressToDelete.addressKey || addressToDelete.id}" olan kayıt başarıyla silindi.`,
                'delete'
            );
            setAddressToDelete(null);
        } catch (err) {
            console.error('Silme başarısız:', err);
        }
    };

    if (isLoading) {
        return (
            <HStack justify="center" p={10}>
                <Spinner size="xl" color="red.500" />
            </HStack>
        );
    }

    if (isError) {
        return <Text color="red.500">Adresler yüklenirken bir hata oluştu!</Text>;
    }

    return (
        <Box position="relative">
            {/* Üst Başlık ve Yeni Ekle Butonu */}
            <HStack justify="space-between" mb={6}>
                <Heading size="lg" color="gray.800">
                    Adres Yönetimi
                </Heading>
                <Button colorPalette="red" onClick={() => handleOpenModal()}>
                    <FiPlus style={{ marginRight: '8px' }} /> Yeni Adres Ekle
                </Button>
            </HStack>

            {/* Fuse.js Arama Çubuğu */}
            <Box mb={6} bg="white" p={4} rounded="lg" shadow="sm">
                <HStack gap={3}>
                    <FiSearch size={20} color="gray" />
                    <Input
                        placeholder="Adres Anahtarı, Adres Detayı, Müşteri ID veya Şehir ile akıllı ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="outline"
                    />
                </HStack>
            </Box>

            {/* Adres Tablosu */}
            <Box bg="white" rounded="lg" shadow="sm" overflow="hidden" p={4}>
                <Table.Root variant="line" interactive>
                    <Table.Header bg="gray.100">
                        <Table.Row>
                            <Table.ColumnHeader>ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Müşteri ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Adres Tipi</Table.ColumnHeader>
                            <Table.ColumnHeader>Adres Anahtarı</Table.ColumnHeader>
                            <Table.ColumnHeader>Şehir ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Posta Kodu</Table.ColumnHeader>
                            <Table.ColumnHeader>Adres Detayı</Table.ColumnHeader>
                            <Table.ColumnHeader>İletişim Adresi</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="center">İşlemler</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {filteredAddresses && filteredAddresses.length > 0 ? (
                            filteredAddresses.map((addr) => (
                                <Table.Row key={addr.id}>
                                    <Table.Cell>{addr.id}</Table.Cell>
                                    <Table.Cell fontWeight="bold">{addr.customerId}</Table.Cell>
                                    <Table.Cell>
                                        <Badge colorPalette="blue">{addr.addressType || 'HOME'}</Badge>
                                    </Table.Cell>
                                    <Table.Cell fontWeight="medium">{addr.addressKey || '-'}</Table.Cell>
                                    <Table.Cell>{addr.domesticCityId || '-'}</Table.Cell>
                                    <Table.Cell>{addr.postalCode || '-'}</Table.Cell>
                                    <Table.Cell maxW="220px" truncate>{addr.address || '-'}</Table.Cell>
                                    <Table.Cell>
                                        <Badge colorPalette={addr.contactAddress ? 'green' : 'gray'}>
                                            {addr.contactAddress ? 'EVET' : 'HAYIR'}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell textAlign="center">
                                        <HStack justify="center" gap={2}>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                colorPalette="blue"
                                                onClick={() => handleOpenModal(addr)}
                                            >
                                                <FiEdit2 />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                colorPalette="red"
                                                onClick={() => handleOpenDeleteModal(addr)}
                                            >
                                                <FiTrash2 />
                                            </Button>
                                        </HStack>
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        ) : (
                            <Table.Row>
                                <Table.Cell colSpan={9} textAlign="center" py={6} color="gray.500">
                                    Arama kriterlerine uygun adres bulunamadı.
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table.Root>
            </Box>

            {/* Ekleme / Düzenleme Modalı */}
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
                                    {selectedAddress ? 'Adres Bilgilerini Güncelle' : 'Yeni Adres Ekle'}
                                </Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body py={4} maxH="65vh" overflowY="auto">
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                    <Field.Root required>
                                        <Field.Label fontWeight="medium">Müşteri ID</Field.Label>
                                        <Input
                                            type="number"
                                            value={formData.customerId}
                                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                            disabled={Boolean(selectedAddress)}
                                        />
                                    </Field.Root>

                                    <Field.Root required invalid={isDuplicateAddressKey}>
                                        <Field.Label fontWeight="medium">Adres Anahtarı</Field.Label>
                                        <Input
                                            placeholder="Örn: EV_ADRESI_1"
                                            value={formData.addressKey}
                                            onChange={(e) => setFormData({ ...formData, addressKey: e.target.value })}
                                            disabled={Boolean(selectedAddress)}
                                        />
                                        {isDuplicateAddressKey && (
                                            <Text color="orange.600" fontSize="xs" mt={1}>
                                                ⚠️ Bu adres anahtarı zaten kayıtlı!
                                            </Text>
                                        )}
                                    </Field.Root>

                                    <Field.Root required>
                                        <Field.Label fontWeight="medium">Adres Tipi</Field.Label>
                                        <HStack gap={2} w="full">
                                            <Button
                                                type="button"
                                                flex={1}
                                                variant={formData.addressType === 'HOME' ? 'solid' : 'outline'}
                                                colorPalette="red"
                                                bg={formData.addressType === 'HOME' ? 'red.500' : 'white'}
                                                color={formData.addressType === 'HOME' ? 'white' : 'gray.700'}
                                                borderColor={formData.addressType === 'HOME' ? 'red.500' : 'gray.300'}
                                                borderRadius="md"
                                                fontWeight="medium"
                                                transition="all 0.2s"
                                                _hover={{
                                                    bg: 'gray.200',
                                                    color: 'black',
                                                    borderColor: 'red.500',
                                                }}
                                                onClick={() => setFormData({ ...formData, addressType: 'HOME' })}
                                            >
                                                Ev (HOME)
                                            </Button>

                                            <Button
                                                type="button"
                                                flex={1}
                                                variant={formData.addressType === 'BUSINESS' ? 'solid' : 'outline'}
                                                colorPalette="red"
                                                bg={formData.addressType === 'BUSINESS' ? 'red.500' : 'white'}
                                                color={formData.addressType === 'BUSINESS' ? 'white' : 'gray.700'}
                                                borderColor={formData.addressType === 'BUSINESS' ? 'red.500' : 'gray.300'}
                                                borderRadius="md"
                                                fontWeight="medium"
                                                transition="all 0.2s"
                                                _hover={{
                                                    bg: 'gray.200',
                                                    color: 'black',
                                                    borderColor: 'red.500',
                                                }}
                                                onClick={() => setFormData({ ...formData, addressType: 'BUSINESS' })}
                                            >
                                                İş (BUSINESS)
                                            </Button>
                                        </HStack>
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Label fontWeight="medium">Şehir ID</Field.Label>
                                        <Input
                                            value={formData.domesticCityId}
                                            onChange={(e) => setFormData({ ...formData, domesticCityId: e.target.value })}
                                        />
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Label fontWeight="medium">Posta Kodu</Field.Label>
                                        <Input
                                            placeholder="Örn: 34160"
                                            value={formData.postalCode}
                                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                        />
                                    </Field.Root>

                                    <Field.Root invalid={isInvalidPhone}>
                                        <Field.Label fontWeight="medium">Telefon Numarası</Field.Label>
                                        <Input
                                            placeholder="05xxxxxxxxx"
                                            maxLength={11}
                                            value={formData.phoneNumber}
                                            onChange={(e) => {
                                                const onlyNums = e.target.value.replace(/\D/g, '');
                                                setFormData({ ...formData, phoneNumber: onlyNums });
                                            }}
                                        />
                                        {isInvalidPhone && (
                                            <Text color="orange.600" fontSize="xs" mt={1}>
                                                ⚠️ Telefon numarası 11 haneli olmalıdır!
                                            </Text>
                                        )}
                                    </Field.Root>

                                    <Box gridColumn={{ md: 'span 2' }}>
                                        <Field.Root required>
                                            <Field.Label fontWeight="medium">Adres Detayı</Field.Label>
                                            <Input
                                                placeholder="Mahalle, Cadde, Sokak, No..."
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </Field.Root>
                                    </Box>
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
                                        {selectedAddress ? 'Güncelle' : 'Kaydet'}
                                    </Button>
                                </HStack>
                            </Dialog.Footer>
                        </form>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

            {/* Özel Silme Onay Modalı */}
            <Dialog.Root open={isDeleteOpen} onOpenChange={(e) => setIsDeleteOpen(e.open)}>
                <Dialog.Backdrop bg="blackAlpha.600" />
                <Dialog.Positioner p={{ base: 3, md: 6 }}>
                    <Dialog.Content rounded="xl" shadow="2xl" maxW="450px" w="full" mx="auto" p={3}>
                        <Dialog.Header borderBottomWidth="1px" pb={3}>
                            <HStack gap={2}>
                                <FiAlertTriangle size={22} color="#E53E3E" />
                                <Dialog.Title fontSize="lg" fontWeight="bold" color="red.600">
                                    Adres Silme Onayı
                                </Dialog.Title>
                            </HStack>
                        </Dialog.Header>

                        <Dialog.Body py={4}>
                            <Text fontSize="sm" color="gray.700">
                                <strong>Adres Anahtarı: {addressToDelete?.addressKey || addressToDelete?.id}</strong> (Müşteri ID: {addressToDelete?.customerId}) olan adresi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

            {/* Ekran Ortasındaki İşlem Sonucu Modalı */}
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