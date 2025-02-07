import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  Box,
  styled,
  CircularProgress,
} from '@mui/material';
import { format } from 'date-fns-jalali';
import { Clock, AlertCircle } from 'lucide-react';

// Types for our data
interface User {
  id: number;
  fullName: string;
  nationalCode: string;
  lastSeen: string;
  imageUrl: string;
}

// Styled components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: '70vh',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  '&::-webkit-scrollbar': {
    width: '0.4em',
    height: '0.4em',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.default,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  textAlign: 'center',
  padding: theme.spacing(2),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    transition: 'background-color 0.2s ease',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 50,
  height: 50,
  border: `2px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[2],
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  gap: theme.spacing(2),
}));

const LastSeenInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch users data
        const response = await fetch('/api/last_seen');
        const data = await response.json();

        // Transform the data to include lastSeen and imageUrl
        const usersWithDetails = data.map((user: any) => ({
          ...user,
          lastSeen: user.lastSeen || new Date().toISOString(), // Use current time if not provided
          imageUrl: `https://photo-attendance-system.storage.c2.liara.space/last_seen/${user.nationalCode}.jpg`, // Use nationalCode for image URL
        }));

        setUsers(usersWithDetails);
        setError(null);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('خطا در دریافت اطلاعات کاربران');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleImageClick = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  if (loading) {
    return (
      <LoadingOverlay>
        <CircularProgress size={40} />
        <Typography variant="h6">در حال بارگذاری...</Typography>
      </LoadingOverlay>
    );
  }

  if (error) {
    return (
      <LoadingOverlay>
        <AlertCircle size={40} color="error" />
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </LoadingOverlay>
    );
  }

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <StyledTableContainer >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell>تصویر</StyledTableCell>
              <StyledTableCell>نام و نام خانوادگی</StyledTableCell>
              <StyledTableCell>کد ملی</StyledTableCell>
              <StyledTableCell>آخرین بازدید</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <StyledTableRow key={user.id}>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center">
                    <StyledAvatar
                      src={user.imageUrl}
                      alt={user.fullName}
                      onClick={() => handleImageClick(user.imageUrl)}
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">{user.fullName}</TableCell>
                <TableCell align="center">{user.nationalCode}</TableCell>
                <TableCell align="center">
                  <LastSeenInfo>
                    <Clock size={16} />
                    {format(new Date(user.lastSeen), 'HH:mm:ss - yyyy/MM/dd')}
                  </LastSeenInfo>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </Box>
  );
};

export default App;
