"use client";

import { Item } from "../types";

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

export default function UpdateItemModal({
  show,
  onClose,
  updateData,
  setUpdateData,
  existingItems,
  onUpdate,
}: UpdateItemModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white text-gray-900 p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Update Existing Item</h2>

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

        {updateData.salePrice && (
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">
              Current Sale Price
            </label>
            <input
              type="number"
              value={updateData.salePrice}
              disabled
              className="w-full p-2 rounded border border-gray-300 bg-gray-100 cursor-not-allowed"
            />
          </div>
        )}

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
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">
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
}
