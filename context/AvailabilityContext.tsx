import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Alert } from 'react-native';
import { format } from 'date-fns';
import { useAuth } from './AuthContext'; // Import useAuth

// API_URL is defined in your original file, ensure it's correct
const API_URL = 'http://192.168.1.51/kreno-api'; // Adjusted to base URL, endpoint will be appended

export interface AvailabilitySlot {
  availability_id?: number;
  user_id: string;
  available_date: string; // YYYY-MM-DD
  start_time: string;     // HH:mm
}

interface AvailabilityContextType {
  availability: AvailabilitySlot[];
  isLoading: boolean;
  error: string | null;
  fetchAvailability: (startDate?: Date, endDate?: Date) => Promise<void>; // userId removed
  addAvailabilitySlot: (slotData: { available_date: string; start_time: string }) => Promise<boolean>; // userId removed from input
  removeAvailabilitySlot: (slotData: { available_date: string; start_time: string }) => Promise<boolean>; // userId removed from input
}

const AvailabilityContext = createContext<AvailabilityContextType | undefined>(undefined);

export const AvailabilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth(); // Get the current user from AuthContext

  const fetchAvailability = useCallback(async (startDate?: Date, endDate?: Date) => {
    if (!currentUser?.userId) {
      setError("User not authenticated. Cannot fetch availability.");
      setAvailability([]); // Clear availability if user is not logged in
      return;
    }
    const userId = currentUser.userId;
    setIsLoading(true);
    setError(null);
    try {
      let queryParams = `user_id=${encodeURIComponent(userId)}`;
      if (startDate) queryParams += `&start_date=${encodeURIComponent(format(startDate, 'yyyy-MM-dd'))}`;
      if (endDate) queryParams += `&end_date=${encodeURIComponent(format(endDate, 'yyyy-MM-dd'))}`;

      const response = await fetch(`${API_URL}/availability_api.php?${queryParams}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch availability');
      }
      setAvailability(data.data || []);
    } catch (err: any) {
      console.error("fetchAvailability error:", err);
      setError(err.message || 'An unknown error occurred while fetching availability.');
      setAvailability([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.userId]); // Depend on currentUser.userId

  const addAvailabilitySlot = useCallback(async (slotData: { available_date: string; start_time: string }) => {
    if (!currentUser?.userId) {
      Alert.alert("Authentication Error", "You must be logged in to add availability.");
      return false;
    }
    const slotWithUser: Omit<AvailabilitySlot, 'availability_id'> = {
      ...slotData,
      user_id: currentUser.userId,
    };

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/availability_api.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slotWithUser),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add availability slot');
      }
      // API returns the full slot object including availability_id and user_id
      setAvailability(prev => [...prev, data.data as AvailabilitySlot]);
      return true;
    } catch (err: any) {
      console.error("addAvailabilitySlot error:", err);
      setError(err.message || 'An unknown error occurred while adding slot.');
      Alert.alert("Error", err.message || "Could not add availability slot.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.userId]); // Depend on currentUser.userId

  const removeAvailabilitySlot = useCallback(async (slotData: { available_date: string; start_time: string }) => {
    if (!currentUser?.userId) {
      Alert.alert("Authentication Error", "You must be logged in to remove availability.");
      return false;
    }
    const slotWithUser: Omit<AvailabilitySlot, 'availability_id'> = {
      ...slotData,
      user_id: currentUser.userId,
    };

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/availability_api.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slotWithUser),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove availability slot');
      }
      setAvailability(prev => prev.filter(s =>
        !(s.user_id === slotWithUser.user_id && s.available_date === slotWithUser.available_date && s.start_time === slotWithUser.start_time)
      ));
      return true;
    } catch (err: any) {
      console.error("removeAvailabilitySlot error:", err);
      setError(err.message || 'An unknown error occurred while removing slot.');
      Alert.alert("Error", err.message || "Could not remove availability slot.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.userId]); // Depend on currentUser.userId


  return (
    <AvailabilityContext.Provider value={{ availability, isLoading, error, fetchAvailability, addAvailabilitySlot, removeAvailabilitySlot }}>
      {children}
    </AvailabilityContext.Provider>
  );
};

export const useAvailability = (): AvailabilityContextType => {
  const context = useContext(AvailabilityContext);
  if (context === undefined) {
    throw new Error('useAvailability must be used within an AvailabilityProvider');
  }
  return context;
};