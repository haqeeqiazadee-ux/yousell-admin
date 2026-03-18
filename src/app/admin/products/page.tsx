"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBadge } from "@/components/score-badge";
import {
  Package,
  Plus,
  Search,
  ExternalLink,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Product } from "@/lib/types/product";
import { authFetch } from "@/lib/auth-fetch";
import { EnginePageLayout } from "@/components/engines";

const platformColors: Record<string, string> = {
  tiktok: "text-pink-500 border-pink-500/30",
  amazon: "text-orange-500 border-orange-500/30",
  shopify: "text-green-500 border-green-500/30",
  pinterest: "text-red-500 border-red-500/30",
  digital: "text-purple-500 border-purple-500/30",
  ai_affiliate: "text-cyan-500 border-cyan-500/30",
  physical_affiliate: "text-emerald-500 border-emerald-500/30",
  manual: "text-blue-500 border-blue-500/30",
};

const statusColors: Record<string, string> = {
  draft: "text-gray-500 border-gray-500/30",
  active: "text-green-500 border-green-500/30",
  archived: "text-gray-400 border-gray-400/30",
  enriching: "text-yellow-500 border-yellow-500/30",
};

const PAGE_SIZE = 25;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCost, setEditCost] = useState("");
  const [editUrl, setEditUrl] = useState("");

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String((page - 1) * PAGE_SIZE));
      const res = await authFetch(`/api/admin/products?${params}`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setError(null);
    } catch {
      setError("Failed to load products. Please refresh.");
    }
    setLoading(false);
  }, [search, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await authFetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        category: newCategory || undefined,
        price: newPrice ? parseFloat(newPrice) : undefined,
        cost: newCost ? parseFloat(newCost) : undefined,
        external_url: newUrl || undefined,
        platform: "manual",
        status: "draft",
      }),
    });

    if (res.ok) {
      setNewTitle("");
      setNewCategory("");
      setNewPrice("");
      setNewCost("");
      setNewUrl("");
      setDialogOpen(false);
      fetchProducts();
    } else {
      setError("Failed to add product. Please try again.");
    }
    setSubmitting(false);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setEditTitle(product.title);
    setEditCategory(product.category || "");
    setEditPrice(product.price ? String(product.price) : "");
    setEditCost(product.cost ? String(product.cost) : "");
    setEditUrl(product.external_url || "");
    setEditDialogOpen(true);
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setSubmitting(true);
    const res = await authFetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editProduct.id,
        title: editTitle,
        category: editCategory || undefined,
        price: editPrice ? parseFloat(editPrice) : undefined,
        cost: editCost ? parseFloat(editCost) : undefined,
        external_url: editUrl || undefined,
      }),
    });
    if (res.ok) {
      setEditDialogOpen(false);
      fetchProducts();
    } else {
      setError("Failed to update product. Please try again.");
    }
    setSubmitting(false);
  };

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;
    setSubmitting(true);
    const res = await authFetch(`/api/admin/products?id=${deleteProduct.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setDeleteDialogOpen(false);
      setDeleteProduct(null);
      fetchProducts();
    } else {
      setError("Failed to delete product. Please try again.");
    }
    setSubmitting(false);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <EnginePageLayout
      title="Products"
      engineId="scoring"
      description={`${total} product${total !== 1 ? "s" : ""} tracked`}
      status="idle"
      healthy={true}
    >
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={<Button><Plus className="h-4 w-4 mr-2" />Add Product</Button>}
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Product Title</Label>
                <Input
                  id="title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Wireless Earbuds Pro"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Electronics"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Sell Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="29.99"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost Price</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    placeholder="9.99"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Product URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Adding..." : "Add Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No products yet</p>
              <p className="text-sm">
                Add products manually or discover them via TikTok, Amazon, or
                Trend Scout.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt=""
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{product.title}</p>
                          {product.ai_summary && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {product.ai_summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={platformColors[product.platform]}
                      >
                        {product.platform}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[product.status]}
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {product.category || "\u2014"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {product.price
                        ? `${product.currency} ${Number(product.price).toFixed(2)}`
                        : "\u2014"}
                    </TableCell>
                    <TableCell className="text-center">
                      <ScoreBadge score={product.score_overall} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {product.external_url && (
                          <a
                            href={product.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground p-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => openEdit(product)}
                          className="text-muted-foreground hover:text-foreground p-1"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setDeleteProduct(product); setDeleteDialogOpen(true); }}
                          className="text-muted-foreground hover:text-red-600 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditProduct} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Product Title</Label>
              <Input id="edit-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input id="edit-category" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Sell Price</Label>
                <Input id="edit-price" type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cost">Cost Price</Label>
                <Input id="edit-cost" type="number" step="0.01" value={editCost} onChange={(e) => setEditCost(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">Product URL</Label>
              <Input id="edit-url" type="url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{deleteProduct?.title}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDeleteProduct} disabled={submitting}>
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </EnginePageLayout>
  );
}
