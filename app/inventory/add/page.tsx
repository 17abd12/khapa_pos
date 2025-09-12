"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

// -------------------- Types --------------------
export type Item = {
  id: string;
  name: string;
  costPrice: number;
  sale_price: number;
  units: number;
};

// -------------------- Item Card --------------------
type ItemCardProps = {
  item: Item;
  onDelete: (id: string) => void;
};

const ItemCard = ({ item, onDelete }: ItemCardProps) => (
  <div className="bg-white text-gray-900 p-4 rounded-lg shadow-md flex justify-between items-start">
    <div>
      <h2 className="text-lg font-bold">{item.name}</h2>
      <p>Cost: {item.costPrice}</p>
      <p>Sale: {item.sale_price}</p>
      <p>Units: {item.units}</p>
    </div>
    <button
      onClick={() => onDelete(item.id)}
      className="text-red-500 hover:text-red-700 font-bold"
    >
      ✕
    </button>
  </div>
);

// -------------------- Add Item Modal --------------------
type AddItemModalProps = {
  show: boolean;
  onClose: () => void;
  formData: {
    name: string;
    costPrice: string;
    salePrice: string;
    units: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      costPrice: string;
      salePrice: string;
      units: string;
    }>
  >;
  onSave: () => void;
};

// const AddItemModal = ({ show, onClose, formData, setFormData, onSave }: AddItemModalProps) => {
//   if (!show) return null;

//   return (
//     <div className="fixed inset-0 text-black bg-opacity-60 flex items-center justify-center">
//       <div className="text-slate-800 p-6 rounded-lg w-96">
//         <h2 className="text-xl font-bold mb-4">Add New Item</h2>
//         <input
//           type="text"
//           placeholder="Item Name"
//           value={formData.name}
//           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//           className="w-full mb-3 p-2 rounded bg-slate-700 text-white"
//         />
//         <input
//           type="number"
//           placeholder="Cost Price per Unit"
//           value={formData.costPrice}
//           onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
//           className="w-full mb-3 p-2 rounded bg-slate-700 text-white"
//         />
//         <input
//           type="number"
//           placeholder="Sale Price per Unit"
//           value={formData.salePrice}
//           onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
//           className="w-full mb-3 p-2 rounded bg-slate-700 text-white"
//         />
//         <input
//           type="number"
//           placeholder="No of Units"
//           value={formData.units}
//           onChange={(e) => setFormData({ ...formData, units: e.target.value })}
//           className="w-full mb-3 p-2 rounded bg-slate-700 text-white"
//         />

//         <div className="flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onSave}
//             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
//           >
//             OK
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// -------------------- Update Item Modal --------------------
type UpdateItemModalProps = {
  show: boolean;
  onClose: () => void;
  updateData: {
    id: string;
    costPrice: string;
    salePrice: string;
    units: string;
  };
  setUpdateData: React.Dispatch<
    React.SetStateAction<{
      id: string;
      costPrice: string;
      salePrice: string;
      units: string;
    }>
  >;
  existingItems: Item[];
  onUpdate: () => void;
};

// const UpdateItemModal = ({
//   show,
//   onClose,
//   updateData,
//   setUpdateData,
//   existingItems,
//   onUpdate,
// }: UpdateItemModalProps) => {
//   if (!show) return null;

//   return (
//     <div className="fixed inset-0 text-black bg-opacity-60 flex items-center justify-center">
//       <div className="text-slate-800 p-6 rounded-lg w-96">
//         <h2 className="text-xl font-bold mb-4">Update Existing Item</h2>

//         {/* Select Item */}
//         <select
//           value={updateData.id}
//           onChange={(e) => {
//             const selectedId = e.target.value;
//             const selectedItem = existingItems.find((item) => item.id === selectedId);
//             setUpdateData({
//               ...updateData,
//               id: selectedId,
//               costPrice: "",
//               units: "",
//               salePrice: selectedItem ? String(selectedItem.sale_price) : "",
//             });
//           }}
//           className="w-full mb-3 p-2 rounded bg-slate-700 text-white"
//         >
//           <option value="">Select Item</option>
//           {existingItems.map((item) => (
//             <option key={item.id} value={item.id}>
//               {item.name}
//             </option>
//           ))}
//         </select>

