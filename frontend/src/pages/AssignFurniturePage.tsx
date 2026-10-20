import { useEffect, useState } from "react";
import { getEmployeesSelected, type SelectedObject } from "../api/employees";
import {
  assignFurniture,
  getFurnitureAllocations,
  getFurniturePage,
  returnFurniture,
  type Furniture,
  type FurnitureAllocation,
} from "../api/furnitures";
import { handleApiError } from "../api/client";
import { canAssignFurnitures, canReturnFurnitures } from "../utils/auth";
import SearchableSelect from "../components/SearchableSelect";

export default function AssignFurniturePage() {
  const canAssign = canAssignFurnitures();
  const canReturn = canReturnFurnitures();
  const [employees, setEmployees] = useState<SelectedObject[]>([]);
  const [furnitures, setFurnitures] = useState<Furniture[]>([]);
  const [allocations, setAllocations] = useState<FurnitureAllocation[]>([]);
  const [furnitureId, setFurnitureId] = useState<number | "">("");
  const [targetType, setTargetType] = useState<"employee" | "room">("employee");
  const [employeeId, setEmployeeId] = useState<number | "">("");
  const [roomNumber, setRoomNumber] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [returnQuantities, setReturnQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!canAssign && !canReturn) return;
    loadBaseData();
  }, [canAssign, canReturn]);

  useEffect(() => {
    if (!furnitureId) {
      setAllocations([]);
      return;
    }
    loadAllocations(Number(furnitureId));
  }, [furnitureId]);

  async function loadBaseData() {
    try {
      setLoading(true);
      setError(null);
      const [emps, furniturePage] = await Promise.all([
        getEmployeesSelected(""),
        getFurniturePage(500, 1),
      ]);
      setEmployees(emps);
      setFurnitures(furniturePage.items);
    } catch (e) {
      setError(handleApiError(e));
    } finally {
      setLoading(false);
    }
  }

  async function loadAllocations(id: number) {
    try {
      setError(null);
      const data = await getFurnitureAllocations(id);
      setAllocations(data);
      setReturnQuantities(
        data.reduce<Record<number, number>>((acc, item) => {
          acc[item.id] = item.quantity;
          return acc;
        }, {})
      );
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  async function onAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!canAssign) return;
    if (!furnitureId) {
      setError("Mebel saýlaň");
      return;
    }
    if (quantity <= 0) {
      setError("Mukdar 0-dan uly bolmaly");
      return;
    }
    if (targetType === "employee" && !employeeId) {
      setError("Işgär saýlaň");
      return;
    }
    if (targetType === "room" && !roomNumber) {
      setError("Otag belgisi giriziň");
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await assignFurniture({
        furniture_id: Number(furnitureId),
        employee_id: targetType === "employee" ? Number(employeeId) : null,
        room_number: targetType === "room" ? Number(roomNumber) : null,
        quantity,
      });
      setSuccess("Mebel üstünlikli birikdirildi");
      setQuantity(1);
      await Promise.all([loadBaseData(), loadAllocations(Number(furnitureId))]);
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  async function onReturn(allocationId: number) {
    if (!canReturn) return;
    const qty = returnQuantities[allocationId] || 0;
    if (qty <= 0) {
      setError("Gaýtaryljak mukdar 0-dan uly bolmaly");
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await returnFurniture({ allocation_id: allocationId, quantity: qty });
      setSuccess("Mebel üstünlikli gaýtaryldy");
      await Promise.all([loadBaseData(), furnitureId ? loadAllocations(Number(furnitureId)) : Promise.resolve()]);
    } catch (e) {
      setError(handleApiError(e));
    }
  }

  if (!canAssign && !canReturn) {
    return (
      <div className="card">
        <h2 style={{ marginBottom: 8 }}>Rugsat ýok</h2>
        <p style={{ color: "var(--text-muted)" }}>Mebel birikdirmek üçin degişli rugsat gerek.</p>
      </div>
    );
  }

  return (
    <div className="page-animate">
      <h2 style={{ marginBottom: 16 }}>Mebel birikdirme</h2>

      {error && <div style={{ color: "var(--danger)", marginBottom: 16 }}>{error}</div>}
      {success && <div style={{ color: "var(--success)", marginBottom: 16 }}>{success}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={onAssign} style={{ display: "grid", gap: 16, maxWidth: 640 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label>Mebel</label>
            <SearchableSelect
              value={furnitureId}
              onChange={(value) => setFurnitureId(value ? Number(value) : "")}
              options={furnitures.map((item) => ({
                value: item.id,
                label: `${item.name} (${item.available_quantity} elýeterli)`,
              }))}
              emptyOptionLabel="Mebel saýlaň..."
              searchPlaceholder="Mebel ady boýunça filter..."
            />
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="radio" checked={targetType === "employee"} onChange={() => setTargetType("employee")} />
              Işgäre
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="radio" checked={targetType === "room"} onChange={() => setTargetType("room")} />
              Otaga
            </label>
          </div>

          {targetType === "employee" ? (
            <div style={{ display: "grid", gap: 6 }}>
              <label>Işgär</label>
              <SearchableSelect
                value={employeeId}
                onChange={(value) => setEmployeeId(value ? Number(value) : "")}
                options={employees.map((emp) => ({ value: emp.id, label: emp.name }))}
                emptyOptionLabel="Işgär saýlaň..."
                searchPlaceholder="Işgär ady boýunça filter..."
              />
            </div>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              <label>Otag belgisi</label>
              <input type="number" min={1} value={roomNumber} onChange={(e) => setRoomNumber(e.target.value ? Number(e.target.value) : "")} />
            </div>
          )}

          <div style={{ display: "grid", gap: 6 }}>
            <label>Mukdar</label>
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </div>

          {canAssign && (
            <button className="btn btn-primary" type="submit" disabled={loading}>
              Birikdir
            </button>
          )}
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nirä</th>
              <th>Mukdar</th>
              <th>Sene</th>
              <th>Gaýtarmak</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((allocation) => (
              <tr key={allocation.id}>
                <td>{allocation.id}</td>
                <td>
                  {allocation.employee
                    ? allocation.employee.full_name
                    : allocation.room_number
                      ? `Otag #${allocation.room_number}`
                      : "-"}
                </td>
                <td>{allocation.quantity}</td>
                <td>{new Date(allocation.assigned_at).toLocaleString()}</td>
                <td>
                  {canReturn ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="number"
                        min={1}
                        max={allocation.quantity}
                        value={returnQuantities[allocation.id] || allocation.quantity}
                        onChange={(e) =>
                          setReturnQuantities((prev) => ({
                            ...prev,
                            [allocation.id]: Number(e.target.value),
                          }))
                        }
                        style={{ width: 90 }}
                      />
                      <button className="btn btn-secondary" type="button" onClick={() => onReturn(allocation.id)}>
                        Gaýtarmak
                      </button>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
            {allocations.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                  {furnitureId ? "Aktiw birikdirme ýok" : "Birikdirmeleri görmek üçin mebel saýlaň"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
