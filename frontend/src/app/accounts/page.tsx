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
    useGetAccountsQuery,
    useCreateAccountMutation,
    useUpdateAccountMutation,
    useDeleteAccountMutation,
} from '@/store/api/apiSlice';
import { Account } from '@/types';

export default function AccountsPage() {
    // RTK Query Hook'ları
    const { data: accounts, isLoading, isError } = useGetAccountsQuery();
    const [createAccount, { isLoading: isCreating }] = useCreateAccountMutation();
    const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();
    const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

    // State Yönetimi
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    // Silme Modalı State'leri
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

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
        accountId: '',
        branchId: '',
        customerId: '',
        fullname: '',
    });

    // Mükerrer Hesap Kodu Kontrolü (Düzenlenen hesap hariç tutulur)
    const otherAccounts = accounts?.filter((a) =>
        selectedAccount ? a.id !== selectedAccount.id : true
    ) || [];

    const isDuplicateAccountId = Boolean(
        formData.accountId.trim() &&
        otherAccounts.some(
            (a) => a.accountId?.toLowerCase().trim() === formData.accountId.toLowerCase().trim()
        )
    );

    const hasValidationErrors = isDuplicateAccountId;

    // Fuse.js Bulanık Arama Yapılandırması
    const fuse = useMemo(() => {
        if (!accounts) return null;

        return new Fuse(accounts, {
            keys: [
                { name: 'accountId', weight: 0.4 },
                { name: 'fullname', weight: 0.3 },
                { name: 'customerId', weight: 0.2 },
                { name: 'branchId', weight: 0.1 },
            ],
            threshold: 0.3,
            minMatchCharLength: 1,
        });
    }, [accounts]);

    const filteredAccounts = useMemo(() => {
        if (!searchTerm.trim()) return accounts || [];
        if (!fuse) return [];
        return fuse.search(searchTerm.trim()).map((res) => res.item);
    }, [searchTerm, fuse, accounts]);

    // Modal Açma (Ekle / Düzenle)
    const handleOpenModal = (account?: Account) => {
        if (account) {
            setSelectedAccount(account);
            setFormData({
                accountId: account.accountId || '',
                branchId: String(account.branchId || ''),
                customerId: String(account.customerId || ''),
                fullname: account.fullname || '',
            });
        } else {
            setSelectedAccount(null);
            setFormData({
                accountId: '',
                branchId: '',
                customerId: '',
                fullname: '',
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
                accountId: formData.accountId,
                branchId: Number(formData.branchId),
                customerId: Number(formData.customerId),
                fullname: formData.fullname,
                defaultAccount: selectedAccount ? selectedAccount.defaultAccount : true,
                accountVerificationStatus: selectedAccount ? selectedAccount.accountVerificationStatus : 'VERIFIED',
            };

            if (selectedAccount && selectedAccount.id) {
                await updateAccount({
                    id: selectedAccount.id,
                    ...payload,
                }).unwrap();
                setIsOpen(false);
                triggerFeedback(
                    'Hesap Güncellendi',
                    'Hesap bilgileri başarıyla güncellenmiştir.',
                    'success'
                );
            } else {
                await createAccount(payload).unwrap();
                setIsOpen(false);
                triggerFeedback(
                    'Hesap Tanımlandı',
                    'Yeni hesap başarıyla sisteme eklenmiştir.',
                    'success'
                );
            }
        } catch (err) {
            console.error('İşlem sırasında hata oluştu:', err);
        }
    };

    // Silme Modalını Açma
    const handleOpenDeleteModal = (account: Account) => {
        setAccountToDelete(account);
        setIsDeleteOpen(true);
    };

    // Silme Onayı
    const handleConfirmDelete = async () => {
        if (!accountToDelete || !accountToDelete.id) return;

        try {
            await deleteAccount(accountToDelete.id).unwrap();
            setIsDeleteOpen(false);
            triggerFeedback(
                'Hesap Silindi',
                `Hesap Kodu "${accountToDelete.accountId || accountToDelete.id}" olan kayıt başarıyla silindi.`,
                'delete'
            );
            setAccountToDelete(null);
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
        return <Text color="red.500">Hesaplar yüklenirken bir hata oluştu!</Text>;
    }

    return (
        <Box position="relative">
            {/* Üst Başlık ve Yeni Ekle Butonu */}
            <HStack justify="space-between" mb={6}>
                <Heading size="lg" color="gray.800">
                    Hesap Yönetimi
                </Heading>
                <Button colorPalette="red" onClick={() => handleOpenModal()}>
                    <FiPlus style={{ marginRight: '8px' }} /> Yeni Hesap Ekle
                </Button>
            </HStack>

            {/* Fuse.js Arama Çubuğu */}
            <Box mb={6} bg="white" p={4} rounded="lg" shadow="sm">
                <HStack gap={3}>
                    <FiSearch size={20} color="gray" />
                    <Input
                        placeholder="Hesap Kodu, Unvan, Müşteri ID veya Şube ID ile akıllı ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="outline"
                    />
                </HStack>
            </Box>

            {/* Hesap Tablosu */}
            <Box bg="white" rounded="lg" shadow="sm" overflow="hidden" p={4}>
                <Table.Root variant="line" interactive>
                    <Table.Header bg="gray.100">
                        <Table.Row>
                            <Table.ColumnHeader>ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Hesap Kodu</Table.ColumnHeader>
                            <Table.ColumnHeader>Şube ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Müşteri ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Unvan / Ad Soyad</Table.ColumnHeader>
                            <Table.ColumnHeader>Varsayılan</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="center">İşlemler</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {filteredAccounts && filteredAccounts.length > 0 ? (
                            filteredAccounts.map((acc) => (
                                <Table.Row key={acc.id}>
                                    <Table.Cell>{acc.id}</Table.Cell>
                                    <Table.Cell fontWeight="bold">{acc.accountId || '-'}</Table.Cell>
                                    <Table.Cell>{acc.branchId || '-'}</Table.Cell>
                                    <Table.Cell>{acc.customerId || '-'}</Table.Cell>
                                    <Table.Cell>{acc.fullname || '-'}</Table.Cell>
                                    <Table.Cell>
                                        <Badge colorPalette={acc.defaultAccount ? 'green' : 'gray'}>
                                            {acc.defaultAccount ? 'EVET' : 'HAYIR'}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell textAlign="center">
                                        <HStack justify="center" gap={2}>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                colorPalette="blue"
                                                onClick={() => handleOpenModal(acc)}
                                            >
                                                <FiEdit2 />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                colorPalette="red"
                                                onClick={() => handleOpenDeleteModal(acc)}
                                            >
                                                <FiTrash2 />
                                            </Button>
                                        </HStack>
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        ) : (
                            <Table.Row>
                                <Table.Cell colSpan={7} textAlign="center" py={6} color="gray.500">
                                    Arama kriterlerine uygun hesap bulunamadı.
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
                                    {selectedAccount ? 'Hesap Bilgilerini Güncelle' : 'Yeni Hesap Tanımla'}
                                </Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body py={4} maxH="65vh" overflowY="auto">
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                    <Field.Root required invalid={isDuplicateAccountId}>
                                        <Field.Label fontWeight="medium">Hesap Kodu (Örn: TR123...)</Field.Label>
                                        <Input
                                            value={formData.accountId}
                                            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                                            disabled={Boolean(selectedAccount)}
                                        />
                                        {isDuplicateAccountId && (
                                            <Text color="orange.600" fontSize="xs" mt={1}>
                                                ⚠️ Bu hesap kodu zaten tanımlı!
                                            </Text>
                                        )}
                                    </Field.Root>

                                    <Field.Root required>
                                        <Field.Label fontWeight="medium">Müşteri ID</Field.Label>
                                        <Input
                                            type="number"
                                            value={formData.customerId}
                                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                            disabled={Boolean(selectedAccount)}
                                        />
                                    </Field.Root>

                                    <Field.Root required>
                                        <Field.Label fontWeight="medium">Şube ID</Field.Label>
                                        <Input
                                            type="number"
                                            value={formData.branchId}
                                            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                        />
                                    </Field.Root>

                                    <Field.Root required>
                                        <Field.Label fontWeight="medium">Hesap Unvanı / Ad Soyad</Field.Label>
                                        <Input
                                            value={formData.fullname}
                                            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                        />
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
                                        {selectedAccount ? 'Güncelle' : 'Kaydet'}
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
                                    Hesap Silme Onayı
                                </Dialog.Title>
                            </HStack>
                        </Dialog.Header>

                        <Dialog.Body py={4}>
                            <Text fontSize="sm" color="gray.700">
                                <strong>Hesap Kodu: {accountToDelete?.accountId || accountToDelete?.id}</strong> ({accountToDelete?.fullname}) olan hesabı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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