//         {/* Sale Price (readonly) */}
//         {updateData.salePrice && (
//           <div className="mb-3">
//             <label className="block text-sm text-gray-400 mb-1">Current Sale Price</label>
//             <input
//               type="number"
//               value={updateData.salePrice}
//               disabled
//               className="w-full p-2 rounded bg-slate-700 text-white opacity-70 cursor-not-allowed"
//             />
//           </div>
//         )}

//         {/* Editable Fields */}
//         <input
//           type="number"
//           placeholder="New Cost Price"
//           value={updateData.costPrice}
//           onChange={(e) => setUpdateData({ ...updateData, costPrice: e.target.value })}
//           className="w-full mb-3 p-2 rounded bg-slate-700 text-white"
//         />
//         <input
//           type="number"
//           placeholder="New Units"
//           value={updateData.units}
//           onChange={(e) => setUpdateData({ ...updateData, units: e.target.value })}
//           className="w-full mb-3 p-2 rounded bg-slate-700 text-white"
//         />

//         <div className="flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onUpdate}
//             className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg"
//           >
//             Update
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };


const AddItemModal = ({ show, onClose, formData, setFormData, onSave }: AddItemModalProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white text-gray-900 p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add New Item</h2>
        <input
          type="text"
          placeholder="Item Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-3 p-2 rounded border border-gray-300"
        />
        <input
          type="number"
          placeholder="Cost Price per Unit"
          value={formData.costPrice}
          onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
          className="w-full mb-3 p-2 rounded border border-gray-300"
        />
        <input
          type="number"
          placeholder="Sale Price per Unit"
          value={formData.salePrice}
          onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
          className="w-full mb-3 p-2 rounded border border-gray-300"
        />
        <input
          type="number"
          placeholder="No of Units"
          value={formData.units}
          onChange={(e) => setFormData({ ...formData, units: e.target.value })}
          className="w-full mb-3 p-2 rounded border border-gray-300"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------- Update Item Modal --------------------
const UpdateItemModal = ({
  show,
  onClose,
  updateData,
  setUpdateData,
  existingItems,
  onUpdate,
}: UpdateItemModalProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white text-gray-900 p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Update Existing Item</h2>

        {/* Select Item */}
        <select
          value={updateData.id}
          onChange={(e) => {
            const selectedId = e.target.value;
            const selectedItem = existingItems.find((item) => item.id === selectedId);
            setUpdateData({
              ...updateData,
              id: selectedId,
              costPrice: "",
              units: "",
              salePrice: selectedItem ? String(selectedItem.sale_price) : "",
            });
          }}
          className="w-full mb-3 p-2 rounded border border-gray-300"
        >
          <option value="">Select Item</option>
          {existingItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        {/* Sale Price (readonly) */}
        {updateData.salePrice && (
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Current Sale Price</label>
            <input
              type="number"
              value={updateData.salePrice}
              disabled
              className="w-full p-2 rounded border border-gray-300 bg-gray-100 cursor-not-allowed"
            />
          </div>
        )}

        {/* Editable Fields */}
        <input
          type="number"
          placeholder="New Cost Price"
          value={updateData.costPrice}
          onChange={(e) => setUpdateData({ ...updateData, costPrice: e.target.value })}
          className="w-full mb-3 p-2 rounded border border-gray-300"
        />
        <input
          type="number"
          placeholder="New Units"
          value={updateData.units}
          onChange={(e) => setUpdateData({ ...updateData, units: e.target.value })}
          className="w-full mb-3 p-2 rounded border border-gray-300"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onUpdate}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------- Action Buttons --------------------
// const ActionButtons = ({
//   onAdd,
//   onUpdate,
//   onConfirm,
//   itemsLength,
//   loadingConfirm,
//   confirmed,
// }: ActionButtonsProps) => (
//   <div className="flex gap-4 mb-6">
//     <button
//       onClick={onAdd}
//       className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
//     >
//       + Add Item
//     </button>
//     <button
//       onClick={onUpdate}
//       className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium"
//     >
//       Update Existing Item
//     </button>
//     <button
//       onClick={onConfirm}
//       className={`px-4 py-2 rounded-lg font-medium ${
//         confirmed ? "bg-gray-200 text-gray-900" : "bg-green-500 hover:bg-green-600 text-white"
//       }`}
//       disabled={itemsLength === 0 || loadingConfirm}
//     >
//       {loadingConfirm ? "Confirming..." : "Confirm Inventory"}
//     </button>
//   </div>
// );

// -------------------- Action Buttons --------------------
type ActionButtonsProps = {
  onAdd: () => void;
  onUpdate: () => void;
  onConfirm: () => void;
  itemsLength: number;
  loadingConfirm: boolean;
  confirmed: boolean;
};

const ActionButtons = ({
  onAdd,
  onUpdate,
  onConfirm,
  itemsLength,
  loadingConfirm,
  confirmed,
}: ActionButtonsProps) => (
  <div className="flex gap-4 mb-6">
    <button
      onClick={onAdd}
      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium"
    >
      + Add Item
    </button>
    <button
      onClick={onUpdate}
      className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg font-medium"
    >
      Update Existing Item
    </button>
    <button
      onClick={onConfirm}
      className={`px-4 py-2 rounded-lg font-medium ${
        confirmed ? "bg-white text-black" : "bg-green-600 hover:bg-green-700 text-white"
      }`}
      disabled={itemsLength === 0 || loadingConfirm}
    >
      {loadingConfirm ? "Confirming..." : "Confirm Inventory"}
    </button>
  </div>
);

// -------------------- Main Inventory Page --------------------
export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [existingItems, setExistingItems] = useState<Item[]>([]);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    costPrice: "",
    salePrice: "",
    units: "",
  });

  const [updateData, setUpdateData] = useState({
    id: "",
    costPrice: "",
    salePrice: "",
    units: "",
  });

  // Load saved items
  useEffect(() => {
    const saved = localStorage.getItem("inventory");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(items));
  }, [items]);

  // Fetch existing items
  useEffect(() => {
    fetch("/api/items")
      .then((res) => res.json())
      .then((data) => setExistingItems(data))
      .catch((err) => console.error("❌ Error fetching items:", err));
  }, []);

  // Handlers
  const handleSaveItem = () => {
    if (!formData.name || !formData.costPrice || !formData.salePrice || !formData.units) return;

    const newItem: Item = {
      id: Date.now().toString(),
      name: formData.name,
      costPrice: parseFloat(formData.costPrice),
      sale_price: parseFloat(formData.salePrice),
      units: parseInt(formData.units),
    };

    setItems([...items, newItem]);
    setFormData({ name: "", costPrice: "", salePrice: "", units: "" });
    setShowModal(false);
  };

  const handlePrepareUpdate = () => {
    if (!updateData.id) return;

    const selectedItem = existingItems.find((i) => i.id === updateData.id);
    if (!selectedItem) return;

    const updatedItem: Item = {
      id: Date.now().toString(),
      name: selectedItem.name,
      costPrice: parseFloat(updateData.costPrice) || selectedItem.costPrice,
      sale_price: selectedItem.sale_price,
      units: parseInt(updateData.units) || selectedItem.units,
    };

    setItems([...items, updatedItem]);
    setUpdateData({ id: "", costPrice: "", salePrice: "", units: "" });
    setShowUpdateModal(false);
    toast.success("✅ Item updated locally! Confirm inventory to save.");
  };

  const handleDelete = (id: string) => setItems(items.filter((item) => item.id !== id));

  const handleConfirmInventory = async () => {
    if (items.length === 0) return;
    setLoadingConfirm(true);

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error("❌ Failed: " + error.message);
        return;
      }

      await res.json();
      toast.success("✅ Inventory confirmed and saved!");
      setItems([]);
      localStorage.removeItem("inventory");
      setConfirmed(true);
    } catch (err) {
      console.error("❌ Error saving inventory:", err);
      toast.error("Error saving inventory!");
    } finally {
      setLoadingConfirm(false);
    }
  };

  return (
    <div className="p-6 min-h-screen text-white">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>

      <ActionButtons
        onAdd={() => setShowModal(true)}
        onUpdate={() => setShowUpdateModal(true)}
        onConfirm={handleConfirmInventory}
        itemsLength={items.length}
        loadingConfirm={loadingConfirm}
        confirmed={confirmed}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onDelete={handleDelete} />
        ))}
      </div>

      <AddItemModal
        show={showModal}
        onClose={() => setShowModal(false)}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveItem}
      />

      <UpdateItemModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        updateData={updateData}
        setUpdateData={setUpdateData}
        existingItems={existingItems}
        onUpdate={handlePrepareUpdate}
      />
    </div>
  );
}
