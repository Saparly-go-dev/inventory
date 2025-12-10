import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getEmployeesPage,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../api/employees";
import type {
  Employee,
  UpdateEmployee
} from "../api/employees";
import { handleApiError } from "../api/client";

const PAGE_SIZE = 10;

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<UpdateEmployee>({
    full_name: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    room_number: 0,
  });
  const [editId, setEditId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const roomNumbers = roomFilter.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      const page = await getEmployeesPage(PAGE_SIZE, pageNumber, search, roomNumbers);
      setEmployees(page.items);
      setTotalPages(page.total_pages);
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setLoading(false);
    }
  }, [pageNumber, search, roomFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(null);
      if (editId === null) {
        await createEmployee(form);
      } else {
        await updateEmployee(editId, form);
      }
      resetForm();
      await load();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Delete employee?")) return;
    try {
      setError(null);
      await deleteEmployee(id);
      await load();
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  function onEditClick(e: Employee) {
    setEditId(e.id);
    setForm({
      full_name: e.full_name,
      position: e.position,
      department: e.department,
      email: e.email,
      phone: e.phone,
      room_number: e.room_number,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditId(null);
    setForm({
      full_name: "",
      position: "",
      department: "",
      email: "",
      phone: "",
      room_number: 0,
    });
  }

  return (
    <div>
      <h2>Employees</h2>

      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => {
            setPageNumber(1);
            setSearch(e.target.value);
          }}
        />
        <input
          placeholder="Filter by rooms (e.g. 101,202)..."
          value={roomFilter}
          onChange={(e) => {
            setPageNumber(1);
            setRoomFilter(e.target.value);
          }}
        />
      </div>

      <form onSubmit={onSubmit} style={{ marginBottom: 24 }}>
        <h3>{editId === null ? "Create employee" : `Edit employee #${editId}`}</h3>
        <input
          required
          placeholder="Full name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <input
          placeholder="Position"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
        />
        <input
          placeholder="Department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          type="number"
          placeholder="Room number"
          value={form.room_number || ""}
          onChange={(e) => setForm({ ...form, room_number: Number(e.target.value) })}
        />
        <button type="submit">{editId === null ? "Create" : "Save"}</button>
        {editId !== null && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {loading && <div>Loading...</div>}

      <table border={1} cellPadding={4}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Full name</th>
            <th>Position</th>
            <th>Department</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Room</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.full_name}</td>
              <td>{e.position}</td>
              <td>{e.department}</td>
              <td>{e.email}</td>
              <td>{e.phone}</td>
              <td>{e.room_number}</td>
              <td>
                <Link to={`/employee/${e.id}`}>Assign Device</Link>
                <button onClick={() => onEditClick(e)} style={{ marginLeft: 8 }}>Edit</button>
                <button onClick={() => onDelete(e.id)} style={{ marginLeft: 8 }}>Delete</button>
              </td>
            </tr>
          ))}
          {employees.length === 0 && !loading && (
            <tr>
              <td colSpan={8}>No employees</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: 16 }}>
        <button
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber((p) => p - 1)}
        >
          Prev
        </button>
        <span style={{ margin: "0 8px" }}>
          Page {pageNumber} / {totalPages}
        </span>
        <button
          disabled={pageNumber >= totalPages}
          onClick={() => setPageNumber((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
