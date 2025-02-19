import { View } from 'react-native';
import {
  MapWithMarkers,
  Modal,
  PlanCardSwiper,
  Spinner,
  Text,
} from '@/components';
import { mapSettings } from '@/config/map';
import { PlanSelector } from '@/components/plan';
import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Icon } from '@/components/ui/atoms/Icon';
import { Drawer } from 'expo-router/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import useLocation from '@/hooks/useLocation';
import { useLazyGetPlanDetailsQuery } from '@/api/plan';
import { useLazyGetEventsQuery } from '@/api/event';
import { useLazyGetCategoriesQuery } from '@/api/event';
import Slider from '@react-native-community/slider';
import { Picker} from '@react-native-picker/picker';

export default function Map() {
  const [isPlanSelectorOpened, setIsPlanSelectorOpened] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [focusedEvent, setFocusedEvent] = useState(0);
  const location = useLocation();
  const [getCategories, { data: categories = [], isLoading: isLoadingCategories },] = useLazyGetCategoriesQuery();
  const [getPlanDetails, { data: plan = { events: [] }, isLoading: isLoadingPlan },] = useLazyGetPlanDetailsQuery();
  const [getAllEvents, { data: allEvents = [], error, isLoading: isLoadinEvents },] = useLazyGetEventsQuery();

  const isLoading = isLoadingPlan || isLoadinEvents;


  useEffect(() => {
    selectedPlan
      ? getPlanDetails({ id: selectedPlan, location })
      : getAllEvents({});
  }, [selectedPlan]);
  
  const [filters, setFilters] = useState({
    price: null,
    valoration: null,
    category: null,
  });

  const [pendingFilters, setPendingFilters] = useState(filters);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  let events = !!selectedPlan ? plan?.events : allEvents;

  const markers = events.map(({ coord_x, coord_y }) => ({
    coordinate: {
      latitude: coord_x,
      longitude: coord_y,
    },
  }));

  const planCards = events.map(
    ({
      id,
      event_name,
      price,
      start_hour,
      finish_hour,
      nombre_imagenes,
      direccion_event,
      valoration,
    }) => ({
      id,
      title: event_name.trim(),
      hourStart: start_hour
        ? (start_hour.split(':').slice(0, 2).join(':') as string)
        : '9:00',
      hourEnd: start_hour
        ? (finish_hour.split(':').slice(0, 2).join(':') as string)
        : '14:30',
      price,
      gallery: nombre_imagenes,
      locationName: direccion_event,
      description: 'Ventajas',
      valoration,
    })
  );

  

  const onPlanSelected = (planId: string | null) => {
    console.log('planId', planId);
    setSelectedPlan(planId);
    setIsPlanSelectorOpened(false);
  };

  const applyFilters = () => {
    setFilters(pendingFilters);
    setIsFilterModalOpen(false);
    getAllEvents(pendingFilters);
  };

  const resetFilters = () => {
    setPendingFilters({
      price: null,
      valoration: null,
      category: null,
    });
  };

  const openFilterModal = () => {
    setIsFilterModalOpen(true);
    if (categories.length === 0) {
      getCategories();
    }
  };

  

  return (
    <>
      <Drawer.Screen
        options={{
          headerTransparent: true,
          headerTitle: plan?.description,
          headerBackground: () => (
            <LinearGradient
              colors={['#000000', '#00000000']}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          ),
          headerRight: () => (
            <View className="flex-row">
              {/* 🔹 Botón para abrir el selector de planes */}
              <TouchableOpacity
                onPress={() => setIsPlanSelectorOpened((p) => !p)}
                className="mr-4"
              >
                <Icon name="notebook" />
              </TouchableOpacity>

              {/* 🔹 Botón para abrir el modal de filtros */}
              <TouchableOpacity
                onPress={() => openFilterModal()}
                className="mr-4"
              >
                <Icon name="filter" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* 🔹 Modal de filtros */}
      <Modal open={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
        <View className="bg-neutral-700 w-full rounded-xl p-4">
          <Text bold className="white font-black text-lg mb-2">Filtrar Eventos</Text>

          {/* Precio */}
          <Text className="white">Precio Máximo: {pendingFilters.price !== null ? `${pendingFilters.price}€` : 'Sin Precio Máximo'}</Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={pendingFilters.price ?? 0}
            onValueChange={(value) => setPendingFilters((prev) => ({ ...prev, price: value }))}
            minimumTrackTintColor="#1E90FF"
            maximumTrackTintColor="#808080"
          />

          {/* Valoración */}
          <Text className="white mt-4">Valoración Mínima: {pendingFilters.valoration !== null ? `${pendingFilters.valoration}` : 'Sin Valoración'}</Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={pendingFilters.valoration ?? 0}
            onValueChange={(value) => setPendingFilters((prev) => ({ ...prev, valoration: value }))}
            minimumTrackTintColor="#FFD700"
            maximumTrackTintColor="#808080"
          />

          {/* Categoría */}
          <View className="mt-4 w-full">
            <Text className="text-white mb-2">Categoría:</Text>
            <View className="bg-neutral-700 rounded-lg overflow-hidden border border-neutral-500">
              <Picker
                selectedValue={pendingFilters.category}
                onValueChange={(itemValue) =>
                  setPendingFilters((prev) => ({ ...prev, category: itemValue }))
                }
                style={{ color: 'white' }}
                dropdownIconColor="white"
              >
                <Picker.Item label="Todas" value="" />
                {categories.map((category) => (
                  <Picker.Item key={category.id} label={category.category} value={category.id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Botón de aplicar */}
          <TouchableOpacity
            onPress={resetFilters}
            className="mt-4 bg-red-500 p-3 rounded-lg"
          >
            <Text className="text-white text-center font-bold">Restablecer Filtros</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={applyFilters} className="bg-blue-500 p-3 rounded-lg mt-4">
            <Text className="text-white text-center font-bold">Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Spinner open={isLoading} />
      <View className="flex-1">
        <Modal
          open={isPlanSelectorOpened}
          onClose={() => setIsPlanSelectorOpened(false)}
        >
          <PlanSelector
            className="bg-neutral-700 w-full rounded-xl flex-grow-0"
            onPlanSelected={onPlanSelected}
          />
          <TouchableOpacity
            onPress={() => onPlanSelected(null)}
            className="mx-auto mt-4 items-center"
          >
            <Icon name="binoculars" size={32} />
            <Text bold className="white font-black mt-2 uppercase">
              Explorar
            </Text>
          </TouchableOpacity>
        </Modal>
        <MapWithMarkers
          markers={markers}
          focusedMarker={focusedEvent}
          setFocusedMarker={setFocusedEvent}
          {...mapSettings}
        ></MapWithMarkers>
      </View>
      <PlanCardSwiper
        planCards={planCards}
        focusedEvent={focusedEvent}
        onPlanSelected={setFocusedEvent}
        className="absolute bottom-1"
        from={selectedPlan ? 'plan' : 'explore'}
      />
    </>
  );
}
