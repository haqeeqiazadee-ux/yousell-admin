"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Truck, Plus, Check, X } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

interface Supplier {
  id: string;
  name: string;
  country: string;
  platform: string;
  moq: number;
  unit_price: number;
  shipping_cost: number;
  lead_time: number;
  white_label: boolean;
  dropship: boolean;
  us_warehouse: boolean;
  created_at: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newName, setNewName] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [newMoq, setNewMoq] = useState("");
  const [newUnitPrice, setNewUnitPrice] = useState("");
  const [newShippingCost, setNewShippingCost] = useState("");
  const [newLeadTime, setNewLeadTime] = useState("");
  const [newWhiteLabel, setNewWhiteLabel] = useState(false);
  const [newDropship, setNewDropship] = useState(false);
  const [newUsWarehouse, setNewUsWarehouse] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    const res = await authFetch("/api/admin/suppliers");
    const data = await res.json();
    setSuppliers(data.suppliers || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await authFetch("/api/admin/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        country: newCountry,
        platform: newPlatform || undefined,
        moq: newMoq ? parseInt(newMoq, 10) : undefined,
        unit_price: newUnitPrice ? parseFloat(newUnitPrice) : undefined,
        shipping_cost: newShippingCost ? parseFloat(newShippingCost) : undefined,
        lead_time: newLeadTime ? parseInt(newLeadTime, 10) : undefined,
        white_label: newWhiteLabel,
        dropship: newDropship,
        us_warehouse: newUsWarehouse,
      }),
    });

    if (res.ok) {
      setNewName("");
      setNewCountry("");
      setNewPlatform("");
      setNewMoq("");
      setNewUnitPrice("");
      setNewShippingCost("");
      setNewLeadTime("");
      setNewWhiteLabel(false);
      setNewDropship(false);
      setNewUsWarehouse(false);
      setDialogOpen(false);
      fetchSuppliers();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            Suppliers
          </h1>
          <p className="text-muted-foreground">
            {total} supplier{total !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Supplier Name</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Shenzhen Electronics Co."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    placeholder="e.g. China"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Input
                    id="platform"
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    placeholder="e.g. Alibaba"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moq">MOQ</Label>
                  <Input
                    id="moq"
                    type="number"
                    value={newMoq}
                    onChange={(e) => setNewMoq(e.target.value)}
                    placeholder="e.g. 100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price ($)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={newUnitPrice}
                    onChange={(e) => setNewUnitPrice(e.target.value)}
                    placeholder="e.g. 4.99"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingCost">Shipping Cost ($)</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    step="0.01"
                    value={newShippingCost}
                    onChange={(e) => setNewShippingCost(e.target.value)}
                    placeholder="e.g. 2.50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadTime">Lead Time (days)</Label>
                  <Input
                    id="leadTime"
                    type="number"
                    value={newLeadTime}
                    onChange={(e) => setNewLeadTime(e.target.value)}
                    placeholder="e.g. 14"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="whiteLabel">White Label</Label>
                  <Switch
                    id="whiteLabel"
                    checked={newWhiteLabel}
                    onCheckedChange={setNewWhiteLabel}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="dropship">Dropship</Label>
                  <Switch
                    id="dropship"
                    checked={newDropship}
                    onCheckedChange={setNewDropship}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="usWarehouse">US Warehouse</Label>
                  <Switch
                    id="usWarehouse"
                    checked={newUsWarehouse}
                    onCheckedChange={setNewUsWarehouse}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Adding..." : "Add Supplier"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3" />
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No suppliers yet</p>
              <p className="text-sm">
                Add suppliers to manage your sourcing pipeline.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>MOQ</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Lead Time</TableHead>
                  <TableHead className="text-center">White Label</TableHead>
                  <TableHead className="text-center">US Warehouse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">
                      {supplier.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {supplier.country || "\u2014"}
                    </TableCell>
                    <TableCell>
                      {supplier.platform ? (
                        <Badge variant="outline" className="text-xs">
                          {supplier.platform}
                        </Badge>
                      ) : (
                        "\u2014"
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {supplier.moq != null ? supplier.moq.toLocaleString() : "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {supplier.unit_price != null
                        ? `$${Number(supplier.unit_price).toFixed(2)}`
                        : "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {supplier.lead_time != null
                        ? `${supplier.lead_time} days`
                        : "\u2014"}
                    </TableCell>
                    <TableCell className="text-center">
                      {supplier.white_label ? (
                        <Check className="h-4 w-4 mx-auto text-green-500" />
                      ) : (
                        <X className="h-4 w-4 mx-auto text-muted-foreground/50" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {supplier.us_warehouse ? (
                        <Check className="h-4 w-4 mx-auto text-green-500" />
                      ) : (
                        <X className="h-4 w-4 mx-auto text-muted-foreground/50" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
