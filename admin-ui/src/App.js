import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserData, setEditingUserData] = useState({});
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    axios.get('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
      .then(response => {
        setUsers(response.data);
        setFilteredUsers(response.data);
      })
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter(user =>
        Object.values(user).some(value =>
          value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
    setCurrentPage(1);
  }, [searchTerm, users]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectAll = () => {
    if (isPageSelected()) {
      setSelectedUsers(selectedUsers.filter(id => !currentPageUsers().some(user => user.id === id)));
    } else {
      setSelectedUsers([...selectedUsers, ...currentPageUsers().map(user => user.id)]);
    }
  };

  const handleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(selectedId => selectedId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const handleDeleteSelectedUsers = () => {
    setUsers(users.filter(user => !selectedUsers.includes(user.id)));
    setSelectedUsers([]);
  };

  const handleEditUser = (id) => {
    setEditingUserId(id);
    const user = users.find(user => user.id === id);
    setEditingUserData({ ...user });
  };

  const handleSaveUser = (id) => {
    setUsers(users.map(user => (user.id === id ? editingUserData : user)));
    setEditingUserId(null);
    setEditingUserData({});
  };

  const handleChangeUserData = (event) => {
    const { name, value } = event.target;
    setEditingUserData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const currentPageUsers = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  };

  const isPageSelected = () => {
    return currentPageUsers().every(user => selectedUsers.includes(user.id));
  };

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  return (
    <div className="container">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={isPageSelected()}
                onChange={handleSelectAll}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPageUsers().map(user => (
            <tr key={user.id} className={selectedUsers.includes(user.id) ? 'selected' : ''}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleSelectUser(user.id)}
                />
              </td>
              <td>
                {editingUserId === user.id ? (
                  <input
                    type="text"
                    name="name"
                    value={editingUserData.name}
                    onChange={handleChangeUserData}
                  />
                ) : (
                  user.name
                )}
              </td>
              <td>
                {editingUserId === user.id ? (
                  <input
                    type="text"
                    name="email"
                    value={editingUserData.email}
                    onChange={handleChangeUserData}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {editingUserId === user.id ? (
                  <input
                    type="text"
                    name="role"
                    value={editingUserData.role}
                    onChange={handleChangeUserData}
                  />
                ) : (
                  user.role
                )}
              </td>
              <td>
                {editingUserId === user.id ? (
                  <button
                    className="save"
                    onClick={() => handleSaveUser(user.id)}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="edit"
                    onClick={() => handleEditUser(user.id)}
                  >
                    Edit
                  </button>
                )}
                <button
                  className="delete"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button
          className="first-page"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(1)}
        >
          First
        </button>
        <button
          className="previous-page"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        >
          Previous
        </button>
        {[...Array(totalPages).keys()].map(number => (
          <button
            key={number}
            className={`page-number ${currentPage === number + 1 ? 'active' : ''}`}
            onClick={() => setCurrentPage(number + 1)}
          >
            {number + 1}
          </button>
        ))}
        <button
          className="next-page"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        >
          Next
        </button>
        <button
          className="last-page"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(totalPages)}
        >
          Last
        </button>
      </div>
      <button
        className="delete-selected"
        onClick={handleDeleteSelectedUsers}
      >
        Delete Selected
      </button>
    </div>
  );
};

export default App;
