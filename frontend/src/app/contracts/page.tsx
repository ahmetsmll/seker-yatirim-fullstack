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
    useGetContractsQuery,
    useCreateContractMutation,
    useUpdateContractMutation,
    useDeleteContractMutation,
} from '@/store/api/apiSlice';
import { CustomerContract } from '@/types';

export default function ContractsPage() {
    // RTK Query Hook'ları
    const { data: contracts, isLoading, isError } = useGetContractsQuery();
    const [createContract, { isLoading: isCreating }] = useCreateContractMutation();
    const [updateContract, { isLoading: isUpdating }] = useUpdateContractMutation();
    const [deleteContract, { isLoading: isDeleting }] = useDeleteContractMutation();

    // State Yönetimi
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<CustomerContract | null>(null);

    // Silme Modalı State'leri
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [contractToDelete, setContractToDelete] = useState<CustomerContract | null>(null);

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

    // Form State'i (Inputlar için hepsi string tutulur)
    const [formData, setFormData] = useState({
        customerRefId: '',
        contractTypeId: '',
        contractVersion: '1',
        contractStatus: 1,
        approvedDate: '',
    });

    // Mükerrer Sözleşme Kontrolü
    const otherContracts = useMemo(() => {
        return contracts?.filter((c) => (selectedContract ? c.id !== selectedContract.id : true)) || [];
    }, [contracts, selectedContract]);

    const isDuplicateContract = Boolean(
        formData.customerRefId.trim() &&
        formData.contractTypeId.trim() &&
        otherContracts.some(
            (c) =>
                String(c.customerRefId ?? '') === formData.customerRefId.trim() &&
                String(c.contractTypeId ?? '') === formData.contractTypeId.trim()
        )
    );

    const isFormIncomplete = !formData.customerRefId.trim() || !formData.contractTypeId.trim();
    const hasValidationErrors = isDuplicateContract || isFormIncomplete;

    // Fuse.js Bulanık Arama Yapılandırması
    const fuse = useMemo(() => {
        if (!contracts) return null;

        return new Fuse(contracts, {
            keys: [
                { name: 'customerRefId', weight: 0.4 },
                { name: 'contractTypeId', weight: 0.3 },
                { name: 'contractVersion', weight: 0.15 },
                { name: 'contractStatus', weight: 0.15 },
            ],
            threshold: 0.3,
            minMatchCharLength: 1,
        });
    }, [contracts]);

    const filteredContracts = useMemo(() => {
        if (!searchTerm.trim()) return contracts || [];
        if (!fuse) return [];
        return fuse.search(searchTerm.trim()).map((res) => res.item);
    }, [searchTerm, fuse, contracts]);

    // Modal Açma (Ekle / Düzenle)
    const handleOpenModal = (contract?: CustomerContract) => {
        if (contract) {
            setSelectedContract(contract);
            setFormData({
                customerRefId: String(contract.customerRefId ?? ''),
                contractTypeId: String(contract.contractTypeId ?? ''),
                contractVersion: String(contract.contractVersion ?? '1'), // TS2322 Düzeltmesi
                contractStatus: contract.contractStatus ?? 1,
                approvedDate: contract.approvedDate ? String(contract.approvedDate).split('T')[0] : '',
            });
        } else {
            setSelectedContract(null);
            setFormData({
                customerRefId: '',
                contractTypeId: '',
                contractVersion: '1',
                contractStatus: 1,
                approvedDate: new Date().toISOString().split('T')[0],
            });
        }
        setIsOpen(true);
    };

    // Form Gönderme (Create & Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (hasValidationErrors) return;

        try {
            // Backend'in beklediği YYYY-MM-DD tarih formatı
            const formattedDate = formData.approvedDate || new Date().toISOString().split('T')[0];

            const payload = {
                customerRefId: Number(formData.customerRefId),
                contractTypeId: Number(formData.contractTypeId),
                contractVersion: Number(formData.contractVersion) || 1,
                contractStatus: Number(formData.contractStatus),
                approvedDate: formattedDate, // ISO String yerine YYYY-MM-DD
            };

            if (selectedContract && selectedContract.id) {
                await updateContract({
                    id: selectedContract.id,
                    ...payload,
                }).unwrap();
                setIsOpen(false);
                triggerFeedback('Sözleşme Güncellendi', 'Sözleşme bilgileri güncellenmiştir.', 'success');
            } else {
                await createContract(payload).unwrap();
                setIsOpen(false);
                triggerFeedback('Sözleşme Oluşturuldu', 'Yeni sözleşme kaydedilmiştir.', 'success');
            }
        } catch (err) {
            console.error('İşlem sırasında hata oluştu:', err);
        }
    };

    // Silme Modalını Açma
    const handleOpenDeleteModal = (contract: CustomerContract) => {
        setContractToDelete(contract);
        setIsDeleteOpen(true);
    };

    // Silme Onayı
    const handleConfirmDelete = async () => {
        if (!contractToDelete || contractToDelete.id === undefined) return;

        try {
            await deleteContract(contractToDelete.id).unwrap();
            setIsDeleteOpen(false);
            triggerFeedback(
                'Sözleşme Silindi',
                `ID: "${contractToDelete.id}" olan sözleşme kaydı başarıyla silindi.`,
                'delete'
            );
            setContractToDelete(null);
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
        return <Text color="red.500">Sözleşmeler yüklenirken bir hata oluştu!</Text>;
    }

    return (
        <Box position="relative">
            {/* Üst Başlık ve Yeni Ekle Butonu */}
            <HStack justify="space-between" mb={6}>
                <Heading size="lg" color="gray.800">
                    Sözleşme Yönetimi
                </Heading>
                <Button colorPalette="red" onClick={() => handleOpenModal()}>
                    <FiPlus style={{ marginRight: '8px' }} /> Yeni Sözleşme Ekle
                </Button>
            </HStack>

            {/* Fuse.js Arama Çubuğu */}
            <Box mb={6} bg="white" p={4} rounded="lg" shadow="sm">
                <HStack gap={3}>
                    <FiSearch size={20} color="gray" />
                    <Input
                        placeholder="Müşteri Ref ID, Sözleşme Tipi ID veya Versiyon ile akıllı ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="outline"
                    />
                </HStack>
            </Box>

            {/* Sözleşme Tablosu */}
            <Box bg="white" rounded="lg" shadow="sm" overflow="hidden" p={4}>
                <Table.Root variant="line" interactive>
                    <Table.Header bg="gray.100">
                        <Table.Row>
                            <Table.ColumnHeader>ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Müşteri Ref ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Sözleşme Tipi ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Versiyon</Table.ColumnHeader>
                            <Table.ColumnHeader>Durum Kodu</Table.ColumnHeader>
                            <Table.ColumnHeader>Onay Tarihi</Table.ColumnHeader>
                            <Table.ColumnHeader>Oluşturulma Tarihi</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="center">İşlemler</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {filteredContracts && filteredContracts.length > 0 ? (
                            filteredContracts.map((contract) => (
                                <Table.Row key={contract.id}>
                                    <Table.Cell>{contract.id}</Table.Cell>
                                    <Table.Cell fontWeight="bold">{contract.customerRefId}</Table.Cell>
                                    <Table.Cell>{contract.contractTypeId}</Table.Cell>
                                    <Table.Cell>
                                        <Badge colorPalette="purple">v{contract.contractVersion}</Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge colorPalette={contract.contractStatus === 1 ? 'green' : 'orange'}>
                                            {contract.contractStatus === 1
                                                ? 'ONAYLI (1)'
                                                : `BEKLEMEDE (${contract.contractStatus ?? 0})`}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {contract.approvedDate
                                            ? new Date(contract.approvedDate).toLocaleDateString('tr-TR')
                                            : '-'}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {contract.createdDate
                                            ? new Date(contract.createdDate).toLocaleDateString('tr-TR')
                                            : '-'}
                                    </Table.Cell>
                                    <Table.Cell textAlign="center">
                                        <HStack justify="center" gap={2}>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                colorPalette="blue"
                                                onClick={() => handleOpenModal(contract)}
                                            >
                                                <FiEdit2 />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                colorPalette="red"
                                                onClick={() => handleOpenDeleteModal(contract)}
                                            >
                                                <FiTrash2 />
                                            </Button>
                                        </HStack>
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        ) : (
                            <Table.Row>
                                <Table.Cell colSpan={8} textAlign="center" py={6} color="gray.500">
                                    Arama kriterlerine uygun sözleşme bulunamadı.
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
                        <form onSubmit={handleSubmit} autoComplete="off">
                            <Dialog.Header borderBottomWidth="1px" pb={3}>
                                <Dialog.Title fontSize={{ base: 'md', md: 'xl' }} fontWeight="bold">
                                    {selectedContract ? 'Sözleşme Bilgilerini Güncelle' : 'Yeni Sözleşme Ekle'}
                                </Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body py={4} maxH="65vh" overflowY="auto">
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                    {/* Müşteri Ref ID */}
                                    <Field.Root required invalid={isDuplicateContract}>
                                        <Field.Label fontWeight="medium">Müşteri Ref ID</Field.Label>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="off"
                                            value={formData.customerRefId}
                                            onChange={(e) => {
                                                const onlyNums = e.target.value.replace(/\D/g, ''); // Sadece rakam kabul eder
                                                setFormData({ ...formData, customerRefId: onlyNums });
                                            }}
                                            disabled={Boolean(selectedContract)}
                                        />
                                    </Field.Root>

                                    {/* Sözleşme Tipi ID */}
                                    <Field.Root required invalid={isDuplicateContract}>
                                        <Field.Label fontWeight="medium">Sözleşme Tipi ID</Field.Label>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="off"
                                            value={formData.contractTypeId}
                                            onChange={(e) => {
                                                const onlyNums = e.target.value.replace(/\D/g, ''); // Sadece rakam kabul eder
                                                setFormData({ ...formData, contractTypeId: onlyNums });
                                            }}
                                            disabled={Boolean(selectedContract)}
                                        />
                                        {isDuplicateContract && (
                                            <Text color="orange.600" fontSize="xs" mt={1}>
                                                ⚠️ Bu müşteri için bu sözleşme tipi zaten tanımlı!
                                            </Text>
                                        )}
                                    </Field.Root>

                                    <Field.Root required>
                                        <Field.Label fontWeight="medium">Sözleşme Versiyonu</Field.Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={formData.contractVersion}
                                            onChange={(e) =>
                                                setFormData({ ...formData, contractVersion: e.target.value })
                                            }
                                        />
                                    </Field.Root>

                                    <Field.Root required>
                                        <Field.Label fontWeight="medium">Onay Tarihi</Field.Label>
                                        <Input
                                            type="date"
                                            value={formData.approvedDate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, approvedDate: e.target.value })
                                            }
                                        />
                                    </Field.Root>

                                    {/* Kırmızı Temalı Durum Seçimi Segmented Button */}
                                    <Box gridColumn={{ md: 'span 2' }}>
                                        <Field.Root required>
                                            <Field.Label fontWeight="medium">Sözleşme Durumu</Field.Label>
                                            <HStack gap={2} w="full">
                                                <Button
                                                    type="button"
                                                    flex={1}
                                                    variant={formData.contractStatus === 1 ? 'solid' : 'outline'}
                                                    colorPalette="red"
                                                    bg={formData.contractStatus === 1 ? 'red.500' : 'white'}
                                                    color={formData.contractStatus === 1 ? 'white' : 'gray.700'}
                                                    borderColor={formData.contractStatus === 1 ? 'red.500' : 'gray.300'}
                                                    borderRadius="md"
                                                    fontWeight="medium"
                                                    transition="all 0.2s"
                                                    _hover={{
                                                        bg: 'red.500',
                                                        color: 'white',
                                                        borderColor: 'red.500',
                                                    }}
                                                    onClick={() => setFormData({ ...formData, contractStatus: 1 })}
                                                >
                                                    Onaylı (1)
                                                </Button>

                                                <Button
                                                    type="button"
                                                    flex={1}
                                                    variant={formData.contractStatus === 0 ? 'solid' : 'outline'}
                                                    colorPalette="red"
                                                    bg={formData.contractStatus === 0 ? 'red.500' : 'white'}
                                                    color={formData.contractStatus === 0 ? 'white' : 'gray.700'}
                                                    borderColor={formData.contractStatus === 0 ? 'red.500' : 'gray.300'}
                                                    borderRadius="md"
                                                    fontWeight="medium"
                                                    transition="all 0.2s"
                                                    _hover={{
                                                        bg: 'red.500',
                                                        color: 'white',
                                                        borderColor: 'red.500',
                                                    }}
                                                    onClick={() => setFormData({ ...formData, contractStatus: 0 })}
                                                >
                                                    Beklemede (0)
                                                </Button>
                                            </HStack>
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
                                        {selectedContract ? 'Güncelle' : 'Kaydet'}
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
                                    Sözleşme Silme Onayı
                                </Dialog.Title>
                            </HStack>
                        </Dialog.Header>

                        <Dialog.Body py={4}>
                            <Text fontSize="sm" color="gray.700">
                                <strong>Sözleşme ID: {contractToDelete?.id}</strong> (Müşteri Ref ID:{' '}
                                {contractToDelete?.customerRefId}) olan sözleşmeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

            {/* Sayfa Ortasındaki İşlem Sonucu Modalı */}
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