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
  Box,
  Chip,
  styled,
  CircularProgress,
} from '@mui/material';
import { XCircle, AlertCircle } from 'lucide-react';

// Types for our data
interface User {
  id: number;
  fullName: string;
  nationalCode: string;
}

interface AttendanceRecord {
  id: number;
  national_code: string;
  first_name: string;
  last_name: string;
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

const LoadingOverlay = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  gap: theme.spacing(2),
}));

const App: React.FC = () => {
  const [absentUsers, setAbsentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAbsentUsers = async () => {
      try {
        // Fetch all users
        const usersResponse = await fetch('/api/users');
        const users: User[] = await usersResponse.json();

        // Fetch attendance records
        const attendanceResponse = await fetch('/api/attendance');
        const attendanceRecords: AttendanceRecord[] = await attendanceResponse.json();

        // Find users who are absent (not in attendance records)
        const absentUsers = users.filter(user => 
          !attendanceRecords.some(record => record.national_code === user.nationalCode)
        );

        setAbsentUsers(absentUsers);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('خطا در دریافت اطلاعات غایبین');
      } finally {
        setLoading(false);
      }
    };

    fetchAbsentUsers();
  }, []);

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
                <StyledTableCell>نام و نام خانوادگی</StyledTableCell>
                <StyledTableCell>کد ملی</StyledTableCell>
                <StyledTableCell>وضعیت</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {absentUsers.map((user) => (
                <StyledTableRow key={user.id}>
                  <TableCell align="center">{user.fullName}</TableCell>
                  <TableCell align="center">{user.nationalCode}</TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<XCircle size={16} />}
                      label="غایب"
                      color="error"
                      variant="outlined"
                      sx={{
                        fontWeight: 'bold',
                        '& .MuiChip-icon': {
                          color: 'error.main',
                        },
                      }}
                    />
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