import React, { useState } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  Search,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Upload,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { CatalogItem } from '../../types/pharmacy';

interface InventoryManagerProps {
  catalogItems: CatalogItem[];
  onAddProduct: (item: CatalogItem) => void;
  onUpdateProduct: (item: CatalogItem) => void;
  onDeleteProduct: (productId: string) => void;
  onBulkPriceAdjust: (category: string, percentChange: number) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  catalogItems,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBulkPriceAdjust,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('All');
  const [bulkPercent, setBulkPercent] = useState<number>(5);
  const [notification, setNotification] = useState<string | null>(null);

  // New product form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CatalogItem['category']>('Sleep');
  const [price, setPrice] = useState<string>('19.99');
  const [copayPrice, setCopayPrice] = useState<string>('5.00');
  const [costPrice, setCostPrice] = useState<string>('8.50');
  const [stockCount, setStockCount] = useState<string>('50');
  const [minThreshold, setMinThreshold] = useState<string>('15');
  const [dosage, setDosage] = useState('');
  const [sku, setSku] = useState('');
  const [ndcCode, setNdcCode] = useState('');
  const [description, setDescription] = useState('');
  const [rxRequired, setRxRequired] = useState(false);
  const [imageOption, setImageOption] = useState<string>('/src/assets/images/sleep_wellness_remedy_1793623730003.jpg');

  // Stats calculation
  const totalProducts = catalogItems.length;
  const lowStockCount = catalogItems.filter(
    (i) => i.stockCount <= i.minStockThreshold && i.stockCount > 0
  ).length;
  const outOfStockCount = catalogItems.filter((i) => i.stockCount <= 0 || !i.inStock).length;
  const totalInventoryValuation = catalogItems.reduce(
    (sum, i) => sum + i.price * i.stockCount,
    0
  );

