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
  Chip,
  styled,
  CircularProgress,
} from '@mui/material';
import { format } from 'date-fns-jalali';
import { CheckCircle, AlertCircle } from 'lucide-react';

// Types for our attendance record
interface AttendanceRecord {
  id: number;
  national_code: string;
  first_name: string;
  last_name: string;
  checkin_time: string;
  location: string;
  created_at: string;
  photo?: string;
  status?: 'present' | 'absent';
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

const AttendanceTable: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        // Fetch attendance data from MySQL
        const response = await fetch('/api/attendance');
        if (!response.ok) {
          throw new Error('Failed to fetch attendance data');
        }
        const data = await response.json();

        // Transform the data to include the photo URL using national_code
        const recordsWithPhotos = data.map((record: AttendanceRecord) => ({
          ...record,
          photo: `https://photo-attendance-system.storage.c2.liara.space/user_register/${record.national_code}.jpg`,
          status: 'present',
        }));

        setAttendanceData(recordsWithPhotos);
        setError(null);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setError('خطا در دریافت اطلاعات حضور و غیاب');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
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
              <StyledTableCell>نام</StyledTableCell>
              <StyledTableCell>نام خانوادگی</StyledTableCell>
              <StyledTableCell>کد ملی</StyledTableCell>
              <StyledTableCell>زمان ورود</StyledTableCell>
              <StyledTableCell>محل حضور</StyledTableCell>
              <StyledTableCell>وضعیت</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceData.map((record) => (
              <StyledTableRow key={record.id}>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center">
                    <StyledAvatar
                      src={record.photo}
                      alt={`${record.first_name} ${record.last_name}`}
                      onClick={() => handleImageClick(record.photo!)}
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">{record.first_name}</TableCell>
                <TableCell align="center">{record.last_name}</TableCell>
                <TableCell align="center">{record.national_code}</TableCell>
                <TableCell align="center">
                  {format(new Date(record.checkin_time), 'HH:mm - yyyy/MM/dd')}
                </TableCell>
                <TableCell align="center">{record.location}</TableCell>
                <TableCell align="center">
                  <Chip
                    icon={<CheckCircle size={16} />}
                    label="حاضر"
                    color="success"
                    variant="outlined"
                    sx={{
                      fontWeight: 'bold',
                      '& .MuiChip-icon': {
                        color: 'success.main',
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

export default AttendanceTable;