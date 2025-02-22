import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Backdrop,
} from '@mui/material';

interface UserData {
  fullName: string;
  nationalCode: string;
  phoneNumber: string;
  role: string;
}

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    fullName: '',
    nationalCode: '',
    phoneNumber: '',
    role: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('توکن موجود نیست');
        setLoading(false);
        return;
      }

      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const nationalCode = decodedToken.nationalCode;

        const response = await fetch(`http://nestjs:3001/users/by-national-code/${nationalCode}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const user = await response.json();
          setUserData({
            fullName: user.fullName,
            nationalCode: user.nationalCode,
            phoneNumber: user.phoneNumber,
            role: user.role,
          });
        } else {
          console.error('خطا در دریافت اطلاعات کاربر:', response.statusText);
        }
      } catch (error) {
        console.error('خطا در دریافت اطلاعات کاربر:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData: UserData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`http://nestjs:3001/users/by-national-code/${userData.nationalCode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        console.log('تغییرات با موفقیت ذخیره شد');
        setIsEditing(false);
      } else {
        console.error('خطا در به‌روزرسانی اطلاعات کاربر:', response.statusText);
      }
    } catch (error) {
      console.error('خطا در به‌روزرسانی اطلاعات کاربر:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Backdrop open={loading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        مشخصات کاربری
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="نام کامل"
          name="fullName"
          value={userData.fullName}
          onChange={handleChange}
          disabled={!isEditing}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          label="کد ملی"
          name="nationalCode"
          value={userData.nationalCode}
          disabled
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          label="شماره تلفن"
          name="phoneNumber"
          value={userData.phoneNumber}
          onChange={handleChange}
          disabled={!isEditing}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          label="نقش"
          name="role"
          value={userData.role}
          disabled
          sx={{ marginBottom: 2 }}
        />
        <Button variant="contained" onClick={handleEditToggle} sx={{ marginRight: 1 }}>
          {isEditing ? 'لغو' : 'ویرایش'}
        </Button>
        {isEditing && (
          <Button type="submit" variant="contained">
            ذخیره
          </Button>
        )}
      </form>
    </Box>
  );
};

export default ProfilePage;
