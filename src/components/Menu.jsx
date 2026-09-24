import { useState, useMemo } from 'react'
import MenuItemCard from './MenuItemCard'
import { CATEGORIES } from '../utils/constants'
import { Search } from 'lucide-react'

export default function MenuGrid({ items = [], cart = {}, onAdd, onRemove }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat =
        selectedCategory === 'All' || item.category === selectedCategory
      const matchSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.trim().toLowerCase())
      return matchCat && matchSearch
    })
  }, [items, selectedCategory, search])

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-stone-800 bg-stone-900/60 p-12 text-center">
        <p className="text-sm font-semibold text-stone-400">
          No menu items available for this outlet today.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5 rounded-2xl bg-stone-900/90 p-1.5 border border-stone-800">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
          <input
            type="text"
            placeholder="Search food items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-stone-800 bg-stone-900 py-2 pl-9 pr-4 text-xs text-white placeholder-stone-500 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grid of Items */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-8 text-center text-xs text-stone-400">
          No menu items matching your filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              cartQty={cart[item.id]?.qty || 0}
              onAdd={() => onAdd(item)}
              onRemove={() => onRemove(item)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
