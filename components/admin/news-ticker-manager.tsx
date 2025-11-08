"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Edit2 } from "lucide-react"

export interface NewsItem {
  id: string
  text: string
  category?: string
  priority?: "low" | "medium" | "high"
  link?: string
}

interface NewsTickerManagerProps {
  onSave?: (items: NewsItem[]) => void
  initialItems?: NewsItem[]
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "")

export default function NewsTickerManager({ onSave, initialItems = [] }: NewsTickerManagerProps) {
  const [items, setItems] = useState<NewsItem[]>(initialItems)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newItem, setNewItem] = useState<Partial<NewsItem>>({
    text: "",
    category: "News",
    priority: "medium",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadNewsItems()
  }, [])

  const loadNewsItems = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/news-ticker`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error("Failed to load news items:", error)
    }
  }

  const handleAddItem = () => {
    if (!newItem.text || newItem.text.trim() === "") {
      setMessage("Please enter news text")
      return
    }

    const item: NewsItem = {
      id: Date.now().toString(),
      text: newItem.text,
      category: newItem.category || "News",
      priority: newItem.priority || "medium",
      link: newItem.link,
    }

    setItems([...items, item])
    setNewItem({ text: "", category: "News", priority: "medium", link: "" })
    setMessage("News item added successfully")
  }

  const handleUpdateItem = (id: string, updates: Partial<NewsItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...updates } : item)))
    setEditingId(null)
    setMessage("News item updated successfully")
  }

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
    setMessage("News item deleted successfully")
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`${API_URL}/admin/news-ticker`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ items }),
      })

      if (res.ok) {
        setMessage("News ticker saved successfully!")
        onSave?.(items)
      } else {
        setMessage("Failed to save news ticker")
      }
    } catch (error) {
      console.error("Failed to save:", error)
      setMessage("Error saving news ticker")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">News Ticker Manager</h2>

      {/* Message */}
      {message && <div className="mb-4 p-3 bg-primary/10 border border-primary text-primary rounded-lg">{message}</div>}

      {/* Add New Item */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Add New News Item</h3>
        <div className="space-y-3">
          <Input
            placeholder="Enter news text..."
            value={newItem.text || ""}
            onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
            maxLength={200}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Category (e.g., Tech, Fashion)"
              value={newItem.category || ""}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            />
            <select
              value={newItem.priority || "medium"}
              onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as any })}
              className="px-3 py-2 border border-input rounded-md"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <Input
            placeholder="Link (optional)"
            value={newItem.link || ""}
            onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
          />
          <Button onClick={handleAddItem} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add News Item
          </Button>
        </div>
      </div>

      {/* Current Items */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Current News Items</h3>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No news items yet. Add one to get started.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-4 border border-border rounded-lg flex items-start justify-between gap-4">
              {editingId === item.id ? (
                <div className="flex-1 space-y-2">
                  <Input
                    value={item.text}
                    onChange={(e) => handleUpdateItem(item.id, { text: e.target.value })}
                    maxLength={200}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={item.category || ""}
                      onChange={(e) => handleUpdateItem(item.id, { category: e.target.value })}
                    />
                    <select
                      value={item.priority || "medium"}
                      onChange={(e) => handleUpdateItem(item.id, { priority: e.target.value as any })}
                      className="px-3 py-2 border border-input rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <Button size="sm" onClick={() => setEditingId(null)} className="w-full">
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="font-medium">{item.text}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{item.category}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          item.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : item.priority === "medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setEditingId(item.id)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isSaving} className="w-full mt-6" size="lg">
        {isSaving ? "Saving..." : "Save News Ticker"}
      </Button>
    </div>
  )
}
