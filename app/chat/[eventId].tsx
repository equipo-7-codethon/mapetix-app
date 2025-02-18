import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, Button } from '@/components';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGetMessagesQuery } from '@/api/chat';
import { useInsertMessageMutation } from '@/api/chat';
import { useNavigation } from '@react-navigation/native';

const SOCKET_SERVER_URL = 'http://192.168.1.38:5000/chat';

export default function ChatScreen() {
  const { eventId, title } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const [messages, setMessages] = useState<{ user: string; message: string }[]>([]);
  const [message, setMessage] = useState('');
  const socketRef = useRef<Socket | null>(null); // useRef para almacenar el socket
  const [insertMessage] = useInsertMessageMutation();
  const { data = [], isLoading, refetch: refetchGetMessages } = useGetMessagesQuery(eventId);
    

  useEffect(() => {
    if (title) {
      navigation.setOptions({ title });
    }
    const fetchTokenAndConnect = async () => {
      // Obtener el token del AsyncStorage
      const jwtToken = await AsyncStorage.getItem('token');
      
      if (!jwtToken) {
        console.log('Usuario no autenticado');
        return; // Si no hay token, no conectamos al chat
      }

      refetchGetMessages()
      .then((response) => {
        setMessages(response.data); // Establecer los mensajes actualizados
      })
      .catch((error) => {
        console.error('Error al hacer refetch de mensajes:', error);
      });

      // Crear el socket con el token en los headers
      const newSocket = io(SOCKET_SERVER_URL, {
        query: { eventId },
        transports: ['websocket'], // Esto puede ser útil para asegurar el transporte WebSocket
        extraHeaders: {
            Authorization: `${jwtToken}`, // Pasar el token en los headers de la conexión
          },
      });

      socketRef.current = newSocket;

      newSocket.on('connect', () => {
        console.log('Conectado al chat');
        newSocket.emit('join', { room: eventId });
      });

      newSocket.on('message', (data) => {
        console.log('Mensaje recibido:', data);
        setMessages((prev) => { // Agrega este log para ver si está actualizando correctamente
          return [...prev, data];
        });
      });

      newSocket.on('error', (error) => {
        console.error('Error:', error);
      });
    };

      fetchTokenAndConnect();

      return () => {
        if (socketRef.current) {
          console.log('Saliendo de la sala...');
          socketRef.current.emit('leave', { room: eventId }); // Dejar la sala
          //socketRef.current.disconnect(); // Desconectar socket
          socketRef.current = null; // Eliminar referencia al socket
        }
      };
    }, [eventId]);

  const sendMessage = () => {
    if (message.trim() && socketRef.current) {
        //socketRef.current.emit('leave', { room: eventId });
      socketRef.current.emit('message', { message, room: eventId });
      try {
        insertMessage({ eventId, message });
      } catch (error) {
        console.error('Error guardando mensaje:', error);
      }
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-neutral-800 px-4"
    >
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          
          <View className="flex-row items-start mb-3">
            {/* Avatar con la primera letra del usuario */}
            <View className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
              <Text className="text-white font-bold">{item.user[0].toUpperCase()}</Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-gray-300 font-bold">{item.user}</Text>
            
            {/* Mensaje */}
            <View className="mb-2 p-2 rounded-lg bg-gray-700 self-start">
              <Text className="text-white">{item.message}</Text>
              </View>
            </View>
          </View>
        )}
        style={{ marginTop: 120 }} // Ajusta el valor según el tamaño de la barra
        
      />
      <View className="flex-row items-center gap-x-2 mb-4">
        <TextInput
          className="flex-1 bg-gray-600 text-white p-2 rounded"
          value={message}
          onChangeText={setMessage}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#ccc"
        />
        <Button stylish="primary" onPress={sendMessage}>Enviar</Button>
      </View>
    </KeyboardAvoidingView>
  );
}
