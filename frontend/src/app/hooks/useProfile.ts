"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { UserProfile, Market, UserOutcome } from "@/lib/types";

export function useProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`/api/profile/${userId}`);
        setProfile(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || err.message);
        } else {
          setError("Unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
}

export function useUserCreatedMarkets(userId: string) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchMarkets = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`/api/profile/${userId}/created-markets`);
        setMarkets(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || err.message);
        } else {
          setError("Unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [userId]);

  return { markets, loading, error };
}

export function useUserShares(userId: string) {
  const [shares, setShares] = useState<UserOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchShares = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`/api/profile/${userId}/shares`);
        setShares(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || err.message);
        } else {
          setError("Unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShares();
  }, [userId]);

  return { shares, loading, error };
}