  // Filtered list
  const filteredProducts = catalogItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.ndcCode && item.ndcCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    let matchesStock = true;
    if (stockStatusFilter === 'Low') {
      matchesStock = item.stockCount <= item.minStockThreshold && item.stockCount > 0;
    } else if (stockStatusFilter === 'Out') {
      matchesStock = item.stockCount <= 0 || !item.inStock;
    } else if (stockStatusFilter === 'InStock') {
      matchesStock = item.stockCount > item.minStockThreshold && item.inStock;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleStockAdjust = (item: CatalogItem, delta: number) => {
    const newCount = Math.max(0, item.stockCount + delta);
    onUpdateProduct({
      ...item,
      stockCount: newCount,
      inStock: newCount > 0,
      lastRestocked: delta > 0 ? '2026-11-02' : item.lastRestocked,
    });
    setNotification(`Updated stock for ${item.name} to ${newCount} units.`);
  };

  const handleToggleInStock = (item: CatalogItem) => {
    const updated = !item.inStock;
    onUpdateProduct({
      ...item,
      inStock: updated,
    });
    setNotification(`${item.name} is now marked ${updated ? 'In Stock' : 'Out of Stock'}.`);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedPrice = parseFloat(price) || 0;
    const parsedStock = parseInt(stockCount) || 0;

    const newItem: CatalogItem = {
      id: `prod-${Date.now()}`,
      name: name.trim(),
      category,
      price: parsedPrice,
      copayPrice: parseFloat(copayPrice) || 0,
      costPrice: parseFloat(costPrice) || 0,
      stockCount: parsedStock,
      minStockThreshold: parseInt(minThreshold) || 10,
      dosage: dosage.trim() || 'Standard Clinical Unit',
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      ndcCode: ndcCode.trim() || undefined,
      description: description.trim() || 'Verified pharmaceutical formulation.',
      rxRequired,
      inStock: parsedStock > 0,
      image: imageOption,
      lastRestocked: '2026-11-02',
    };

    onAddProduct(newItem);
    setNotification(`Successfully added product: ${newItem.name}`);
    setIsAddModalOpen(false);

    // Reset form
    setName('');
    setDescription('');
    setDosage('');
    setSku('');
    setNdcCode('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdateProduct(editingItem);
    setNotification(`Saved changes for ${editingItem.name}.`);
    setEditingItem(null);
  };

  const handleApplyBulkPrice = (e: React.FormEvent) => {
    e.preventDefault();
    onBulkPriceAdjust(bulkCategory, bulkPercent);
    setNotification(
      `Applied ${bulkPercent > 0 ? `+${bulkPercent}%` : `${bulkPercent}%`} price adjustment to ${
        bulkCategory === 'All' ? 'all catalog products' : bulkCategory
      }.`
    );
    setIsBulkPriceModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 uppercase tracking-wider mb-1">
            <Package className="w-3.5 h-3.5 text-teal-700" />
            <span>Dispensary Catalog &amp; Formulations</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Product Upload, Stock Tracking &amp; Price Adjustments
          </h3>
          <p className="text-xs text-slate-500">
            Manage public pharmacy catalog, NDC codes, copay formulas, and real-time inventory counts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBulkPriceModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Percent className="w-3.5 h-3.5 text-teal-700" />
            <span>Bulk Price Adjust</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload New Product</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold">{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Inventory KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Catalog Products</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalProducts}</div>
          <p className="text-[11px] text-slate-400 mt-1">Active formulations</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700">{lowStockCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Below threshold units</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Out of Stock</span>
            <Package className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700">{outOfStockCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Requires supplier order</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Retail Inventory Value</span>
            <DollarSign className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            ${totalInventoryValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">On-shelf valuation</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU (e.g. RX-MET-500ER), or NDC code..."
            className="w-full bg-slate-50 border border-slate-300 rounded-md pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800"
          >
            <option value="All">All Categories</option>
            <option value="Sleep">Sleep</option>
            <option value="Weight Loss">Weight Loss</option>
            <option value="Energy & Focus">Energy &amp; Focus</option>
            <option value="Heart & Circulation">Heart &amp; Circulation</option>
            <option value="Digestive Health">Digestive Health</option>
            <option value="Daily Wellness">Daily Wellness</option>
            <option value="Pain & Recovery">Pain &amp; Recovery</option>
          </select>

          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800"
          >
            <option value="All">All Stock Levels</option>
            <option value="InStock">Normal Stock</option>
            <option value="Low">Low Stock (&le; threshold)</option>
            <option value="Out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory & Price Adjustments Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Product &amp; SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price &amp; Copay</th>
                <th className="py-3 px-3 text-center">Stock Level</th>
                <th className="py-3 px-3 text-center">Quick Stock Adjust</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((item) => {
                const isLow = item.stockCount <= item.minStockThreshold && item.stockCount > 0;
                const isOut = item.stockCount <= 0 || !item.inStock;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-md object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            SKU: {item.sku} {item.ndcCode ? `· ${item.ndcCode}` : ''}
                          </p>
                          <p className="text-[11px] text-slate-400">{item.dosage}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-sm border border-teal-200 whitespace-nowrap">
                        {item.category}
                      </span>
                      {item.rxRequired && (
                        <span className="block text-[10px] text-amber-700 font-medium mt-1">
                          Rx Required
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Retail Price:</span>
                        <span className="font-bold text-slate-900">${item.price.toFixed(2)}</span>
                      </div>
                      {item.copayPrice !== undefined && item.copayPrice > 0 && (
                        <div className="mt-0.5 text-[11px] text-teal-700">
                          Copay: ${item.copayPrice.toFixed(2)}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-mono">
                      <span
                        className={`text-sm font-bold ${
                          isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                        }`}
                      >
                        {item.stockCount}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Min: {item.minStockThreshold}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
                        <button
                          onClick={() => handleStockAdjust(item, -10)}
                          title="Decrease 10"
                          className="px-2 py-0.5 text-[11px] font-mono font-bold bg-white text-slate-700 hover:bg-slate-200 rounded shadow-2xs"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => handleStockAdjust(item, -1)}
                          title="Decrease 1"
                          className="px-2 py-0.5 text-[11px] font-mono font-bold bg-white text-slate-700 hover:bg-slate-200 rounded shadow-2xs"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleStockAdjust(item, 1)}
                          title="Increase 1"
                          className="px-2 py-0.5 text-[11px] font-mono font-bold bg-white text-slate-700 hover:bg-slate-200 rounded shadow-2xs"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleStockAdjust(item, 10)}
                          title="Increase 10"
                          className="px-2 py-0.5 text-[11px] font-mono font-bold bg-white text-slate-700 hover:bg-slate-200 rounded shadow-2xs"
                        >
                          +10
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleInStock(item)}
                        className={`px-2 py-0.5 rounded-sm text-[11px] font-semibold border transition-colors ${
                          isOut
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : isLow
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 text-slate-500 hover:text-teal-800 hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit Price & Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">
            No products match the selected criteria.
          </div>
        )}
      </div>

      {/* MODAL 1: ADD / UPLOAD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Upload &amp; Add New Medication</h3>
                <p className="text-xs text-slate-500">Configure pharmacy catalog item, inventory &amp; pricing</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Medication / Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amoxicillin Trihydrate 500mg"
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CatalogItem['category'])}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                  >
                    <option value="Sleep">Sleep</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Energy & Focus">Energy &amp; Focus</option>
                    <option value="Heart & Circulation">Heart &amp; Circulation</option>
                    <option value="Digestive Health">Digestive Health</option>
                    <option value="Daily Wellness">Daily Wellness</option>
                    <option value="Pain & Recovery">Pain &amp; Recovery</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Dosage &amp; Packaging <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 500 mg, 30 Oral Capsules"
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Retail Price ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Insurance Copay Estimate ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={copayPrice}
                    onChange={(e) => setCopayPrice(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initial Stock Count (Units) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={stockCount}
                    onChange={(e) => setStockCount(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. RX-AMX-500"
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    National Drug Code (NDC)
                  </label>
                  <input
                    type="text"
                    value={ndcCode}
                    onChange={(e) => setNdcCode(e.target.value)}
                    placeholder="e.g. NDC 0093-3109-01"
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Product Photography Asset
                  </label>
                  <select
                    value={imageOption}
                    onChange={(e) => setImageOption(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                  >
                    <option value="/src/assets/images/sleep_wellness_remedy_1793623730003.jpg">
                      Sleep &amp; Rest Apothecary Display (High Res)
                    </option>
                    <option value="/src/assets/images/weight_metabolic_care_1793623731156.jpg">
                      Weight Loss &amp; Metabolic Care (High Res)
                    </option>
                    <option value="/src/assets/images/medication_chronic_care_1793621456444.jpg">
                      Clinical Healthcare Care Bottles (High Res)
                    </option>
                    <option value="/src/assets/images/wellness_vitamins_display_1793621456102.jpg">
                      Wellness &amp; Amber Glass Supplement Display
                    </option>
                    <option value="/src/assets/images/hero_pharmacy_care_1793621455330.jpg">
                      Dispensary Counter &amp; Care Package
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Clinical Description &amp; Usage
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Therapeutic class, indication, administration advisory..."
                    className="w-full bg-white border border-slate-300 rounded-md p-3 text-slate-900"
                  ></textarea>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rxRequired"
                    checked={rxRequired}
                    onChange={(e) => setRxRequired(e.target.checked)}
                    className="rounded text-teal-700 focus:ring-teal-700"
                  />
                  <label htmlFor="rxRequired" className="font-semibold text-slate-800 cursor-pointer">
                    Clinical Grade Formula (Doctor Verification Required)
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-xs"
                >
                  Save &amp; Publish to Public Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PRODUCT DETAILS & PRICING */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Pricing &amp; Details: {editingItem.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">SKU: {editingItem.sku}</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Retail Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Estimated Copay ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.copayPrice || 0}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        copayPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Stock Count (Units)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingItem.stockCount}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        stockCount: parseInt(e.target.value) || 0,
                        inStock: (parseInt(e.target.value) || 0) > 0,
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Min Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={editingItem.minStockThreshold}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        minStockThreshold: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingItem.description}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, description: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded-md p-3 text-slate-900"
                  ></textarea>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-xs"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BULK PRICE ADJUSTMENT */}
      {isBulkPriceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Bulk Price Adjustments</h3>
                <p className="text-xs text-slate-500">Apply percentage shifts across product categories</p>
              </div>
              <button
                onClick={() => setIsBulkPriceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyBulkPrice} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Category</label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900"
                >
                  <option value="All">All Categories (Universal Catalog)</option>
                  <option value="Sleep">Sleep</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Energy & Focus">Energy &amp; Focus</option>
                  <option value="Heart & Circulation">Heart &amp; Circulation</option>
                  <option value="Digestive Health">Digestive Health</option>
                  <option value="Daily Wellness">Daily Wellness</option>
                  <option value="Pain & Recovery">Pain &amp; Recovery</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Percentage Adjustment (%):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="1"
                    value={bulkPercent}
                    onChange={(e) => setBulkPercent(parseFloat(e.target.value) || 0)}
                    className="w-32 bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-mono text-center text-sm font-bold"
                  />
                  <span className="text-slate-500">
                    {bulkPercent >= 0 ? `+${bulkPercent}% Price Increase` : `${bulkPercent}% Price Discount`}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                Example: A $20.00 medication adjusted by {bulkPercent > 0 ? `+${bulkPercent}%` : `${bulkPercent}%`} will become ${(20 * (1 + bulkPercent / 100)).toFixed(2)}.
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBulkPriceModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-xs"
                >
                  Apply to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
