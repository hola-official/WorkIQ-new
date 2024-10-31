import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useShowToast from './useShowToast';
import { useAxiosInstance } from '../../api/axios';
import useAuth from './useAuth';
import { useRecoilState } from 'recoil';
import userAtom from '@/atoms/userAtom';

const useGetUserProfile = () => {
  // const [userInfo, setUserInfo] = useRecoilState(userAtom);
  const [userInfo, setUserInfo] = useState({});
  const axiosInstance = useAxiosInstance()
  const [loading, setLoading] = useState(true);
  const { _id, username } = useAuth()
  const { query } = useParams();
  const showToast = useShowToast();

  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await axiosInstance.get(`users/${query}`);
        const data = res.data;

        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        console.log(data);

        setUserInfo(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, [query, showToast]);

  return { loading, userInfo };
};

export default useGetUserProfile;
