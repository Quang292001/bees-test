// src/App.tsx
import React, { useState, useEffect } from "react";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { FixedSizeList } from "react-window";
import { fetchUsers } from "./api";
import { User } from "./types";
import { lightTheme, darkTheme, Theme } from "./theme";

// GlobalStyle với theme đã được định nghĩa kiểu
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: ${(props) => props.theme.background};
    color: ${(props) => props.theme.text};
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
`;

const Table = styled.div`
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 4px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  background: ${(props) => props.theme.border};
  padding: 10px;
  font-weight: bold;
`;

const TableRow = styled.div`
  display: flex;
  padding: 10px;
  border-bottom: 1px solid ${(props) => props.theme.border};
  &:hover {
    background: ${(props) => props.theme.hover};
  }
`;

const TableCell = styled.div<{ width?: string }>`
  flex: 1;
  padding: 0 10px;
  width: ${(props) => props.width || "auto"};
  display: flex;
  align-items: center;
`;

const CheckboxCell = styled(TableCell)`
  flex: 0 0 50px;
`;

const EmailLink = styled.a`
  color: ${(props) => props.theme.text};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const StatusButton = styled.span`
  padding: 5px 10px;
  border-radius: 15px;
  background-color: ${(props) => props.theme.border};
  display: inline-block;
  font-size: 12px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  margin: 20px 0;
`;

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof User | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await fetchUsers(100); // Fetch 100 users
        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Xử lý lọc dữ liệu
  useEffect(() => {
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset về trang 1 khi lọc
  }, [filter, users]);

  // Xử lý sắp xếp
  const handleSort = (field: keyof User) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    const sorted = [...filteredUsers].sort((a, b) => {
      if (order === "asc") {
        return a[field] > b[field] ? 1 : -1;
      }
      return a[field] < b[field] ? 1 : -1;
    });
    setFilteredUsers(sorted);
  };

  // Xử lý chọn/t bỏ chọn tất cả
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageUserIds = paginatedUsers.map((user) => user.id);
      setSelectedUsers(pageUserIds);
    } else {
      setSelectedUsers([]);
    }
  };

  // Xử lý chọn từng user
  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  // Phân trang
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  // Virtualization với react-window
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const user = paginatedUsers[index];
    if (!user) return null;

    const formatDate = (date: string) => {
      return new Date(date).toISOString().split("T")[0]; // yyyy-MM-dd
    };

    const detailedDate = (date: string) => {
      return new Date(date).toISOString().replace("T", " ").split(".")[0]; // yyyy-MM-dd HH:mm:ss
    };

    return (
      <TableRow style={style}>
        <CheckboxCell>
          <input
            type="checkbox"
            checked={selectedUsers.includes(user.id)}
            onChange={(e) => handleSelectUser(user.id, e.target.checked)}
          />
        </CheckboxCell>
        <TableCell>{user.name}</TableCell>
        <TableCell>${user.balance.toLocaleString()}</TableCell>
        <TableCell>
          <EmailLink href={`mailto:${user.email}`}>{user.email}</EmailLink>
        </TableCell>
        <TableCell title={detailedDate(user.registration)}>
          {formatDate(user.registration)}
        </TableCell>
        <TableCell>
          <StatusButton>{user.status}</StatusButton>
        </TableCell>
        <TableCell>
          <ActionButton>✏️</ActionButton>
        </TableCell>
      </TableRow>
    );
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <GlobalStyle />
      <Container>
        <div>
          <button onClick={() => setDarkMode(!darkMode)}>
            Toggle {darkMode ? "Light" : "Dark"} Mode
          </button>
        </div>

        {/* Filtering */}
        <div style={{ margin: "20px 0" }}>
          <input
            type="text"
            placeholder="Filter by name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <CheckboxCell>
              <input
                type="checkbox"
                checked={
                  paginatedUsers.length > 0 &&
                  paginatedUsers.every((user) => selectedUsers.includes(user.id))
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </CheckboxCell>
            <TableCell onClick={() => handleSort("name")}>Name</TableCell>
            <TableCell onClick={() => handleSort("balance")}>Balance ($)</TableCell>
            <TableCell onClick={() => handleSort("email")}>Email</TableCell>
            <TableCell onClick={() => handleSort("registration")}>Registration</TableCell>
            <TableCell onClick={() => handleSort("status")}>Status</TableCell>
            <TableCell>Action</TableCell>
          </TableHeader>
          <FixedSizeList
            height={400}
            width="100%"
            itemCount={paginatedUsers.length}
            itemSize={50}
          >
            {Row}
          </FixedSizeList>
        </Table>

        {/* Pagination */}
        <Pagination>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 rows</option>
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
          </select>
        </Pagination>
      </Container>
    </ThemeProvider>
  );
};

export default App;