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
    useGetIpoApprovalsQuery,
    useCreateIpoApprovalMutation,
    useUpdateIpoApprovalMutation,
    useDeleteIpoApprovalMutation,
    useDeleteMultipleIpoApprovalsMutation,
    useApproveMultipleIpoApprovalsMutation,
} from '@/store/api/apiSlice';
import { IpoApproval } from '@/types';

export default function IpoApprovalsPage() {
    // RTK Query Hook'ları
    const { data: ipoApprovals, isLoading, isError } = useGetIpoApprovalsQuery();
    const [createIpoApproval, { isLoading: isCreating }] = useCreateIpoApprovalMutation();
    const [updateIpoApproval, { isLoading: isUpdating }] = useUpdateIpoApprovalMutation();
    const [deleteIpoApproval, { isLoading: isDeleting }] = useDeleteIpoApprovalMutation();
    const [deleteMultipleIpoApprovals, { isLoading: isBulkDeleting }] = useDeleteMultipleIpoApprovalsMutation();
    const [approveMultipleIpoApprovals, { isLoading: isBulkApproving }] = useApproveMultipleIpoApprovalsMutation();

    // State Yönetimi
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<IpoApproval | null>(null);

    // Tekil Silme Modalı State'leri
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<IpoApproval | null>(null);

    // Toplu İşlem State'leri (Kutucuk Seçimleri)
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [isBulkApproveOpen, setIsBulkApproveOpen] = useState(false);

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
        ipoId: '',
        approved: true,
        approvedAt: '',
        clientIp: '',
        deviceId: '',
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
        if (!ipoApprovals) return;
        if (selectedIds.length === ipoApprovals.length) {
            setSelectedIds([]);
        } else {
            const allIds = ipoApprovals.map((item) => item.id).filter((id): id is number => id !== undefined);
            setSelectedIds(allIds);
        }
    };

    // Toplu Silme İşlemi
    const handleConfirmBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        try {
            await deleteMultipleIpoApprovals(selectedIds).unwrap();
            setIsBulkDeleteOpen(false);
            triggerFeedback(
                'Onay Kayıtları Silindi',
                `Seçilen ${selectedIds.length} adet halka arz onay kaydı başarıyla silindi.`,
                'delete'
            );
            setSelectedIds([]);
        } catch (err) {
            console.error('Toplu silme başarısız:', err);
        }
    };

    // Toplu Onaylama İşlemi
    const handleConfirmBulkApprove = async () => {
        if (selectedIds.length === 0) return;

        try {
            await approveMultipleIpoApprovals(selectedIds).unwrap();
            setIsBulkApproveOpen(false);
            triggerFeedback(
                'Toplu Onay Tamamlandı',
                `Seçilen ${selectedIds.length} adet halka arz izahnamesi başarıyla onaylandı.`,
                'success'
            );
            setSelectedIds([]);
        } catch (err) {
            console.error('Toplu onaylama başarısız:', err);
        }
    };

    // Mükerrer Onay Kontrolü (Aynı Müşteri + Aynı Halka Arz)
    const otherApprovals = useMemo(() => {
        return ipoApprovals?.filter((item) => (selectedItem ? item.id !== selectedItem.id : true)) || [];
    }, [ipoApprovals, selectedItem]);

    const isDuplicateApproval = Boolean(
        formData.customerId.trim() &&
        formData.ipoId.trim() &&
        otherApprovals.some(
            (item) =>
                String(item.customerId ?? '') === formData.customerId.trim() &&
                String(item.ipoId ?? '') === formData.ipoId.trim()
        )
    );

    const isFormIncomplete = !formData.customerId.trim() || !formData.ipoId.trim();
    const hasValidationErrors = isDuplicateApproval || isFormIncomplete;

    // Fuse.js Bulanık Arama Yapılandırması
    const fuse = useMemo(() => {
        if (!ipoApprovals) return null;

        return new Fuse(ipoApprovals, {
            keys: [
                { name: 'customerId', weight: 0.35 },
                { name: 'ipoId', weight: 0.35 },
                { name: 'clientIp', weight: 0.15 },
                { name: 'deviceId', weight: 0.15 },
            ],
            threshold: 0.3,
            minMatchCharLength: 1,
        });
    }, [ipoApprovals]);

    const filteredApprovals = useMemo(() => {
        if (!searchTerm.trim()) return ipoApprovals || [];
        if (!fuse) return [];
        return fuse.search(searchTerm.trim()).map((res) => res.item);
    }, [searchTerm, fuse, ipoApprovals]);

    // Modal Açma (Ekle / Düzenle)
    const handleOpenModal = (item?: IpoApproval) => {
        if (item) {
            setSelectedItem(item);
            setFormData({
                customerId: String(item.customerId ?? ''),
                ipoId: String(item.ipoId ?? ''),
                approved: item.approved ?? true,
                approvedAt: item.approvedAt ? new Date(item.approvedAt).toISOString().slice(0, 16) : '',
                clientIp: item.clientIp || '',
                deviceId: item.deviceId || '',
            });
        } else {
            setSelectedItem(null);
            setFormData({
                customerId: '',
                ipoId: '',
                approved: true,
                approvedAt: new Date().toISOString().slice(0, 16),
                clientIp: '',
                deviceId: '',
            });
        }
        setIsOpen(true);
    };

    // Form Gönderme (Create & Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (hasValidationErrors) return;

        try {
            const formattedDate = formData.approvedAt
                ? new Date(formData.approvedAt).toISOString()
                : new Date().toISOString();

            const payload = {
                customerId: Number(formData.customerId),
                ipoId: Number(formData.ipoId),
                approved: formData.approved,
                approvedAt: formattedDate,
                clientIp: formData.clientIp,
                deviceId: formData.deviceId,
            };

            if (selectedItem && selectedItem.id) {
                await updateIpoApproval({
                    id: selectedItem.id,
                    ...payload,
                }).unwrap();
                setIsOpen(false);
                triggerFeedback(
                    'Onay Bilgisi Güncellendi',
                    'Halka arz onay kaydı başarıyla güncellenmiştir.',
                    'success'
                );
            } else {
                await createIpoApproval(payload).unwrap();
                setIsOpen(false);
                triggerFeedback(
                    'Onay Kaydı Oluşturuldu',
                    'Yeni halka arz onayı sisteme kaydedilmiştir.',
                    'success'
                );
            }
        } catch (err) {
            console.error('İşlem sırasında hata oluştu:', err);
        }
    };

    // Silme Modalını Açma
    const handleOpenDeleteModal = (item: IpoApproval) => {
        setItemToDelete(item);
        setIsDeleteOpen(true);
    };

    // Silme Onayı
    const handleConfirmDelete = async () => {
        if (!itemToDelete || itemToDelete.id === undefined) return;

        try {
            await deleteIpoApproval(itemToDelete.id).unwrap();
            setIsDeleteOpen(false);
            triggerFeedback(
                'Onay Kaydı Silindi',
                `ID: "${itemToDelete.id}" olan onay kaydı başarıyla silindi.`,
                'delete'
            );
            setItemToDelete(null);
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
        return <Text color="red.500">Halka arz onayları yüklenirken bir hata oluştu!</Text>;
    }

    return (
        <Box position="relative">
            {/* Üst Başlık ve Butonlar */}
            <HStack justify="space-between" mb={6}>
                <Heading size="lg" color="gray.800">
                    Halka Arz İzahname Onayları
                </Heading>
                <HStack gap={3}>
                    {/* Seçilen Kayıt Varsa Beliren Toplu İşlem Butonları */}
                    {selectedIds.length > 0 && (
                        <>
                            <Button
                                colorPalette="green"
                                onClick={() => setIsBulkApproveOpen(true)}
                            >
                                <FiCheckCircle style={{ marginRight: '8px' }} />
                                Seçilenleri Onayla ({selectedIds.length})
                            </Button>

                            <Button
                                colorPalette="red"
                                variant="subtle"
                                onClick={() => setIsBulkDeleteOpen(true)}
                            >
                                <FiTrash2 style={{ marginRight: '8px' }} />
                                Seçilenleri Sil ({selectedIds.length})
                            </Button>
                        </>
                    )}
                    <Button colorPalette="red" onClick={() => handleOpenModal()}>
                        <FiPlus style={{ marginRight: '8px' }} /> Yeni Onay Ekle
                    </Button>
                </HStack>
            </HStack>

            {/* Fuse.js Arama Çubuğu */}
            <Box mb={6} bg="white" p={4} rounded="lg" shadow="sm">
                <HStack gap={3}>
                    <FiSearch size={20} color="gray" />
                    <Input
                        placeholder="Müşteri ID, Halka Arz ID, IP Adresi veya Cihaz ID ile akıllı ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="outline"
                    />
                </HStack>
            </Box>

            {/* Onaylar Tablosu */}
            <Box bg="white" rounded="lg" shadow="sm" overflow="hidden" p={4}>
                <Table.Root variant="line" interactive>
                    <Table.Header bg="gray.100">
                        <Table.Row>
                            {/* TÜMÜNÜ SEÇ KUTUCUĞU */}
                            <Table.ColumnHeader width="50px">
                                <input
                                    type="checkbox"
                                    checked={Boolean(ipoApprovals && ipoApprovals.length > 0 && selectedIds.length === ipoApprovals.length)}
                                    onChange={handleSelectAll}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                            </Table.ColumnHeader>
                            <Table.ColumnHeader>ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Müşteri ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Halka Arz ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Onay Durumu</Table.ColumnHeader>
                            <Table.ColumnHeader>Onay Tarihi ve Saati</Table.ColumnHeader>
                            <Table.ColumnHeader>IP Adresi</Table.ColumnHeader>
                            <Table.ColumnHeader>Cihaz ID</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="center">İşlemler</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {filteredApprovals && filteredApprovals.length > 0 ? (
                            filteredApprovals.map((item) => {
                                const isSelected = item.id !== undefined && selectedIds.includes(item.id);
                                return (
                                    <Table.Row key={item.id} bg={isSelected ? 'red.50' : 'transparent'}>
                                        {/* TEKİL KUTUCUK (CHECKBOX) */}
                                        <Table.Cell>
                                            {item.id !== undefined && (
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(item.id!)}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                            )}
                                        </Table.Cell>
                                        <Table.Cell>{item.id}</Table.Cell>
                                        <Table.Cell fontWeight="bold">{item.customerId}</Table.Cell>
                                        <Table.Cell>{item.ipoId}</Table.Cell>
                                        <Table.Cell>
                                            <Badge colorPalette={item.approved ? 'green' : 'red'}>
                                                {item.approved ? 'ONAYLANDI' : 'ONAYLANMADI'}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {item.approvedAt
                                                ? new Date(item.approvedAt).toLocaleString('tr-TR')
                                                : '-'}
                                        </Table.Cell>
                                        <Table.Cell>{item.clientIp || '-'}</Table.Cell>
                                        <Table.Cell maxW="150px" truncate>{item.deviceId || '-'}</Table.Cell>
                                        <Table.Cell textAlign="center">
                                            <HStack justify="center" gap={2}>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    colorPalette="blue"
                                                    onClick={() => handleOpenModal(item)}
                                                >
                                                    <FiEdit2 />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    colorPalette="red"
                                                    onClick={() => handleOpenDeleteModal(item)}
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
                                <Table.Cell colSpan={9} textAlign="center" py={6} color="gray.500">
                                    Arama kriterlerine uygun onay kaydı bulunamadı.
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
                                    {selectedItem ? 'Onay Bilgilerini Güncelle' : 'Yeni İzahname Onayı Ekle'}
                                </Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body py={4} maxH="65vh" overflowY="auto">
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                    <Field.Root required invalid={isDuplicateApproval}>
                                        <Field.Label fontWeight="medium">Müşteri ID</Field.Label>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="off"
                                            value={formData.customerId}
                                            onChange={(e) => {
                                                const onlyNums = e.target.value.replace(/\D/g, '');
                                                setFormData({ ...formData, customerId: onlyNums });
                                            }}
                                            disabled={Boolean(selectedItem)}
                                        />
                                    </Field.Root>

                                    <Field.Root required invalid={isDuplicateApproval}>
                                        <Field.Label fontWeight="medium">Halka Arz ID</Field.Label>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="off"
                                            value={formData.ipoId}
                                            onChange={(e) => {
                                                const onlyNums = e.target.value.replace(/\D/g, '');
                                                setFormData({ ...formData, ipoId: onlyNums });
                                            }}
                                            disabled={Boolean(selectedItem)}
                                        />
                                        {isDuplicateApproval && (
                                            <Text color="orange.600" fontSize="xs" mt={1}>
                                                ⚠️ Bu müşteri için bu halka arz onayı zaten kayıtlı!
                                            </Text>
                                        )}
                                    </Field.Root>

                                    <Field.Root required>
                                        <Field.Label fontWeight="medium">Onay Tarihi ve Saati</Field.Label>
                                        <Input
                                            type="datetime-local"
                                            value={formData.approvedAt}
                                            onChange={(e) =>
                                                setFormData({ ...formData, approvedAt: e.target.value })
                                            }
                                        />
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Label fontWeight="medium">IP Adresi</Field.Label>
                                        <Input
                                            placeholder="Örn: 192.168.1.1"
                                            value={formData.clientIp}
                                            onChange={(e) =>
                                                setFormData({ ...formData, clientIp: e.target.value })
                                            }
                                        />
                                    </Field.Root>

                                    <Box gridColumn={{ md: 'span 2' }}>
                                        <Field.Root>
                                            <Field.Label fontWeight="medium">Cihaz ID / Bilgisi</Field.Label>
                                            <Input
                                                value={formData.deviceId}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, deviceId: e.target.value })
                                                }
                                            />
                                        </Field.Root>
                                    </Box>

                                    <Box gridColumn={{ md: 'span 2' }}>
                                        <Field.Root required>
                                            <Field.Label fontWeight="medium">Onay Durumu</Field.Label>
                                            <HStack gap={2} w="full">
                                                <Button
                                                    type="button"
                                                    flex={1}
                                                    variant={formData.approved ? 'solid' : 'outline'}
                                                    colorPalette="red"
                                                    bg={formData.approved ? 'red.500' : 'white'}
                                                    color={formData.approved ? 'white' : 'gray.700'}
                                                    borderColor={formData.approved ? 'red.500' : 'gray.300'}
                                                    borderRadius="md"
                                                    fontWeight="medium"
                                                    transition="all 0.2s"
                                                    _hover={{
                                                        bg: 'red.500',
                                                        color: 'white',
                                                        borderColor: 'red.500',
                                                    }}
                                                    onClick={() => setFormData({ ...formData, approved: true })}
                                                >
                                                    Onaylandı (True)
                                                </Button>

                                                <Button
                                                    type="button"
                                                    flex={1}
                                                    variant={!formData.approved ? 'solid' : 'outline'}
                                                    colorPalette="red"
                                                    bg={!formData.approved ? 'red.500' : 'white'}
                                                    color={!formData.approved ? 'white' : 'gray.700'}
                                                    borderColor={!formData.approved ? 'red.500' : 'gray.300'}
                                                    borderRadius="md"
                                                    fontWeight="medium"
                                                    transition="all 0.2s"
                                                    _hover={{
                                                        bg: 'red.500',
                                                        color: 'white',
                                                        borderColor: 'red.500',
                                                    }}
                                                    onClick={() => setFormData({ ...formData, approved: false })}
                                                >
                                                    Onaylanmadı (False)
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
                                        {selectedItem ? 'Güncelle' : 'Kaydet'}
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
                                    Onay Kaydı Silme Onayı
                                </Dialog.Title>
                            </HStack>
                        </Dialog.Header>

                        <Dialog.Body py={4}>
                            <Text fontSize="sm" color="gray.700">
                                <strong>ID: {itemToDelete?.id}</strong> (Müşteri ID: {itemToDelete?.customerId}, Halka Arz ID: {itemToDelete?.ipoId}) olan onay kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

            {/* TOPLU ONAYLAMA MODALI */}
            <Dialog.Root open={isBulkApproveOpen} onOpenChange={(e) => setIsBulkApproveOpen(e.open)}>
                <Dialog.Backdrop bg="blackAlpha.600" />
                <Dialog.Positioner p={{ base: 3, md: 6 }}>
                    <Dialog.Content rounded="xl" shadow="2xl" maxW="450px" w="full" mx="auto" p={3}>
                        <Dialog.Header borderBottomWidth="1px" pb={3}>
                            <HStack gap={2}>
                                <FiCheckCircle size={22} color="#38A169" />
                                <Dialog.Title fontSize="lg" fontWeight="bold" color="green.600">
                                    Toplu İzahname Onayı
                                </Dialog.Title>
                            </HStack>
                        </Dialog.Header>

                        <Dialog.Body py={4}>
                            <Text fontSize="sm" color="gray.700">
                                Seçmiş olduğunuz <strong>{selectedIds.length} adet</strong> halka arz izahnamesini onaylamak istediğinizden emin misiniz?
                            </Text>
                        </Dialog.Body>

                        <Dialog.Footer borderTopWidth="1px" pt={3}>
                            <HStack justify="flex-end" gap={3} w="full">
                                <Button variant="outline" onClick={() => setIsBulkApproveOpen(false)}>
                                    Vazgeç
                                </Button>
                                <Button
                                    colorPalette="green"
                                    onClick={handleConfirmBulkApprove}
                                    loading={isBulkApproving}
                                >
                                    Evet, Hepsini Onayla
                                </Button>
                            </HStack>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

            {/* TOPLU SİLME MODALI */}
            <Dialog.Root open={isBulkDeleteOpen} onOpenChange={(e) => setIsBulkDeleteOpen(e.open)}>
                <Dialog.Backdrop bg="blackAlpha.600" />
                <Dialog.Positioner p={{ base: 3, md: 6 }}>
                    <Dialog.Content rounded="xl" shadow="2xl" maxW="450px" w="full" mx="auto" p={3}>
                        <Dialog.Header borderBottomWidth="1px" pb={3}>
                            <HStack gap={2}>
                                <FiAlertTriangle size={22} color="#E53E3E" />
                                <Dialog.Title fontSize="lg" fontWeight="bold" color="red.600">
                                    Toplu Silme Onayı
                                </Dialog.Title>
                            </HStack>
                        </Dialog.Header>

                        <Dialog.Body py={4}>
                            <Text fontSize="sm" color="gray.700">
                                Seçmiş olduğunuz <strong>{selectedIds.length} adet</strong> onay kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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