/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useSWR from "swr";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { Users } from "lucide-react";

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function AdminPage() {
  const { data: stats } = useSWR("/api/admin/stats", fetcher);
  const { data: plans, mutate } = useSWR("/api/admin/plans", fetcher);
  
  const [newPlan, setNewPlan] = useState({
    name: "",
    maxFileSize: "",
    retentionHrs: "",
    priceCents: "",
  });

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/admin/plans", {
        name: newPlan.name,
        maxFileSize: Number(newPlan.maxFileSize) * 1024 * 1024 * 1024, // Convert GB to bytes
        retentionHrs: Number(newPlan.retentionHrs),
        priceCents: newPlan.priceCents ? Number(newPlan.priceCents) : null,
      });
      toast.success("Plano criado com sucesso!");
      setNewPlan({ name: "", maxFileSize: "", retentionHrs: "", priceCents: "" });
      mutate();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar plano");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Painel do Administrador</h1>
        <Link href="/admin/users">
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Gerenciar Usuários
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Arquivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFiles || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Armazenamento Usado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(stats?.totalStorageBytes || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDownloads || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Arquivos Expirados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.expiredFiles || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Management */}
      <Card>
        <CardHeader>
          <CardTitle>Planos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plans?.map((plan: any) => (
              <div key={plan.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <p className="text-sm text-gray-600">
                    Tamanho máximo: {formatBytes(plan.maxFileSize)} | 
                    Retenção: {plan.retentionHrs}h | 
                    Preço: {plan.priceCents ? `R$ ${(plan.priceCents / 100).toFixed(2)}` : 'Grátis'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create New Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Plano</Label>
                <Input
                  id="name"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  placeholder="Ex: Premium"
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxFileSize">Tamanho Máximo (GB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={newPlan.maxFileSize}
                  onChange={(e) => setNewPlan({ ...newPlan, maxFileSize: e.target.value })}
                  placeholder="Ex: 50"
                  required
                />
              </div>
              <div>
                <Label htmlFor="retentionHrs">Retenção (horas)</Label>
                <Input
                  id="retentionHrs"
                  type="number"
                  value={newPlan.retentionHrs}
                  onChange={(e) => setNewPlan({ ...newPlan, retentionHrs: e.target.value })}
                  placeholder="Ex: 720"
                  required
                />
              </div>
              <div>
                <Label htmlFor="priceCents">Preço (centavos)</Label>
                <Input
                  id="priceCents"
                  type="number"
                  value={newPlan.priceCents}
                  onChange={(e) => setNewPlan({ ...newPlan, priceCents: e.target.value })}
                  placeholder="Ex: 999 (R$ 9.99)"
                />
              </div>
            </div>
            <Button type="submit">Criar Plano</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
