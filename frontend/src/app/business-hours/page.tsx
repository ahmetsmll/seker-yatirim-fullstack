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
    useGetBusinessHoursQuery,
    useCreateBusinessHoursMutation,
    useUpdateBusinessHoursMutation,
    useDeleteBusinessHoursMutation,
} from '@/store/api/apiSlice';
import { BusinessHours } from '@/types';

export default function BusinessHoursPage() {
    // RTK Query Hook'ları
    const { data: businessHours, isLoading, isError } = useGetBusinessHoursQuery();
    const [createBusinessHours, { isLoading: isCreating }] = useCreateBusinessHoursMutation();
    const [updateBusinessHours, { isLoading: isUpdating }] = useUpdateBusinessHoursMutation();
    const [deleteBusinessHours, { isLoading: isDeleting }] = useDeleteBusinessHoursMutation();

    // State Yönetimi
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<BusinessHours | null>(null);

    // Silme Modalı State'leri
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<BusinessHours | null>(null);

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
        startTime: '09:00',
        endTime: '18:00',
        lunchBreakEnabled: true,
        lunchStartTime: '12:00',
        lunchEndTime: '13:00',
    });

    // Doğrulama Kontrolleri
    const isFormIncomplete = !formData.startTime.trim() || !formData.endTime.trim();
    const isLunchIncomplete =
        formData.lunchBreakEnabled &&
        (!formData.lunchStartTime.trim() || !formData.lunchEndTime.trim());

    const hasValidationErrors = isFormIncomplete || isLunchIncomplete;

    // Fuse.js Bulanık Arama Yapılandırması
    const fuse = useMemo(() => {
        if (!businessHours) return null;

        return new Fuse(businessHours, {
            keys: [
                { name: 'startTime', weight: 0.3 },
                { name: 'endTime', weight: 0.3 },
                { name: 'lunchStartTime', weight: 0.2 },
                { name: 'lunchEndTime', weight: 0.2 },
            ],
            threshold: 0.3,
            minMatchCharLength: 1,
        });
    }, [businessHours]);

    const filteredBusinessHours = useMemo(() => {
        if (!searchTerm.trim()) return businessHours || [];
        if (!fuse) return [];
        return fuse.search(searchTerm.trim()).map((res) => res.item);
    }, [searchTerm, fuse, businessHours]);

    // Modal Açma (Ekle / Düzenle)
    const handleOpenModal = (item?: BusinessHours) => {
        if (item) {
            setSelectedItem(item);
            setFormData({
                startTime: item.startTime || '09:00',
                endTime: item.endTime || '18:00',
                lunchBreakEnabled: item.lunchBreakEnabled ?? true,
                lunchStartTime: item.lunchStartTime || '12:00',
                lunchEndTime: item.lunchEndTime || '13:00',
            });
        } else {
            setSelectedItem(null);
            setFormData({
                startTime: '09:00',
                endTime: '18:00',
                lunchBreakEnabled: true,
                lunchStartTime: '12:00',
                lunchEndTime: '13:00',
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
                startTime: formData.startTime,
                endTime: formData.endTime,
                lunchBreakEnabled: formData.lunchBreakEnabled,
                lunchStartTime: formData.lunchBreakEnabled ? formData.lunchStartTime : '',
                lunchEndTime: formData.lunchBreakEnabled ? formData.lunchEndTime : '',
                updatedDate: new Date().toISOString(),
            };

            if (selectedItem && selectedItem.id) {
                await updateBusinessHours({
                    id: selectedItem.id,
                    ...payload,
                }).unwrap();
                setIsOpen(false);
                triggerFeedback(
                    'Mesai Saati Güncellendi',
                    'Mesai saati bilgileri başarıyla güncellenmiştir.',
                    'success'
                );
            } else {
                await createBusinessHours(payload).unwrap();
                setIsOpen(false);
                triggerFeedback(
                    'Mesai Saati Ekledi',
                    'Yeni mesai saati tanımı sisteme kaydedilmiştir.',
                    'success'
                );
            }
        } catch (err) {
            console.error('İşlem sırasında hata oluştu:', err);
        }
    };

    // Silme Modalını Açma
    const handleOpenDeleteModal = (item: BusinessHours) => {
        setItemToDelete(item);
        setIsDeleteOpen(true);
    };

    // Silme Onayı
    const handleConfirmDelete = async () => {
        if (!itemToDelete || itemToDelete.id === undefined) return;

        try {
            await deleteBusinessHours(itemToDelete.id).unwrap();
            setIsDeleteOpen(false);
            triggerFeedback(
                'Mesai Saati Silindi',
                `ID: "${itemToDelete.id}" olan mesai tanımı başarıyla silindi.`,
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
        return <Text color="red.500">Mesai saatleri yüklenirken bir hata oluştu!</Text>;
    }

    return (
        <Box position="relative">
            {/* Üst Başlık ve Yeni Ekle Butonu */}
            <HStack justify="space-between" mb={6}>
                <Heading size="lg" color="gray.800">
                    Mesai Saatleri Yönetimi
                </Heading>
                <Button colorPalette="red" onClick={() => handleOpenModal()}>
                    <FiPlus style={{ marginRight: '8px' }} /> Yeni Mesai Saati Ekle
                </Button>
            </HStack>

            {/* Fuse.js Arama Çubuğu */}
            <Box mb={6} bg="white" p={4} rounded="lg" shadow="sm">
                <HStack gap={3}>
                    <FiSearch size={20} color="gray" />
                    <Input
                        placeholder="Başlangıç, bitiş veya öğle arası saatleri ile akıllı ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="outline"
                    />
                </HStack>
            </Box>

            {/* Mesai Saatleri Tablosu */}
            <Box bg="white" rounded="lg" shadow="sm" overflow="hidden" p={4}>
                <Table.Root variant="line" interactive>
                    <Table.Header bg="gray.100">
                        <Table.Row>
                            <Table.ColumnHeader>ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Başlangıç Saati</Table.ColumnHeader>
                            <Table.ColumnHeader>Bitiş Saati</Table.ColumnHeader>
                            <Table.ColumnHeader>Öğle Arası Durumu</Table.ColumnHeader>
                            <Table.ColumnHeader>Öğle Arası Başlangıç</Table.ColumnHeader>
                            <Table.ColumnHeader>Öğle Arası Bitiş</Table.ColumnHeader>
                            <Table.ColumnHeader>Son Güncelleme</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="center">İşlemler</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {filteredBusinessHours && filteredBusinessHours.length > 0 ? (
                            filteredBusinessHours.map((item) => (
                                <Table.Row key={item.id}>
                                    <Table.Cell>{item.id}</Table.Cell>
                                    <Table.Cell fontWeight="bold">{item.startTime}</Table.Cell>
                                    <Table.Cell fontWeight="bold">{item.endTime}</Table.Cell>
                                    <Table.Cell>
                                        <Badge colorPalette={item.lunchBreakEnabled ? 'green' : 'red'}>
                                            {item.lunchBreakEnabled ? 'AKTİF' : 'PASİF'}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>{item.lunchBreakEnabled ? item.lunchStartTime || '-' : '-'}</Table.Cell>
                                    <Table.Cell>{item.lunchBreakEnabled ? item.lunchEndTime || '-' : '-'}</Table.Cell>
                                    <Table.Cell>
                                        {item.updatedDate
                                            ? new Date(item.updatedDate).toLocaleDateString('tr-TR')
                                            : '-'}
                                    </Table.Cell>
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
                            ))
                        ) : (
                            <Table.Row>
                                <Table.Cell colSpan={8} textAlign="center" py={6} color="gray.500">
                                    Arama kriterlerine uygun mesai saati tanımı bulunamadı.
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
                                    {selectedItem ? 'Mesai Saatini Güncelle' : 'Yeni Mesai Saati Ekle'}
                                </Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body py={4} maxH="65vh" overflowY="auto">
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                    <Field.Root required>
                                        <Field.Label fontWeight="medium">Mesai Başlangıç Saati</Field.Label>
                                        <Input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        />
                                    </Field.Root>

                                    <Field.Root required>
                                        <Field.Label fontWeight="medium">Mesai Bitiş Saati</Field.Label>
                                        <Input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        />
                                    </Field.Root>

                                    {/* Öğle Arası Durumu Segmented Button */}
                                    <Box gridColumn={{ md: 'span 2' }}>
                                        <Field.Root required>
                                            <Field.Label fontWeight="medium">Öğle Arası Var Mı?</Field.Label>
                                            <HStack gap={2} w="full">
                                                <Button
                                                    type="button"
                                                    flex={1}
                                                    variant={formData.lunchBreakEnabled ? 'solid' : 'outline'}
                                                    colorPalette="red"
                                                    bg={formData.lunchBreakEnabled ? 'red.500' : 'white'}
                                                    color={formData.lunchBreakEnabled ? 'white' : 'gray.700'}
                                                    borderColor={formData.lunchBreakEnabled ? 'red.500' : 'gray.300'}
                                                    borderRadius="md"
                                                    fontWeight="medium"
                                                    transition="all 0.2s"
                                                    _hover={{
                                                        bg: 'red.500',
                                                        color: 'white',
                                                        borderColor: 'red.500',
                                                    }}
                                                    onClick={() => setFormData({ ...formData, lunchBreakEnabled: true })}
                                                >
                                                    Aktif (Var)
                                                </Button>

                                                <Button
                                                    type="button"
                                                    flex={1}
                                                    variant={!formData.lunchBreakEnabled ? 'solid' : 'outline'}
                                                    colorPalette="red"
                                                    bg={!formData.lunchBreakEnabled ? 'red.500' : 'white'}
                                                    color={!formData.lunchBreakEnabled ? 'white' : 'gray.700'}
                                                    borderColor={!formData.lunchBreakEnabled ? 'red.500' : 'gray.300'}
                                                    borderRadius="md"
                                                    fontWeight="medium"
                                                    transition="all 0.2s"
                                                    _hover={{
                                                        bg: 'red.500',
                                                        color: 'white',
                                                        borderColor: 'red.500',
                                                    }}
                                                    onClick={() => setFormData({ ...formData, lunchBreakEnabled: false })}
                                                >
                                                    Pasif (Yok)
                                                </Button>
                                            </HStack>
                                        </Field.Root>
                                    </Box>

                                    {/* Öğle Arası Aktifse Saat Input'ları Görünür */}
                                    {formData.lunchBreakEnabled && (
                                        <>
                                            <Field.Root required>
                                                <Field.Label fontWeight="medium">Öğle Arası Başlangıç</Field.Label>
                                                <Input
                                                    type="time"
                                                    value={formData.lunchStartTime}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, lunchStartTime: e.target.value })
                                                    }
                                                />
                                            </Field.Root>

                                            <Field.Root required>
                                                <Field.Label fontWeight="medium">Öğle Arası Bitiş</Field.Label>
                                                <Input
                                                    type="time"
                                                    value={formData.lunchEndTime}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, lunchEndTime: e.target.value })
                                                    }
                                                />
                                            </Field.Root>
                                        </>
                                    )}
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

            {/* Özel Silme Onay Modalı */}
            <Dialog.Root open={isDeleteOpen} onOpenChange={(e) => setIsDeleteOpen(e.open)}>
                <Dialog.Backdrop bg="blackAlpha.600" />
                <Dialog.Positioner p={{ base: 3, md: 6 }}>
                    <Dialog.Content rounded="xl" shadow="2xl" maxW="450px" w="full" mx="auto" p={3}>
                        <Dialog.Header borderBottomWidth="1px" pb={3}>
                            <HStack gap={2}>
                                <FiAlertTriangle size={22} color="#E53E3E" />
                                <Dialog.Title fontSize="lg" fontWeight="bold" color="red.600">
                                    Mesai Saati Silme Onayı
                                </Dialog.Title>
                            </HStack>
                        </Dialog.Header>

                        <Dialog.Body py={4}>
                            <Text fontSize="sm" color="gray.700">
                                <strong>ID: {itemToDelete?.id}</strong> ({itemToDelete?.startTime} - {itemToDelete?.endTime}) olan mesai saati tanımını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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