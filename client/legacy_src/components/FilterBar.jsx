export default function FilterBar({ filters, onChange }) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-xs font-semibold">Category</label>
        <select
          value={filters.category}
          onChange={e => onChange({ ...filters, category: e.target.value })}
          className="border border-ink/20 rounded-lg px-3 py-2"
        >
          <option value="">All</option>
          <option value="Food">Food</option>
          <option value="Heritage">Heritage</option>
          <option value="Culture">Culture</option>
          <option value="Eco">Eco</option>
          <option value="Night">Night</option>
          <option value="Photography">Photography</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold">Min Price</label>
        <input
          value={filters.minPrice}
          onChange={e => onChange({ ...filters, minPrice: e.target.value })}
          className="border border-ink/20 rounded-lg px-3 py-2"
          placeholder="10"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold">Max Price</label>
        <input
          value={filters.maxPrice}
          onChange={e => onChange({ ...filters, maxPrice: e.target.value })}
          className="border border-ink/20 rounded-lg px-3 py-2"
          placeholder="100"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold">Search</label>
        <input
          value={filters.q}
          onChange={e => onChange({ ...filters, q: e.target.value })}
          className="border border-ink/20 rounded-lg px-3 py-2"
          placeholder="street food"
        />
      </div>
    </div>
  );
}
